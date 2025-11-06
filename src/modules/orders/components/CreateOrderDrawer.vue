<script setup lang="ts">
import Drawer from "@components/Drawer.vue"
import StepperWizard from "@components/StepperWizard.vue"
import { ref, computed } from "vue"
import type { IProductCatalogue } from "@modules/inventory/types"
import type { ICustomer } from "@modules/customers/types"
import type { OrderPayload, OrderItemPayload } from "@modules/orders/types"
import OrderSelectCustomer from "./create-order-form/OrderSelectCustomer.vue"
import OrderSelectProduct from "./create-order-form/OrderSelectProduct.vue"
import OrderProductQtyVariant from "./create-order-form/OrderProductQtyVariant.vue"
import OrderReviewForm from "./create-order-form/OrderReviewForm.vue"
import OrderShippingInfoForm from "./create-order-form/OrderShippingInfoForm.vue"
import OrderPaymentForm from "./create-order-form/OrderPaymentForm.vue"
import { anonymousCustomer } from "../constants"
import { displayError } from "@/utils/error-handler"
import { useCreateOrder } from "../api"
import { toast } from "@/composables/useToast"

defineProps({
  open: { type: Boolean, required: true },
})
const emit = defineEmits(["close", "refresh"])

const steps = [
  "Add Products",
  "Select Variants & Qty",
  "Customer Details",
  "Shipping Info",
  "Payment",
  "Review & Confirm",
]
const activeStep = ref(0)

// Step 1: Selected products
const selectedProducts = ref<IProductCatalogue[]>([])

// Step 2: Product variants with quantities and prices
interface OrderItem {
  product: IProductCatalogue
  variant: { uid: string; name: string; sku: string; price: string; stock: number } | null
  quantity: number
  unit_price: number
  notes?: string
}

const orderItems = ref<OrderItem[]>([])

// Transform orderItems for ReviewForm
const reviewOrderItems = computed(() => {
  return orderItems.value.map((item) => ({
    product: {
      uid: item.product.uid,
      product_name: item.product.name,
      total_stock: item.product.total_stock,
    },
    variant: item.variant,
    quantity: item.quantity,
    unit_price: item.unit_price,
    notes: item.notes,
  }))
})

// Step 3: Customer info
const selectedCustomer = ref<ICustomer | null>(null)

// Step 4: Shipping info
const shippingInfo = ref({
  fulfilment_method: "pickup" as "pickup" | "delivery",
  fulfilment_status: "unfulfilled" as "unfulfilled" | "fulfilled",
  delivery_address: "",
  delivery_method: "manual" as "manual" | "automatic",
  courier: "",
  delivery_fee: 0,
  order_date: new Date().toISOString().split("T")[0],
  order_channel: "online_store",
  has_shipping: true,
})

// Step 5: Payment info
const paymentInfo = ref({
  payment_status: "unpaid" as "unpaid" | "paid" | "partially_paid",
  payment_amount: 0,
  payment_source: undefined as { label: string; value: string } | undefined,
  coupon_code: null as string | null,
  discount_amount: 0,
})

// Computed totals
const productsTotal = computed(() => {
  return orderItems.value.reduce((sum, item) => {
    return sum + item.quantity * item.unit_price
  }, 0)
})

const totalAmount = computed(() => {
  return productsTotal.value + shippingInfo.value.delivery_fee - paymentInfo.value.discount_amount
})

const { mutate: createOrder, isPending } = useCreateOrder()

const onCreateOrder = () => {
  // Format payload according to OrderPayload interface
  // source: "internal" || shippingInfo.value.order_channel,
  const payload: OrderPayload = {
    source: "internal",
    customer:
      selectedCustomer.value?.uid == anonymousCustomer?.uid
        ? ""
        : selectedCustomer.value?.uid || "",
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
    payment_source: paymentInfo.value.payment_source?.value,
    items: orderItems.value.map(
      (item): OrderItemPayload => ({
        variant: item.variant?.uid || "",
        quantity: item.quantity,
        unit_price: item.unit_price,
        fulfilment_status: shippingInfo.value.fulfilment_status,
        qty_fulfilled: 0,
        notes: item.notes,
      }),
    ),
  }

  createOrder(payload, {
    onSuccess: (res) => {
      console.log("Order created:", res.data)
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
    fulfilment_method: "delivery",
    fulfilment_status: "unfulfilled",
    delivery_address: "",
    delivery_method: "manual",
    courier: "",
    delivery_fee: 0,
    order_date: new Date().toISOString().split("T")[0],
    order_channel: "online_store",
    has_shipping: true,
  }
  paymentInfo.value = {
    payment_status: "unpaid",
    payment_amount: 0,
    payment_source: undefined,
    coupon_code: null,
    discount_amount: 0,
  }
}
</script>

<template>
  <Drawer :open="open" title="Create Order" max-width="2xl" @close="emit('close')">
    <StepperWizard v-model="activeStep" :steps="steps" :showIndicators="false">
      <template #default="{ step, onPrev, onNext }">
        <!-- Step 0: Select Products -->
        <OrderSelectProduct
          v-if="step === 0"
          v-model:selectedProducts="selectedProducts"
          @next="onNext"
        />

        <!-- Step 1: Select Variants & Quantities -->
        <OrderProductQtyVariant
          v-if="step === 1"
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
          @next="onNext"
          @prev="onPrev"
        />

        <!-- Step 4: Payment Info -->
        <OrderPaymentForm
          v-if="step === 4"
          v-model:paymentInfo="paymentInfo"
          :productsTotal="productsTotal"
          :deliveryFee="shippingInfo.delivery_fee"
          :totalAmount="totalAmount"
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
          :totalAmount="totalAmount"
          :loading="isPending"
          @prev="onPrev"
          @submit="onCreateOrder"
        />
      </template>
    </StepperWizard>
  </Drawer>
</template>
