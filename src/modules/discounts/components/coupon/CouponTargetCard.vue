<template>
  <!-- mobile: grey card, header on grey + a white list panel; desktop: white card + border -->
  <div class="rounded-2xl bg-gray-100 p-2.5 md:border md:border-gray-200 md:bg-white md:p-0">
    <!-- Header (on grey on mobile, on white on desktop) -->
    <div
      class="flex items-center gap-2.5 px-1.5 py-2 md:border-b md:border-gray-100 md:px-5 md:py-3.5"
    >
      <span
        class="bg-primary-50 text-primary-600 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
      >
        <Icon name="tag-2" size="18" />
      </span>
      <h3 class="m-0 text-sm font-semibold text-gray-800 md:text-base">Target Products</h3>

      <!-- All-products scope -->
      <span v-if="isAllProducts" class="ml-1 text-xs font-medium text-gray-500">All Products</span>

      <!-- Category count -->
      <span v-else-if="isCategoryScope" class="ml-1 text-xs font-medium text-gray-500">
        {{ coupon.categories.length }}
        {{ coupon.categories.length === 1 ? "Category" : "Categories" }}
      </span>

      <!-- Category filter (category scope only) -->
      <div v-if="isCategoryScope" class="ml-auto">
        <DropdownMenu :items="categoryFilterItems" placement="bottom-end" menu-width="auto">
          <template #trigger>
            <button
              type="button"
              class="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              <Icon name="filter-lines" size="14" class="text-gray-500" />
              <span class="max-w-28 truncate">{{ activeCategoryLabel }}</span>
              <Icon name="chevron-down" size="14" class="text-gray-400" />
            </button>
          </template>
        </DropdownMenu>
      </div>
    </div>

    <!-- White list panel (mobile); grey nested panel (desktop) -->
    <div class="rounded-xl bg-white p-1.5 md:m-3 md:bg-gray-50 md:p-2">
      <!-- Loading -->
      <div v-if="loading" class="space-y-3 px-3 py-3">
        <div v-for="n in 4" :key="n" class="flex items-center gap-3">
          <div class="h-12 w-12 animate-pulse rounded-lg bg-gray-100" />
          <div class="h-3 flex-1 animate-pulse rounded bg-gray-100" />
          <div class="h-3 w-16 animate-pulse rounded bg-gray-100" />
        </div>
      </div>

      <!-- Empty -->
      <p v-else-if="rows.length === 0" class="py-6 text-center text-sm text-gray-500">
        No target products to display.
      </p>

      <!-- Rows -->
      <ul v-else class="divide-y divide-gray-200">
        <li v-for="row in rows" :key="row.uid" class="flex items-center gap-3 rounded-lg px-3 py-3">
          <img
            :src="row.image ?? emptyState"
            :alt="row.name"
            class="h-12 w-12 shrink-0 rounded-lg bg-white object-cover"
            :class="{ 'object-contain p-1': !row.image }"
          />
          <span class="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">
            {{ row.name }}
          </span>

          <!-- Prices -->
          <div class="flex shrink-0 items-baseline gap-2">
            <template v-if="row.original != null">
              <span class="text-xs text-gray-400 line-through">{{ format(row.original) }}</span>
              <span class="text-sm font-semibold text-gray-800">{{ format(row.discounted) }}</span>
            </template>
            <span v-else class="text-sm font-semibold text-gray-800">--</span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import Icon from "@components/Icon.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import emptyState from "@/assets/images/empty-state.png"
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import { useGetProducts, useGetCategories } from "@modules/inventory/api"
import type { TProduct, IProductCategory } from "@modules/inventory/types"
import type { TCoupon } from "../../types"

const props = defineProps<{ coupon: TCoupon }>()

const { format } = useFormatCurrency()

const isAllProducts = computed(() => props.coupon.target_type === "all_products")
const isCategoryScope = computed(
  () => !isAllProducts.value && (props.coupon.categories?.length ?? 0) > 0,
)

// ---------------------------------------------------------------------------
// Price helpers
// ---------------------------------------------------------------------------
/** Parse a price that may be a comma-formatted string, number, or null. */
function parsePrice(v: string | number | null | undefined): number | null {
  if (v == null) return null
  const n = Number(String(v).replace(/[^0-9.]/g, ""))
  return Number.isFinite(n) && n > 0 ? n : null
}

/** Apply the coupon's discount to an original price, clamped to >= 0. */
function discountedPrice(original: number): number {
  const c = props.coupon
  if (c.discount_type === "flat") {
    const flat = parsePrice(c.flat_discount) ?? 0
    return Math.max(0, original - flat)
  }
  const pct = Number(c.percentage_discount ?? 0)
  const raw = original * (pct / 100)
  if (c.discount_type === "combined") {
    const cap = parsePrice(c.flat_discount)
    const off = cap != null ? Math.min(raw, cap) : raw
    return Math.max(0, original - off)
  }
  return Math.max(0, original - raw) // percentage
}

// ---------------------------------------------------------------------------
// Category filter (category scope)
// ---------------------------------------------------------------------------
const activeCategory = ref<string | null>(null)

const { data: categoriesData } = useGetCategories()
const allCategories = computed<IProductCategory[]>(() => categoriesData.value?.data?.results ?? [])

/** Categories actually targeted by this coupon. */
const targetCategories = computed<IProductCategory[]>(() => {
  const uids = new Set(props.coupon.categories ?? [])
  return allCategories.value.filter((c) => uids.has(c.uid))
})

const activeCategoryLabel = computed(() => {
  if (!activeCategory.value) return "All Products"
  return targetCategories.value.find((c) => c.uid === activeCategory.value)?.name ?? "All Products"
})

const categoryFilterItems = computed(() => [
  { id: "all", label: "All Products", action: () => (activeCategory.value = null) },
  ...targetCategories.value.map((c) => ({
    id: c.uid,
    label: c.name,
    action: () => (activeCategory.value = c.uid),
  })),
])

// ---------------------------------------------------------------------------
// Products — best-effort hydration.
// The coupon detail endpoint only returns product/category uids, so we fetch a
// page of products and resolve names/prices/thumbnails client-side. For the
// products scope we match against `applicable_products`; for the category scope
// we list products that belong to the targeted categories (optionally filtered).
// ---------------------------------------------------------------------------
const productParams = computed<Record<string, string | number>>(() => {
  const p: Record<string, string | number> = { limit: 100 }
  if (isCategoryScope.value && activeCategory.value) p.category = activeCategory.value
  return p
})

const { data: productsData, isFetching: loading } = useGetProducts(productParams)
const products = computed<TProduct[]>(() => productsData.value?.data?.results ?? [])

interface TargetRow {
  uid: string
  name: string
  image: string | null
  /** Parsed original price, or null when missing/invalid (renders "--"). */
  original: number | null
  /** Discounted price; only meaningful when `original` is non-null. */
  discounted: number
}

function toRow(p: TProduct): TargetRow {
  const original = parsePrice(p.price)
  return {
    uid: p.uid,
    name: p.name,
    image: p.primary_image?.image ?? null,
    original,
    discounted: original != null ? discountedPrice(original) : 0,
  }
}

const rows = computed<TargetRow[]>(() => {
  // All-products scope: the coupon applies to the entire catalogue, so list the
  // fetched product page directly (no uid matching needed).
  if (isAllProducts.value) return products.value.map(toRow)

  if (isCategoryScope.value) {
    const catUids = new Set(props.coupon.categories ?? [])
    return products.value
      .filter((p) => {
        if (activeCategory.value) return p.category === activeCategory.value
        return p.category != null && catUids.has(p.category)
      })
      .map(toRow)
  }

  // Products scope: resolve the targeted uids, preserving order; render a
  // placeholder row for any uid not present in the fetched page.
  const byUid = new Map(products.value.map((p) => [p.uid, p]))
  return (props.coupon.applicable_products ?? []).map((uid) => {
    const p = byUid.get(uid)
    return p ? toRow(p) : { uid, name: "Product", image: null, original: null, discounted: 0 }
  })
})
</script>
