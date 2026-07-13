<template>
  <!-- Filters map to the `/discounts/` server-side query params: status,
       target_type (scope) and discount_type (type). -->
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
    label: "Target",
    options: [
      { value: "products", label: "Product", color: "primary" },
      { value: "categories", label: "Category", color: "purple" },
      { value: "storefront", label: "Storefront", color: "blue" },
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
