<template>
  <div class="text-core-800 p-4">
    <button
      @click="$router.back()"
      class="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
    >
      <Icon name="arrow-left" class="h-8 w-8 text-gray-600" />
    </button>

    <LoadingIcon v-if="isPending" class="mx-auto my-20" />
    <EmptyState
      v-else-if="!product && !isPending"
      class="my-20"
      title="Product not found."
      description="The product you are looking for does not exist."
      action-label="Go to Inventory"
      action-icon="box-outline"
      @action="$router.push({ name: 'Inventory' })"
    />
    <div v-else>
      <div class="border-primary-700 bg-primary-25 mt-4 flex gap-2 rounded-xl border p-4 md:gap-5">
        <div
          class="border-core-300 bg-core-200 flex size-10 items-center justify-center rounded-full border md:size-20"
        >
          <Icon name="box-filled" class="text-primary-600 !size-5 md:!size-8" />
        </div>
        <div class="flex flex-1 flex-col justify-between gap-2 py-1 md:gap-3">
          <div class="flex items-center justify-between">
            <h5 class="text-core-700 text-lg font-bold md:text-xl">{{ product?.data.name }}</h5>
            <div class="flex items-center gap-2">
              <Icon name="moneys" class="text-core-600" size="24" />
              <h4 class="text-xl font-bold md:text-2xl">
                {{ formatCurrency(Number(product?.data.variants[0].price)) }}
              </h4>
            </div>
          </div>
          <div class="flex gap-2">
            <Chip color="purple" icon="tag" label="Footwear" />
            <Chip color="success" label="In Stock" showDot />
            <Chip color="error" icon="star-outline" label="Bestseller" />
          </div>
        </div>
        <div>
          <DropdownMenu
            :items="actionItems"
            placement="bottom-end"
            :show-chevron="false"
            size="sm"
            trigger-class="!p-1 !min-h-6 !w-6 hover:bg-gray-100 !border-0"
            @click.stop
          >
            <template #trigger>
              <Icon name="dots-vertical" />
            </template>
          </DropdownMenu>
        </div>
      </div>

      <Tabs :tabs="tabs" v-model="activeTab" class="mt-4 md:mt-8" />

      <!-- overview tab -->
      <div v-if="activeTab === 'overview'">
        <h3 class="text-core-700 mb-4 text-lg font-semibold md:text-xl">Your Product Stats</h3>

        <PageSummaryCards
          :items="productMetrics"
          default-icon="bag"
          default-icon-class="text-success-500"
        />

        <Collapsible header="Product Details" class="mt-8">
          <template #body>
            <div class="mb-4 border-b border-gray-200 pb-4">
              <p class="text-core-600 mb-1 text-xs font-semibold md:text-sm">Description</p>
              <p class="text-core-800 text-xs font-semibold md:text-sm">
                {{ product?.data.description || "No description available for this product." }}
              </p>
            </div>
            <div
              class="grid grid-cols-2 gap-4"
              :class="product?.data.images.length ? 'mb-4 border-b border-gray-200 pb-4' : ''"
            >
              <div>
                <p class="text-core-600 mb-1 text-xs font-semibold md:text-sm">Price</p>
                <p class="text-core-800 text-xs font-semibold md:text-sm">
                  {{ formatCurrency(Number(product?.data.variants[0].price)) }}
                </p>
              </div>
              <div>
                <p class="text-core-600 mb-1 text-xs font-semibold md:text-sm">Total Stock</p>
                <p class="text-core-800 text-xs font-semibold md:text-sm">
                  {{ product?.data.variants[0].sellable_stock }}
                </p>
              </div>
              <div>
                <p class="text-core-600 mb-1 text-xs font-semibold md:text-sm">Weight</p>
                <p class="text-core-800 text-xs font-semibold md:text-sm">
                  {{ product?.data.variants[0].weight }}kg
                </p>
              </div>
              <div>
                <p class="text-core-600 mb-1 text-xs font-semibold md:text-sm">Dimension</p>
                <p class="text-core-800 text-xs font-semibold md:text-sm">
                  L-{{ Number(product?.data.variants[0].length) }}cm W-
                  {{ Number(product?.data.variants[0].width) }}cm H-{{
                    Number(product?.data.variants[0].height)
                  }}cm
                </p>
              </div>
            </div>
            <div v-if="product?.data.images.length" class="mt-4 flex gap-2">
              <img
                v-for="image in product?.data.images"
                :key="image.uid"
                :src="image.image"
                class="w-1/6 rounded-lg object-cover md:h-24 md:w-24"
                alt=""
              />
            </div>
          </template>
        </Collapsible>

        <div class="mt-6">
          <h3 class="text-core-700 mb-4 text-lg font-semibold md:text-xl">Product Promos</h3>
          <div
            class="border-primary-700 bg-primary-25 mt-4 flex gap-2 rounded-xl border p-4 md:gap-5"
          >
            <div class="flex flex-1 flex-col justify-between gap-2 md:gap-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center justify-between gap-2">
                  <!-- original price -->
                  <h5 class="text-core-400 text-lg font-semibold line-through md:text-xl">
                    {{ formatCurrency(5000) }}
                  </h5>
                  <!-- promo price -->
                  <h5 class="text-core-800 text-xl font-semibold md:text-2xl">
                    {{ formatCurrency(4000) }}
                  </h5>
                </div>
              </div>
              <p class="text-core-700 inline-flex items-center gap-1 text-sm md:text-base">
                <Icon name="calendar" class="text-core-700 inline" size="16" /> Ends Sept 30, 2025
              </p>
              <div class="flex gap-2">
                <Chip color="success" label="Active" showDot />
                <Chip color="blue" icon="tag" :label="`${formatCurrency(5000)} off`" />
                <Chip color="purple" icon="box-outline" label="Product Only" />
              </div>
            </div>
            <!-- <div>
            <DropdownMenu
              :items="actionItems"
              placement="bottom-end"
              :show-chevron="false"
              size="sm"
              trigger-class="!p-1 !min-h-6 !w-6 hover:bg-gray-100 !border-0"
              @click.stop
            >
              <template #trigger>
                <Icon name="dots-vertical" />
              </template>
            </DropdownMenu>
          </div> -->
          </div>
        </div>
      </div>
    </div>

    <!-- modals -->
    <ConfirmationModal
      v-model="showDeleteConfirmationModal"
      @close="showDeleteConfirmationModal = false"
      header="Delete Product"
      paragraph="Are you sure you want to delete this product?"
      variant="error"
      @confirm="handleDeleteProduct"
      :loading="isDeletingProduct"
    />
  </div>
</template>

<script setup lang="ts">
import Icon from "@components/Icon.vue"
import { useGetProduct, useDeleteProduct } from "../api"
import { useRoute, useRouter } from "vue-router"
import DropdownMenu from "@components/DropdownMenu.vue"
import { ref } from "vue"
import { formatCurrency } from "@/utils/format-currency"
import Chip from "@components/Chip.vue"
import Tabs from "@components/Tabs.vue"
import PageSummaryCards from "@components/PageSummaryCards.vue"
import Collapsible from "@components/Collapsible.vue"
import LoadingIcon from "@components/LoadingIcon.vue"
import ConfirmationModal from "@components/ConfirmationModal.vue"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"
import { useQueryClient } from "@tanstack/vue-query"
import EmptyState from "@components/EmptyState.vue"

const route = useRoute()
const router = useRouter()
const queryClient = useQueryClient()
const uid = Array.isArray(route.params.uid) ? route.params.uid[0] : route.params.uid
const { data: product, isPending } = useGetProduct(uid)
const { mutate: deleteProduct, isPending: isDeletingProduct } = useDeleteProduct()

const activeTab = ref("overview")
const showDeleteConfirmationModal = ref(false)

const actionItems = ref([
  {
    label: "Edit Product",
    icon: "edit",
    action: () => {
      console.log("Editing product:", product.value)
    },
  },
  {
    label: "Add Stock",
    icon: "box-add",
    action: () => {
      console.log("Adding stock:", product.value)
    },
  },
  {
    label: "Reduce Stock",
    icon: "box-add",
    action: () => {
      console.log("Reducing Stock:", product.value)
    },
  },
  {
    label: "Transfer Stock",
    icon: "box",
    action: () => {
      console.log("Transferring stock:", product.value)
    },
  },
  {
    label: "Request Stock",
    icon: "box-time",
    action: () => {
      console.log("Requesting stock:", product.value)
    },
  },
  {
    label: "View Stock Movement",
    icon: "arrow-2",
    action: () => {
      console.log("Viewing stock movement:", product.value)
    },
  },
  {
    divider: true,
  },
  {
    label: "Delete Product",
    icon: "trash",
    action: () => {
      showDeleteConfirmationModal.value = true
    },
    class: "text-red-600 hover:bg-red-50",
    iconClass: "text-red-600",
  },
])

const tabs = ref([
  { key: "overview", title: "Overview" },
  { key: "orders", title: "Orders" },
  { key: "movement_logs", title: "Movement Logs" },
])

const productMetrics = ref([
  {
    label: "Actual Inventory",
    value: 1245,
    prev_value: 1200,
    icon: "shop",
  },
  {
    label: "Sellable Inventory",
    value: formatCurrency(56789.45),
    prev_value: formatCurrency(54321.0),
    icon: "shopping-cart",
  },
  {
    label: "Amount Sold(Revenue)",
    value: 150,
    prev_value: 120,
    icon: "box-filled",
  },
  {
    label: "Quantity Sold",
    value: 320,
    prev_value: 300,
    icon: "box-time",
  },
  {
    label: "Reserved Inventory",
    value: 320,
    prev_value: 300,
    icon: "box-time",
  },
  {
    label: "Memo Count",
    value: 320,
    prev_value: 300,
    icon: "box-time",
  },
  {
    label: "Return Count",
    value: 320,
    prev_value: 300,
    icon: "box-time",
  },
])

const handleDeleteProduct = () => {
  if (!product.value) return

  deleteProduct(product.value?.data.uid, {
    onSuccess: () => {
      toast.success("Product deleted successfully")
      showDeleteConfirmationModal.value = false
      queryClient.refetchQueries({ queryKey: ["products"] })
      router.push({ name: "Inventory" })
    },
    onError: displayError,
  })
}
</script>
