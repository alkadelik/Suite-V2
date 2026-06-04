<template>
  <div class="space-y-4">
    <!-- Discount Applies to -->
    <SelectField
      :model-value="appliesToOption"
      :options="APPLIES_TO_OPTIONS"
      label="Discount Applies to"
      @update:model-value="onModeChange"
    />

    <!-- ALL -->
    <p v-if="model.mode === 'all'" class="text-core-500 text-sm">
      This coupon applies to all products.
    </p>

    <!-- PRODUCTS -->
    <div v-else-if="model.mode === 'products'" class="space-y-3">
      <div ref="productDropdownRef" class="relative">
        <label class="text-core-800 mb-1.5 block text-sm font-medium">Select/Search Products</label>

        <!-- Field -->
        <button
          type="button"
          class="border-core-50 bg-core-25 hover:border-primary-300 flex min-h-[44px] w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition-colors"
          @click="productOpen = !productOpen"
        >
          <span
            :class="[
              'truncate text-sm',
              model.productUids.length ? 'text-core-800' : 'text-core-400',
            ]"
          >
            {{
              model.productUids.length
                ? `${model.productUids.length} product(s) selected`
                : "Select at least one"
            }}
          </span>
          <Icon name="arrow-down-double" class="text-core-400 h-4 w-4 shrink-0" />
        </button>

        <!-- Dropdown panel -->
        <div
          v-if="productOpen"
          class="border-core-100 absolute z-50 mt-1 w-full overflow-hidden rounded-xl border bg-white shadow-lg"
        >
          <div class="border-core-100 border-b p-2">
            <TextField
              :model-value="productSearch"
              left-icon="search-lg"
              placeholder="e.g Search by product name"
              size="sm"
              @update:model-value="(v: string) => (productSearch = v)"
            />
          </div>

          <div class="max-h-72 overflow-auto">
            <div v-if="productsLoading" class="text-core-400 py-4 text-center text-sm">
              Loading products...
            </div>
            <div v-else-if="products.length === 0" class="text-core-400 py-4 text-center text-sm">
              No products found
            </div>
            <ul v-else class="divide-core-50 divide-y">
              <li
                v-for="product in products"
                :key="product.uid"
                class="hover:bg-core-25 flex cursor-pointer items-center gap-3 px-3 py-2"
                @click="toggleProduct(product)"
              >
                <Checkbox
                  :model-value="isProductSelected(product.uid)"
                  dense
                  @update:model-value="() => toggleProduct(product)"
                />
                <div
                  class="bg-core-50 flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg"
                >
                  <img
                    v-if="primaryImage(product)"
                    :src="primaryImage(product)!"
                    :alt="product.name"
                    class="h-full w-full object-cover"
                  />
                  <Icon v-else name="box" class="text-core-400 h-4 w-4" />
                </div>
                <span class="text-core-800 min-w-0 flex-1 truncate text-sm font-medium">
                  {{ product.name }}
                </span>
                <span class="text-core-800 shrink-0 text-sm font-medium">
                  {{ priceLabel(product) }}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Selected summary -->
      <template v-if="model.productUids.length">
        <div class="flex items-center justify-between">
          <span class="text-primary-700 text-sm font-semibold">
            {{ model.productUids.length }} Selected
          </span>
          <button
            type="button"
            class="text-core-500 hover:text-core-700 text-sm font-medium"
            @click="unselectAllProducts"
          >
            Unselect All
          </button>
        </div>

        <ul class="space-y-2">
          <li
            v-for="product in selectedProducts"
            :key="product.uid"
            class="rounded-xl border border-gray-100 bg-white p-3"
          >
            <div class="flex items-center gap-3">
              <Checkbox
                :model-value="true"
                dense
                @update:model-value="() => toggleProduct(product)"
              />

              <!-- Bigger image, nothing under it -->
              <div
                class="bg-core-50 flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg"
              >
                <img
                  v-if="primaryImage(product)"
                  :src="primaryImage(product)!"
                  :alt="product.name"
                  class="h-full w-full rounded-lg object-cover"
                />
                <Icon v-else name="box" class="text-core-400 h-6 w-6" />
              </div>

              <!-- Name + variants indicator -->
              <div class="min-w-0 flex-1">
                <h4 class="text-core-800 line-clamp-1 text-sm font-medium">{{ product.name }}</h4>
                <span class="text-primary-600 mt-0.5 inline-flex items-center gap-1 text-xs">
                  <Icon name="shapes" class="h-3.5 w-3.5" />
                  {{ variantSummary(product) }}
                </span>
              </div>

              <!-- Price + Modify Selection -->
              <div class="flex shrink-0 flex-col items-end gap-1">
                <span class="text-core-800 text-sm font-medium">{{ priceLabel(product) }}</span>
                <button
                  type="button"
                  class="text-primary-600 hover:text-primary-700 cursor-pointer text-xs font-medium underline"
                  @click="toggleExpanded(product.uid)"
                >
                  Modify Selection
                </button>
              </div>
            </div>

            <ProductVariantPicker
              v-if="expandedProduct === product.uid"
              :variants="product.variants ?? []"
              :model-value="model.variantSelections[product.uid] ?? []"
              @update:model-value="(v: string[]) => setVariants(product.uid, v)"
            />
          </li>
        </ul>
      </template>
    </div>

    <!-- CATEGORIES -->
    <div v-else class="space-y-3">
      <div ref="categoryDropdownRef" class="relative">
        <label class="text-core-800 mb-1.5 block text-sm font-medium"
          >Select/Search Categories</label
        >

        <button
          type="button"
          class="border-core-50 bg-core-25 hover:border-primary-300 flex min-h-[44px] w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition-colors"
          @click="categoryOpen = !categoryOpen"
        >
          <span
            :class="[
              'truncate text-sm',
              model.categoryUids.length ? 'text-core-800' : 'text-core-400',
            ]"
          >
            {{
              model.categoryUids.length
                ? `${model.categoryUids.length} categor${model.categoryUids.length === 1 ? "y" : "ies"} selected`
                : "Select at least one"
            }}
          </span>
          <Icon name="arrow-down-double" class="text-core-400 h-4 w-4 shrink-0" />
        </button>

        <div
          v-if="categoryOpen"
          class="border-core-100 absolute z-50 mt-1 w-full overflow-hidden rounded-xl border bg-white shadow-lg"
        >
          <div class="border-core-100 border-b p-2">
            <TextField
              :model-value="categorySearch"
              left-icon="search-lg"
              placeholder="e.g Search by category name"
              size="sm"
              @update:model-value="(v: string) => (categorySearch = v)"
            />
          </div>

          <div class="max-h-72 overflow-auto">
            <div v-if="categoriesLoading" class="text-core-400 py-4 text-center text-sm">
              Loading categories...
            </div>
            <div
              v-else-if="filteredCategories.length === 0"
              class="text-core-400 py-4 text-center text-sm"
            >
              No categories found
            </div>
            <ul v-else class="divide-core-50 divide-y">
              <li
                v-for="category in filteredCategories"
                :key="category.uid"
                class="hover:bg-core-25 flex cursor-pointer items-center gap-3 px-3 py-2"
                @click="toggleCategory(category.uid)"
              >
                <Checkbox
                  :model-value="isCategorySelected(category.uid)"
                  dense
                  @update:model-value="() => toggleCategory(category.uid)"
                />
                <span
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500"
                >
                  <Icon name="tag-2" class="h-4 w-4" />
                </span>
                <Chip :label="category.name" color="purple" size="sm" />
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Selected summary -->
      <template v-if="model.categoryUids.length">
        <div class="flex items-center justify-between">
          <span class="text-primary-700 text-sm font-semibold">
            {{ model.categoryUids.length }} Selected
          </span>
          <button
            type="button"
            class="text-core-500 hover:text-core-700 text-sm font-medium"
            @click="unselectAllCategories"
          >
            Unselect All
          </button>
        </div>

        <ul class="space-y-2">
          <li
            v-for="category in selectedCategories"
            :key="category.uid"
            class="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3"
          >
            <Checkbox
              :model-value="true"
              dense
              @update:model-value="() => toggleCategory(category.uid)"
            />
            <span
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500"
            >
              <Icon name="tag-2" class="h-4 w-4" />
            </span>
            <Chip :label="category.name" color="purple" size="sm" />
            <span
              v-if="categoryProductCount(category) !== null"
              class="text-primary-600 ml-auto shrink-0 text-xs font-medium"
            >
              {{ categoryProductCount(category) }} products
            </span>
          </li>
        </ul>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { onClickOutside } from "@vueuse/core"
import SelectField from "@components/form/SelectField.vue"
import TextField from "@components/form/TextField.vue"
import Checkbox from "@components/form/Checkbox.vue"
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"
import ProductVariantPicker from "./ProductVariantPicker.vue"
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import { useDebouncedRef } from "@/composables/useDebouncedRef"
import { useGetProductCatalogsInfinite, useGetCategories } from "@modules/inventory/api"
import type { IProductCatalogue, IProductCategory } from "@modules/inventory/types"
import { APPLIES_TO_OPTIONS } from "../constants"
import { optionValue } from "../utils"
import type { TTargetMode } from "../types"

/** Controlled v-model shape (a slice of ICouponFormModel). */
export interface ITargetSelectorModel {
  mode: TTargetMode
  productUids: string[]
  variantSelections: Record<string, string[]>
  categoryUids: string[]
}

/** Category may carry a product-count field not present in the base type. */
type TCategoryWithCount = IProductCategory & {
  products_count?: number
  product_count?: number
  total_products?: number
}

const props = defineProps<{ modelValue: ITargetSelectorModel }>()
const emit = defineEmits<{ "update:modelValue": [value: ITargetSelectorModel] }>()

const { format } = useFormatCurrency()

const model = computed(() => props.modelValue)

/** The matching option object so SelectField shows the friendly label. */
const appliesToOption = computed(
  () => APPLIES_TO_OPTIONS.find((o) => o.value === model.value.mode) ?? null,
)

/** Emit a brand-new object so the prop is never mutated. */
function updateModel(patch: Partial<ITargetSelectorModel>): void {
  emit("update:modelValue", { ...props.modelValue, ...patch })
}

const onModeChange = (v: unknown): void => {
  updateModel({ mode: optionValue<TTargetMode>(v) })
}

// ---------------------------------------------------------------------------
// Product price / image helpers (catalog products use variants for pricing)
// ---------------------------------------------------------------------------
function primaryImage(product: IProductCatalogue): string | null {
  const images = product.images ?? []
  return images.find((img) => img.is_primary)?.image ?? images[0]?.image ?? null
}

/** Numeric, finite, positive prices derived from a product's variants. */
function variantPrices(product: IProductCatalogue): number[] {
  return (product.variants ?? [])
    .map((v) => Number(v.price))
    .filter((n) => Number.isFinite(n) && n > 0)
}

/** Single price, a min–max range, or "--" — never "₦NaN". */
function priceLabel(product: IProductCatalogue): string {
  const prices = variantPrices(product)
  if (prices.length === 0) return "--"
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return min === max ? format(min) : `${format(min)} - ${format(max)}`
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------
const productOpen = ref(false)
const productDropdownRef = ref<HTMLElement | null>(null)
onClickOutside(productDropdownRef, () => (productOpen.value = false))

const productSearch = ref("")
const debouncedProductSearch = useDebouncedRef(productSearch, 600)

const { data: productsData, isFetching: productsLoading } = useGetProductCatalogsInfinite(
  20,
  debouncedProductSearch,
)

const products = computed<IProductCatalogue[]>(
  () => productsData.value?.pages?.flatMap((page) => page.results) ?? [],
)

/** Cache fetched products so selected rows render even after search changes. */
const productCache = ref<Record<string, IProductCatalogue>>({})
watch(
  products,
  (list) => {
    for (const p of list) productCache.value[p.uid] = p
  },
  { immediate: true },
)

const selectedProducts = computed<IProductCatalogue[]>(() =>
  props.modelValue.productUids.map(
    (uid) =>
      productCache.value[uid] ??
      ({ uid, name: "", images: [], variants: [] } as unknown as IProductCatalogue),
  ),
)

function isProductSelected(uid: string): boolean {
  return props.modelValue.productUids.includes(uid)
}

function toggleProduct(product: IProductCatalogue): void {
  const uid = product.uid
  const has = isProductSelected(uid)
  const productUids = has
    ? props.modelValue.productUids.filter((id) => id !== uid)
    : [...props.modelValue.productUids, uid]
  // drop variant selections for removed products
  const variantSelections = { ...props.modelValue.variantSelections }
  if (has) delete variantSelections[uid]
  else productCache.value[uid] = product
  updateModel({ productUids, variantSelections })
  if (has && expandedProduct.value === uid) expandedProduct.value = null
}

function unselectAllProducts(): void {
  updateModel({ productUids: [], variantSelections: {} })
  expandedProduct.value = null
}

const expandedProduct = ref<string | null>(null)
function toggleExpanded(uid: string): void {
  expandedProduct.value = expandedProduct.value === uid ? null : uid
}

function setVariants(uid: string, variantUids: string[]): void {
  const variantSelections = { ...props.modelValue.variantSelections }
  if (variantUids.length === 0) delete variantSelections[uid]
  else variantSelections[uid] = variantUids
  updateModel({ variantSelections })
}

function variantSummary(product: IProductCatalogue): string {
  const selected = props.modelValue.variantSelections[product.uid] ?? []
  const total = product.variants?.length ?? 0
  if (selected.length === 0) return "All variants selected"
  if (total) return `${selected.length} of ${total} variants`
  return `${selected.length} variant(s)`
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
const categoryOpen = ref(false)
const categoryDropdownRef = ref<HTMLElement | null>(null)
onClickOutside(categoryDropdownRef, () => (categoryOpen.value = false))

const categorySearch = ref("")
const { data: categoriesData, isFetching: categoriesLoading } = useGetCategories()
const categories = computed<TCategoryWithCount[]>(
  () => (categoriesData.value?.data?.results as TCategoryWithCount[] | undefined) ?? [],
)

const filteredCategories = computed(() => {
  const term = categorySearch.value.trim().toLowerCase()
  if (!term) return categories.value
  return categories.value.filter((c) => c.name.toLowerCase().includes(term))
})

const selectedCategories = computed<TCategoryWithCount[]>(() =>
  props.modelValue.categoryUids
    .map((uid) => categories.value.find((c) => c.uid === uid))
    .filter((c): c is TCategoryWithCount => !!c),
)

function isCategorySelected(uid: string): boolean {
  return props.modelValue.categoryUids.includes(uid)
}

function toggleCategory(uid: string): void {
  const categoryUids = isCategorySelected(uid)
    ? props.modelValue.categoryUids.filter((id) => id !== uid)
    : [...props.modelValue.categoryUids, uid]
  updateModel({ categoryUids })
}

function unselectAllCategories(): void {
  updateModel({ categoryUids: [] })
}

/** Real count field if present, otherwise null (renders name only). */
function categoryProductCount(category: TCategoryWithCount): number | null {
  const count = category.products_count ?? category.product_count ?? category.total_products
  return typeof count === "number" ? count : null
}
</script>
