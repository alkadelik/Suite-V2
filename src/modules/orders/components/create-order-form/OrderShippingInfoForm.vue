<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import FormField from "@components/form/FormField.vue"
import TextField from "@components/form/TextField.vue"
import RadioInputField from "@components/form/RadioInputField.vue"
import GooglePlacesAutocomplete from "@components/GooglePlacesAutocomplete.vue"
import Icon from "@components/Icon.vue"
import Chip from "@components/Chip.vue"
import LoadingIcon from "@components/LoadingIcon.vue"
import type { ICustomer } from "@modules/customers/types"
import type { IShippingCourier } from "@modules/shared/types"
import { computed, ref, watch } from "vue"
import {
  ORDER_CHANNELS,
  anonymousCustomer,
  DELIVERY_PAYMENT_OPTION,
} from "@modules/orders/constants"
import { useGetShippingRates } from "@modules/shared/api"
import { toast } from "@/composables/useToast"
import { formatCurrency } from "@/utils/format-currency"
import * as yup from "yup"

interface ShippingInfo {
  fulfilment_method: "pickup" | "delivery"
  fulfilment_status: "unfulfilled" | "fulfilled"
  delivery_address: string
  delivery_method: "manual" | "automatic"
  courier: string
  delivery_fee: number
  order_date: string
  order_channel: { label: string; value: string }
  has_shipping: boolean
  delivery_payment_option: string
  shipping_courier: IShippingCourier | null
  shipping_rate_token: string
  customer_email: string
  customer_phone: string
}

interface OrderItem {
  variant: { uid: string; name: string; sku: string; price: string; stock: number } | null
  quantity: number
  [key: string]: unknown
}

const props = defineProps<{
  shippingInfo: ShippingInfo
  customer: ICustomer | null
  orderItems?: OrderItem[]
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

const DELIVERY_METHOD_OPTIONS = [
  { label: "Manual", value: "manual", description: "GIG, Bolt, Gokada, etc" },
  { label: "Automatic", value: "automatic", description: "Powered by ShipBubble" },
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
  return `${firstName} ${lastName}`.trim() || props.customer.full_name || "Unknown Customer"
})

// const showShipBubbleOption = computed(() => {
//   return !props.shippingInfo.fulfilment_status && props.customer?.uid !== anonymousCustomer.uid
// })

// Validation errors for manual delivery
const validationErrors = ref({ courier: "", delivery_fee: "" })

// Yup validation schema for manual delivery
const manualDeliverySchema = yup.object({
  courier: yup.string().required("Courier name is required").trim(),
  delivery_fee: yup
    .number()
    .required("Delivery fee is required")
    .min(0, "Delivery fee must be 0 or greater")
    .typeError("Delivery fee must be a valid number"),
})

// Yup validation schema for fetch rates form
const fetchRatesSchema = yup.object({
  customer_phone: yup
    .string()
    .required("Customer phone number is required")
    .trim()
    .matches(/^(\+234|0)[789]\d{9}$/, "Please enter a valid Nigerian phone number"),
  customer_email: yup
    .string()
    .required("Customer email is required")
    .trim()
    .email("Please enter a valid email address"),
  delivery_address: yup
    .string()
    .required(
      "Full shipping address is required, please select one of the options from the dropdown",
    )
    .trim()
    .min(10, "Address seems too short, please provide a complete address"),
})

// Handle invalid submission - scroll to first error and focus
const onInvalidSubmit = () => {
  const firstErrorFieldName = Object.keys(validationErrors.value).find(
    (key) => validationErrors.value[key as keyof typeof validationErrors.value],
  )

  if (firstErrorFieldName) {
    const element = document.querySelector(`[name="${firstErrorFieldName}"]`) as HTMLElement

    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" })
      element.focus()
    }
  }
}

// Validate manual delivery fields
const validateManualDelivery = async (): Promise<boolean> => {
  validationErrors.value = { courier: "", delivery_fee: "" }

  try {
    await manualDeliverySchema.validate(
      {
        courier: props.shippingInfo.courier,
        delivery_fee: props.shippingInfo.delivery_fee,
      },
      { abortEarly: false },
    )
    return true
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      err.inner.forEach((error) => {
        if (error.path && error.path in validationErrors.value) {
          validationErrors.value[error.path as keyof typeof validationErrors.value] = error.message
        }
      })
      onInvalidSubmit()
    }
    return false
  }
}

const canProceed = computed(() => {
  if (props.shippingInfo.fulfilment_method === "delivery") {
    // Allow proceeding if customer pays courier directly
    if (props.shippingInfo.delivery_payment_option === "customer_pays_courier") {
      return true
    }

    if (props.shippingInfo.delivery_method === "automatic") {
      return (
        props.shippingInfo.delivery_address.trim().length > 0 &&
        props.shippingInfo.shipping_courier !== null
      )
    } else if (props.shippingInfo.delivery_method === "manual") {
      return true
    }
  }
  return true
})

const handleNext = async () => {
  // Skip validation if customer pays courier directly
  if (
    props.shippingInfo.fulfilment_method === "delivery" &&
    props.shippingInfo.delivery_payment_option === "customer_pays_courier"
  ) {
    emit("next")
    return
  }

  if (
    props.shippingInfo.fulfilment_method === "delivery" &&
    props.shippingInfo.delivery_method === "automatic" &&
    !props.shippingInfo.shipping_courier
  ) {
    toast.error("Please select a courier or switch to manual shipping.")
    return
  }

  // Validate manual delivery fields
  if (
    props.shippingInfo.fulfilment_method === "delivery" &&
    props.shippingInfo.delivery_method === "manual"
  ) {
    const isValid = await validateManualDelivery()
    if (!isValid) {
      return
    }
  }

  if (canProceed.value) {
    emit("next")
  }
}

// Shipbubble integration
const shipBubbleRates = ref<{ couriers: IShippingCourier[] }>({ couriers: [] })
const shippingRateErrors = ref({ email: "", phone: "", address: "" })
const delivery_address = ref(props.shippingInfo.delivery_address || "")

const { mutate: getShippingRates, isPending: isGettingRates } = useGetShippingRates()

// Validate fetch rates form fields
const validateFetchRates = async (): Promise<boolean> => {
  shippingRateErrors.value = { email: "", phone: "", address: "" }

  try {
    await fetchRatesSchema.validate(
      {
        customer_phone: props.shippingInfo.customer_phone,
        customer_email: props.shippingInfo.customer_email,
        delivery_address: props.shippingInfo.delivery_address,
      },
      { abortEarly: false },
    )
    return true
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      err.inner.forEach((error) => {
        if (error.path === "customer_email") {
          shippingRateErrors.value.email = error.message
        } else if (error.path === "customer_phone") {
          shippingRateErrors.value.phone = error.message
        } else if (error.path === "delivery_address") {
          shippingRateErrors.value.address = error.message
        }
      })
    }
    return false
  }
}

const fetchShippingRates = async () => {
  // Validate form before fetching rates
  const isValid = await validateFetchRates()
  if (!isValid) {
    return
  }

  // Transform orderItems to the required items format
  const items =
    props.orderItems?.map((item) => ({
      variant: item.variant?.uid || "",
      quantity: item.quantity,
    })) || []

  getShippingRates(
    {
      delivery_address: props.shippingInfo.delivery_address,
      customer_name: customerName.value,
      customer_email: props.shippingInfo.customer_email,
      customer_phone: props.shippingInfo.customer_phone,
      items,
    },
    {
      onSuccess: (res) => {
        // Reset selected courier
        updateField("shipping_courier", null)

        if (res?.data?.data?.rates?.couriers?.length) {
          shipBubbleRates.value = res.data.data.rates
          updateField("shipping_rate_token", res.data.data.rates.request_token)
        } else {
          shippingRateErrors.value.address =
            "No shipping rates found for the provided address. Please check the address and try again."
        }
      },
      onError: (error: unknown) => {
        const err =
          (error as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          "Error fetching shipping rates"
        shippingRateErrors.value.address = err
      },
    },
  )
}

const selectCourier = (item: IShippingCourier) => {
  updateField("shipping_courier", item)
  updateField("delivery_fee", item.total_amount || item.total || 0)
  updateField("courier", item.courier_name)
}

// Watch for address changes and fetch rates
watch(
  () => props.shippingInfo.delivery_address,
  (newVal, oldVal) => {
    if (newVal && newVal !== oldVal && props.shippingInfo.delivery_method === "automatic") {
      shipBubbleRates.value = { couriers: [] }
      fetchShippingRates()
    }
  },
)

// Sync customer email and phone from customer prop
watch(
  () => props.customer,
  (val) => {
    if (val && val.uid !== anonymousCustomer.uid) {
      if (val.email && !props.shippingInfo.customer_email) {
        updateField("customer_email", val.email)
      }
      if (val.phone && !props.shippingInfo.customer_phone) {
        updateField("customer_phone", val.phone)
      }
    }
  },
  { immediate: true },
)

// Clear shipping price when switching fulfilment method
watch(
  () => props.shippingInfo.fulfilment_method,
  (val) => {
    if (val === "pickup") {
      updateField("delivery_fee", 0)
      updateField("courier", "")
    }
  },
)

// Reset delivery method when switching payment option
watch(
  () => props.shippingInfo.delivery_payment_option,
  (val) => {
    if (val === "free_shipping" || val === "customer_pays_courier") {
      updateField("delivery_method", "manual")
    }
  },
)
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
            type="select"
            :options="ORDER_CHANNELS"
            name="order_channel"
            label="Order Channel"
            :modelValue="shippingInfo.order_channel"
            @update:modelValue="updateField('order_channel', $event)"
            required
          />

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

      <div
        v-if="shippingInfo.fulfilment_method === 'delivery'"
        class="my-6 rounded-xl bg-white p-4"
      >
        <h3 class="mb-4 text-sm font-medium">
          Who
          {{ shippingInfo.fulfilment_status === "fulfilled" ? "paid" : "will pay" }} for delivery?
        </h3>

        <hr class="mb-4 border-gray-300" />
        <RadioInputField
          :options="DELIVERY_PAYMENT_OPTION"
          :modelValue="shippingInfo.delivery_payment_option"
          @update:modelValue="updateField('delivery_payment_option', $event)"
          orientation="vertical"
        />
      </div>

      <div
        v-if="
          shippingInfo.fulfilment_method === 'delivery' &&
          shippingInfo.delivery_payment_option !== 'customer_pays_courier'
        "
        class="rounded-xl bg-white p-4"
      >
        <h3 class="mb-4 text-sm font-medium">Delivery Information</h3>
        <hr class="mb-4 border-gray-300" />
        <div class="space-y-4">
          <RadioInputField
            v-if="shippingInfo.delivery_payment_option !== 'customer_pays_courier'"
            label="Delivery Method"
            :options="DELIVERY_METHOD_OPTIONS"
            :modelValue="shippingInfo.delivery_method"
            @update:modelValue="updateField('delivery_method', $event)"
          >
            <template #content="{ option }">
              <div class="flex flex-1 flex-col gap-1.5">
                <span class="text-sm font-medium text-gray-700">
                  {{ option.label }}
                </span>

                <Chip v-if="option.value === 'automatic'" show-dot color="blue" radius="2xl">
                  <span class="hidden lg:inline"> Powered by </span>
                  <img src="/images/shipbubble-logo.png" alt="" class="ml-1 inline-block" />
                </Chip>

                <span
                  v-if="option.description && option.value === 'manual'"
                  class="text-xs text-gray-400"
                >
                  {{ option.description }}
                </span>
              </div>
            </template>
          </RadioInputField>

          <!-- ShipBubble Automatic Delivery -->
          <template v-if="shippingInfo.delivery_method === 'automatic'">
            <div class="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
              <TextField
                type="tel"
                name="customer_phone"
                label="Customer Phone"
                placeholder="+234 XXX XXX XXXX"
                :modelValue="shippingInfo.customer_phone"
                @update:modelValue="
                  (value: string) => {
                    updateField('customer_phone', value)
                    shippingRateErrors.phone = ''
                  }
                "
                :error="shippingRateErrors.phone"
                required
              />

              <TextField
                type="email"
                name="customer_email"
                label="Customer Email"
                placeholder="customer@example.com"
                :modelValue="shippingInfo.customer_email"
                @update:modelValue="
                  (value: string) => {
                    updateField('customer_email', value)
                    shippingRateErrors.email = ''
                  }
                "
                :error="shippingRateErrors.email"
                required
              />

              <GooglePlacesAutocomplete
                name="delivery_address"
                label="Delivery Address"
                placeholder="Enter delivery address"
                :modelValue="delivery_address"
                @update:modelValue="delivery_address = $event"
                @selected="
                  (item: any) => {
                    updateField('delivery_address', item.description)
                    shippingRateErrors.address = ''
                  }
                "
                :error="shippingRateErrors.address"
                required
              />

              <div class="flex justify-end">
                <AppButton
                  label="Fetch Rates"
                  size="sm"
                  class="w-48"
                  :loading="isGettingRates"
                  @click="fetchShippingRates"
                />
              </div>

              <!-- Shipbubble couriers selection -->
              <div
                v-if="
                  shipBubbleRates.couriers?.length ||
                  shippingInfo.shipping_courier ||
                  isGettingRates
                "
                class="mt-6"
              >
                <p class="text-core-600 mb-2 text-xs">Select your preferred courier</p>
                <LoadingIcon v-if="isGettingRates" icon-class="text-black h-6 w-6" />
                <div
                  v-for="item in isGettingRates
                    ? []
                    : shipBubbleRates.couriers?.length
                      ? shipBubbleRates.couriers
                      : shippingInfo.shipping_courier
                        ? [shippingInfo.shipping_courier]
                        : []"
                  :key="item.courier_id"
                  class="border-core-200 mb-2 flex cursor-pointer items-center gap-2 rounded-lg border bg-white p-2"
                  :class="{
                    '!border-primary-500 !bg-primary-50':
                      shippingInfo.shipping_courier?.courier_id === item.courier_id,
                  }"
                  @click="selectCourier(item)"
                >
                  <img
                    v-if="item.courier_image"
                    :src="item.courier_image"
                    alt="Courier Logo"
                    class="border-core-200 size-10 rounded-lg border bg-white"
                  />
                  <span
                    v-else
                    class="border-core-200 flex size-10 items-center justify-center rounded-lg border"
                  >
                    <Icon name="box" />
                  </span>
                  <div class="flex-1 text-sm">
                    <h5 class="text-gray-900">{{ item.courier_name }}</h5>
                    <span class="flex items-center gap-1 text-xs text-gray-400">
                      <Icon
                        name="star"
                        :type="item.ratings === 5 ? 'bold' : item.ratings > 2 ? 'bulk' : 'linear'"
                        size="14"
                        class="text-primary-500"
                      />
                      {{ item.ratings }} ({{ item.votes }}
                      {{ item.votes > 1 ? "reviews" : "review" }})
                    </span>
                  </div>
                  <span class="text-sm font-medium">
                    {{ formatCurrency(item.total_amount || item.total || 0) }}
                  </span>
                </div>
              </div>

              <div
                class="border-error-500 bg-error-500/10 border-y p-2 text-center text-xs text-black"
              >
                Provided by
                <img
                  src="/images/shipbubble-logo.png"
                  alt="Shipbubble"
                  class="ml-1 inline-block h-4 align-middle"
                />
              </div>
            </div>
          </template>

          <!-- Manual Delivery -->
          <template v-if="shippingInfo.delivery_method === 'manual'">
            <div class="grid grid-cols-1 gap-3">
              <TextField
                type="text"
                name="courier"
                label="Courier Name"
                placeholder="e.g GoKada"
                :model-value="shippingInfo.courier"
                @update:model-value="
                  (value: string) => {
                    updateField('courier', value)
                    validationErrors.courier = ''
                  }
                "
                :error="validationErrors.courier"
                required
              />

              <TextField
                type="number"
                name="delivery_fee"
                label="Delivery Fee"
                placeholder="0.00"
                :model-value="shippingInfo.delivery_fee"
                @update:model-value="
                  (value: string) => {
                    updateField('delivery_fee', Number(value))
                    validationErrors.delivery_fee = ''
                  }
                "
                :error="validationErrors.delivery_fee"
                :min="0"
                step="0.01"
                required
              />
            </div>
          </template>
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
