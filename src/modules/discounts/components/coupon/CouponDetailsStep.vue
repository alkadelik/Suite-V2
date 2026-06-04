<template>
  <div class="space-y-4">
    <!-- Sub-header -->
    <IconHeader icon-name="shop-add" subtext="Add the details of the coupon you want to create." />

    <!-- Select Coupon Scope -->
    <div>
      <label class="text-core-800 mb-1.5 block text-sm font-medium">Select Coupon Scope</label>
      <div class="grid grid-cols-2 gap-3">
        <button
          v-for="opt in SCOPE_OPTIONS"
          :key="opt.value"
          type="button"
          role="radio"
          :aria-checked="model.scope === opt.value"
          :class="[
            'flex items-start gap-2.5 rounded-xl border p-3 text-left transition-colors',
            model.scope === opt.value
              ? 'border-primary-500 ring-primary-500 bg-primary-50 ring-1'
              : 'border-core-100 bg-core-25 hover:border-primary-300',
          ]"
          @click="update({ scope: opt.value })"
        >
          <span
            :class="[
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
              model.scope === opt.value
                ? 'bg-primary-100 text-primary-600'
                : 'bg-core-100 text-core-500',
            ]"
          >
            <Icon :name="opt.icon" class="h-4 w-4" />
          </span>
          <span class="min-w-0">
            <span class="text-core-800 block text-sm font-medium">{{ opt.title }}</span>
            <span class="text-core-500 mt-0.5 block text-xs">{{ opt.subtitle }}</span>
          </span>
        </button>
      </div>
    </div>

    <!-- Coupon Name -->
    <TextField
      label="Coupon Name"
      :model-value="model.name"
      placeholder="e.g a Christmas Sales"
      required
      @update:model-value="(v: string) => update({ name: v.slice(0, 100) })"
    />

    <!-- Coupon Code -->
    <div>
      <div class="mb-1.5 flex items-center justify-between">
        <label class="text-core-800 text-sm font-medium">
          Coupon Code <span class="text-red-500">*</span>
        </label>
        <button
          type="button"
          class="text-primary-600 hover:text-primary-700 text-sm font-medium"
          @click="onGenerateCode"
        >
          Generate Code
        </button>
      </div>
      <TextField
        :model-value="model.code"
        placeholder="SUHMERHD"
        @update:model-value="onCodeInput"
      />
      <div class="text-core-500 mt-1.5 flex items-center gap-1 text-xs">
        <Icon name="info-circle" size="14" class="shrink-0" />
        <span>Customers must enter this code at checkout.</span>
      </div>
    </div>

    <!-- Discount Type -->
    <SelectField
      label="Discount Type"
      :model-value="model.discountKind"
      :options="DISCOUNT_TYPE_OPTIONS"
      required
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
            :model-value="model.percentage_off"
            placeholder="e.g 10"
            input-class="pr-9"
            @update:model-value="(v: string) => update({ percentage_off: v })"
          />
          <div class="absolute inset-y-0 right-2.5 flex flex-col justify-center">
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
        label="Maximum coupon discount amount (Optional)"
        type="number"
        format="currency"
        :model-value="model.max_discount_amount"
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
        :model-value="model.flat_amount"
        placeholder="5,000"
        required
        @update:model-value="(v: string) => update({ flat_amount: v })"
      />
    </template>

    <!-- Dates -->
    <DateTimeField
      label="Start Date & Time"
      required
      :model-value="model.valid_from"
      @update:model-value="(v) => update({ valid_from: v ?? '' })"
    />

    <DateTimeField
      label="End Date & Time (optional)"
      clearable
      :min-date="model.valid_from ? new Date(model.valid_from) : undefined"
      :model-value="model.valid_until"
      :error="endDateError"
      @update:model-value="(v) => update({ valid_until: v ?? '' })"
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
import { generateCouponCode, optionValue } from "@modules/discounts/utils"
import type { ICouponFormModel, TCouponDiscountKind, TCouponScope } from "@modules/discounts/types"

const props = defineProps<{ modelValue: ICouponFormModel }>()
const emit = defineEmits<{
  "update:modelValue": [value: ICouponFormModel]
}>()

const model = computed(() => props.modelValue)

const SCOPE_OPTIONS: { value: TCouponScope; title: string; subtitle: string; icon: string }[] = [
  {
    value: "order",
    title: "Order",
    subtitle: "Applies to total order amount",
    icon: "receipt-text",
  },
  {
    value: "products",
    title: "Products",
    subtitle: "Applies to specific product(s)",
    icon: "box",
  },
]

/** Emit a fresh object so the prop is never mutated. */
function update(patch: Partial<ICouponFormModel>): void {
  emit("update:modelValue", { ...props.modelValue, ...patch })
}

function onCodeInput(v: string): void {
  const sanitized = v
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 50)
  update({ code: sanitized })
}

function onGenerateCode(): void {
  update({ code: generateCouponCode() })
}

/** Nudge the percentage value, clamped to 1–100. */
function stepPercentage(delta: number): void {
  const current = Number(props.modelValue.percentage_off) || 0
  const next = Math.min(100, Math.max(1, current + delta))
  update({ percentage_off: String(next) })
}

// ---------------------------------------------------------------------------
// Validation (local — inline end-date error; host owns the Continue gate)
// ---------------------------------------------------------------------------
const endDateError = computed(() => {
  const { valid_from, valid_until } = props.modelValue
  if (!valid_until || !valid_from) return undefined
  return new Date(valid_until).getTime() < new Date(valid_from).getTime()
    ? "End date must be after the start date"
    : undefined
})
</script>
