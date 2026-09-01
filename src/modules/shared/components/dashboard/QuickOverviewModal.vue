<template>
  <Modal :open="open" title="Quick Overview" variant="bottom-nav" @close="$emit('close')">
    <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 md:px-5">
      <p
        v-for="(sentence, i) in paragraphs"
        :key="i"
        class="text-core-700 text-sm leading-relaxed md:text-base"
        :class="i > 0 ? 'mt-4' : ''"
      >
        <template v-for="(part, j) in sentence" :key="j">
          <strong v-if="part.bold" class="text-core-900 font-semibold">{{ part.text }}</strong>
          <template v-else>{{ part.text }}</template>
        </template>
      </p>
    </div>

    <template #footer>
      <button
        type="button"
        class="text-core-900 w-full rounded-xl border border-gray-300 py-3 text-sm font-semibold md:text-base"
        @click="$emit('close')"
      >
        Got It
      </button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { computed } from "vue"
import Modal from "@components/Modal.vue"

const props = withDefaults(defineProps<{ open: boolean; line?: string }>(), { line: "" })
defineEmits<{ (e: "close"): void }>()

interface Segment {
  text: string
  bold: boolean
}

/** ₦-amounts render bold; the client performs no arithmetic (DASH-20). */
function toSegments(text: string): Segment[] {
  return text
    .split(/(₦[\d,]+)/g)
    .filter((p) => p.length > 0)
    .map((p) => ({ text: p, bold: /^₦[\d,]+$/.test(p) }))
}

/** Split the summary into sentences (paragraphs), then into bold/plain segments. */
const paragraphs = computed<Segment[][]>(() =>
  (props.line || "")
    .split(/(?<=\.)\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map(toSegments),
)
</script>
