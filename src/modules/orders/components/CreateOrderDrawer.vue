<script setup lang="ts">
import Drawer from "@components/Drawer.vue"
import StepperWizard from "@components/StepperWizard.vue"
import { ref, computed } from "vue"
import type { IProductCatalogue } from "@modules/inventory/types"
import type { ICustomer } from "@modules/customers/types"
import type { OrderPayload, OrderItemPayload } from "@modules/orders/types"
import type { PopupInventoryVariant, PopupOrderPayload } from "@modules/popups/types"
import OrderSelectCustomer from "./create-order-form/OrderSelectCustomer.vue"
import OrderSelectProduct from "./create-order-form/OrderSelectProduct.vue"
import OrderProductQtyVariant from "./create-order-form/OrderProductQtyVariant.vue"
import OrderReviewForm from "./create-order-form/OrderReviewForm.vue"
import OrderShippingInfoForm from "./create-order-form/OrderShippingInfoForm.vue"
import OrderPaymentForm from "./create-order-form/OrderPaymentForm.vue"
import PopupOrderSelectProduct from "@modules/popups/components/popup-order-form/PopupOrderSelectProduct.vue"
import PopupOrderProductQty from "@modules/popups/components/popup-order-form/PopupOrderProductQty.vue"
import { anonymousCustomer, ORDER_CHANNELS, DELIVERY_PAYMENT_OPTION } from "../constants"
import { displayError } from "@/utils/error-handler"
import { useCreateOrder } from "../api"
import { useCreatePopupOrder } from "@modules/popups/api"
import { toast } from "@/composables/useToast"
import type { IShippingCourier } from "@modules/shared/types"
import type { PopupInventory } from "@modules/popups/types"
import { useMediaQuery } from "@vueuse/core"
import Modal from "@components/Modal.vue"
import { useGetStoreDetails } from "@modules/settings/api"
import { useAuthStore } from "@modules/auth/store"

const props = defineProps({
  open: { type: Boolean, required: true },
  popupEventId: { type: String, default: undefined },
})
const emit = defineEmits(["close", "refresh"])

// Get store details for tax settings
const storeUid = computed(() => useAuthStore().user?.store_uid || "")
const { data: storeDetails } = useGetStoreDetails(storeUid.value)

// Check if tax collection is enabled
const isTaxEnabled = computed(() => storeDetails.value?.tax_collection_enabled || false)

// VAT rate from store settings (default 7.5%)
const VAT_RATE = computed(() => {
  const rate = storeDetails.value?.tax_rate
  return rate ? Number(rate) : 0.075
})

const isPopupOrder = computed(() => !!props.popupEventId)

const steps = computed(() => {
  if (isPopupOrder.value) {
    return [
      "Add Products",
      "Set Quantities",
      "Customer Details",
      "Shipping Info",
      "Payment",
      "Review & Confirm",
    ]
  }
  return [
    "Add Products",
    "Select Variants & Qty",
    "Customer Details",
    "Shipping Info",
    "Payment",
    "Review & Confirm",
  ]
})
const activeStep = ref(0)

// Step 1: Selected products
const selectedProducts = ref<IProductCatalogue[]>([])
const selectedPopupProducts = ref<PopupInventory[]>([])

// Step 2: Product variants with quantities and prices
interface OrderItem {
  product: IProductCatalogue
  variant: {
    uid: string
    name: string
    sku: string
    price: string
    stock: number
    original_price?: number
  } | null
  quantity: number
  unit_price: number
  notes?: string
}

const orderItems = ref<OrderItem[]>([])

// Popup order items structure
interface PopupOrderItem {
  product: PopupInventory
  variant: PopupInventoryVariant
  quantity: number
  unit_price: number
  notes?: string
}

const popupOrderItems = ref<PopupOrderItem[]>([])

// Transform orderItems for ReviewForm
const reviewOrderItems = computed(() => {
  if (isPopupOrder.value) {
    return popupOrderItems.value.map((item) => ({
      product: {
        uid: item.product.uid,
        product_name: item.product.name,
        total_stock: item.variant.available_quantity,
        image: item.product.images?.[0]?.image || null,
      },
      variant: {
        uid: item.variant.uid,
        name: item.variant.name,
        sku: item.variant.sku,
        price: item.variant.event_price,
        original_price: parseFloat(item.variant.original_price),
      },
      quantity: item.quantity,
      unit_price: item.unit_price,
      notes: item.notes,
    }))
  }
  return orderItems.value.map((item) => ({
    product: {
      uid: item.product.uid,
      product_name: item.product.name,
      total_stock: item.product.total_stock,
      image: item.product.images?.[0]?.image || null,
    },
    variant: item.variant
      ? {
          uid: item.variant.uid,
          name: item.variant.name,
          sku: item.variant.sku,
          price: item.variant.price,
          original_price: item.variant.original_price,
        }
      : null,
    quantity: item.quantity,
    unit_price: item.unit_price,
    notes: item.notes,
  }))
})

// Step 3: Customer info
const selectedCustomer = ref<ICustomer | null>(null)

// Step 4: Shipping info
const getInitialShippingInfo = () => ({
  fulfilment_method: "pickup" as "pickup" | "delivery",
  fulfilment_status: isPopupOrder.value
    ? "fulfilled"
    : ("unfulfilled" as "unfulfilled" | "fulfilled"),
  delivery_address: "",
  delivery_method: "manual" as "manual" | "automatic",
  courier: "",
  delivery_fee: 0,
  order_date: new Date().toISOString().split("T")[0],
  order_channel: isPopupOrder.value
    ? { label: "Popup Event", value: "popup_event" }
    : ORDER_CHANNELS[0],
  has_shipping: true,
  delivery_payment_option: DELIVERY_PAYMENT_OPTION[0].value,
  shipping_courier: null as IShippingCourier | null,
  shipping_rate_token: "",
  customer_email: "",
  customer_phone: "",
})

const shippingInfo = ref(getInitialShippingInfo())

// Step 5: Payment info
const getInitialPaymentInfo = () => ({
  payment_status: (isPopupOrder.value ? "paid" : "unpaid") as "unpaid" | "paid" | "partially_paid",
  payment_amount: 0,
  payment_source: undefined as { label: string; value: string } | undefined,
  coupon_code: null as string | null,
  discount_amount: 0,
})

const paymentInfo = ref(getInitialPaymentInfo())

// Computed totals
const itemsCount = computed(() => {
  if (isPopupOrder.value) {
    return popupOrderItems.value.reduce((sum, item) => sum + Number(item.quantity), 0)
  }
  return orderItems.value.reduce((sum, item) => sum + Number(item.quantity), 0)
})

const productsTotal = computed(() => {
  if (isPopupOrder.value) {
    return popupOrderItems.value.reduce((sum, item) => {
      return sum + item.quantity * item.unit_price
    }, 0)
  }
  return orderItems.value.reduce((sum, item) => {
    return sum + item.quantity * item.unit_price
  }, 0)
})

// VAT amount
const vatAmount = computed(() => {
  if (!isTaxEnabled.value) return 0
  return Math.round(productsTotal.value * VAT_RATE.value * 100) / 100
})

const totalAmount = computed(() => {
  return (
    productsTotal.value +
    vatAmount.value +
    shippingInfo.value.delivery_fee -
    paymentInfo.value.discount_amount
  )
})

const { mutate: createOrder, isPending: isRegularOrderPending } = useCreateOrder()
const { mutate: createPopupOrder, isPending: isPopupOrderPending } = useCreatePopupOrder()

const isPending = computed(() => isRegularOrderPending.value || isPopupOrderPending.value)

const onCreateOrder = () => {
  // Format payload according to OrderPayload interface
  const { fulfilment_method, delivery_method } = shippingInfo.value
  const { uid, email, phone, full_name, first_name, last_name } = selectedCustomer.value || {}

  const payload = {
    source: isPopupOrder.value ? "popup-internal" : "internal",
    ...(isPopupOrder.value ? { popup_event: props.popupEventId } : {}),
    ...(uid && uid !== anonymousCustomer.uid
      ? {
          customer: uid,
          customer_name: full_name || `${first_name} ${last_name}`,
          customer_email: email || "",
          customer_phone: phone || "",
        }
      : { customer: "" }),
    total_amount: totalAmount.value,
    ...(fulfilment_method === "delivery"
      ? {
          delivery_fee: shippingInfo.value.delivery_fee,
          delivery_method,
          delivery_payment_option: shippingInfo.value.delivery_payment_option,
          delivery_address:
            delivery_method === "automatic" ? shippingInfo.value.delivery_address : "",
        }
      : {}),
    fulfilment_method,
    courier:
      fulfilment_method === "delivery" &&
      (shippingInfo.value.shipping_courier || shippingInfo.value.courier)
        ? {
            courier_id: shippingInfo.value.courier?.toLowerCase(),
            courier_name: shippingInfo.value.courier,
            votes: 0,
            ratings: 0,
          }
        : "",
    coupon_code: paymentInfo.value.coupon_code || "",
    payment_status: paymentInfo.value.payment_status,
    payment_amount:
      paymentInfo.value.payment_status === "paid"
        ? totalAmount.value
        : paymentInfo.value.payment_amount,
    payment_source: paymentInfo.value.payment_source?.value,
    items: isPopupOrder.value
      ? popupOrderItems.value.map((item) => ({
          popup_inventory: item.variant.popup_inventory_uid,
          quantity: item.quantity,
          unit_price: item.unit_price,
          fulfilment_status: shippingInfo.value.fulfilment_status,
          notes: item.notes,
        }))
      : orderItems.value.map(
          (item): OrderItemPayload => ({
            variant: item.variant?.uid || "",
            quantity: item.quantity,
            unit_price: item.unit_price,
            fulfilment_status: shippingInfo.value.fulfilment_status,
            qty_fulfilled: 0,
            notes: item.notes,
          }),
        ),
    fulfilment_status: shippingInfo.value.fulfilment_status,
    order_channel: shippingInfo.value.order_channel.value,
    order_date: shippingInfo.value.order_date,
  }

  const handler = {
    onSuccess: () => {
      toast.success("Order created successfully!")
      emit("refresh")
      emit("close")
      resetForm()
    },
    onError: displayError,
  }

  if (isPopupOrder.value) {
    createPopupOrder(payload as PopupOrderPayload, handler)
  } else {
    createOrder(payload as OrderPayload, handler)
  }
}

const resetForm = () => {
  activeStep.value = 0
  selectedProducts.value = []
  selectedPopupProducts.value = []
  orderItems.value = []
  popupOrderItems.value = []
  selectedCustomer.value = null
  shippingInfo.value = getInitialShippingInfo()
  paymentInfo.value = getInitialPaymentInfo()
}

const isMobile = useMediaQuery("(max-width: 1028px)")
</script>

<template>
  <component
    :is="isMobile ? Modal : Drawer"
    :open="open"
    :title="isPopupOrder ? 'Add Popup Order' : 'Create Order'"
    max-width="2xl"
    variant="fullscreen"
    @close="emit('close')"
  >
    <StepperWizard v-model="activeStep" :steps="steps" :showIndicators="false">
      <template #default="{ step, onPrev, onNext }">
        <!-- Step 0: Select Products -->
        <PopupOrderSelectProduct
          v-if="step === 0 && isPopupOrder"
          v-model:selectedProducts="selectedPopupProducts"
          @next="onNext"
        />
        <OrderSelectProduct
          v-else-if="step === 0"
          v-model:selectedProducts="selectedProducts"
          @next="onNext"
        />

        <!-- Step 1: Select Variants & Quantities -->
        <PopupOrderProductQty
          v-if="step === 1 && isPopupOrder"
          v-model:orderItems="popupOrderItems"
          :selectedProducts="selectedPopupProducts"
          @next="onNext"
          @prev="onPrev"
        />
        <OrderProductQtyVariant
          v-else-if="step === 1"
          v-model:orderItems="orderItems"
          :selectedProducts="selectedProducts"
          @next="onNext"
          @prev="onPrev"
        />

        <!-- Step 2: Select Customer -->
        <OrderSelectCustomer
          v-if="step === 2"
          v-model:selectedCustomer="selectedCustomer"
          @next="onNext"
          @prev="onPrev"
        />

        <!-- Step 3: Shipping Info -->
        <OrderShippingInfoForm
          v-if="step === 3"
          v-model:shippingInfo="shippingInfo"
          :customer="selectedCustomer"
          :orderItems="isPopupOrder ? (popupOrderItems as any) : orderItems"
          @next="onNext"
          @prev="onPrev"
        />

        <!-- Step 4: Payment Info -->
        <OrderPaymentForm
          v-if="step === 4"
          v-model:paymentInfo="paymentInfo"
          :productsTotal="productsTotal"
          :deliveryFee="shippingInfo.delivery_fee"
          :vatAmount="vatAmount"
          :totalAmount="totalAmount"
          :itemsCount="itemsCount"
          @next="onNext"
          @prev="onPrev"
        />

        <!-- Step 5: Review & Confirm -->
        <OrderReviewForm
          v-if="step === 5"
          :orderItems="reviewOrderItems"
          :customer="selectedCustomer"
          :shippingInfo="shippingInfo"
          :paymentInfo="paymentInfo"
          :productsTotal="productsTotal"
          :deliveryFee="shippingInfo.delivery_fee"
          :vatAmount="vatAmount"
          :totalAmount="totalAmount"
          :loading="isPending"
          @prev="onPrev"
          @submit="onCreateOrder"
        />
      </template>
    </StepperWizard>
  </component>
</template>
