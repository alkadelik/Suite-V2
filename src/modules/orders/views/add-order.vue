<script setup lang="ts">
import { ref, computed, onMounted, watch, useTemplateRef, toValue } from "vue"
import { useRouter } from "vue-router"
import Icon from "@components/Icon.vue"
import AppButton from "@components/AppButton.vue"
import Drawer from "@components/Drawer.vue"
import TextField from "@components/form/TextField.vue"
import EmptyState from "@components/EmptyState.vue"
import type { IProductCatalogue } from "@modules/inventory/types"
import type { ICustomer } from "@modules/customers/types"
import type { OrderPayload, OrderItemPayload } from "@modules/orders/types"
import { useGetProductCatalogsInfinite } from "@modules/inventory/api"
import { useGetCategories } from "@modules/inventory/api"
import { useInfiniteScroll } from "@vueuse/core"
import { useDebouncedRef } from "@/composables/useDebouncedRef"
import OrderSelectCustomer from "../components/create-order-form/OrderSelectCustomer.vue"
import OrderShippingInfoForm from "../components/create-order-form/OrderShippingInfoForm.vue"
import OrderPaymentForm from "../components/create-order-form/OrderPaymentForm.vue"
import OrderAddCustomerAddress from "../components/create-order-form/OrderAddCustomerAddress.vue"
import AddNewProductModal from "../components/create-order-form/AddNewProductModal.vue"
import { anonymousCustomer, ORDER_CHANNELS, DELIVERY_PAYMENT_OPTION } from "../constants"
import { displayError } from "@/utils/error-handler"
import { useCreateOrder } from "../api"
import { toast } from "@/composables/useToast"
import type { IShippingCourier } from "@modules/shared/types"
import { handlePayStackPayment, loadPaystackScript } from "../utilities"
import { useSettingsStore } from "@modules/settings/store"
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import Chip from "@components/Chip.vue"
import { pluralize } from "@/utils/pluralize"

const router = useRouter()
const { format } = useFormatCurrency()

const storeDetails = computed(() => useSettingsStore().storeDetails)
const isTaxEnabled = computed(() => storeDetails.value?.tax_collection_enabled || false)
const VAT_RATE = computed(() => {
  const rate = storeDetails.value?.tax_rate
  return rate ? Number(rate) : 0.075
})

// ─── Product browsing ────────────────────────────────────────────────────────
const searchQuery = ref("")
const debouncedSearch = useDebouncedRef(searchQuery, 500)
const activeCategoryUid = ref<string | null>(null)

const { data: categoriesData } = useGetCategories()
const categories = computed(() => categoriesData.value?.data.results ?? [])

const { data, isPending, isFetchingNextPage, fetchNextPage, hasNextPage, refetch } =
  useGetProductCatalogsInfinite(20, debouncedSearch)

const scrollContainer = useTemplateRef<HTMLElement>("scrollContainer")
useInfiniteScroll(
  scrollContainer,
  async () => {
    if (toValue(hasNextPage)) await fetchNextPage()
  },
  { distance: 200 },
)

const allProducts = computed(() => {
  if (!data.value?.pages) return []
  return data.value.pages.flatMap((page) => page.results)
})

const products = computed(() => {
  if (!activeCategoryUid.value) return allProducts.value
  return allProducts.value.filter((p) => p.category === activeCategoryUid.value)
})

const getAvailableStock = (product: IProductCatalogue) => {
  if (!product.variants || product.variants.length === 0) return 0
  return product.variants.reduce((total, v) => {
    const sellable = Number(v.sellable_stock ?? v.available_stock ?? 0)
    const taken = Number((v as { popup_quantity_taken?: number }).popup_quantity_taken ?? 0)
    return total + Math.max(0, sellable - taken)
  }, 0)
}

const hasMultipleVariants = (product: IProductCatalogue) => product.variants.length > 1

const showAddProduct = ref(false)
const handleProductCreated = async (uid: string) => {
  showAddProduct.value = false
  await refetch()
  const newProd = allProducts.value.find((p) => p.uid === uid)
  if (newProd && getAvailableStock(newProd) > 0 && !hasMultipleVariants(newProd)) {
    incrementItem(newProd, newProd.variants[0] ?? null)
  }
}

// ─── Order items ─────────────────────────────────────────────────────────────
interface VariantRef {
  uid: string
  name: string
  sku: string
  price: string
  sellable_stock: number
  original_price?: number
}

interface OrderItem {
  product: IProductCatalogue
  variant: VariantRef | null
  quantity: number
  unit_price: number
  notes?: string
}

const orderItems = ref<OrderItem[]>([])

const getItemQty = (productUid: string, variantUid: string | null) => {
  return (
    orderItems.value.find(
      (i) => i.product.uid === productUid && (i.variant?.uid ?? null) === variantUid,
    )?.quantity ?? 0
  )
}

const productTotalQty = (product: IProductCatalogue) =>
  orderItems.value.filter((i) => i.product.uid === product.uid).reduce((s, i) => s + i.quantity, 0)

const incrementItem = (product: IProductCatalogue, variant: VariantRef | null) => {
  const idx = orderItems.value.findIndex(
    (i) => i.product.uid === product.uid && (i.variant?.uid ?? null) === (variant?.uid ?? null),
  )
  if (idx > -1) {
    orderItems.value[idx].quantity++
  } else {
    orderItems.value.push({
      product,
      variant,
      quantity: 1,
      unit_price: parseFloat(variant?.price ?? "0"),
    })
  }
}

const decrementItem = (product: IProductCatalogue, variant: VariantRef | null) => {
  const idx = orderItems.value.findIndex(
    (i) => i.product.uid === product.uid && (i.variant?.uid ?? null) === (variant?.uid ?? null),
  )
  if (idx === -1) return
  if (orderItems.value[idx].quantity <= 1) {
    orderItems.value.splice(idx, 1)
  } else {
    orderItems.value[idx].quantity--
  }
}

// ─── Variant selection modal ──────────────────────────────────────────────────
const variantModalProduct = ref<IProductCatalogue | null>(null)
const openVariantModal = (product: IProductCatalogue) => {
  variantModalProduct.value = product
}
const closeVariantModal = () => {
  variantModalProduct.value = null
}

// ─── Customer ────────────────────────────────────────────────────────────────
const showCustomerDrawer = ref(false)
const selectedCustomer = ref<ICustomer | null>(null)

const customerName = computed(() => {
  if (!selectedCustomer.value) return null
  const { full_name, first_name, last_name } = selectedCustomer.value
  return full_name || `${first_name || ""} ${last_name || ""}`.trim() || null
})

// ─── Order details (shipping + payment) ──────────────────────────────────────
const showDetailsDrawer = ref(false)
const detailsTab = ref<"shipping" | "payment">("shipping")

const getInitialShippingInfo = () => ({
  fulfilment_method: "pickup" as "pickup" | "delivery",
  fulfilment_status: "unfulfilled" as "unfulfilled" | "fulfilled",
  delivery_address: "" as string | { label: string; value: string },
  delivery_type: "" as "standard" | "express",
  delivery_method: "" as "manual" | "shipbubble" | "custom",
  courier: "" as string | IShippingCourier,
  delivery_fee: 0,
  order_date: new Date().toISOString().split("T")[0],
  order_channel: ORDER_CHANNELS[0],
  has_shipping: true,
  delivery_payment_option: DELIVERY_PAYMENT_OPTION[0].value,
  shipping_courier: null as IShippingCourier | null,
  shipping_rate_token: "",
  customer_email: "",
  customer_phone: "",
  express_delivery_option: "",
  manual_delivery_option: "",
})

const shippingInfo = ref(getInitialShippingInfo())

const showAddAddressModal = ref(false)
const handleAddressSuccess = (address: { label: string; value: string }) => {
  shippingInfo.value.delivery_address = address
  showAddAddressModal.value = false
}

const getInitialPaymentInfo = () => ({
  payment_status: "unpaid" as "unpaid" | "paid" | "partially_paid",
  payment_amount: 0,
  payment_source: undefined as { label: string; value: string } | undefined,
  coupon_code: null as string | null,
  discount_amount: 0,
})

const paymentInfo = ref(getInitialPaymentInfo())
const couponInput = ref("")

// ─── Totals ───────────────────────────────────────────────────────────────────
const itemsCount = computed(() => orderItems.value.reduce((s, i) => s + i.quantity, 0))

const productsTotal = computed(() =>
  orderItems.value.reduce((s, i) => s + i.quantity * i.unit_price, 0),
)

const vatAmount = computed(() => {
  if (!isTaxEnabled.value) return 0
  return Math.round(productsTotal.value * VAT_RATE.value * 100) / 100
})

const deliveryFee = computed(() =>
  shippingInfo.value.fulfilment_method === "delivery" &&
  shippingInfo.value.delivery_payment_option !== "free_shipping"
    ? Number(shippingInfo.value.delivery_fee)
    : 0,
)

const totalAmount = computed(
  () =>
    productsTotal.value +
    vatAmount.value +
    deliveryFee.value -
    Number(paymentInfo.value.discount_amount),
)

// ─── Create order ─────────────────────────────────────────────────────────────
const { mutate: createOrder, isPending: isCreating } = useCreateOrder()

const canCreate = computed(() => orderItems.value.length > 0)

const onCreateOrder = () => {
  if (!canCreate.value) return

  const { fulfilment_method, delivery_type, delivery_method } = shippingInfo.value
  const { uid, email, phone, full_name, first_name, last_name } = selectedCustomer.value || {}

  const deliveryFields: Record<string, unknown> = {}
  if (fulfilment_method === "delivery") {
    deliveryFields.delivery_payment_option = shippingInfo.value.delivery_payment_option
    deliveryFields.delivery_address =
      typeof shippingInfo.value.delivery_address === "string"
        ? shippingInfo.value.delivery_address
        : shippingInfo.value.delivery_address.value
    deliveryFields.delivery_method = delivery_method

    if (delivery_type === "express") {
      deliveryFields.delivery_method = "manual"
      deliveryFields.manual_delivery_option = shippingInfo.value.express_delivery_option
    } else if (delivery_type === "standard") {
      if (delivery_method === "manual") {
        deliveryFields.manual_delivery_option = shippingInfo.value.manual_delivery_option
      } else if (delivery_method === "shipbubble") {
        deliveryFields.rate = shippingInfo.value.shipping_rate_token
        deliveryFields.courier = shippingInfo.value.courier
        delete deliveryFields.delivery_address
      } else if (delivery_method === "custom") {
        deliveryFields.delivery_fee = shippingInfo.value.delivery_fee
        deliveryFields.courier = shippingInfo.value.courier
          ? {
              courier_id: shippingInfo.value.courier,
              courier_name: shippingInfo.value.courier,
              votes: 0,
              ratings: 0,
            }
          : ""
      }
    }

    if (shippingInfo.value.delivery_payment_option === "customer_pays_courier") {
      deliveryFields.delivery_method = "custom"
      deliveryFields.courier = {
        courier_id: "unknown-courier",
        courier_name: "Unknown Courier",
        votes: 0,
        ratings: 0,
      }
    }
  }

  const payload = {
    source: "internal",
    ...(uid && uid !== anonymousCustomer.uid
      ? {
          customer: uid,
          customer_name: full_name || `${first_name} ${last_name}`,
          customer_email: email || "",
          customer_phone: phone || "",
        }
      : { customer: "" }),
    total_amount: Number(totalAmount.value).toFixed(2),
    ...deliveryFields,
    fulfilment_method,
    coupon_code: paymentInfo.value.coupon_code || "",
    payment_status: paymentInfo.value.payment_status,
    payment_amount:
      paymentInfo.value.payment_status === "paid"
        ? Number(totalAmount.value).toFixed(2)
        : Number(paymentInfo.value.payment_amount).toFixed(2),
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
    fulfilment_status: shippingInfo.value.fulfilment_status,
    order_channel: shippingInfo.value.order_channel.value,
    order_date: shippingInfo.value.order_date,
  }

  const handler = {
    onSuccess: () => {
      toast.success("Order created successfully!")
      router.push("/orders")
    },
    onError: displayError,
  }

  if (delivery_method === "shipbubble") {
    const payData = {
      shipping_price: (Number(shippingInfo.value.delivery_fee || 0) * 100).toFixed(2),
      customer_name:
        selectedCustomer.value?.full_name ||
        `${selectedCustomer.value?.first_name || ""} ${selectedCustomer.value?.last_name || ""}`.trim() ||
        "Customer",
      customer_email: shippingInfo.value.customer_email || selectedCustomer.value?.email || "",
      shipping_address:
        typeof shippingInfo.value.delivery_address === "string"
          ? shippingInfo.value.delivery_address
          : (shippingInfo.value.delivery_address as { label: string; value: string }).label,
    }
    handlePayStackPayment(payData, (payResponse) => {
      createOrder(
        {
          ...payload,
          reference: payResponse.reference,
          delivery_fee: Number(shippingInfo.value.delivery_fee).toFixed(2),
        } as OrderPayload,
        handler,
      )
    })
  } else {
    createOrder(payload as OrderPayload, handler)
  }
}

watch(
  () => selectedCustomer.value,
  (customer) => {
    if (customer && customer.uid !== anonymousCustomer.uid) {
      if (customer.email) shippingInfo.value.customer_email = customer.email
      if (customer.phone) shippingInfo.value.customer_phone = customer.phone
    } else {
      shippingInfo.value.customer_email = ""
      shippingInfo.value.customer_phone = ""
    }
  },
  { immediate: true },
)

onMounted(() => {
  loadPaystackScript()
})
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-gray-50">
    <!-- ─── LEFT PANEL ─────────────────────────────────────────── -->
    <div class="flex min-w-0 flex-1 flex-col overflow-hidden border-r border-gray-200 bg-white">
      <!-- Header -->
      <div class="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
        <button class="hover:text-primary-600" @click="router.push('/orders')">
          <Icon name="arrow-left" size="20" />
        </button>
        <h1 class="text-lg font-semibold">Add Order</h1>
        <div class="flex-1" />
        <TextField
          v-model="searchQuery"
          left-icon="search-lg"
          placeholder="Search by name"
          size="sm"
          class="w-64"
        />
        <AppButton color="alt" size="sm" icon="filter-lines" />
        <AppButton icon="add" size="sm" @click="showAddProduct = true" />
      </div>

      <!-- Category filter pills -->
      <div class="scrollbar-hide flex gap-2 overflow-x-auto border-b border-gray-100 px-5 py-3">
        <Chip
          :color="activeCategoryUid === null ? 'primary' : 'alt'"
          label="All"
          radius="md"
          size="md"
          icon="grid"
          class="shrink-0!"
          @click="activeCategoryUid = null"
        />
        <Chip
          v-for="cat in categories"
          :key="cat.uid"
          :color="activeCategoryUid === cat.uid ? 'primary' : 'alt'"
          :label="cat.name"
          radius="md"
          size="md"
          icon="tag"
          class="shrink-0!"
          @click="activeCategoryUid = cat.uid"
        />
      </div>

      <!-- Product grid -->
      <div ref="scrollContainer" class="flex-1 overflow-y-auto p-5">
        <EmptyState v-if="isPending" title="" description="" :loading="true" class="mt-10" />
        <EmptyState
          v-else-if="products.length === 0"
          title="No products found"
          description="Try a different search or category."
        />
        <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          <div
            v-for="product in products"
            :key="product.uid"
            class="overflow-hidden rounded-xl border border-gray-200 bg-white p-1"
          >
            <!-- Image -->
            <div class="relative h-[180px] w-full overflow-hidden rounded-xl bg-gray-100">
              <img
                v-if="product.images?.[0]?.image"
                :src="product.images[0].image"
                :alt="product.name"
                class="size-full object-cover"
              />
              <div v-else class="flex size-full items-center justify-center">
                <Icon name="box-filled" size="60" />
              </div>
              <!-- Category chip -->
              <Chip
                v-if="product.category_name"
                color="purple"
                :label="product.category_name"
                class="absolute top-2 left-2"
                radius="md"
              />
            </div>

            <!-- Info + controls -->
            <div class="px-1 py-3">
              <div class="mb-2 flex items-center justify-between">
                <p class="truncate text-xs font-medium">{{ product.name }}</p>
                <p class="text-sm font-semibold">
                  {{ format(parseFloat(product.variants[0]?.price ?? "0")) }}
                </p>
              </div>

              <!-- Out of stock -->
              <Chip
                v-if="getAvailableStock(product) === 0"
                color="error"
                label="Out of stock"
                radius="md"
              />

              <!-- Multi-variant: See option -->
              <button
                v-else-if="hasMultipleVariants(product)"
                class="border-primary-400 text-primary-600 hover:bg-primary-50 w-full rounded-lg border py-1.5 text-xs font-medium"
                @click="openVariantModal(product)"
              >
                {{
                  productTotalQty(product) > 0
                    ? `${productTotalQty(product)} added · Edit`
                    : "See option"
                }}
              </button>

              <!-- Single variant: qty controls -->
              <div v-else class="flex items-center justify-between gap-2">
                <button
                  class="flex size-7 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                  :disabled="getItemQty(product.uid, product.variants[0]?.uid ?? null) === 0"
                  @click="decrementItem(product, product.variants[0] ?? null)"
                >
                  <Icon name="minus" size="14" />
                </button>
                <span class="min-w-[1.5rem] text-center text-sm font-semibold text-gray-800">
                  {{ getItemQty(product.uid, product.variants[0]?.uid ?? null) }}
                </span>
                <button
                  class="flex size-7 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                  @click="incrementItem(product, product.variants[0] ?? null)"
                >
                  <Icon name="add" size="14" />
                </button>
              </div>
            </div>
          </div>

          <!-- Load more indicator -->
          <div
            v-if="isFetchingNextPage"
            class="col-span-full py-4 text-center text-sm text-gray-400"
          >
            Loading more...
          </div>
        </div>
      </div>
    </div>

    <!-- ─── RIGHT PANEL ────────────────────────────────────────── -->
    <div class="flex w-80 shrink-0 flex-col bg-white xl:w-96">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <h2 class="font-semibold text-gray-900">Order Summary</h2>
        <Chip radius="md" color="alt" :label="`${itemsCount} ${pluralize('item', itemsCount)}`" />
      </div>

      <div class="flex flex-1 flex-col overflow-y-auto px-5 py-4">
        <!-- Items list -->
        <div v-if="orderItems.length > 0" class="mb-4 space-y-3">
          <div
            v-for="item in orderItems"
            :key="`${item.product.uid}-${item.variant?.uid}`"
            class="flex items-center gap-3"
          >
            <div class="size-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
              <img
                v-if="item.product.images?.[0]?.image"
                :src="item.product.images[0].image"
                :alt="item.product.name"
                class="size-full object-cover"
              />
              <div v-else class="flex size-full items-center justify-center">
                <Icon name="image-01" size="14" class="text-gray-400" />
              </div>
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-xs font-medium text-gray-800">{{ item.product.name }}</p>
              <p
                v-if="item.variant && hasMultipleVariants(item.product)"
                class="text-xs text-gray-400"
              >
                {{ item.variant.name }}
              </p>
              <p class="text-xs text-gray-500">× {{ item.quantity }}</p>
            </div>
            <p class="shrink-0 text-xs font-semibold text-gray-800">
              {{ format(item.unit_price * item.quantity) }}
            </p>
          </div>
        </div>

        <!-- Empty state -->
        <div
          v-else
          class="mb-4 flex flex-col items-center justify-center rounded-xl bg-gray-50 py-16 text-center"
        >
          <Icon name="bag-2" size="48" class="mb-2" />
          <p class="text-core-800 text-sm font-medium">No Products Added</p>
          <p class="text-core-500 text-xs">Add at least one to create an order</p>
        </div>

        <!-- Add Customer card -->
        <button
          class="mb-3 flex w-full items-center gap-3 rounded-xl border border-gray-100 bg-orange-50 px-4 py-3 text-left transition-colors hover:bg-orange-100"
          @click="showCustomerDrawer = true"
        >
          <div class="flex size-9 shrink-0 items-center justify-center rounded-full bg-orange-100">
            <Icon name="personalcard" size="18" class="text-orange-600" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-gray-800">
              {{ customerName ?? "Add Customer" }}
            </p>
            <p class="text-xs text-gray-500">
              {{
                customerName
                  ? selectedCustomer?.email || "Customer selected"
                  : "Who owns this order?"
              }}
            </p>
          </div>
          <Icon name="chevron-right" size="16" class="shrink-0 text-gray-400" />
        </button>

        <!-- Add Order Details card -->
        <button
          class="mb-5 flex w-full items-center gap-3 rounded-xl border border-gray-100 bg-orange-50 px-4 py-3 text-left transition-colors hover:bg-orange-100"
          @click="showDetailsDrawer = true"
        >
          <div class="flex size-9 shrink-0 items-center justify-center rounded-full bg-orange-100">
            <Icon name="truck-fast" size="18" class="text-orange-600" />
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-800">Add Order Details</p>
            <p class="text-xs text-gray-500">How was this order shipped and fulfilled</p>
          </div>
          <Icon name="chevron-right" size="16" class="shrink-0 text-gray-400" />
        </button>

        <!-- Coupon code -->
        <div class="mb-5 flex gap-2">
          <TextField
            v-model="couponInput"
            placeholder="Enter Coupon Code"
            size="sm"
            class="flex-1"
          />
          <AppButton
            label="Apply Code"
            size="sm"
            :disabled="!couponInput.trim()"
            @click="paymentInfo.coupon_code = couponInput.trim() || null"
          />
        </div>

        <!-- Totals -->
        <div class="space-y-2.5 border-t border-dashed border-gray-200 pt-4 text-sm text-gray-600">
          <div class="flex justify-between">
            <span>Subtotal</span>
            <span>{{ orderItems.length ? format(productsTotal) : "-" }}</span>
          </div>
          <div class="flex justify-between">
            <span>VAT ({{ (VAT_RATE * 100).toFixed(1) }}%)</span>
            <span>{{ isTaxEnabled && orderItems.length ? format(vatAmount) : "-" }}</span>
          </div>
          <div class="flex justify-between">
            <span>Shipping</span>
            <span>
              {{
                shippingInfo.fulfilment_method === "delivery" && orderItems.length
                  ? shippingInfo.delivery_payment_option === "free_shipping"
                    ? "Free"
                    : format(deliveryFee)
                  : "-"
              }}
            </span>
          </div>
          <div v-if="paymentInfo.discount_amount > 0" class="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-{{ format(paymentInfo.discount_amount) }}</span>
          </div>
          <div
            class="flex justify-between border-t border-gray-200 pt-2.5 font-semibold text-gray-900"
          >
            <span>Total</span>
            <span>{{ orderItems.length ? format(totalAmount) : "-" }}</span>
          </div>
        </div>
      </div>

      <!-- Create Order button -->
      <div class="border-t border-gray-100 p-5">
        <AppButton
          label="Create Order"
          class="w-full"
          :disabled="!canCreate"
          :loading="isCreating"
          @click="onCreateOrder"
        />
      </div>
    </div>
  </div>

  <!-- ─── Variant selection modal ──────────────────────────────────────────── -->
  <Drawer
    :open="!!variantModalProduct"
    :title="variantModalProduct?.name ?? ''"
    max-width="sm"
    @close="closeVariantModal"
  >
    <div v-if="variantModalProduct" class="space-y-3 p-4">
      <div
        v-for="variant in variantModalProduct.variants"
        :key="variant.uid"
        class="flex items-center gap-3 rounded-xl border border-gray-200 p-3"
      >
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-gray-800">{{ variant.name }}</p>
          <p class="text-xs text-gray-500">{{ format(parseFloat(variant.price)) }}</p>
          <p class="text-xs text-gray-400">{{ variant.sellable_stock }} in stock</p>
        </div>
        <div class="flex items-center gap-2">
          <button
            class="flex size-7 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            :disabled="getItemQty(variantModalProduct.uid, variant.uid) === 0"
            @click="decrementItem(variantModalProduct, variant)"
          >
            <Icon name="minus" size="14" />
          </button>
          <span class="min-w-[1.5rem] text-center text-sm font-semibold">
            {{ getItemQty(variantModalProduct.uid, variant.uid) }}
          </span>
          <button
            class="flex size-7 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            :disabled="getItemQty(variantModalProduct.uid, variant.uid) >= variant.sellable_stock"
            @click="incrementItem(variantModalProduct, variant)"
          >
            <Icon name="add" size="14" />
          </button>
        </div>
      </div>
      <AppButton label="Done" class="mt-4 w-full" @click="closeVariantModal" />
    </div>
  </Drawer>

  <!-- ─── Customer drawer ──────────────────────────────────────────────────── -->
  <Drawer
    :open="showCustomerDrawer"
    title="Select Customer"
    max-width="lg"
    @close="showCustomerDrawer = false"
  >
    <OrderSelectCustomer
      :selected-customer="selectedCustomer"
      @update:selected-customer="selectedCustomer = $event"
      @next="showCustomerDrawer = false"
      @prev="showCustomerDrawer = false"
    />
  </Drawer>

  <!-- ─── Order details drawer ─────────────────────────────────────────────── -->
  <Drawer
    :open="showDetailsDrawer"
    title="Order Details"
    max-width="xl"
    @close="showDetailsDrawer = false"
  >
    <div class="flex gap-4 border-b border-gray-200 px-6 py-2">
      <button
        :class="[
          'pb-2 text-sm font-medium transition-colors',
          detailsTab === 'shipping'
            ? 'text-primary-600 border-primary-500 border-b-2'
            : 'text-gray-500 hover:text-gray-700',
        ]"
        @click="detailsTab = 'shipping'"
      >
        Shipping
      </button>
      <button
        :class="[
          'pb-2 text-sm font-medium transition-colors',
          detailsTab === 'payment'
            ? 'text-primary-600 border-primary-500 border-b-2'
            : 'text-gray-500 hover:text-gray-700',
        ]"
        @click="detailsTab = 'payment'"
      >
        Payment
      </button>
    </div>
    <OrderShippingInfoForm
      v-if="detailsTab === 'shipping'"
      v-model:shipping-info="shippingInfo"
      :customer="selectedCustomer"
      :orderItems="
        orderItems.map((i) => ({
          ...i,
          variant: i.variant ? { ...i.variant, stock: i.variant.sellable_stock } : null,
        }))
      "
      @next="detailsTab = 'payment'"
      @prev="showDetailsDrawer = false"
      @openAddAddress="showAddAddressModal = true"
    />
    <OrderPaymentForm
      v-else
      v-model:paymentInfo="paymentInfo"
      :productsTotal="productsTotal"
      :deliveryFee="deliveryFee"
      :vatAmount="vatAmount"
      :totalAmount="totalAmount"
      :itemsCount="itemsCount"
      :is-free-shipping="shippingInfo.delivery_payment_option === 'free_shipping'"
      @next="showDetailsDrawer = false"
      @prev="detailsTab = 'shipping'"
    />
  </Drawer>

  <!-- ─── Add address modal ─────────────────────────────────────────────────── -->
  <OrderAddCustomerAddress
    :open="showAddAddressModal"
    :customer-uid="selectedCustomer?.uid || ''"
    :customer-name="
      selectedCustomer?.full_name ||
      (selectedCustomer?.first_name || '') + ' ' + (selectedCustomer?.last_name || '') ||
      'Customer'
    "
    @close="showAddAddressModal = false"
    @success="handleAddressSuccess"
  />

  <!-- ─── Add product modal ─────────────────────────────────────────────────── -->
  <AddNewProductModal
    :open="showAddProduct"
    @close="showAddProduct = false"
    @created="handleProductCreated"
  />
</template>
