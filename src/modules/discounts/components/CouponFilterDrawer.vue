<template>
  <!--
    NOTE: The coupon list API only supports `search` + `ordering`, so the
    filters applied here are evaluated client-side over the current page only.
    ListFilterDrawer renders its own template/footer and exposes no slot for
    extra body content, so we cannot inject a visual hint about this limitation
    here — documented as a comment instead.
  -->
  <ListFilterDrawer
    :model-value="modelValue"
    :filter-groups="filterGroups"
    @update:model-value="(v: boolean) => emit('update:modelValue', v)"
    @apply="(f) => emit('apply', f)"
  />
</template>

<script setup lang="ts">
import ListFilterDrawer from "@components/ListFilterDrawer.vue"
import type { FilterGroup } from "@components/ListFilterDrawer.vue"

defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  "update:modelValue": [boolean]
  apply: [Record<string, string | null>]
}>()

const filterGroups: FilterGroup[] = [
  {
    key: "status",
    label: "Status",
    options: [
      { value: "active", label: "Active", color: "success", showDot: true },
      { value: "disabled", label: "Disabled", color: "alt", showDot: true },
      { value: "expired", label: "Expired", color: "error", showDot: true },
    ],
  },
  {
    key: "scope",
    label: "Scope",
    options: [
      { value: "order", label: "Order", color: "blue" },
      { value: "products", label: "Product", color: "purple" },
    ],
  },
  {
    key: "type",
    label: "Discount Type",
    options: [
      { value: "percentage", label: "Percentage" },
      { value: "fixed", label: "Fixed Amount" },
    ],
  },
]
</script>
