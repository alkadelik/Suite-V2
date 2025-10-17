<script setup lang="ts">
import Drawer from "@components/Drawer.vue"
import StepperWizard from "@components/StepperWizard.vue"
import AppButton from "@components/AppButton.vue"
import Icon from "@components/Icon.vue"
import { ref, computed } from "vue"
import { formatCurrency } from "@/utils/format-currency"
import type { IProductCatalogue } from "@modules/inventory/types"
import BoothSelectProduct from "./booth-form/BoothSelectProduct.vue"
import BoothSelectQtyVariant from "./booth-form/BoothSelectQtyVariant.vue"
import { useAddProductsToPopup } from "../api"
import { useRoute } from "vue-router"
import { displayError } from "@/utils/error-handler"
import { AddProductsPayload } from "../types"
import { toast } from "@/composables/useToast"

interface OrderItem {
  product: IProductCatalogue
  variant: { uid: string; name: string; sku: string; price: string; stock: number } | null
  quantity: number
  unit_price: number
  notes?: string
}

defineProps({
  open: { type: Boolean, required: true },
})
const emit = defineEmits(["close", "refresh"])

const route = useRoute()

const steps = ["Select Products", "Select Variants & Qty", "Review & Confirm"]
const activeStep = ref(0)

// Step 1: Selected products
const selectedProducts = ref<IProductCatalogue[]>([])

// Step 2: Product variants with quantities and prices
interface BoothItem {
  product: IProductCatalogue
  variant: { uid: string; name: string; sku: string; price: string; stock: number } | null
  quantity: number
  unit_price: number // Keep as unit_price for compatibility with existing components
  event_price: number // This will be the editable booth price
  is_visible: boolean
  is_active: boolean
  notes?: string
}

const orderItems = ref<BoothItem[]>([])

// Computed totals
const productsTotal = computed(() => {
  return orderItems.value.reduce((sum, item) => {
    return sum + item.quantity * item.event_price
  }, 0)
})

// Handle updates from BoothSelectQtyVariant
const updateOrderItems = (items: OrderItem[]) => {
  // Transform the items to include booth-specific properties
  orderItems.value = items.map((item) => ({
    ...item,
    event_price: item.unit_price, // Initially set event_price to unit_price
    is_visible: true, // Default to visible
    is_active: true, // Default to active
  }))
}

const { mutate: addProducts, isPending: isAddingProducts } = useAddProductsToPopup()

const resetForm = () => {
  activeStep.value = 0
  selectedProducts.value = []
  orderItems.value = []
}

const handleClose = () => {
  resetForm()
  emit("close")
}

const onSubmitBooth = () => {
  const boothItems: AddProductsPayload[] = orderItems.value.map((item) => ({
    variant: item.variant?.uid || "",
    quantity: item.quantity,
    event_price: item.event_price,
    is_visible: item.is_visible,
    is_active: item.is_active,
  }))

  addProducts(
    { popup_event: String(route.params.id), items: boothItems },
    {
      onSuccess: () => {
        toast.success("Products added to Booth successfully!")
        resetForm()
        emit("refresh")
        emit("close")
      },
      onError: displayError,
    },
  )
}
</script>

<template>
  <Drawer :open="open" title="Setup Booth" max-width="2xl" @close="handleClose">
    <StepperWizard v-model="activeStep" :steps="steps" :showIndicators="false">
      <template #default="{ step, onPrev, onNext }">
        <!-- Step 0: Select Products -->
        <BoothSelectProduct
          v-if="step === 0"
          v-model:selectedProducts="selectedProducts"
          @next="onNext"
        />

        <!-- Step 1: Select Variants & Quantities -->
        <BoothSelectQtyVariant
          v-if="step === 1"
          :orderItems="orderItems"
          :selectedProducts="selectedProducts"
          @update:orderItems="updateOrderItems"
          @next="onNext"
          @prev="onPrev"
        />

        <!-- Step 2: Review & Confirm -->
        <div v-if="step === 2" class="space-y-6">
          <div class="bg-core-50 mb-2 flex size-10 items-center justify-center rounded-xl p-2">
            <Icon name="document-check" size="28" />
          </div>
          <p class="mb-4 text-sm">Review your booth setup and confirm the products.</p>

          <!-- Booth Items -->
          <div class="rounded-xl bg-white p-4">
            <h3 class="mb-3 text-sm font-semibold">Booth Products</h3>
            <div class="space-y-3">
              <div
                v-for="(item, index) in orderItems"
                :key="index"
                class="border-core-200 flex items-center justify-between border-b pb-3 last:border-0"
              >
                <div class="flex-1">
                  <p class="font-medium">{{ item.product.name }}</p>
                  <p v-if="item.variant" class="text-xs text-gray-600">{{ item.variant.name }}</p>
                  <p class="text-xs text-gray-600">Qty: {{ item.quantity }}</p>
                  <p class="text-xs" :class="item.is_visible ? 'text-green-600' : 'text-gray-400'">
                    {{ item.is_visible ? "Visible" : "Hidden" }} •
                    {{ item.is_active ? "Active" : "Inactive" }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="font-medium">{{ formatCurrency(item.event_price) }}</p>
                  <p class="text-xs text-gray-600">
                    Total: {{ formatCurrency(item.quantity * item.event_price) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Summary -->
          <div class="rounded-xl bg-white p-4">
            <h3 class="mb-3 text-sm font-semibold">Booth Summary</h3>
            <div class="space-y-2 text-sm">
              <p class="flex justify-between">
                <span class="text-gray-600">Total Products:</span>
                <span class="font-medium">{{ orderItems.length }}</span>
              </p>
              <p class="flex justify-between">
                <span class="text-gray-600">Total Value:</span>
                <span class="text-primary-600 font-medium">{{
                  formatCurrency(productsTotal)
                }}</span>
              </p>
            </div>
          </div>

          <div class="h-24" />

          <div
            class="border-core-200 fixed right-0 bottom-0 left-0 flex gap-3 border-t bg-white p-6"
          >
            <AppButton
              label="Back"
              color="alt"
              variant="outlined"
              class="w-1/3"
              icon="arrow-left"
              @click="onPrev"
            />
            <AppButton
              label="Setup Booth"
              class="w-2/3"
              :loading="isAddingProducts"
              @click="onSubmitBooth"
            />
          </div>
        </div>
      </template>
    </StepperWizard>
  </Drawer>
</template>
