<template>
  <!-- mobile: grey card, header on grey + a white list panel; desktop: white card + border -->
  <div
    class="flex h-full flex-col rounded-2xl bg-gray-100 p-2.5 md:border md:border-gray-200 md:bg-white md:p-0"
  >
    <!-- Header -->
    <div
      class="flex items-center gap-2.5 px-1.5 py-2 md:border-b md:border-gray-100 md:px-5 md:py-3.5"
    >
      <span
        class="bg-primary-50 text-primary-600 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
      >
        <Icon name="tag-2" size="18" />
      </span>
      <h3 class="m-0 text-sm font-semibold text-gray-800 md:text-base">{{ headerTitle }}</h3>
      <span v-if="countLabel" class="ml-1 text-xs font-medium text-gray-500">{{ countLabel }}</span>
    </div>

    <!-- White list panel (mobile); grey nested panel (desktop). flex-1 so it
         fills the card height (the grid stretches both columns equal). -->
    <div class="flex-1 rounded-xl bg-white p-1.5 md:m-3 md:bg-gray-50 md:p-2">
      <!-- Storefront: whole-store discount, nothing to list -->
      <div
        v-if="discount.target_type === 'storefront'"
        class="flex h-full flex-col items-center justify-center gap-2 px-3 py-8 text-center"
      >
        <span
          class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600"
        >
          <Icon name="shop" size="20" />
        </span>
        <p class="text-sm font-medium text-gray-700">Applies to your entire storefront</p>
        <p class="text-xs text-gray-500">Every product in your store gets this discount.</p>
      </div>

      <!-- Products (variants) — products scope, and category scope once the
           backend has resolved the targeted categories into variants. -->
      <ul v-else-if="variants.length" class="divide-y divide-gray-200">
        <li v-for="v in variants" :key="v.uid" class="flex items-center gap-3 rounded-lg px-3 py-3">
          <img
            :src="variantImage(v)"
            :alt="v.product_name"
            class="h-12 w-12 shrink-0 rounded-lg bg-white object-cover"
            :class="{ 'object-contain p-1': !v.image && !v.product_image }"
          />
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-gray-800">{{ v.product_name }}</p>
            <p v-if="v.name" class="truncate text-xs text-gray-500">{{ v.name }}</p>
          </div>

          <!-- Original price (struck-through) + discounted price -->
          <div class="flex shrink-0 items-baseline gap-2">
            <span class="text-xs text-gray-400 line-through">{{ format(originalPrice(v)) }}</span>
            <span class="text-sm font-semibold text-gray-800">{{
              format(discountedPrice(v))
            }}</span>
          </div>
        </li>
      </ul>

      <!-- Category fallback — category scope with no embedded variants. -->
      <ul v-else-if="categories.length" class="divide-y divide-gray-200">
        <li
          v-for="c in categories"
          :key="c.uid"
          class="flex items-center gap-3 rounded-lg px-3 py-3"
        >
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600"
          >
            <Icon name="tag-2" size="18" />
          </span>
          <p class="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">{{ c.name }}</p>
          <span class="text-primary-600 shrink-0 text-xs font-medium">
            {{ c.product_count }} products
          </span>
        </li>
      </ul>

      <p v-else class="py-6 text-center text-sm text-gray-500">No target products to display.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import Icon from "@components/Icon.vue"
import emptyState from "@/assets/images/empty-state.png"
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import type { TDiscountDetail, TDiscountVariant } from "../../types"

// Variants + categories are embedded in DiscountDetail — no client-side hydration.
// `discount` also drives the discounted price when a variant's promo_price hasn't
// been written yet (e.g. a scheduled discount).
const props = defineProps<{ discount: TDiscountDetail }>()

const { format } = useFormatCurrency()

const variants = computed<TDiscountVariant[]>(() => props.discount.variants ?? [])
const categories = computed(() => props.discount.categories ?? [])

// Header stays "Target Products" for products + categories (matches the design);
// only storefront swaps it out.
const headerTitle = computed(() =>
  props.discount.target_type === "storefront" ? "Storefront" : "Target Products",
)

const countLabel = computed(() => {
  if (props.discount.target_type === "storefront") return ""
  if (props.discount.target_type === "categories") {
    const n = categories.value.length
    return `${n} ${n === 1 ? "Category" : "Categories"}`
  }
  const n = variants.value.length
  return `${n} ${n === 1 ? "variant" : "variants"}`
})

function variantImage(v: TDiscountVariant): string {
  return v.image || v.product_image || emptyState
}

function toNumber(v: string | null | undefined): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function originalPrice(v: TDiscountVariant): number {
  return toNumber(v.price)
}

function discountedPrice(v: TDiscountVariant): number {
  // Prefer the backend-written promo_price when present.
  if (v.promo_price != null && v.promo_price !== "") {
    const promo = toNumber(v.promo_price)
    if (promo > 0) return promo
  }
  // Otherwise derive it from the discount.
  const original = originalPrice(v)
  const d = props.discount
  if (d.discount_type === "fixed_amount") {
    return Math.max(0, original - toNumber(d.value))
  }
  let off = original * (toNumber(d.value) / 100)
  if (d.max_discount_amount) off = Math.min(off, toNumber(d.max_discount_amount))
  return Math.max(0, original - off)
}
</script>
