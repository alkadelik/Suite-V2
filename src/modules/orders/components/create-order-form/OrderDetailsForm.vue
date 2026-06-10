<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import FormField from "@components/form/FormField.vue"
import TextField from "@components/form/TextField.vue"
import PhoneInput from "@components/form/PhoneInput.vue"
import SelectField from "@components/form/SelectField.vue"
import RadioInputField from "@components/form/RadioInputField.vue"
import GooglePlacesAutocomplete from "@components/GooglePlacesAutocomplete.vue"
import FieldGroupError from "@components/form/FieldGroupError.vue"
import Icon from "@components/Icon.vue"
import Chip from "@components/Chip.vue"
import EmptyState from "@components/EmptyState.vue"
import { Field } from "vee-validate"
import { computed, ref, watch, onMounted } from "vue"
import { scrollToAndFocusValidationTarget } from "@/utils/validations"
import {
  ORDER_CHANNELS,
  DELIVERY_PAYMENT_OPTION,
  ORDER_PAYMENT_METHODS,
  ORDER_PAYMENT_STATUS,
  anonymousCustomer,
} from "@modules/orders/constants"
import {
  useGetExpressDeliveryOptions,
  useGetManualDeliveryOptions,
  useGetShippingRates,
} from "@modules/shared/api"
import { toast } from "@/composables/useToast"
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import * as yup from "yup"
import { useSettingsStore } from "@modules/settings/store"
import { useMediaQuery } from "@vueuse/core"
import { useGetCustomerAddresses } from "@modules/customers/api"
import type { ICustomer } from "@modules/customers/types"
import type { IShippingCourier } from "@modules/shared/types"

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

interface PaymentInfo {
  payment_status: "unpaid" | "paid" | "partially_paid"
  payment_amount: number | string
  payment_source?: { label: string; value: string }
  coupon_code: string | null
  discount_amount: number
}

interface OrderItem {
  variant: { uid: string; name: string; sku: string; price: string; stock: number } | null
  quantity: number
  [key: string]: unknown
}

const props = defineProps<{
  customer: ICustomer | null
  orderItems?: OrderItem[]
  productsTotal: number
  deliveryFee: number
  vatAmount: number
  totalAmount: number
  itemsCount: number
  isFreeShipping: boolean
}>()

const emit = defineEmits<{
  save: []
  close: []
  openAddAddress: []
}>()

const shippingInfo = defineModel<ShippingInfo>("shippingInfo", { required: true })
const paymentInfo = defineModel<PaymentInfo>("paymentInfo", { required: true })

const { format } = useFormatCurrency()
const currency = computed(() => useSettingsStore().storeDetails?.currency || "NGN")
const isMobile = useMediaQuery("(max-width: 768px)")
const isInternational = computed(() => useSettingsStore().isInternational)

const deliveryDetails = computed(
  () => useSettingsStore().liveStatus?.criteria?.delivery_options?.details,
)
const isShippingSetupComplete = computed(() => deliveryDetails.value?.delivery_enabled)

const ratesFetched = ref(false)

// ─── Static options ──────────────────────────────────────────────────────────
const FULFILMENT_METHODS = [
  { label: "Delivery", value: "delivery" },
  { label: "Pickup", value: "pickup" },
]

const FULFILMENT_STATUS = [
  { label: "Yes", value: "fulfilled" },
  { label: "No", value: "unfulfilled" },
]

// ─── Remote options ──────────────────────────────────────────────────────────
const { data: expressOptions } = useGetExpressDeliveryOptions()
const { data: manualOptions } = useGetManualDeliveryOptions()
const { data: customerAddresses } = useGetCustomerAddresses(
  computed(() => props.customer?.uid || ""),
)

const CUSTOMER_ADDRESSES = computed(
  () =>
    customerAddresses.value?.results?.map((addr) => ({
      label: addr.address,
      value: addr.uid,
    })) ?? [],
)

const EXPRESS_DELIVERY_LOCATIONS = computed(
  () =>
    expressOptions.value?.map((v) => ({
      label: v.location,
      value: v.uid,
      description: format(v.amount, { kobo: true }),
    })) ?? [],
)

const MANUAL_DELIVERY_LOCATIONS = computed(
  () =>
    manualOptions.value?.map((v) => ({
      label: v.location,
      value: v.uid,
      description: format(v.amount, { kobo: true }),
    })) ?? [],
)

const DELIVERY_METHOD_OPTIONS = computed(() =>
  [
    { label: "Manual", value: "manual", description: "Select your delivery location" },
    { label: "Shipbubble", value: "shipbubble", description: "" },
    { label: "Custom", value: "custom", description: "GIG, Bolt, Gokada, etc" },
  ].filter((x) => {
    const { shipping_account, delivery_enabled, manual_delivery_enabled } =
      deliveryDetails.value || {}
    if (x.value === "shipbubble") {
      return (
        !isInternational.value &&
        shipping_account &&
        delivery_enabled &&
        shippingInfo.value.fulfilment_status === "unfulfilled"
      )
    }
    if (x.value === "manual") {
      return (
        manual_delivery_enabled && !delivery_enabled && MANUAL_DELIVERY_LOCATIONS.value.length > 0
      )
    }
    return true
  }),
)

const DELIVERY_TYPE_OPTIONS = computed(() =>
  [
    { label: "Express", value: "express" },
    { label: "Standard", value: "standard" },
  ].filter((x) => {
    const { express_delivery_enabled } = deliveryDetails.value || {}
    if (x.value === "express") {
      return express_delivery_enabled && EXPRESS_DELIVERY_LOCATIONS.value.length > 0
    }
    return true
  }),
)

const DELIVERY_PAYMENT_OPTIONS = computed(() => {
  const isFulfilled = shippingInfo.value.fulfilment_status === "fulfilled"
  return DELIVERY_PAYMENT_OPTION.map((option) => ({
    ...option,
    label: isFulfilled
      ? option.label.replace("pays", "paid").replace("Shipping", "shipping")
      : option.label,
  }))
})

// ─── Local delivery type/method (mirror parent state with sensible defaults) ─
const defaultDeliveryType = (): ShippingInfo["delivery_type"] => {
  const opts = DELIVERY_TYPE_OPTIONS.value
  const raw = opts.find((o) => o.value === "standard")?.value ?? opts[0]?.value ?? ""
  return raw as ShippingInfo["delivery_type"]
}
const defaultDeliveryMethod = (): ShippingInfo["delivery_method"] => {
  const opts = DELIVERY_METHOD_OPTIONS.value
  if (opts.length === 1) return opts[0].value as ShippingInfo["delivery_method"]
  const raw = opts.find((o) => o.value === "custom")?.value ?? opts[0]?.value ?? ""
  return raw as ShippingInfo["delivery_method"]
}

const localDeliveryType = ref<ShippingInfo["delivery_type"]>(
  shippingInfo.value.delivery_type || defaultDeliveryType(),
)
const localDeliveryMethod = ref<ShippingInfo["delivery_method"]>(
  shippingInfo.value.delivery_method || defaultDeliveryMethod(),
)

watch(shippingInfo, (info) => {
  localDeliveryType.value = info.delivery_type || defaultDeliveryType()
  localDeliveryMethod.value = info.delivery_method || defaultDeliveryMethod()
})

watch(localDeliveryType, (val) => {
  if (val !== shippingInfo.value.delivery_type) {
    shippingInfo.value = { ...shippingInfo.value, delivery_type: val }
  }
})
watch(localDeliveryMethod, (val) => {
  if (val !== shippingInfo.value.delivery_method) {
    shippingInfo.value = { ...shippingInfo.value, delivery_method: val }
  }
})

onMounted(() => {
  if (!shippingInfo.value.delivery_type || !shippingInfo.value.delivery_method) {
    shippingInfo.value = {
      ...shippingInfo.value,
      delivery_type: localDeliveryType.value,
      delivery_method: localDeliveryMethod.value,
    }
  }
  if (paymentInfo.value.payment_status === "paid") {
    paymentInfo.value = {
      ...paymentInfo.value,
      payment_amount: Number(props.totalAmount).toFixed(2),
    }
  }
})

// ─── Helpers ─────────────────────────────────────────────────────────────────
const updateShipping = (field: keyof ShippingInfo, value: unknown) => {
  shippingInfo.value = { ...shippingInfo.value, [field]: value }
}

const customerName = computed(() => {
  if (!props.customer) return "Unknown Customer"
  const firstName = props.customer.first_name || ""
  const lastName = props.customer.last_name || ""
  return `${firstName} ${lastName}`.trim() || props.customer.full_name || "Unknown Customer"
})

// ─── Validation ──────────────────────────────────────────────────────────────
const validationErrors = ref({ courier: "", delivery_fee: "" })
const navigationErrors = ref({
  delivery_type: "",
  delivery_method: "",
  express_delivery_option: "",
  manual_delivery_option: "",
})
const shippingRateErrors = ref({ email: "", phone: "", address: "" })
const submitAttempted = ref(false)
const paymentErrors = ref({ payment_source: "", payment_amount: "" })

const manualDeliverySchema = yup.object({
  courier: yup.string().required("Courier name is required").trim(),
  delivery_fee: yup
    .number()
    .required("Delivery fee is required")
    .min(0, "Delivery fee must be 0 or greater")
    .typeError("Delivery fee must be a valid number"),
})

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

const validateManualDelivery = async (): Promise<boolean> => {
  validationErrors.value = { courier: "", delivery_fee: "" }
  try {
    await manualDeliverySchema.validate(
      { courier: shippingInfo.value.courier, delivery_fee: shippingInfo.value.delivery_fee },
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
      const firstErrorFieldName = Object.keys(validationErrors.value).find(
        (key) => validationErrors.value[key as keyof typeof validationErrors.value],
      )
      if (firstErrorFieldName) scrollToAndFocusValidationTarget(firstErrorFieldName)
    }
    return false
  }
}

const validateFetchRates = async (): Promise<boolean> => {
  shippingRateErrors.value = { email: "", phone: "", address: "" }
  try {
    await fetchRatesSchema.validate(
      {
        customer_phone: shippingInfo.value.customer_phone,
        customer_email: shippingInfo.value.customer_email,
        delivery_address: shippingInfo.value.delivery_address,
      },
      { abortEarly: false },
    )
    return true
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      err.inner.forEach((error) => {
        if (error.path === "customer_email") shippingRateErrors.value.email = error.message
        else if (error.path === "customer_phone") shippingRateErrors.value.phone = error.message
        else if (error.path === "delivery_address") shippingRateErrors.value.address = error.message
      })
    }
    return false
  }
}

const validatePayment = (): boolean => {
  paymentErrors.value = { payment_source: "", payment_amount: "" }

  if (
    paymentInfo.value.payment_status === "paid" ||
    paymentInfo.value.payment_status === "partially_paid"
  ) {
    if (!paymentInfo.value.payment_source) {
      paymentErrors.value.payment_source = "Select how the customer paid."
    }
  }

  if (paymentInfo.value.payment_status === "partially_paid") {
    const amount = Number(paymentInfo.value.payment_amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      paymentErrors.value.payment_amount = "Enter an amount greater than 0."
    } else if (amount >= props.totalAmount) {
      paymentErrors.value.payment_amount =
        "Partial payment must be less than the total order amount."
    }
  }

  return !paymentErrors.value.payment_source && !paymentErrors.value.payment_amount
}

const canProceedShipping = computed(() => {
  if (shippingInfo.value.fulfilment_method === "pickup") return true

  if (shippingInfo.value.fulfilment_method === "delivery") {
    if (
      shippingInfo.value.delivery_payment_option === "customer_pays_courier" ||
      shippingInfo.value.delivery_payment_option === "free_shipping"
    ) {
      return true
    }

    if (shippingInfo.value.delivery_payment_option === "customer_pays_merchant") {
      if (!localDeliveryType.value) return false
      if (localDeliveryType.value === "standard" && !localDeliveryMethod.value) return false
    }

    if (localDeliveryType.value === "express") {
      return !!shippingInfo.value.express_delivery_option
    }

    if (localDeliveryType.value === "standard") {
      if (localDeliveryMethod.value === "manual") {
        return !!shippingInfo.value.manual_delivery_option
      } else if (localDeliveryMethod.value === "shipbubble") {
        return (
          !!shippingInfo.value.delivery_address &&
          shippingInfo.value.customer_email.trim().length > 0 &&
          shippingInfo.value.customer_phone.trim().length > 0 &&
          !!shippingInfo.value.courier
        )
      } else if (localDeliveryMethod.value === "custom") {
        // &&  !!shippingInfo.value.delivery_address
        return !!shippingInfo.value.courier && shippingInfo.value.delivery_fee >= 0
      }
    }
  }

  return true
})

// ─── Shipbubble rates ────────────────────────────────────────────────────────
const shipBubbleRates = ref<{ couriers: IShippingCourier[] }>({ couriers: [] })
const delivery_address = ref(shippingInfo.value.delivery_address || "")
const { mutate: getShippingRates, isPending: isGettingRates } = useGetShippingRates()

const fetchShippingRates = async () => {
  const isValid = await validateFetchRates()
  if (!isValid) return

  const items =
    props.orderItems?.map((item) => ({
      variant: item.variant?.uid || "",
      quantity: item.quantity,
    })) || []

  getShippingRates(
    {
      delivery_address:
        typeof shippingInfo.value.delivery_address === "string"
          ? shippingInfo.value.delivery_address
          : shippingInfo.value.delivery_address?.label || "",
      customer_name: customerName.value,
      customer_email: shippingInfo.value.customer_email,
      customer_phone: shippingInfo.value.customer_phone,
      items,
    },
    {
      onSuccess: (res) => {
        ratesFetched.value = true
        if (res?.data?.data?.couriers?.length) {
          shipBubbleRates.value = res.data.data
          updateShipping("shipping_rate_token", res.data.data.request_token)
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

const courierOptions = computed(() => {
  const couriers = isGettingRates.value
    ? []
    : shipBubbleRates.value.couriers?.length
      ? shipBubbleRates.value.couriers
      : (shippingInfo.value.courier as IShippingCourier)?.courier_id
        ? [shippingInfo.value.courier as IShippingCourier]
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
    shippingInfo.value = { ...shippingInfo.value, courier, delivery_fee: fee }
  }
}

// ─── Cross-field syncing ─────────────────────────────────────────────────────
watch(
  () => shippingInfo.value.express_delivery_option,
  (newVal) => {
    if (newVal && localDeliveryType.value === "express") {
      const location = expressOptions.value?.find((v) => v.uid === newVal)
      if (location) updateShipping("delivery_fee", location.amount)
    }
    if (newVal) navigationErrors.value.express_delivery_option = ""
  },
)

watch(
  () => shippingInfo.value.manual_delivery_option,
  (newVal) => {
    if (newVal && localDeliveryMethod.value === "manual") {
      const location = manualOptions.value?.find((v) => v.uid === newVal)
      if (location) updateShipping("delivery_fee", location.amount)
    }
    if (newVal) navigationErrors.value.manual_delivery_option = ""
  },
)

watch(
  () => shippingInfo.value.delivery_address,
  (newVal, oldVal) => {
    if (newVal && newVal !== oldVal && localDeliveryMethod.value === "shipbubble") {
      shipBubbleRates.value = { couriers: [] }
      fetchShippingRates()
    }
  },
)

watch(
  () => props.customer,
  (val) => {
    if (val && val.uid !== anonymousCustomer.uid) {
      if (val.email) updateShipping("customer_email", val.email)
      if (val.phone) updateShipping("customer_phone", val.phone)
    } else {
      updateShipping("customer_email", "")
      updateShipping("customer_phone", "")
    }
  },
  { immediate: true },
)

watch(
  () => shippingInfo.value.fulfilment_method,
  (val) => {
    if (val === "pickup") {
      updateShipping("delivery_fee", 0)
      updateShipping("courier", "")
    }
  },
)

watch(
  () => shippingInfo.value.delivery_payment_option,
  (val) => {
    if (val === "free_shipping" || val === "customer_pays_courier") {
      updateShipping("delivery_fee", 0)
      updateShipping("courier", "")
    }
    navigationErrors.value = {
      delivery_type: "",
      delivery_method: "",
      express_delivery_option: "",
      manual_delivery_option: "",
    }
    shippingRateErrors.value = { email: "", phone: "", address: "" }
    validationErrors.value = { courier: "", delivery_fee: "" }
  },
)

watch(localDeliveryMethod, (val) => {
  navigationErrors.value.delivery_method = ""
  navigationErrors.value.manual_delivery_option = ""

  if (val === "manual") {
    shipBubbleRates.value = { couriers: [] }
    updateShipping("shipping_rate_token", "")
    updateShipping("courier", "")
    shippingRateErrors.value = { email: "", phone: "", address: "" }
    validationErrors.value = { courier: "", delivery_fee: "" }
  } else if (val === "custom") {
    shipBubbleRates.value = { couriers: [] }
    updateShipping("manual_delivery_option", "")
    shippingRateErrors.value = { email: "", phone: "", address: "" }
    validationErrors.value = { courier: "", delivery_fee: "" }
  } else if (val === "shipbubble") {
    updateShipping("courier", "")
    updateShipping("manual_delivery_option", "")
    validationErrors.value = { courier: "", delivery_fee: "" }
  }
})

watch(localDeliveryType, () => {
  navigationErrors.value.delivery_type = ""
  navigationErrors.value.express_delivery_option = ""
})

// ─── Payment side syncing ────────────────────────────────────────────────────
watch(
  () => props.totalAmount,
  (newTotal) => {
    if (newTotal === 0) {
      paymentInfo.value = {
        ...paymentInfo.value,
        payment_status: "paid",
        payment_amount: 0,
        payment_source: paymentInfo.value.payment_source ?? ORDER_PAYMENT_METHODS[0],
      }
    }
  },
  { immediate: true },
)

watch(
  () => paymentInfo.value.payment_status,
  (newStatus) => {
    if (newStatus === "paid") {
      paymentInfo.value = {
        ...paymentInfo.value,
        payment_amount: Number(props.totalAmount).toFixed(2),
      }
    } else if (newStatus === "partially_paid" || newStatus === "unpaid") {
      paymentInfo.value = { ...paymentInfo.value, payment_amount: 0 }
    }
  },
)

watch(
  () => props.totalAmount,
  (newTotal) => {
    if (newTotal > 0 && paymentInfo.value.payment_status === "paid") {
      paymentInfo.value = { ...paymentInfo.value, payment_amount: newTotal }
    }
  },
)

watch(
  () => [
    paymentInfo.value.payment_status,
    paymentInfo.value.payment_source,
    paymentInfo.value.payment_amount,
    props.totalAmount,
  ],
  () => {
    if (submitAttempted.value) validatePayment()
  },
)

// ─── Save handler — single button for the whole drawer ───────────────────────
const handleSave = async () => {
  submitAttempted.value = true

  // Shipping side validation
  if (!canProceedShipping.value) {
    if (
      shippingInfo.value.fulfilment_method === "delivery" &&
      shippingInfo.value.delivery_payment_option === "customer_pays_merchant" &&
      !localDeliveryType.value
    ) {
      navigationErrors.value.delivery_type = "Select a delivery type before continuing."
      return
    }
    if (
      shippingInfo.value.fulfilment_method === "delivery" &&
      shippingInfo.value.delivery_payment_option === "customer_pays_merchant" &&
      localDeliveryType.value === "standard" &&
      !localDeliveryMethod.value
    ) {
      navigationErrors.value.delivery_method = "Select a delivery method before continuing."
      return
    }
    if (
      shippingInfo.value.fulfilment_method === "delivery" &&
      localDeliveryType.value === "express" &&
      !shippingInfo.value.express_delivery_option
    ) {
      navigationErrors.value.express_delivery_option =
        "Select a delivery location before continuing."
      return
    }
    if (
      shippingInfo.value.fulfilment_method === "delivery" &&
      localDeliveryType.value === "standard" &&
      localDeliveryMethod.value === "manual" &&
      !shippingInfo.value.manual_delivery_option
    ) {
      navigationErrors.value.manual_delivery_option =
        "Select a delivery location before continuing."
      return
    }
    toast.error("Please fill in all required delivery fields before saving.")
    return
  }

  if (
    shippingInfo.value.fulfilment_method === "delivery" &&
    localDeliveryType.value === "standard" &&
    localDeliveryMethod.value === "shipbubble" &&
    shippingInfo.value.delivery_payment_option !== "customer_pays_courier" &&
    shippingInfo.value.delivery_payment_option !== "free_shipping"
  ) {
    const isValid = await validateFetchRates()
    if (!isValid) {
      toast.error("Please provide valid customer details and delivery address.")
      return
    }
    if (!shippingInfo.value.courier) {
      toast.error("Please select a courier or switch to manual shipping.")
      return
    }
  }

  if (
    shippingInfo.value.fulfilment_method === "delivery" &&
    localDeliveryType.value === "standard" &&
    localDeliveryMethod.value === "custom" &&
    shippingInfo.value.delivery_payment_option !== "customer_pays_courier" &&
    shippingInfo.value.delivery_payment_option !== "free_shipping"
  ) {
    const isValid = await validateManualDelivery()
    if (!isValid) {
      toast.error("Please provide valid courier name and delivery fee.")
      return
    }
  }

  // Payment side validation
  if (!validatePayment()) {
    if (paymentErrors.value.payment_source) {
      scrollToAndFocusValidationTarget("order-payment-source")
    } else {
      scrollToAndFocusValidationTarget("order-payment-amount")
    }
    return
  }

  emit("save")
}
</script>

<template>
  <div>
    <div class="space-y-4">
      <!-- ─── SALES CARD ───────────────────────────────────────── -->
      <section class="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <header class="border-b border-gray-200 bg-gray-50 px-4 py-2.5">
          <h3 class="text-sm font-semibold text-gray-700">Sales</h3>
        </header>
        <div class="space-y-4 p-4">
          <FormField
            type="select"
            :options="ORDER_CHANNELS"
            name="order_channel"
            label="Select Order Channel"
            :modelValue="shippingInfo.order_channel"
            @update:modelValue="updateShipping('order_channel', $event)"
            required
          />
          <FormField
            type="date"
            name="order_date"
            label="Order Date"
            :modelValue="shippingInfo.order_date"
            @update:modelValue="updateShipping('order_date', $event)"
          />
        </div>
      </section>

      <!-- ─── DELIVERY CARD ────────────────────────────────────── -->
      <section class="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <header class="border-b border-gray-200 bg-gray-50 px-4 py-2.5">
          <h3 class="text-sm font-semibold text-gray-700">Delivery</h3>
        </header>
        <div class="space-y-5 p-4">
          <div>
            <p class="mb-2 text-sm font-medium text-gray-700">Has the product been delivered?</p>
            <RadioInputField
              :options="FULFILMENT_STATUS"
              :modelValue="shippingInfo.fulfilment_status"
              @update:modelValue="updateShipping('fulfilment_status', $event)"
            />
          </div>

          <div>
            <p class="mb-2 text-sm font-medium text-gray-700">
              How
              {{ shippingInfo.fulfilment_status === "fulfilled" ? "was it" : "will it be" }}
              delivered?
            </p>
            <RadioInputField
              :options="FULFILMENT_METHODS"
              :modelValue="shippingInfo.fulfilment_method"
              @update:modelValue="updateShipping('fulfilment_method', $event)"
            />
          </div>

          <div v-if="shippingInfo.fulfilment_method === 'delivery'">
            <p class="mb-2 text-sm font-medium text-gray-700">
              Who
              {{ shippingInfo.fulfilment_status === "fulfilled" ? "paid" : "will pay" }}
              for delivery?
            </p>
            <RadioInputField
              :options="DELIVERY_PAYMENT_OPTIONS"
              :modelValue="shippingInfo.delivery_payment_option"
              @update:modelValue="updateShipping('delivery_payment_option', $event)"
              orientation="vertical"
            />
          </div>

          <template
            v-if="
              shippingInfo.fulfilment_method === 'delivery' &&
              shippingInfo.delivery_payment_option !== 'customer_pays_courier'
            "
          >
            <div v-if="DELIVERY_TYPE_OPTIONS.length > 1">
              <p class="mb-2 text-sm font-medium text-gray-700">What type of delivery?</p>
              <RadioInputField
                :options="DELIVERY_TYPE_OPTIONS"
                :modelValue="localDeliveryType"
                :error="navigationErrors.delivery_type"
                @update:modelValue="
                  (val) => (localDeliveryType = val as ShippingInfo['delivery_type'])
                "
              />
            </div>

            <!-- Express location -->
            <div v-if="localDeliveryType === 'express'">
              <p class="mb-2 text-sm font-medium text-gray-700">Select your delivery location</p>
              <RadioInputField
                :options="EXPRESS_DELIVERY_LOCATIONS"
                :modelValue="shippingInfo.express_delivery_option"
                orientation="vertical"
                :error="navigationErrors.express_delivery_option"
                @update:modelValue="updateShipping('express_delivery_option', $event)"
              >
                <template #content="{ option }">
                  <div class="flex flex-1 justify-between gap-2.5">
                    <span class="text-sm font-medium text-gray-700">{{ option.label }}</span>
                    <span v-if="option.description" class="text-sm font-semibold text-gray-900">
                      {{ option.description }}
                    </span>
                  </div>
                </template>
              </RadioInputField>
            </div>

            <!-- Standard delivery method -->
            <div v-if="localDeliveryType === 'standard'" class="space-y-4">
              <div>
                <p class="mb-2 text-sm font-medium text-gray-700">Delivery Method</p>
                <RadioInputField
                  v-if="shippingInfo.delivery_payment_option !== 'customer_pays_courier'"
                  :options="DELIVERY_METHOD_OPTIONS"
                  :orientation="isMobile ? 'vertical' : 'horizontal'"
                  :modelValue="localDeliveryMethod"
                  :error="navigationErrors.delivery_method"
                  @update:modelValue="
                    (val) => (localDeliveryMethod = val as ShippingInfo['delivery_method'])
                  "
                >
                  <template #content="{ option }">
                    <div class="flex flex-1 flex-col gap-1.5">
                      <span class="text-sm font-medium text-gray-700">{{ option.label }}</span>
                      <Chip v-if="option.value === 'shipbubble'" show-dot color="blue" radius="2xl">
                        <span class="hidden lg:inline">Powered by</span>
                        <img src="/images/shipbubble-logo.png" alt="" class="ml-1 inline-block" />
                      </Chip>
                      <span v-if="option.description" class="text-xs text-gray-400">
                        {{ option.description }}
                      </span>
                    </div>
                  </template>
                </RadioInputField>
              </div>

              <!-- Manual delivery location -->
              <template v-if="localDeliveryMethod === 'manual'">
                <RadioInputField
                  :options="MANUAL_DELIVERY_LOCATIONS"
                  :modelValue="shippingInfo.manual_delivery_option"
                  orientation="vertical"
                  :error="navigationErrors.manual_delivery_option"
                  @update:modelValue="updateShipping('manual_delivery_option', $event)"
                >
                  <template #content="{ option }">
                    <div class="flex flex-1 justify-between gap-2.5">
                      <span class="text-sm font-medium text-gray-700">{{ option.label }}</span>
                      <span v-if="option.description" class="text-sm font-semibold text-gray-900">
                        {{ option.description }}
                      </span>
                    </div>
                  </template>
                </RadioInputField>
              </template>

              <!-- Shipbubble -->
              <template v-if="localDeliveryMethod === 'shipbubble'">
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

                <div v-else class="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
                  <PhoneInput
                    name="customer_phone"
                    label="Customer Phone"
                    placeholder="XXX XXX XXXX"
                    :modelValue="shippingInfo.customer_phone"
                    @update:modelValue="
                      (value: string) => {
                        updateShipping('customer_phone', value)
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
                        updateShipping('customer_email', value)
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
                        updateShipping('delivery_address', item.description)
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

                  <div
                    v-if="
                      shipBubbleRates.couriers?.length || shippingInfo.courier || isGettingRates
                    "
                    class="mt-6"
                  >
                    <p class="text-core-600 mb-2 text-xs">Select your preferred courier</p>
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
                                  format(
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
                                <span class="text-gray-600">
                                  {{ (option.courier as any).delivery_eta }}
                                </span>
                              </div>
                            </div>
                          </div>
                          <span
                            class="ml-auto hidden text-sm font-semibold text-gray-900 lg:inline"
                          >
                            {{
                              format(
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

              <!-- Custom delivery -->
              <template v-if="localDeliveryMethod === 'custom'">
                <div class="grid grid-cols-1 gap-3">
                  <TextField
                    type="text"
                    name="courier"
                    label="Courier Name"
                    placeholder="e.g GoKada"
                    :model-value="shippingInfo.courier as string"
                    @update:model-value="
                      (value: string) => {
                        updateShipping('courier', value)
                        validationErrors.courier = ''
                      }
                    "
                    :error="validationErrors.courier"
                    required
                  />
                  <TextField
                    type="number"
                    format="currency"
                    step="0.01"
                    name="delivery_fee"
                    :label="`Delivery Fee (${currency})`"
                    placeholder="0.00"
                    :model-value="shippingInfo.delivery_fee"
                    @update:model-value="
                      (value: string) => {
                        updateShipping('delivery_fee', Number(value))
                        validationErrors.delivery_fee = ''
                      }
                    "
                    :error="validationErrors.delivery_fee"
                    :min="0"
                    required
                  />
                </div>
              </template>
            </div>

            <!-- Delivery address (not needed for shipbubble - it has its own) -->
            <div
              v-if="
                shippingInfo.delivery_type === 'express' ||
                (shippingInfo.delivery_type === 'standard' &&
                  (localDeliveryMethod === 'manual' || localDeliveryMethod === 'custom'))
              "
            >
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
                  @update:model-value="updateShipping('delivery_address', $event)"
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
      </section>

      <!-- ─── PAYMENT CARD ─────────────────────────────────────── -->
      <section
        v-if="productsTotal > 0 || shippingInfo.delivery_fee > 0"
        class="overflow-hidden rounded-xl border border-gray-200 bg-white"
      >
        <header class="border-b border-gray-200 bg-gray-50 px-4 py-2.5">
          <h3 class="text-sm font-semibold text-gray-700">Payment</h3>
        </header>
        <div class="space-y-5 p-4">
          <div>
            <p class="mb-2 text-sm font-medium text-gray-700">Payment Status</p>
            <RadioInputField
              :options="ORDER_PAYMENT_STATUS"
              v-model="paymentInfo.payment_status"
              :orientation="isMobile ? 'vertical' : 'horizontal'"
            />
          </div>

          <div
            v-if="paymentInfo.payment_status !== 'unpaid'"
            data-validation-target="order-payment-source"
          >
            <SelectField
              :model-value="paymentInfo.payment_source"
              :options="ORDER_PAYMENT_METHODS"
              label="Payment Mode"
              required
              :error="submitAttempted ? paymentErrors.payment_source : ''"
              @update:model-value="
                paymentInfo.payment_source = $event as PaymentInfo['payment_source']
              "
            />
          </div>

          <div
            v-if="paymentInfo.payment_status === 'partially_paid'"
            data-validation-target="order-payment-amount"
          >
            <TextField
              :model-value="paymentInfo.payment_amount"
              name="order-payment-amount"
              type="number"
              format="currency"
              step="0.01"
              :label="`Amount Paid (${format(totalAmount)})`"
              placeholder="0.00"
              :min="0"
              :max="totalAmount"
              required
              :error="submitAttempted ? paymentErrors.payment_amount : ''"
              @update:model-value="paymentInfo.payment_amount = $event"
            />
          </div>
        </div>
      </section>
    </div>

    <div class="h-24" />

    <!-- ─── Footer ─────────────────────────────────────────────── -->
    <div class="border-core-200 fixed right-0 bottom-0 left-0 border-t bg-white p-4 md:p-6">
      <div class="flex flex-col gap-3">
        <FieldGroupError
          v-if="submitAttempted && (paymentErrors.payment_source || paymentErrors.payment_amount)"
          target="order-payment-source"
          :error="paymentErrors.payment_source || paymentErrors.payment_amount"
        />
        <div class="flex gap-3">
          <AppButton
            label="Back"
            color="alt"
            class="w-1/3"
            icon="arrow-left"
            @click="emit('close')"
          />
          <AppButton label="Save Details" class="w-2/3" @click="handleSave" />
        </div>
      </div>
    </div>
  </div>
</template>
