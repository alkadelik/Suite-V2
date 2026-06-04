<template>
  <div class="space-y-4">
    <!-- Sub-header -->
    <IconHeader icon-name="shop-add" subtext="Add the details of the coupon you want to create." />

    <!-- Total usage -->
    <TextField
      label="Total number of times coupon can be used (Optional)"
      type="number"
      :model-value="model.max_usage"
      placeholder="e.g 10"
      @update:model-value="(v: string) => update({ max_usage: v })"
    />

    <!-- Per-customer usage -->
    <TextField
      label="Maximum usage per customer (Optional)"
      type="number"
      :model-value="model.max_usage_per_customer"
      placeholder="e.g 1"
      @update:model-value="(v: string) => update({ max_usage_per_customer: v })"
    />

    <!-- Minimum requirements -->
    <div class="space-y-3">
      <h3 class="text-core-800 text-sm font-semibold">Minimum Requirements to Trigger Discount</h3>

      <!-- Minimum Cart Amount -->
      <div>
        <div class="flex items-start gap-3">
          <Checkbox
            :model-value="model.enable_min_amount"
            class="mt-0.5 !flex-none"
            @update:model-value="(v: boolean) => update({ enable_min_amount: v })"
          />
          <div class="min-w-0">
            <p class="text-core-800 text-sm font-medium">Minimum Cart Amount</p>
            <p class="text-core-500 mt-0.5 text-xs">
              Discount should be triggered when total cart cost exceeds…
            </p>
          </div>
        </div>

        <div v-if="model.enable_min_amount" class="mt-3 pl-8">
          <TextField
            type="number"
            format="currency"
            :model-value="model.min_order_amount"
            placeholder="0.00"
            @update:model-value="(v: string) => update({ min_order_amount: v })"
          />
          <div class="text-core-500 mt-1.5 flex items-center gap-1 text-xs">
            <Icon name="info-circle" size="14" class="shrink-0" />
            <span>This will apply to all products</span>
          </div>
        </div>
      </div>

      <!-- Minimum Cart Item Quantity -->
      <div>
        <div class="flex items-start gap-3">
          <Checkbox
            :model-value="model.enable_min_items"
            class="mt-0.5 !flex-none"
            @update:model-value="(v: boolean) => update({ enable_min_items: v })"
          />
          <div class="min-w-0">
            <p class="text-core-800 text-sm font-medium">Minimum Cart Item Quantity</p>
            <p class="text-core-500 mt-0.5 text-xs">
              Discount should be triggered when total cart items exceeds…
            </p>
          </div>
        </div>

        <div v-if="model.enable_min_items" class="mt-3 pl-8">
          <TextField
            type="number"
            :model-value="model.min_cart_items"
            placeholder="0"
            @update:model-value="(v: string) => update({ min_cart_items: v })"
          />
          <div class="text-core-500 mt-1.5 flex items-center gap-1 text-xs">
            <Icon name="info-circle" size="14" class="shrink-0" />
            <span>This will apply to all products</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import TextField from "@components/form/TextField.vue"
import Checkbox from "@components/form/Checkbox.vue"
import Icon from "@components/Icon.vue"
import IconHeader from "@components/IconHeader.vue"
import type { ICouponFormModel } from "@modules/discounts/types"

const props = defineProps<{ modelValue: ICouponFormModel }>()
const emit = defineEmits<{
  "update:modelValue": [value: ICouponFormModel]
}>()

const model = computed(() => props.modelValue)

/** Emit a fresh object so the prop is never mutated. */
function update(patch: Partial<ICouponFormModel>): void {
  emit("update:modelValue", { ...props.modelValue, ...patch })
}
</script>
