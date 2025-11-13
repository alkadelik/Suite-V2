<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import FormField from "@components/form/FormField.vue"
import RadioInputField from "@components/form/RadioInputField.vue"
import Icon from "@components/Icon.vue"
import type { ICustomer } from "@modules/customers/types"
import { computed } from "vue"

interface ShippingInfo {
  fulfilment_method: "pickup" | "delivery"
  fulfilment_status: "unfulfilled" | "fulfilled"
  delivery_address: string
  delivery_method: "manual" | "automatic"
  courier: string
  delivery_fee: number
  order_date: string
  order_channel: string
  has_shipping: boolean
}

const props = defineProps<{
  shippingInfo: ShippingInfo
  customer: ICustomer | null
}>()

const emit = defineEmits<{
  next: []
  prev: []
  "update:shippingInfo": [info: ShippingInfo]
}>()

const FULFILMENT_METHODS = [
  { label: "Delivery", value: "delivery" },
  { label: "Pickup", value: "pickup" },
]

const FULFILMENT_STATUS = [
  { label: "Yes", value: "fulfilled" },
  { label: "No", value: "unfulfilled" },
]

const DELIVERY_METHODS = [
  { label: "Manual (I'll handle shipping)", value: "manual" },
  { label: "Automatic (Use courier service)", value: "automatic" },
]

const updateField = (field: keyof ShippingInfo, value: unknown) => {
  emit("update:shippingInfo", {
    ...props.shippingInfo,
    [field]: value,
  })
}

const customerName = computed(() => {
  if (!props.customer) return "Unknown Customer"
  const firstName = props.customer.first_name || ""
  const lastName = props.customer.last_name || ""
  return props.customer.full_name || `${firstName} ${lastName}`.trim() || "Unknown Customer"
})

const canProceed = computed(() => {
  if (props.shippingInfo.delivery_method === "automatic") {
    return props.shippingInfo.delivery_address.trim().length > 0
  }
  return true
})

const handleNext = () => {
  if (canProceed.value) {
    emit("next")
  }
}
</script>

<template>
  <div>
    <div class="bg-core-50 mb-2 flex size-10 items-center justify-center rounded-xl p-2">
      <Icon name="truck-fast" size="28" />
    </div>
    <p class="mb-4 text-sm">
      Provide the shipping method and address for {{ customerName }}'s order.
    </p>

    <div class="space-y-4">
      <div class="rounded-xl bg-white p-4">
        <h3 class="mb-4 text-sm font-medium">Order Details</h3>
        <hr class="mb-4 border-gray-300" />
        <div class="space-y-4">
          <FormField
            type="date"
            name="order_date"
            label="Order Date"
            :modelValue="shippingInfo.order_date"
            @update:modelValue="updateField('order_date', $event)"
          />
        </div>
      </div>

      <div class="my-6 rounded-xl bg-white p-4">
        <h3 class="mb-4 text-sm font-medium">Has the product been delivered?</h3>
        <hr class="mb-4 border-gray-300" />
        <RadioInputField
          :options="FULFILMENT_STATUS"
          :modelValue="shippingInfo.fulfilment_status"
          @update:modelValue="updateField('fulfilment_status', $event)"
        />
      </div>

      <div class="my-6 rounded-xl bg-white p-4">
        <h3 class="mb-4 text-sm font-medium">
          How
          {{ shippingInfo.fulfilment_status === "fulfilled" ? "was it" : "will it be" }} delivered?
        </h3>
        <hr class="mb-4 border-gray-300" />
        <RadioInputField
          :options="FULFILMENT_METHODS"
          :modelValue="shippingInfo.fulfilment_method"
          @update:modelValue="updateField('fulfilment_method', $event)"
        />
      </div>

      <div v-if="shippingInfo.fulfilment_method === 'delivery'" class="rounded-xl bg-white p-4">
        <h3 class="mb-4 text-sm font-medium">Delivery Information</h3>
        <hr class="mb-4 border-gray-300" />
        <div class="space-y-4">
          <RadioInputField
            label="Delivery Method"
            :options="DELIVERY_METHODS"
            :modelValue="shippingInfo.delivery_method"
            @update:modelValue="updateField('delivery_method', $event)"
            disabled
          />

          <FormField
            v-if="shippingInfo.delivery_method === 'automatic'"
            type="textarea"
            name="delivery_address"
            label="Delivery Address"
            :rows="2"
            placeholder="Enter delivery address"
            :modelValue="shippingInfo.delivery_address"
            @update:modelValue="updateField('delivery_address', $event)"
            :required="true"
          />

          <FormField
            v-if="shippingInfo.delivery_method === 'automatic'"
            type="text"
            name="courier"
            label="Courier Service"
            placeholder="e.g. DHL, FedEx, etc."
            :modelValue="shippingInfo.courier"
            @update:modelValue="updateField('courier', $event)"
          />

          <FormField
            type="number"
            name="delivery_fee"
            label="Delivery Fee"
            placeholder="0.00"
            :modelValue="shippingInfo.delivery_fee"
            @update:modelValue="updateField('delivery_fee', Number($event))"
            :min="0"
            step="0.01"
          />
        </div>
      </div>
    </div>

    <div class="h-24" />

    <div class="border-core-200 fixed right-0 bottom-0 left-0 flex gap-3 border-t bg-white p-6">
      <AppButton label="Back" color="alt" class="w-1/3" icon="arrow-left" @click="emit('prev')" />
      <AppButton label="Next" class="w-2/3" :disabled="!canProceed" @click="handleNext" />
    </div>
  </div>
</template>
