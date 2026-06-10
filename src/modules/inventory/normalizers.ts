import type { AxiosResponse } from "axios"
import type { IProductCatalogue, IProductDetails, IProductVariantDetails, TProduct } from "./types"

type CatalogueVariant = IProductCatalogue["variants"][number]

const toNumberOrNull = (value: string | number | null | undefined): number | null => {
  if (value === null || value === undefined || value === "") return null
  const cleaned = String(value).replace(/[^0-9.-]/g, "")
  // Guard against non-numeric input ("abc" -> "" -> Number("") === 0).
  if (cleaned === "" || cleaned === "-" || cleaned === ".") return null
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : null
}

const variantDetailsToCatalogueVariant = (variant: IProductVariantDetails): CatalogueVariant => ({
  uid: variant.uid,
  sku: variant.sku,
  name: variant.name,
  attributes: variant.attributes,
  available_stock: variant.available_stock,
  batch_number: variant.batch_number,
  cost_price: toNumberOrNull(variant.cost_price),
  created_at: variant.created_at,
  expiry_date: variant.expiry_date,
  height: variant.height,
  is_active: variant.is_active,
  is_default: variant.is_default,
  is_overstocked: variant.is_overstocked,
  length: variant.length,
  max_stock: variant.max_stock,
  needs_reorder: variant.needs_reorder,
  opening_stock: variant.opening_stock,
  price: variant.price,
  promo_expiry: variant.promo_expiry,
  promo_price: toNumberOrNull(variant.promo_price),
  reorder_point: variant.reorder_point,
  reserved_stock: variant.reserved_stock,
  sellable_stock: variant.sellable_stock,
  popup_quantity_taken: variant.popup_quantity_taken,
  updated_at: variant.updated_at,
  weight: variant.weight,
  width: variant.width,
})

type ResponseEnvelope<T> = {
  data?: T | ResponseEnvelope<T>
}

const isProductDetails = (value: unknown): value is IProductDetails =>
  !!value &&
  typeof value === "object" &&
  "uid" in value &&
  "variants" in value &&
  "images" in value &&
  typeof (value as { uid?: unknown }).uid === "string" &&
  Array.isArray((value as { variants?: unknown }).variants) &&
  Array.isArray((value as { images?: unknown }).images)

const hasData = (value: unknown): value is { data?: unknown } =>
  !!value && typeof value === "object" && "data" in value

export const normalizeProductResponse = (response: unknown): IProductDetails | null => {
  let current: unknown = response

  for (let depth = 0; depth < 3 && current; depth += 1) {
    if (isProductDetails(current)) return current
    if (!hasData(current)) break
    current = current.data
  }

  return null
}

export const productDetailsToListItem = (product: IProductDetails): TProduct => {
  const primaryImage = product.images.find((image) => image.is_primary) ?? product.images[0] ?? null
  const prices = product.variants
    .map((variant) => Number(variant.price))
    .filter((price) => Number.isFinite(price))
  const minPrice = prices.length ? Math.min(...prices) : product.min_price
  const maxPrice = prices.length ? Math.max(...prices) : product.max_price

  return {
    uid: product.uid,
    name: product.name,
    total_stock: product.total_stock,
    sellable_stock: product.variants.reduce(
      (total, variant) => total + Number(variant.sellable_stock || 0),
      0,
    ),
    needs_reorder: product.needs_reorder,
    variants_count: product.variants.length,
    is_active: product.is_active,
    is_hidden_from_storefront: product.is_hidden_from_storefront,
    category: product.category_name || product.category || null,
    created_at: product.created_at,
    primary_image: primaryImage,
    price:
      Number.isFinite(minPrice) && Number.isFinite(maxPrice) ? `${minPrice} - ${maxPrice}` : null,
    amount_sold: product.amount_sold ?? 0,
    quantity_sold: product.quantity_sold ?? 0,
    memo_count: product.memo_count ?? 0,
    return_count: product.return_count ?? 0,
    popup_quantity_taken: product.popup_quantity_taken ?? 0,
  }
}

export const productDetailsToCatalogue = (product: IProductDetails): IProductCatalogue => ({
  uid: product.uid,
  name: product.name,
  description: product.description,
  story: product.story,
  category: product.category,
  category_name: product.category_name,
  brand: product.brand,
  is_active: product.is_active,
  is_variable: product.is_variable,
  variants: product.variants.map(variantDetailsToCatalogueVariant),
  images: product.images.map((image) => ({
    uid: image.uid,
    image: image.image,
    is_primary: image.is_primary,
  })),
  total_stock: product.total_stock,
  created_at: product.created_at,
})

export type ProductMutationResponse = AxiosResponse<unknown> | ResponseEnvelope<IProductDetails>
