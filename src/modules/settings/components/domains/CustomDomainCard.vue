<template>
  <section class="overflow-hidden rounded-xl border border-gray-200 bg-white">
    <header class="border-b border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800">
      Connected Domain
    </header>
    <div class="flex items-start justify-between gap-3 px-4 py-4 md:items-center">
      <RouterLink :to="detailRoute" class="min-w-0 flex-1">
        <p class="truncate text-sm font-bold text-gray-900 md:text-base">{{ fullUrl }}</p>
        <div class="mt-1 flex flex-wrap gap-1.5">
          <Chip
            v-for="chip in meta.chips"
            :key="chip.label"
            :label="chip.label"
            :color="chip.color"
            size="sm"
            variant="outlined"
            showDot
          />
        </div>
      </RouterLink>

      <!-- Desktop actions -->
      <div class="hidden shrink-0 items-center gap-4 md:flex">
        <button
          v-if="domain.status === 'ACTIVE'"
          type="button"
          disabled
          title="Coming soon"
          class="flex cursor-not-allowed items-center gap-1 text-sm text-gray-400"
        >
          <Icon name="star" size="18" /> Make Primary
        </button>
        <button
          type="button"
          disabled
          title="Coming soon"
          class="flex cursor-not-allowed items-center gap-1 text-sm text-gray-400"
        >
          <Icon name="edit" size="18" /> Edit
        </button>
        <button
          v-if="domain.status !== 'ACTIVE'"
          type="button"
          class="text-primary-700 flex cursor-pointer items-center gap-1 text-sm font-medium disabled:opacity-50"
          :disabled="retrying"
          @click="emit('retry')"
        >
          <Icon name="refresh-cw-01" size="18" /> {{ retrying ? "Retrying…" : "Retry" }}
        </button>
        <button
          type="button"
          class="text-error-600 flex cursor-pointer items-center gap-1 text-sm font-medium"
          @click="emit('disconnect')"
        >
          <Icon name="link-01" size="18" /> Disconnect
        </button>
      </div>

      <!-- Mobile actions -->
      <div class="shrink-0 md:hidden">
        <DropdownMenu
          :items="mobileActions"
          placement="bottom-end"
          :show-chevron="false"
          size="sm"
          trigger-class="!bg-primary-50 !p-2 hover:!bg-primary-100 !border-0 !rounded-lg"
          @click.stop
        >
          <template #trigger>
            <Icon name="dots-vertical" />
          </template>
        </DropdownMenu>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { computed } from "vue"
import { RouterLink } from "vue-router"
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import { DOMAIN_STATUS_META } from "../../constants"
import type { TCustomDomain } from "../../types"

type TMenuItem = {
  label: string
  icon: string
  class?: string
  iconClass?: string
  action: () => void
}

const props = defineProps<{ domain: TCustomDomain; retrying?: boolean }>()
const emit = defineEmits<{ retry: []; disconnect: []; view: [] }>()

const meta = computed(() => DOMAIN_STATUS_META[props.domain.status])
const fullUrl = computed(() => `https://${props.domain.domain.replace(/^https?:\/\//, "")}`)
const detailRoute = computed(() => `/settings/domains/${props.domain.uid}`)

const mobileActions = computed<TMenuItem[]>(() => {
  const items: TMenuItem[] = [{ label: "View Details", icon: "eye", action: () => emit("view") }]
  if (props.domain.status !== "ACTIVE") {
    items.push({ label: "Retry", icon: "refresh-cw-01", action: () => emit("retry") })
  }
  items.push({
    label: "Disconnect",
    icon: "link-01",
    class: "text-red-600 hover:bg-red-50",
    iconClass: "text-red-600",
    action: () => emit("disconnect"),
  })
  return items
})
</script>
