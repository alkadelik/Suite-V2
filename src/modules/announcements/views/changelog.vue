<script setup lang="ts">
import { computed } from "vue"
import { CHANGELOG_RELEASES } from "../constants"
import type { Release } from "../types"
import Chip from "@components/Chip.vue"

type Block =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }

/** Parse a markdown-lite changelog string into a title + body blocks. */
function parse(src: string): { title: string | null; blocks: Block[] } {
  const blocks: Block[] = []
  let para: string[] = []
  let list: string[] = []

  const flush = () => {
    if (para.length) {
      blocks.push({ type: "paragraph", text: para.join(" ") })
      para = []
    }
    if (list.length) {
      blocks.push({ type: "list", items: list })
      list = []
    }
  }

  for (const raw of src.split("\n")) {
    const line = raw.trim()
    if (line.startsWith("## ")) {
      flush()
      blocks.push({ type: "heading", text: line.slice(3).trim() })
    } else if (line.startsWith("- ")) {
      if (para.length) flush()
      list.push(line.slice(2).trim())
    } else if (line === "") {
      flush()
    } else {
      if (list.length) flush()
      para.push(line)
    }
  }
  flush()

  // The first heading is the entry title; the rest is the body.
  let title: string | null = null
  if (blocks[0]?.type === "heading") {
    title = blocks[0].text
    blocks.shift()
  }
  return { title, blocks }
}

const monthYear = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" })

const entries = computed(() =>
  CHANGELOG_RELEASES.map((release: Release, index) => ({
    release,
    date: monthYear.format(new Date(release.published_at)),
    isNew: index === 0,
    ...parse(release.changelog),
  })),
)
</script>

<template>
  <div class="min-h-[100dvh] bg-white text-gray-900">
    <!-- Top nav -->
    <header class="sticky top-0 z-10 border-b border-gray-100 bg-white/90 backdrop-blur">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
        <a href="/" aria-label="Leyyow home" class="flex items-center">
          <img src="/LYW.svg?url" alt="Leyyow" class="h-7 w-auto" />
        </a>
        <a
          href="/"
          class="bg-primary-600 hover:bg-primary-700 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-colors"
        >
          Back to app
        </a>
      </div>
    </header>

    <!-- Hero -->
    <section class="border-b border-gray-100 bg-gray-50">
      <div class="mx-auto max-w-2xl px-5 py-16 text-center sm:py-20">
        <h1 class="text-4xl font-bold tracking-tight sm:text-5xl">What's changed</h1>
        <p class="mx-auto mt-4 max-w-xl text-base leading-relaxed text-gray-600">
          Every update is logged here on the release changelog. This page never expires, so nothing
          you missed is ever really gone.
        </p>

        <!-- Presentational notify input (not wired) -->
        <form
          class="mx-auto mt-8 flex max-w-md items-center gap-2"
          @submit.prevent
          aria-label="Get notified about updates"
        >
          <input
            type="email"
            inputmode="email"
            placeholder="Enter your email"
            class="focus:border-primary-500 focus:ring-primary-100 h-12 flex-1 rounded-full border border-gray-200 bg-white px-5 text-sm outline-none focus:ring-4"
          />
          <button
            type="submit"
            class="bg-primary-600 hover:bg-primary-700 h-12 shrink-0 rounded-full px-6 text-sm font-semibold text-white transition-colors"
          >
            Notify me
          </button>
        </form>
      </div>
    </section>

    <!-- Timeline -->
    <main class="mx-auto max-w-5xl px-5 py-14 sm:py-16">
      <article
        v-for="entry in entries"
        :key="entry.release.id"
        class="relative pb-14 last:pb-0 lg:grid lg:grid-cols-[220px_1fr] lg:gap-12"
      >
        <!-- Left rail: date -->
        <div class="mb-4 lg:mb-0 lg:border-r lg:border-gray-100 lg:pr-12 lg:text-right">
          <time :datetime="entry.release.published_at" class="text-sm font-semibold text-gray-500">
            {{ entry.date }}
          </time>
        </div>

        <!-- Content -->
        <div class="min-w-0">
          <Chip v-if="entry.isNew" label="New" />

          <img
            v-if="entry.release.media"
            :src="entry.release.media"
            :alt="entry.title ?? 'Release image'"
            class="mb-6 w-full rounded-2xl border border-gray-100 object-cover"
          />

          <h2 v-if="entry.title" class="text-2xl font-bold tracking-tight">{{ entry.title }}</h2>

          <div class="mt-4 space-y-4">
            <template v-for="(block, i) in entry.blocks" :key="i">
              <h3 v-if="block.type === 'heading'" class="text-base font-semibold text-gray-900">
                {{ block.text }}
              </h3>
              <p v-else-if="block.type === 'paragraph'" class="text-[15px] leading-7 text-gray-600">
                {{ block.text }}
              </p>
              <ul v-else class="space-y-2">
                <li
                  v-for="(item, j) in block.items"
                  :key="j"
                  class="flex gap-3 text-[15px] leading-7 text-gray-600"
                >
                  <span
                    class="bg-primary-500 mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full"
                    aria-hidden="true"
                  />
                  <span>{{ item }}</span>
                </li>
              </ul>
            </template>
          </div>
        </div>
      </article>

      <p v-if="entries.length === 0" class="text-gray-500">No releases yet.</p>
    </main>

    <!-- Footer -->
    <footer class="border-t border-gray-100 bg-gray-50">
      <div class="mx-auto max-w-5xl px-5 py-12">
        <div class="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <img src="/LYW.svg?url" alt="Leyyow" class="h-7 w-auto" />
            <p class="mt-3 max-w-xs text-sm text-gray-500">
              Everything you need to run and grow your business.
            </p>
          </div>
          <nav class="flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <a href="/dashboard" class="text-gray-600 hover:text-gray-900">Dashboard</a>
            <a href="/orders" class="text-gray-600 hover:text-gray-900">Orders</a>
            <a href="/inventory" class="text-gray-600 hover:text-gray-900">Inventory</a>
            <a href="/changelog" class="text-gray-600 hover:text-gray-900">Changelog</a>
          </nav>
        </div>
        <p class="mt-10 border-t border-gray-100 pt-6 text-sm text-gray-400">
          © {{ new Date().getFullYear() }} Leyyow. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>
