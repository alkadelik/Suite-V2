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
      <span v-if="countLabel" class="ml-1 text-xs font-medium text-gray-500">{{ countLabel }}</span>
    </div>

    <!-- White list panel (mobile); grey nested panel (desktop) -->
    <div class="rounded-xl bg-white p-1.5 md:m-3 md:bg-gray-50 md:p-2">
      <!-- Variant rows — embedded in the detail response for every scope -->
      <ul v-if="rows.length" class="divide-y divide-gray-200">
        <li v-for="row in rows" :key="row.uid" class="flex items-center gap-3 rounded-lg px-3 py-3">
          <img
            :src="row.image ?? emptyState"
            :alt="row.name"
            class="h-12 w-12 shrink-0 rounded-lg bg-white object-cover"
            :class="{ 'object-contain p-1': !row.image }"
          />
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-gray-800">{{ row.name }}</p>
            <p v-if="row.sub" class="truncate text-xs text-gray-500">{{ row.sub }}</p>
          </div>

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

      <!-- Category fallback — category scope with no embedded variants -->
      <ul v-else-if="categories.length" class="divide-y divide-gray-200">
        <li
          v-for="category in categories"
          :key="category.uid"
          class="flex items-center gap-3 rounded-lg px-3 py-3"
        >
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600"
          >
            <Icon name="tag-2" size="18" />
          </span>
          <p class="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">
            {{ category.name }}
          </p>
        </li>
      </ul>

      <!-- Empty -->
      <p v-else class="py-6 text-center text-sm text-gray-500">No target products to display.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import Icon from "@components/Icon.vue"
import emptyState from "@/assets/images/empty-state.png"
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import type { TCouponDetail, TCouponVariantSummary } from "../../types"

// Variants + category summaries are embedded in the detail response for every
// scope (products, categories, all_products), so the card renders synchronously
// — no client-side product/category hydration and no loading state.
const props = defineProps<{ coupon: TCouponDetail }>()

const { format } = useFormatCurrency()

const variants = computed<TCouponVariantSummary[]>(() => props.coupon.variants ?? [])
const categories = computed(() => props.coupon.categories ?? [])

const countLabel = computed(() => {
  if (props.coupon.target_type === "all_products") return "All Products"
  if (props.coupon.target_type === "categories" || categories.value.length > 0) {
    const n = categories.value.length
    return `${n} ${n === 1 ? "Category" : "Categories"}`
  }
  const n = variants.value.length
  return `${n} ${n === 1 ? "Variant" : "Variants"}`
})

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

interface TargetRow {
  uid: string
  name: string
  /** Secondary line (variant name). */
  sub?: string
  image: string | null
  /** Parsed original price, or null when missing/invalid (renders "--"). */
  original: number | null
  /** Discounted price; only meaningful when `original` is non-null. */
  discounted: number
}

const rows = computed<TargetRow[]>(() =>
  variants.value.map((v) => {
    const original = parsePrice(v.price)
    return {
      uid: v.uid,
      name: v.product_name,
      sub: v.name !== v.product_name ? v.name : undefined,
      image: v.image || null,
      original,
      discounted: original != null ? discountedPrice(original) : 0,
    }
  }),
)
</script>
