<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import FormField from "@components/form/FormField.vue"
import TextField from "@components/form/TextField.vue"
import SelectField from "@components/form/SelectField.vue"
import RadioInputField from "@components/form/RadioInputField.vue"
import GooglePlacesAutocomplete from "@components/GooglePlacesAutocomplete.vue"
import Icon from "@components/Icon.vue"
import Chip from "@components/Chip.vue"
import EmptyState from "@components/EmptyState.vue"
import type { ICustomer } from "@modules/customers/types"
import type { IShippingCourier } from "@modules/shared/types"
import { Field } from "vee-validate"
import { computed, ref, watch } from "vue"
import {
  ORDER_CHANNELS,
  anonymousCustomer,
  DELIVERY_PAYMENT_OPTION,
} from "@modules/orders/constants"
import {
  useGetExpressDeliveryOptions,
  useGetManualDeliveryOptions,
  useGetShippingRates,
} from "@modules/shared/api"
import { toast } from "@/composables/useToast"
import { formatCurrency } from "@/utils/format-currency"
import * as yup from "yup"
import { useSettingsStore } from "@modules/settings/store"
import { useMediaQuery } from "@vueuse/core"
import { useGetCustomerAddresses } from "@modules/customers/api"

interface ShippingInfo {
  fulfilment_method: "pickup" | "delivery"
  fulfilment_status: "unfulfilled" | "fulfilled"
  delivery_address: string | { label: string; value: string } | null
  delivery_type: "standard" | "express"
  delivery_method: "manual" | "shipbubble" | "custom"
  courier: string | IShippingCourier
  delivery_fee: number
  order_date: string
  order_channel: { label: string; value: string }
  has_shipping: boolean
  delivery_payment_option: string
  shipping_rate_token: string
  customer_email: string
  customer_phone: string
  express_delivery_option?: string
  manual_delivery_option?: string
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
  openAddAddress: []
}>()

const ratesFetched = ref(false)

const deliveryDetails = computed(
  () => useSettingsStore().liveStatus?.criteria?.delivery_options?.details,
)

const FULFILMENT_METHODS = [
  { label: "Delivery", value: "delivery" },
  { label: "Pickup", value: "pickup" },
]

const FULFILMENT_STATUS = [
  { label: "Yes", value: "fulfilled" },
  { label: "No", value: "unfulfilled" },
]

const DELIVERY_METHOD_OPTIONS = computed(() =>
  [
    { label: "Manual", value: "manual", description: "Select your delivery location" },
    { label: "Shipbubble", value: "shipbubble", description: "" },
    { label: "Custom", value: "custom", description: "GIG, Bolt, Gokada, etc" },
  ].filter((x) => {
    const { shipping_account, delivery_enabled, manual_delivery_enabled } =
      deliveryDetails.value || {}
    if (x.value === "shipbubble") {
      return shipping_account && delivery_enabled
    }
    if (x.value === "manual") {
      return manual_delivery_enabled && !delivery_enabled
    }
    return true
  }),
)

const DELIVERY_TYPE_OPTIONS = [
  { label: "Express", value: "express" },
  { label: "Standard", value: "standard" },
]

const { data: expressOptions } = useGetExpressDeliveryOptions()
const { data: manualOptions } = useGetManualDeliveryOptions()
const { data: customerAddresses } = useGetCustomerAddresses(
  computed(() => props.customer?.uid || ""),
)

const CUSTOMER_ADDRESSES = computed(() => {
  if (!customerAddresses.value) return []
  return customerAddresses.value.results?.map((addr) => ({
    label: addr.address,
    value: addr.uid,
  }))
})

// map from api: uid -> value, name -> label, price -> description
const EXPRESS_DELIVERY_LOCATIONS = computed(
  () =>
    expressOptions.value?.map((v) => ({
      label: v.location,
      value: v.uid,
      description: formatCurrency(v.amount, { kobo: true }),
    })) ?? [],
)

const MANUAL_DELIVERY_LOCATIONS = computed(
  () =>
    manualOptions.value?.map((v) => ({
      label: v.location,
      value: v.uid,
      description: formatCurrency(v.amount, { kobo: true }),
    })) ?? [],
)

const updateField = (field: keyof ShippingInfo, value: unknown) => {
  const updatedInfo = { ...props.shippingInfo, [field]: value }
  emit("update:shippingInfo", updatedInfo)
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
  // Pickup always allows proceeding
  if (props.shippingInfo.fulfilment_method === "pickup") {
    return true
  }

  // For delivery
  if (props.shippingInfo.fulfilment_method === "delivery") {
    // Customer pays courier directly - minimal validation needed
    if (props.shippingInfo.delivery_payment_option === "customer_pays_courier") {
      return true
    }

    // Free shipping - minimal validation needed
    if (props.shippingInfo.delivery_payment_option === "free_shipping") {
      return true
    }

    // For customer pays merchant, delivery type is mandatory
    if (props.shippingInfo.delivery_payment_option === "customer_pays_merchant") {
      if (!props.shippingInfo.delivery_type) {
        return false
      }
      // If standard delivery is selected, delivery method is mandatory
      if (props.shippingInfo.delivery_type === "standard" && !props.shippingInfo.delivery_method) {
        return false
      }
    }

    // For merchant pays options, validate based on delivery type and method
    if (props.shippingInfo.delivery_type === "express") {
      // Express delivery requires express_delivery_option selection (UID)
      return !!props.shippingInfo.express_delivery_option
    }

    // Standard delivery validation based on method
    if (props.shippingInfo.delivery_type === "standard") {
      if (props.shippingInfo.delivery_method === "manual") {
        // Manual requires manual_delivery_option selection (UID)
        return !!props.shippingInfo.manual_delivery_option
      } else if (props.shippingInfo.delivery_method === "shipbubble") {
        // Shipbubble requires address, email, phone, and courier selection
        return (
          props.shippingInfo.delivery_address &&
          props.shippingInfo.customer_email.trim().length > 0 &&
          props.shippingInfo.customer_phone.trim().length > 0 &&
          props.shippingInfo.courier
        )
      } else if (props.shippingInfo.delivery_method === "custom") {
        // Custom requires courier name, delivery fee, and address
        return (
          props.shippingInfo.courier &&
          props.shippingInfo.delivery_fee >= 0 &&
          props.shippingInfo.delivery_address
        )
      }
    }
  }

  return true
})

const handleNext = async () => {
  // Basic canProceed check
  if (!canProceed.value) {
    // Specific error message for missing delivery type when customer pays merchant
    if (
      props.shippingInfo.fulfilment_method === "delivery" &&
      props.shippingInfo.delivery_payment_option === "customer_pays_merchant" &&
      !props.shippingInfo.delivery_type
    ) {
      toast.error("Please select a delivery type (Standard or Express) before proceeding.")
      return
    }
    // Specific error message for missing delivery method when customer pays merchant and standard delivery
    if (
      props.shippingInfo.fulfilment_method === "delivery" &&
      props.shippingInfo.delivery_payment_option === "customer_pays_merchant" &&
      props.shippingInfo.delivery_type === "standard" &&
      !props.shippingInfo.delivery_method
    ) {
      toast.error(
        "Please select a delivery method (Manual, Shipbubble, or Custom) before proceeding.",
      )
      return
    }
    toast.error("Please fill in all required fields before proceeding.")
    return
  }

  // Skip additional validation if customer pays courier or free shipping
  if (
    props.shippingInfo.fulfilment_method === "delivery" &&
    (props.shippingInfo.delivery_payment_option === "customer_pays_courier" ||
      props.shippingInfo.delivery_payment_option === "free_shipping")
  ) {
    emit("next")
    return
  }

  // Validate shipbubble delivery
  if (
    props.shippingInfo.fulfilment_method === "delivery" &&
    props.shippingInfo.delivery_type === "standard" &&
    props.shippingInfo.delivery_method === "shipbubble"
  ) {
    const isValid = await validateFetchRates()
    if (!isValid) {
      toast.error("Please provide valid customer details and delivery address.")
      return
    }

    if (!props.shippingInfo.courier) {
      toast.error("Please select a courier or switch to manual shipping.")
      return
    }
  }

  // Validate custom delivery fields
  if (
    props.shippingInfo.fulfilment_method === "delivery" &&
    props.shippingInfo.delivery_type === "standard" &&
    props.shippingInfo.delivery_method === "custom"
  ) {
    const isValid = await validateManualDelivery()
    if (!isValid) {
      toast.error("Please provide valid courier name and delivery fee.")
      return
    }
  }

  emit("next")
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
      delivery_address:
        typeof props.shippingInfo.delivery_address === "string"
          ? props.shippingInfo.delivery_address
          : props.shippingInfo.delivery_address?.label || "",
      customer_name: customerName.value,
      customer_email: props.shippingInfo.customer_email,
      customer_phone: props.shippingInfo.customer_phone,
      items,
    },
    {
      onSuccess: (res) => {
        ratesFetched.value = true
        if (res?.data?.data?.couriers?.length) {
          shipBubbleRates.value = res.data.data
          updateField("shipping_rate_token", res.data.data.request_token)
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

// Computed courier options for RadioInputField
const courierOptions = computed(() => {
  const couriers = isGettingRates.value
    ? []
    : shipBubbleRates.value.couriers?.length
      ? shipBubbleRates.value.couriers
      : (props.shippingInfo.courier as IShippingCourier)?.courier_id
        ? [props.shippingInfo.courier as IShippingCourier]
        : []

  return couriers.map((courier) => ({
    label: courier.courier_name,
    value: courier.courier_id,
    image: courier.courier_image || "",
    courier: courier,
  }))
})

const selectedCourierId = ref("")

const handleUpdateCourier = (courierId: string) => {
  selectedCourierId.value = courierId
  const courier = shipBubbleRates.value.couriers?.find((c) => c.courier_id === courierId)
  if (courier) {
    const fee = courier.total_amount || courier.total || 0
    emit("update:shippingInfo", {
      ...props.shippingInfo,
      courier,
      delivery_fee: fee,
    })
  }
}

// Sync delivery fee when express_delivery_option changes
watch(
  () => props.shippingInfo.express_delivery_option,
  (newVal) => {
    if (newVal && props.shippingInfo.delivery_type === "express") {
      const location = expressOptions.value?.find((v) => v.uid === newVal)
      if (location) {
        updateField("delivery_fee", location.amount)
      }
    }
  },
)

// Sync delivery fee when manual_delivery_option changes
watch(
  () => props.shippingInfo.manual_delivery_option,
  (newVal) => {
    if (newVal && props.shippingInfo.delivery_method === "manual") {
      const location = manualOptions.value?.find((v) => v.uid === newVal)
      if (location) {
        updateField("delivery_fee", location.amount)
      }
    }
  },
)

// Watch for address changes and fetch rates
watch(
  () => props.shippingInfo.delivery_address,
  (newVal, oldVal) => {
    if (newVal && newVal !== oldVal && props.shippingInfo.delivery_method === "shipbubble") {
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
      // These options don't need specific delivery methods
      updateField("delivery_fee", 0)
      updateField("courier", "")
    }
  },
)

// Reset delivery fields when switching delivery method (standard only)
watch(
  () => props.shippingInfo.delivery_method,
  (val) => {
    if (val === "manual") {
      // Clear shipbubble and custom-specific fields
      shipBubbleRates.value = { couriers: [] }
      updateField("shipping_rate_token", "")
      updateField("courier", "")
      // updateField("delivery_fee", 0)
      shippingRateErrors.value = { email: "", phone: "", address: "" }
      validationErrors.value = { courier: "", delivery_fee: "" }
    } else if (val === "custom") {
      // Clear shipbubble and manual-specific fields
      shipBubbleRates.value = { couriers: [] }
      updateField("manual_delivery_option", "")
      shippingRateErrors.value = { email: "", phone: "", address: "" }
      validationErrors.value = { courier: "", delivery_fee: "" }
    } else if (val === "shipbubble") {
      // Clear custom and manual-specific fields
      updateField("courier", "")
      updateField("manual_delivery_option", "")
      validationErrors.value = { courier: "", delivery_fee: "" }
    }
  },
)

const isShippingSetupComplete = computed(() => {
  const liveStatusData = useSettingsStore().liveStatus
  return liveStatusData?.criteria.delivery_options.details?.delivery_enabled
})

const isMobile = computed(() => useMediaQuery("(max-width: 768px)").value)
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

      <template
        v-if="
          shippingInfo.fulfilment_method === 'delivery' &&
          shippingInfo.delivery_payment_option !== 'customer_pays_courier'
        "
      >
        <div class="my-6 rounded-xl bg-white p-4">
          <h3 class="mb-4 text-sm font-medium">What type of delivery?</h3>
          <hr class="mb-4 border-gray-300" />
          <RadioInputField
            :options="DELIVERY_TYPE_OPTIONS"
            :modelValue="shippingInfo.delivery_type"
            @update:modelValue="updateField('delivery_type', $event)"
          />
        </div>

        <!-- express delivery location -->
        <div v-if="shippingInfo.delivery_type === 'express'" class="my-6 rounded-xl bg-white p-4">
          <h3 class="mb-4 text-sm font-medium">Select your delivery location</h3>
          <hr class="mb-4 border-gray-300" />
          <RadioInputField
            :options="EXPRESS_DELIVERY_LOCATIONS"
            :modelValue="shippingInfo.express_delivery_option"
            orientation="vertical"
            @update:modelValue="updateField('express_delivery_option', $event)"
          >
            <template #content="{ option }">
              <div class="flex flex-1 justify-between gap-2.5">
                <span class="text-sm font-medium text-gray-700">
                  {{ option.label }}
                </span>
                <span v-if="option.description" class="text-sm font-semibold text-gray-900">
                  {{ option.description }}
                </span>
              </div>
            </template>
          </RadioInputField>
        </div>

        <!-- for standard delivery -->
        <div v-if="shippingInfo.delivery_type === 'standard'" class="rounded-xl bg-white p-4">
          <h3 class="mb-4 text-sm font-medium">Delivery Method</h3>
          <hr class="mb-4 border-gray-300" />
          <div class="space-y-4">
            <RadioInputField
              v-if="shippingInfo.delivery_payment_option !== 'customer_pays_courier'"
              label=""
              :options="DELIVERY_METHOD_OPTIONS"
              :orientation="isMobile ? 'vertical' : 'horizontal'"
              :modelValue="shippingInfo.delivery_method"
              @update:modelValue="updateField('delivery_method', $event)"
            >
              <template #content="{ option }">
                <div class="flex flex-1 flex-col gap-1.5">
                  <span class="text-sm font-medium text-gray-700">
                    {{ option.label }}
                  </span>

                  <Chip v-if="option.value === 'shipbubble'" show-dot color="blue" radius="2xl">
                    <span class="hidden lg:inline"> Powered by </span>
                    <img src="/images/shipbubble-logo.png" alt="" class="ml-1 inline-block" />
                  </Chip>

                  <span v-if="option.description" class="text-xs text-gray-400">
                    {{ option.description }}
                  </span>
                </div>
              </template>
            </RadioInputField>

            <!-- Manual Delivery Location Selection -->
            <template v-if="shippingInfo.delivery_method === 'manual'">
              <hr class="my-4 border-gray-300" />
              <RadioInputField
                :options="MANUAL_DELIVERY_LOCATIONS"
                :modelValue="shippingInfo.manual_delivery_option"
                orientation="vertical"
                @update:modelValue="updateField('manual_delivery_option', $event)"
              >
                <template #content="{ option }">
                  <div class="flex flex-1 justify-between gap-2.5">
                    <span class="text-sm font-medium text-gray-700">
                      {{ option.label }}
                    </span>
                    <span v-if="option.description" class="text-sm font-semibold text-gray-900">
                      {{ option.description }}
                    </span>
                  </div>
                </template>
              </RadioInputField>
            </template>

            <!-- ShipBubble shipbubble Delivery -->
            <template v-if="shippingInfo.delivery_method === 'shipbubble'">
              <!-- Empty State when shipping is not set up -->
              <EmptyState
                v-if="!isShippingSetupComplete"
                title="You don't have shipping setup yet"
                description="You need shipping to be able to use shipbubble delivery."
                action-label="Setup Shipping"
                action-icon="add"
                class="!min-h-[40vh] !bg-none !py-0 !shadow-none"
                @action="$router.push('/settings/delivery-options')"
              >
                <template #image>
                  <img
                    src="@/assets/images/empty-location.svg?url"
                    alt="Empty State Illustration"
                    class="mx-auto mb-4"
                  />
                </template>
              </EmptyState>

              <!-- Shipping form when setup is complete -->
              <div v-else class="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
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
                  v-if="shipBubbleRates.couriers?.length || shippingInfo.courier || isGettingRates"
                  class="mt-6"
                >
                  <p class="text-core-600 mb-2 text-xs">Select your preferred courier</p>
                  <!-- Loading -->
                  <div
                    v-if="isGettingRates"
                    class="flex flex-col items-center justify-center gap-6 bg-gray-100 p-4 text-center"
                  >
                    <Icon name="loader" size="24" class="animate-spin text-gray-900" />
                    <p class="max-w-md text-sm font-medium text-gray-600">
                      Loading... Please wait. Available couriers will appear shortly.
                    </p>
                  </div>

                  <RadioInputField
                    v-if="!isGettingRates && courierOptions.length > 0"
                    name="courier-selection"
                    :options="courierOptions"
                    :model-value="selectedCourierId"
                    @update:model-value="($event) => handleUpdateCourier($event as string)"
                    orientation="vertical"
                  >
                    <template #content="{ option }">
                      <div class="flex flex-1 items-center gap-3">
                        <img
                          v-if="option.image && typeof option.image === 'string'"
                          :src="option.image"
                          :alt="option.label"
                          class="border-core-200 size-10 rounded-lg border bg-white object-contain"
                        />
                        <span
                          v-else
                          class="border-core-200 flex size-10 items-center justify-center rounded-lg border"
                        >
                          <Icon name="box" />
                        </span>

                        <div class="flex flex-1 flex-col gap-1 text-gray-700">
                          <div class="flex items-center justify-between">
                            <span class="text-sm font-semibold text-gray-900">
                              {{ option.label }}
                            </span>
                            <span class="inline text-sm font-semibold text-gray-900 lg:hidden">
                              {{
                                formatCurrency(
                                  (option.courier as any).total_amount ||
                                    (option.courier as any).total ||
                                    0,
                                )
                              }}
                            </span>
                          </div>

                          <div class="flex flex-wrap items-center gap-2 text-xs lg:gap-4">
                            <div class="flex items-center gap-1">
                              <Icon
                                name="star"
                                :type="
                                  (option.courier as any).ratings === 5
                                    ? 'bold'
                                    : (option.courier as any).ratings > 2
                                      ? 'bulk'
                                      : 'linear'
                                "
                                size="12"
                                class="text-primary-500"
                              />
                              <span class="text-gray-600">
                                {{ (option.courier as any).ratings }} ({{
                                  (option.courier as any).votes
                                }}
                                {{ (option.courier as any).votes > 1 ? "reviews" : "review" }})
                              </span>
                            </div>

                            <div class="hidden size-1 rounded-full bg-gray-300 lg:block" />

                            <div class="flex items-center gap-1">
                              <Icon name="clock" size="12" class="text-gray-600" />
                              <span class="text-gray-600">{{
                                (option.courier as any).delivery_eta
                              }}</span>
                            </div>
                          </div>
                        </div>

                        <span class="ml-auto hidden text-sm font-semibold text-gray-900 lg:inline">
                          {{
                            formatCurrency(
                              (option.courier as any).total_amount ||
                                (option.courier as any).total ||
                                0,
                              { kobo: true },
                            )
                          }}
                        </span>
                      </div>
                    </template>
                  </RadioInputField>
                </div>

                <!-- Empty State when no shipping courier was found -->
                <div
                  v-if="
                    !(shipBubbleRates.couriers?.length || shippingInfo.courier) &&
                    !isGettingRates &&
                    ratesFetched
                  "
                  class="flex flex-col items-center justify-center gap-3 bg-gray-100 p-4 text-center md:gap-6"
                >
                  <Icon name="truck-fast" size="24" />
                  <h4 class="!font-outif text-sm font-semibold text-gray-900">
                    Shipping Unavailable
                  </h4>
                  <p class="text-sm text-gray-600">
                    None of your preferred couriers deliver to this address. Please try another
                    address.
                  </p>
                </div>

                <div
                  class="border-error-500 bg-error-500/10 mt-4 border-y p-2 text-center text-xs text-black"
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

            <!-- Custom Delivery -->
            <template v-if="shippingInfo.delivery_method === 'custom'">
              <div class="grid grid-cols-1 gap-3">
                <TextField
                  type="text"
                  name="courier"
                  label="Courier Name"
                  placeholder="e.g GoKada"
                  :model-value="shippingInfo.courier as string"
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

        <!-- Delivery address (not needed for shipbubble since it has its own address field) -->
        <div
          v-if="
            shippingInfo.fulfilment_method === 'delivery' &&
            shippingInfo.delivery_payment_option !== 'customer_pays_courier' &&
            (shippingInfo.delivery_type === 'express' ||
              (shippingInfo.delivery_type === 'standard' &&
                (shippingInfo.delivery_method === 'manual' ||
                  shippingInfo.delivery_method === 'custom')))
          "
          class="my-6 rounded-xl bg-white p-4"
        >
          <h3 class="mb-4 text-sm font-medium">Delivery address</h3>
          <hr class="mb-4 border-gray-300" />

          <!-- Show SelectField if customer has addresses -->
          <Field v-slot="{ field, errors: fieldErrors }" name="delivery_address">
            <SelectField
              v-bind="field"
              :model-value="shippingInfo.delivery_address"
              label="Select Delivery Address"
              placeholder="Select an address"
              :options="CUSTOMER_ADDRESSES"
              value-key="value"
              label-key="label"
              :error="fieldErrors[0]"
              @update:model-value="updateField('delivery_address', $event)"
              placement="top"
            >
              <template #prepend="{ close }">
                <div
                  class="hover:bg-core-25 cursor-pointer border-b border-gray-200 px-4 py-2 text-sm transition-colors duration-150"
                  @click="
                    () => {
                      close()
                      emit('openAddAddress')
                    }
                  "
                >
                  <div class="flex items-center justify-between">
                    <span class="text-primary-600 font-semibold">Add New Address</span>
                    <Icon name="add" class="text-primary-600 h-4 w-4" />
                  </div>
                </div>
              </template>
            </SelectField>
          </Field>
        </div>
      </template>
    </div>

    <div class="h-24" />

    <div
      class="border-core-200 fixed right-0 bottom-0 left-0 flex gap-3 border-t bg-white p-4 md:p-6"
    >
      <AppButton label="Back" color="alt" class="w-1/3" icon="arrow-left" @click="emit('prev')" />
      <AppButton label="Next" class="w-2/3" :disabled="!canProceed" @click="handleNext" />
    </div>
  </div>
</template>
