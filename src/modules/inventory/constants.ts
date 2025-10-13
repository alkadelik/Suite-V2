import { ref } from "vue"
import { ISelectOption } from "@modules/shared/types"
import type {
  IProductAttributeDetails,
  IProductCategory,
  IProductDimension,
  IProductVariantDetails,
  IInventoryMovement,
  TProduct,
} from "./types"
import { TableColumn } from "@components/DataTable.vue"
import type { TOrder } from "@modules/orders/types"

export const PRODUCT_COLUMNS: TableColumn<TProduct>[] = [
  { header: "Name", accessor: "name", maxWidth: "300px" },
  { header: "Category", accessor: "category" },
  { header: "Price", accessor: "price" },
  { header: "Stock Available", accessor: "total_stock" },
  { header: "Status", accessor: "status" },
  { header: "", accessor: "action" },
]

export const VARIANT_COLUMNS: TableColumn<IProductVariantDetails>[] = [
  { header: "SKU", accessor: "sku" },
  { header: "Price", accessor: "price" },
  { header: "Actual Stock", accessor: "sellable_stock" },
  { header: "Reserved Stock", accessor: "reserved_stock" },
  { header: "Available Stock", accessor: "available_stock" },
  { header: "", accessor: "action" },
]

export const PRODUCT_ORDER_COLUMNS: TableColumn<TOrder>[] = [
  { header: "Order ID", accessor: "order_number" },
  { header: "Order Date", accessor: "created_at" },
  { header: "Customer", accessor: "customer_info" },
  { header: "Status", accessor: "payment_status" },
]

export const MOVEMENT_COLUMNS: TableColumn<IInventoryMovement>[] = [
  { header: "Date", accessor: "created_at" },
  { header: "SKU", accessor: "variant" },
  { header: "Type", accessor: "type" },
  { header: "Quantity", accessor: "quantity" },
  { header: "Unit Cost", accessor: "unit_cost" },
  { header: "Reason", accessor: "reason" },
  { header: "Created By", accessor: "created_by" },
  { header: "Reference", accessor: "reference" },
]

export const MOCK_INVENTORY_MOVEMENTS: IInventoryMovement[] = [
  {
    uid: "mov-001",
    variant: "var-blue-large",
    store: "store-001",
    location: "warehouse-a",
    type: "in",
    reason: "Stock replenishment",
    quantity: 50,
    unit_cost: "5000.00",
    reference: "PO-2025-001",
    note: "Initial stock delivery",
    created_by: "John Doe",
    created_at: new Date().toISOString(),
  },
  {
    uid: "mov-002",
    variant: "var-red-medium",
    store: "store-001",
    location: "warehouse-a",
    type: "out",
    reason: "Sales order fulfillment",
    quantity: 5,
    unit_cost: "5000.00",
    reference: "ORD-2025-002",
    note: "",
    created_by: "Jane Smith",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    uid: "mov-003",
    variant: "var-green-small",
    store: "store-001",
    location: "warehouse-a",
    type: "in",
    reason: "Stock return from customer",
    quantity: 2,
    unit_cost: "5000.00",
    reference: "RET-2025-001",
    note: "Customer returned items - defective",
    created_by: "Admin User",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    uid: "mov-004",
    variant: "var-blue-large",
    store: "store-001",
    location: "warehouse-a",
    type: "out",
    reason: "Stock transfer to retail location",
    quantity: 10,
    unit_cost: "5000.00",
    reference: "TRF-2025-001",
    note: "Transfer to Store Front",
    created_by: "John Doe",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    uid: "mov-005",
    variant: "var-red-medium",
    store: "store-001",
    location: "warehouse-a",
    type: "in",
    reason: "Stock adjustment",
    quantity: 3,
    unit_cost: "5000.00",
    reference: "ADJ-2025-001",
    note: "Physical count correction",
    created_by: "Jane Smith",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const PRODUCT_CATEGORY_OPTIONS = ref<ISelectOption[]>([])

export const updateProductCategoryOptions: (options: IProductCategory[]) => void = (options) => {
  PRODUCT_CATEGORY_OPTIONS.value.splice(
    0,
    PRODUCT_CATEGORY_OPTIONS.value.length,
    ...options.map((option) => ({
      label: option.name,
      value: option.uid,
    })),
  )
}

/**
 * Weight (Kg) attribute UID - Single source of truth
 * This is the default weight attribute UID that backend sends
 * Used to identify when weight-based auto-population should occur
 */
export const WEIGHT_ATTRIBUTE_UID = "7d961eac-4ed9-4a2d-856d-b05e9bcff8fb"

export const PRODUCT_DIMENSIONS: IProductDimension[] = [
  {
    name: "Envelope",
    description_image_url:
      "https://res.cloudinary.com/delivry/image/upload/v1651839241/package_boxes/envelope-removebg-preview_ghzcii.png",
    height: 2,
    width: 35,
    depth: 25,
    max_weight: 0.5,
    shortLabel: "Light",
    label: "Light (< 0.5 kg)",
    range: "< 0.5 kg",
    examples: "e.g. phone case, jewelry",
  },
  {
    name: "Flyer",
    description_image_url:
      "https://res.cloudinary.com/delivry/image/upload/v1682453788/package_boxes/flyer_i9fh7o.png",
    height: 4,
    width: 31,
    depth: 41,
    max_weight: 2,
    shortLabel: "Moderate",
    label: "Moderate (0.51 - 2 kg)",
    range: "0.51 - 2 kg",
    examples: "e.g. t-shirts, cosmetics",
  },
  {
    name: "Small Box",
    description_image_url:
      "https://res.cloudinary.com/delivry/image/upload/v1682453786/package_boxes/small-box_c4vn5e.png",
    height: 34,
    width: 32,
    depth: 10,
    max_weight: 3,
    shortLabel: "Medium",
    label: "Medium (2.01 - 3 kg)",
    range: "2.01 - 3 kg",
    examples: "e.g. snakers, small tablet",
  },
  {
    name: "Big Box",
    description_image_url:
      "https://res.cloudinary.com/delivry/image/upload/v1682453786/package_boxes/big-box_rujsqd.png",
    height: 34,
    width: 34,
    depth: 32,
    max_weight: 12,
    shortLabel: "Heavy",
    label: "Heavy (3.01 - 12 kg)",
    range: "3.01 - 12 kg",
    examples: "e.g. shoes, small appliances",
  },
  {
    name: "Large Box 1",
    description_image_url:
      "https://res.cloudinary.com/delivry/image/upload/v1712625253/package_boxes/box_6_wlrmim.jpg",
    height: 37,
    width: 36,
    depth: 42,
    max_weight: 18,
    shortLabel: "Bulky",
    label: "Bulky (12.01 - 18 kg)",
    range: "13 - 18 kg",
    examples: "e.g. standing fan, bulk clothing",
  },
  {
    name: "Large Box 2",
    description_image_url:
      "https://res.cloudinary.com/delivry/image/upload/v1712625408/package_boxes/Gemini_Generated_Image_iv8xi3iv8xi3iv8x_x8px9t.jpg",
    height: 39,
    width: 40,
    depth: 48,
    max_weight: 25,
    shortLabel: "Very Bulky",
    label: "Very Bulky (18.01 - 25 kg)",
    range: "19 - 25 kg",
    examples: "e.g. large appliances",
  },
  {
    name: "Large Box 3",
    description_image_url:
      "https://res.cloudinary.com/delivry/image/upload/v1712625560/package_boxes/Gemini_Generated_Image_tb5yhrtb5yhrtb5y_ohaund.jpg",
    height: 45,
    width: 50,
    depth: 56,
    max_weight: 40,
    shortLabel: "Massive",
    label: "Massive (> 25kg)",
    range: "> 25 kg",
    examples: "e.g. very large machines",
  },
]

export const PRODUCT_ATTRIBUTES = ref<ISelectOption[]>([])

export const updateProductAttributeOptions: (options: IProductAttributeDetails[]) => void = (
  options,
) => {
  PRODUCT_ATTRIBUTES.value.splice(
    0,
    PRODUCT_ATTRIBUTES.value.length,
    ...options.map((option) => ({
      label: option.name,
      value: option.uid,
    })),
    { label: "Custom Type", value: "custom_type" },
  )
}
