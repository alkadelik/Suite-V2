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
import Modal from "@components/Modal.vue"
import { useMediaQuery } from "@vueuse/core"

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

const isMobile = useMediaQuery("(max-width: 1028px)")
</script>

<template>
  <component
    :is="isMobile ? Modal : Drawer"
    :open="open"
    variant="fullscreen"
    title="Setup Booth"
    max-width="2xl"
    @close="handleClose"
  >
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
            <Icon name="shop" size="28" />
          </div>
          <p class="mb-4 text-sm">Review your booth setup and confirm the products.</p>

          <!-- Booth Items -->
          <div class="rounded-xl bg-white p-4">
            <h3 class="mb-3 text-sm font-semibold">Booth Products</h3>

            <div class="border-core-300 bg-core-25 my-6 space-y-4 rounded-xl border p-4">
              <div
                v-for="(item, idx) in orderItems"
                :key="`${item.product.uid}-${item.variant?.uid || idx}`"
                class="flex items-center justify-between"
              >
                <!-- LEFT -->
                <div class="flex items-center gap-3">
                  <!-- Product Image -->
                  <img
                    v-if="item.product.images?.length"
                    :src="item.product.images[0].image"
                    :alt="item.product.name"
                    class="h-10 w-10 rounded-lg object-cover"
                  />

                  <div
                    v-else
                    class="flex h-10 w-10 items-center justify-center rounded-lg bg-white"
                  >
                    <Icon name="box" class="h-5 w-5 text-gray-400" />
                  </div>

                  <!-- Product Info -->
                  <div>
                    <h4 class="text-sm font-medium">
                      {{ item.product.name }}
                      <span class="text-primary-700 ml-1 text-xs font-medium">
                        (x{{ item.quantity }})
                      </span>
                    </h4>

                    <!-- Variant Label -->
                    <p v-if="item.variant" class="text-core-500 text-xs">
                      {{ item.variant.name.split(" - ")[1] || item.variant.name }}
                    </p>

                    <!-- Visibility + Active -->
                    <!-- <p class="mt-0.5 text-xs">
                      <span :class="item.is_visible ? 'text-green-600' : 'text-gray-400'">
                        {{ item.is_visible ? "Visible" : "Hidden" }}
                      </span>
                      •
                      <span :class="item.is_active ? 'text-green-600' : 'text-gray-400'">
                        {{ item.is_active ? "Active" : "Inactive" }}
                      </span>
                    </p> -->
                  </div>
                </div>

                <!-- RIGHT PRICE COLUMN -->
                <div class="text-right">
                  <!-- Show original price if discounted -->
                  <!-- <span
                    v-if="
                      item.variant?.original_price &&
                      item.variant.original_price !== item.unit_price
                    "
                    class="text-core-400 text-xs line-through"
                  >
                    {{ formatCurrency(item.quantity * item.variant.original_price) }}
                  </span> -->

                  <span class="ml-1 block text-sm font-medium">
                    {{ formatCurrency(Number(item.quantity * item.unit_price)) }}
                  </span>
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
            <AppButton label="Back" color="alt" class="w-1/3" icon="arrow-left" @click="onPrev" />
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
  </component>
</template>
