<template>
  <div class="mt-3 rounded-xl bg-gray-50 p-3">
    <!-- Search by variant name -->
    <TextField
      :model-value="search"
      left-icon="search-lg"
      placeholder="Search by variant name"
      size="sm"
      @update:model-value="(v: string) => (search = v)"
    />

    <!-- Header hint -->
    <div class="mt-3 mb-1 flex items-center justify-between">
      <span class="text-xs font-medium text-gray-500">
        {{ allIncluded ? "All variants included" : `${modelValue.length} variant(s) selected` }}
      </span>
    </div>

    <!-- Empty -->
    <div v-if="filteredVariants.length === 0" class="py-4 text-center text-xs text-gray-400">
      No variants found
    </div>

    <!-- Variant rows -->
    <ul v-else class="max-h-64 divide-y divide-gray-100 overflow-auto">
      <li
        v-for="variant in filteredVariants"
        :key="variant.uid"
        class="flex items-center gap-3 py-2"
      >
        <Checkbox
          :model-value="isSelected(variant.uid)"
          dense
          @update:model-value="() => toggle(variant.uid)"
        />
        <div class="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          <template v-if="variantChips(variant).length">
            <Chip
              v-for="(chip, idx) in variantChips(variant)"
              :key="idx"
              :label="chip"
              size="sm"
              color="primary"
            />
          </template>
          <span v-else class="truncate text-sm text-gray-700">{{ variant.name }}</span>
        </div>
        <span class="shrink-0 text-sm font-medium text-gray-800">
          {{ variantPrice(variant) }}
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import TextField from "@components/form/TextField.vue"
import Checkbox from "@components/form/Checkbox.vue"
import Chip from "@components/Chip.vue"
import { useFormatCurrency } from "@/composables/useFormatCurrency"

/** Minimal variant shape this picker needs (a slice of catalog ProductVariant). */
export interface IPickerVariant {
  uid: string
  name: string
  price: string | number | null
  attributes?: { attribute_value?: string | null }[]
}

const props = defineProps<{
  /** Variants already loaded from the catalog product — no refetch needed. */
  variants: IPickerVariant[]
  /** Selected variant uids. An empty array means "all variants included". */
  modelValue: string[]
}>()

const emit = defineEmits<{ "update:modelValue": [value: string[]] }>()

const { format } = useFormatCurrency()

const search = ref("")

const filteredVariants = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return props.variants
  return props.variants.filter((v) => {
    const haystack = [v.name, ...variantChips(v)].join(" ").toLowerCase()
    return haystack.includes(term)
  })
})

const allIncluded = computed(() => props.modelValue.length === 0)

function variantChips(variant: IPickerVariant): string[] {
  return (variant.attributes ?? []).map((a) => a.attribute_value).filter((v): v is string => !!v)
}

/** Currency-formatted variant price, guarding non-finite values → "--". */
function variantPrice(variant: IPickerVariant): string {
  const n = Number(variant.price)
  return Number.isFinite(n) ? format(n) : "--"
}

function isSelected(uid: string): boolean {
  return props.modelValue.includes(uid)
}

function toggle(uid: string): void {
  const next = isSelected(uid)
    ? props.modelValue.filter((id) => id !== uid)
    : [...props.modelValue, uid]
  emit("update:modelValue", next)
}
</script>
