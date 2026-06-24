<template>
  <div class="space-y-4">
    <!-- Sub-header -->
    <IconHeader icon-name="tag-2" subtext="Add the details of the discount you want to create." />

    <!-- Discount Name -->
    <TextField
      label="Discount Name"
      :model-value="model.name"
      placeholder="e.g a Christmas Sales"
      required
      @update:model-value="(v: string) => update({ name: v.slice(0, 100) })"
    />

    <!-- Discount Type -->
    <SelectField
      label="Discount Type"
      :model-value="model.discountKind"
      :options="DISCOUNT_TYPE_OPTIONS"
      required
      :disabled="lockFields"
      @update:model-value="(v) => update({ discountKind: optionValue<TCouponDiscountKind>(v) })"
    />

    <!-- Percentage path -->
    <template v-if="model.discountKind === 'percentage'">
      <div>
        <label class="text-core-800 mb-1.5 block text-sm font-medium">
          What Percentage Off? <span class="text-red-500">*</span>
        </label>
        <div class="relative">
          <TextField
            type="number"
            :model-value="model.value"
            :disabled="lockFields"
            placeholder="e.g 10"
            input-class="pr-9"
            @update:model-value="(v: string) => update({ value: v })"
          />
          <div v-if="!lockFields" class="absolute inset-y-0 right-2.5 flex flex-col justify-center">
            <button
              type="button"
              class="text-core-400 hover:text-core-600 -mb-0.5 flex h-3 items-center"
              aria-label="Increase percentage"
              @click="stepPercentage(1)"
            >
              <Icon name="chevron-up" class="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              class="text-core-400 hover:text-core-600 -mt-0.5 flex h-3 items-center"
              aria-label="Decrease percentage"
              @click="stepPercentage(-1)"
            >
              <Icon name="chevron-down" class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <TextField
        label="Maximum discount amount (Optional)"
        type="number"
        format="currency"
        :model-value="model.max_discount_amount"
        :disabled="lockFields"
        placeholder="5,000"
        @update:model-value="(v: string) => update({ max_discount_amount: v })"
      />
    </template>

    <!-- Fixed path -->
    <template v-else>
      <TextField
        label="How Much Discount?"
        type="number"
        format="currency"
        :model-value="model.value"
        :disabled="lockFields"
        placeholder="5,000"
        required
        @update:model-value="(v: string) => update({ value: v })"
      />
    </template>

    <!-- Dates -->
    <DateTimeField
      label="Start Date & Time"
      required
      :disabled="lockFields"
      :model-value="model.start_at"
      @update:model-value="(v) => update({ start_at: v ?? '' })"
    />

    <DateTimeField
      label="End Date & Time (optional)"
      clearable
      :min-date="model.start_at ? new Date(model.start_at) : undefined"
      :model-value="model.end_at"
      :error="endDateError"
      @update:model-value="(v) => update({ end_at: v ?? '' })"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import TextField from "@components/form/TextField.vue"
import SelectField from "@components/form/SelectField.vue"
import DateTimeField from "@components/form/DateTimeField.vue"
import Icon from "@components/Icon.vue"
import IconHeader from "@components/IconHeader.vue"
import { DISCOUNT_TYPE_OPTIONS } from "@modules/discounts/constants"
import { optionValue } from "@modules/discounts/utils"
import type { IDiscountFormModel, TCouponDiscountKind } from "@modules/discounts/types"

// `lockFields` (Edit mode): type/value/max/start are immutable server-side — only
// name + end date stay editable.
const props = withDefaults(
  defineProps<{ modelValue: IDiscountFormModel; lockFields?: boolean }>(),
  { lockFields: false },
)
const emit = defineEmits<{ "update:modelValue": [value: IDiscountFormModel] }>()

const model = computed(() => props.modelValue)

/** Emit a fresh object so the prop is never mutated. */
function update(patch: Partial<IDiscountFormModel>): void {
  emit("update:modelValue", { ...props.modelValue, ...patch })
}

/** Nudge the percentage value, clamped to 1–100. */
function stepPercentage(delta: number): void {
  const current = Number(props.modelValue.value) || 0
  const next = Math.min(100, Math.max(1, current + delta))
  update({ value: String(next) })
}

const endDateError = computed(() => {
  const { start_at, end_at } = props.modelValue
  if (!end_at || !start_at) return undefined
  return new Date(end_at).getTime() < new Date(start_at).getTime()
    ? "End date must be after the start date"
    : undefined
})
</script>
