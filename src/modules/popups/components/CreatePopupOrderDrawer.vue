<script setup lang="ts">
import Drawer from "@components/Drawer.vue"
import StepperWizard from "@components/StepperWizard.vue"
import { ref, computed } from "vue"
import type { ICustomer } from "@modules/customers/types"
import { displayError } from "@/utils/error-handler"
import { toast } from "@/composables/useToast"
import { PopupInventory } from "../types"
import { useCreatePopupOrder } from "../api"
import PopupOrderSelectProduct from "./popup-order-form/PopupOrderSelectProduct.vue"
import PopupOrderProductQty from "./popup-order-form/PopupOrderProductQty.vue"
import PopupOrderSelectCustomer from "./popup-order-form/PopupOrderSelectCustomer.vue"
import PopupOrderShippingInfoForm from "./popup-order-form/PopupOrderShippingInfoForm.vue"
import PopupOrderPaymentForm from "./popup-order-form/PopupOrderPaymentForm.vue"
import PopupOrderReview from "./popup-order-form/PopupOrderReview.vue"

const props = defineProps({
  open: { type: Boolean, required: true },
  popupId: { type: String, required: true },
})
const emit = defineEmits(["close", "refresh"])

const steps = [
  "Add Products",
  "Set Quantities",
  "Customer Details",
  "Shipping Info",
  "Payment",
  "Review & Confirm",
]
const activeStep = ref(0)

// Step 1: Selected products
const selectedProducts = ref<PopupInventory[]>([])

// Step 2: Product variants with quantities and prices for popup orders
interface PopupOrderItem {
  product: PopupInventory
  quantity: number
  unit_price: number
  notes?: string
}

const orderItems = ref<PopupOrderItem[]>([])

// Step 3: Customer info
const selectedCustomer = ref<ICustomer | null>(null)

// Step 4: Shipping info
const shippingInfo = ref({
  fulfilment_method: "pickup" as "pickup" | "delivery",
  fulfilment_status: "fulfilled" as "unfulfilled" | "fulfilled",
  delivery_address: "",
  delivery_method: "manual" as "manual" | "automatic",
  courier: "",
  delivery_fee: 0,
  order_date: new Date().toISOString().split("T")[0],
  order_channel: "popup_event",
  has_shipping: true,
})

// Step 5: Payment info
const paymentInfo = ref({
  payment_status: "paid" as "unpaid" | "paid" | "partially_paid",
  payment_amount: 0,
  coupon_code: null as string | null,
  discount_amount: 0,
})

// Computed totals
const productsTotal = computed(() => {
  return orderItems.value.reduce((sum, item) => {
    return sum + item.quantity * item.unit_price
  }, 0)
})

const productItemsCount = computed(() => {
  return orderItems.value.reduce((sum, item) => {
    return sum + item.quantity
  }, 0)
})

const totalAmount = computed(() => {
  return productsTotal.value + shippingInfo.value.delivery_fee - paymentInfo.value.discount_amount
})

const { mutate: createPopupOrder, isPending } = useCreatePopupOrder()

const onCreateOrder = () => {
  const payload = {
    source: "popup-internal",
    popup_event: props.popupId,
    customer_name: selectedCustomer.value?.full_name || "",
    customer_email: selectedCustomer.value?.email || "",
    customer_phone: selectedCustomer.value?.phone || "",
    total_amount: totalAmount.value,
    delivery_fee: shippingInfo.value.delivery_fee,
    fulfilment_method: shippingInfo.value.fulfilment_method,
    delivery_address: shippingInfo.value.delivery_address,
    delivery_method: shippingInfo.value.delivery_method,
    courier: shippingInfo.value.courier,
    coupon_code: paymentInfo.value.coupon_code || "",
    payment_status: paymentInfo.value.payment_status,
    payment_amount:
      paymentInfo.value.payment_status === "paid"
        ? totalAmount.value
        : paymentInfo.value.payment_amount,
    items: orderItems.value.map((item) => ({
      popup_inventory: item.product.uid,
      quantity: item.quantity,
      unit_price: item.unit_price,
      fulfilment_status: shippingInfo.value.fulfilment_status,
    })),
  }

  createPopupOrder(payload, {
    onSuccess: () => {
      toast.success("Order created successfully!")
      emit("refresh")
      emit("close")
      resetForm()
    },
    onError: displayError,
  })
}

const resetForm = () => {
  activeStep.value = 0
  selectedProducts.value = []
  orderItems.value = []
  selectedCustomer.value = null
  shippingInfo.value = {
    fulfilment_method: "pickup",
    fulfilment_status: "unfulfilled",
    delivery_address: "",
    delivery_method: "manual",
    courier: "",
    delivery_fee: 0,
    order_date: new Date().toISOString().split("T")[0],
    order_channel: "popup_event",
    has_shipping: true,
  }
  paymentInfo.value = {
    payment_status: "unpaid",
    payment_amount: 0,
    coupon_code: null,
    discount_amount: 0,
  }
}
</script>

<template>
  <Drawer :open="open" title="Add Popup Order" max-width="2xl" @close="emit('close')">
    <StepperWizard v-model="activeStep" :steps="steps" :showIndicators="false">
      <template #default="{ step, onPrev, onNext }">
        <!-- Step 0: Select Products -->
        <PopupOrderSelectProduct
          v-if="step === 0"
          v-model:selectedProducts="selectedProducts"
          @next="onNext"
        />

        <!-- Step 1: Select Quantities -->
        <PopupOrderProductQty
          v-if="step === 1"
          v-model:orderItems="orderItems"
          :selectedProducts="selectedProducts"
          @next="onNext"
          @prev="onPrev"
        />

        <!-- Step 2: Select Customer -->
        <PopupOrderSelectCustomer
          v-if="step === 2"
          v-model:selectedCustomer="selectedCustomer"
          @next="onNext"
          @prev="onPrev"
        />

        <!-- Step 3: Shipping Info -->
        <PopupOrderShippingInfoForm
          v-if="step === 3"
          v-model:shippingInfo="shippingInfo"
          :customer="selectedCustomer"
          @next="onNext"
          @prev="onPrev"
        />

        <!-- Step 4: Payment Info -->
        <PopupOrderPaymentForm
          v-if="step === 4"
          v-model:paymentInfo="paymentInfo"
          :productsTotal="productsTotal"
          :itemsCount="productItemsCount"
          :deliveryFee="shippingInfo.delivery_fee"
          :totalAmount="totalAmount"
          @next="onNext"
          @prev="onPrev"
        />

        <!-- Step 5: Review & Confirm -->
        <PopupOrderReview
          v-if="step === 5"
          :orderItems="orderItems"
          :customer="selectedCustomer"
          :shippingInfo="shippingInfo"
          :paymentInfo="paymentInfo"
          :productsTotal="productsTotal"
          :totalAmount="totalAmount"
          :itemsCount="productItemsCount"
          :deliveryFee="shippingInfo.delivery_fee"
          :loading="isPending"
          @prev="onPrev"
          @submit="onCreateOrder"
        />
      </template>
    </StepperWizard>
  </Drawer>
</template>
