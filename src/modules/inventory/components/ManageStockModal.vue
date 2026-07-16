<template>
  <component
    :is="isMobile ? Drawer : Modal"
    :open="open"
    :max-width="isMobile ? 'full' : 'xl'"
    :position="isMobile ? 'bottom' : undefined"
    :full-height="isMobile"
    title="Manage Stock"
    @close="emit('close')"
  >
    <ManageStockSkeleton v-if="loading || (!product && !error)" />

    <div
      v-else-if="error && !product"
      class="flex min-h-[360px] flex-col items-center justify-center gap-3 px-6 text-center"
      role="alert"
    >
      <span class="bg-error-50 flex h-12 w-12 items-center justify-center rounded-full">
        <Icon name="warning-2" size="24" class="text-error-600" />
      </span>
      <div class="space-y-1">
        <h3 class="text-core-800 font-semibold">Unable to load stock details</h3>
        <p class="text-core-500 text-sm">Check your connection and try again.</p>
      </div>
      <AppButton label="Try Again" variant="outlined" @click="emit('retry')" />
    </div>

    <div v-else class="space-y-4">
      <!-- Action Selector -->
      <FormField
        name="action"
        label="Select Action"
        type="select"
        placeholder="Select action"
        :options="actionOptions"
        placement="auto"
        required
      />

      <!-- Product Info Card -->
      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div class="flex items-center gap-3 border-b border-gray-200 p-4">
          <!-- Product/Variant Image -->
          <div class="h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-gray-200">
            <img
              v-if="displayImage"
              :src="displayImage"
              :alt="product?.name ?? ''"
              class="h-full w-full object-cover"
            />
            <div v-else class="flex h-full w-full items-center justify-center">
              <Icon name="shop-add" class="text-core-800" />
            </div>
          </div>

          <div class="flex h-full min-w-0 flex-1 flex-col justify-between gap-2">
            <p class="truncate font-medium">{{ product?.name }}</p>
            <!-- Price and stock only show when variant is selected or for simple products -->
            <template v-if="showPriceAndStock">
              <div class="flex items-center gap-2">
                <Icon name="tag-2" class="text-core-600 h-4 w-4" />
                <p class="text-core-700">{{ displayPrice }}</p>
              </div>
            </template>
          </div>
          <Chip
            v-if="showPriceAndStock"
            icon="box-outline"
            :label="`${stockLeft} in Stock`"
            :color="stockChipColor"
          />
        </div>
      </div>

      <!-- Attribute Selection for Complex Products -->
      <div v-if="isComplexProduct && selectedAction" class="space-y-3">
        <!-- Single attribute - full width -->
        <FormField
          v-if="productAttributes.length === 1"
          :name="productAttributes[0].attribute_uid"
          :label="`Select ${productAttributes[0].attribute_name}`"
          type="select"
          :options="productAttributes[0].options"
          placeholder="Select option"
          placement="auto"
          required
        />
        <!-- Two attributes - side by side -->
        <div v-else-if="productAttributes.length === 2" class="grid grid-cols-2 gap-3">
          <FormField
            v-for="attr in productAttributes"
            :key="attr.attribute_uid"
            :name="attr.attribute_uid"
            :label="`Select ${attr.attribute_name}`"
            type="select"
            :options="attr.options"
            placeholder="Select option"
            placement="auto"
            required
          />
        </div>
      </div>

      <!-- Action-Specific Fields -->
      <template v-if="canShowActionFields">
        <!-- Add Stock Fields -->
        <template v-if="selectedAction === 'add'">
          <FormField
            name="quantity"
            label="Quantity to add"
            type="number"
            placeholder="Enter quantity"
            required
          />
          <FormField
            name="unit_cost"
            label="Unit Cost"
            type="number"
            format="currency"
            step="0.01"
            placeholder="Enter unit cost"
            required
          />
          <FormField
            name="note"
            label="Reason for Manual Entry"
            type="textarea"
            placeholder="Enter reason"
            required
          />
          <ExpenseRecordCard
            v-model="recordExpense"
            :quantity="values.quantity"
            :unit-cost="values.unit_cost"
          />
        </template>

        <!-- Reduce Stock Fields -->
        <template v-else-if="selectedAction === 'reduce'">
          <FormField
            name="quantity"
            label="Quantity to remove"
            type="number"
            placeholder="Enter quantity"
            required
          />
          <FormField
            name="loss_type"
            label="Loss Type/Reason"
            type="select"
            placeholder="Select loss type"
            :options="lossTypeOptions"
            placement="auto"
            required
          />
          <FormField
            name="note"
            label="Additional Notes"
            type="textarea"
            placeholder="Enter additional notes"
          />
        </template>

        <!-- Transfer Stock Fields -->
        <template v-else-if="selectedAction === 'transfer'">
          <FormField
            name="quantity"
            label="Quantity to transfer"
            type="number"
            placeholder="Enter quantity"
            required
          />
          <FormField
            name="to_location"
            label="Select Location"
            type="select"
            placeholder="Select destination location"
            :options="locationOptions"
            placement="auto"
            required
          />
          <FormField
            name="note"
            label="Notes"
            type="textarea"
            placeholder="Enter additional notes"
          />
        </template>

        <!-- Request Stock Fields -->
        <template v-else-if="selectedAction === 'request'">
          <FormField
            name="quantity"
            label="Quantity to request"
            type="number"
            placeholder="Enter quantity"
            required
          />
          <FormField
            name="to_location"
            label="Select Location"
            type="select"
            placeholder="Select location to request from"
            :options="locationOptions"
            placement="auto"
            required
          />
          <FormField
            name="note"
            label="Notes"
            type="textarea"
            placeholder="Enter additional notes"
          />
        </template>
      </template>
    </div>

    <template #footer>
      <AppButton
        v-if="product && !loading"
        :label="submitButtonLabel"
        :loading="isPending"
        class="w-full"
        @click="onSubmit"
        :disabled="!canSubmit"
      />
    </template>
  </component>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useForm } from "vee-validate"
import { useMediaQuery } from "@vueuse/core"
import * as yup from "yup"
import Modal from "@components/Modal.vue"
import Drawer from "@components/Drawer.vue"
import AppButton from "@components/AppButton.vue"
import FormField from "@components/form/FormField.vue"
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"
import ExpenseRecordCard from "@modules/shared/components/ExpenseRecordCard.vue"
import ManageStockSkeleton from "./skeletons/ManageStockSkeleton.vue"
import {
  useAddStock,
  useReduceStock,
  useDirectStockTransfer,
  useRequestStockTransfer,
} from "../api"
import { useQueryClient } from "@tanstack/vue-query"
import { inventoryCache } from "../cache"
import { displayError } from "@/utils/error-handler"
import { toast } from "@/composables/useToast"
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import { getProductAttributesForSelect, findVariantByAttributes } from "@/utils/product-attributes"
import type {
  IAddStockPayload,
  IReduceStockPayload,
  IStockTransferPayload,
  IProductDetails,
} from "../types"
import { useSettingsStore } from "@modules/settings/store"
import { getAddStockDefaults } from "../stock-form"

interface Props {
  open: boolean
  product?: IProductDetails | null
  loading?: boolean
  error?: boolean
}

interface Emits {
  (e: "close"): void
  (e: "retry"): void
}

const props = withDefaults(defineProps<Props>(), {
  product: null,
  loading: false,
  error: false,
})
const emit = defineEmits<Emits>()
const { format } = useFormatCurrency()

const isMobile = useMediaQuery("(max-width: 768px)")
const settingsStore = useSettingsStore()

const { mutate: addStock, isPending: isAdding } = useAddStock()
const { mutate: reduceStock, isPending: isReducing } = useReduceStock()
const { mutate: directTransfer, isPending: isTransferring } = useDirectStockTransfer()
const { mutate: requestTransfer, isPending: isRequesting } = useRequestStockTransfer()
const queryClient = useQueryClient()

const isPending = computed(
  () => isAdding.value || isReducing.value || isTransferring.value || isRequesting.value,
)

// Get available stock for the product
const availableStock = computed(() => {
  if (!props.product?.variants) return 0
  return props.product.variants.reduce((sum, v) => sum + (v.available_stock || 0), 0)
})

const hasMultipleLocations = computed(() => {
  return (settingsStore.locations?.length || 0) > 1
})

const actionOptions = computed(() => {
  const items = []

  // Only HQ can add stock
  if (settingsStore.activeLocation?.is_hq) {
    items.push({ label: "Add Stock", value: "add" })

    // Only show Reduce Stock if stock is available
    if (availableStock.value > 0) {
      items.push({ label: "Reduce Stock", value: "reduce" })
    }
  }

  // Only show transfer and request if there are multiple locations
  if (hasMultipleLocations.value) {
    // Transfer requires available stock
    if (availableStock.value > 0) {
      items.push({ label: "Transfer Stock", value: "transfer" })
    }

    // Any location can request stock
    items.push({ label: "Request Stock", value: "request" })
  }

  return items
})

const lossTypeOptions = [
  { label: "Damage", value: "damage" },
  { label: "Wastage", value: "wastage" },
  { label: "Manual Adjustment Out", value: "manual_adjustment_out" },
]

// Map locations from settings store to select options, excluding current location
const locationOptions = computed(() => {
  if (!settingsStore.locations) return []
  return settingsStore.locations
    .filter((location) => location.uid !== settingsStore.activeLocation?.uid)
    .map((location) => ({
      label: location.name,
      value: location.uid,
    }))
})

// Check if product has multiple variants (complex product)
const isComplexProduct = computed(() => {
  return (props.product?.variants?.length ?? 0) > 1
})

// Get product attributes for selection
const productAttributes = computed(() => {
  if (!props.product || !isComplexProduct.value) return []
  return getProductAttributesForSelect(props.product)
})

interface FormValues {
  action: { label: string; value: string } | null
  quantity: number
  unit_cost: string
  note: string
  loss_type: { label: string; value: string } | null
  to_location: { label: string; value: string } | null
  [key: string]: unknown // For dynamic attribute fields
}

const validationSchema = yup.lazy(() => {
  const schema: Record<string, yup.AnySchema> = {
    action: yup
      .object()
      .shape({
        label: yup.string().required(),
        value: yup.string().required(),
      })
      .required("Action is required"),
    quantity: yup.number().when("action", {
      is: (action: { value: string } | null) => action?.value !== undefined,
      then: (schema) =>
        schema
          .typeError("Please enter a valid number")
          .required("Quantity is required")
          .positive("Quantity must be positive")
          .test("max-stock", "Quantity cannot exceed available stock", function (value) {
            const { action } = this.parent
            if (action?.value === "reduce" || action?.value === "transfer") {
              return value <= stockLeft.value
            }
            return true
          }),
      otherwise: (schema) => schema.optional(),
    }),
    unit_cost: yup.string().when("action", {
      is: (action: { value: string } | null) => action?.value === "add",
      then: (schema) => schema.required("Unit cost is required"),
      otherwise: (schema) => schema.optional(),
    }),
    loss_type: yup.object().when("action", {
      is: (action: { value: string } | null) => action?.value === "reduce",
      then: (schema) =>
        schema
          .shape({
            label: yup.string().required(),
            value: yup.string().required(),
          })
          .required("Loss type is required"),
      otherwise: (schema) => schema.nullable().optional(),
    }),
    to_location: yup.object().when("action", {
      is: (action: { value: string } | null) =>
        action?.value === "transfer" || action?.value === "request",
      then: (schema) =>
        schema
          .shape({
            label: yup.string().required(),
            value: yup.string().required(),
          })
          .required("Location is required"),
      otherwise: (schema) => schema.nullable().optional(),
    }),
    // Notes are only required for manual stock additions ("Reason for Manual Entry");
    // optional when reducing, transferring, or requesting stock (LYW-2623).
    note: yup.string().when("action", {
      is: (action: { value: string } | null) => action?.value === "add",
      then: (schema) => schema.required("Notes are required"),
      otherwise: (schema) => schema.optional(),
    }),
  }

  // Add attribute fields dynamically
  if (isComplexProduct.value) {
    productAttributes.value.forEach((attr) => {
      schema[attr.attribute_uid] = yup
        .object()
        .shape({
          label: yup.string().required(),
          value: yup.string().required(),
        })
        .required(`${attr.attribute_name} is required`)
    })
  }

  return yup.object(schema)
})

// Compute initial values including dynamic attribute fields
const getInitialValues = (): FormValues => {
  const initialValues: FormValues = {
    action: null,
    quantity: 0,
    unit_cost: "",
    note: "",
    loss_type: null,
    to_location: null,
  }

  // Add initial values for attribute fields
  if (isComplexProduct.value) {
    productAttributes.value.forEach((attr) => {
      initialValues[attr.attribute_uid] = null
    })
  }

  return initialValues
}

const { handleSubmit, resetForm, values, setFieldValue } = useForm<FormValues>({
  validationSchema,
  initialValues: getInitialValues(),
  keepValuesOnUnmount: true,
})

// Whether the stock purchase should also be recorded as an expense (default on, per design)
const recordExpense = ref(getAddStockDefaults().recordExpense)

// Get selected action value
const selectedAction = computed(() => values.action?.value)

// Get selected variant based on attribute selection
const selectedVariant = computed(() => {
  if (!props.product) return null
  if (!isComplexProduct.value) {
    // Simple product - return the single variant
    return props.product.variants[0]
  }

  // Complex product - find variant based on selected attributes
  const selectedAttributes: Record<string, string> = {}
  productAttributes.value.forEach((attr) => {
    const fieldValue = values[attr.attribute_uid] as { value: string } | undefined
    if (fieldValue?.value) {
      selectedAttributes[attr.attribute_uid] = fieldValue.value
    }
  })

  // Only return variant if all attributes are selected
  if (Object.keys(selectedAttributes).length === productAttributes.value.length) {
    return findVariantByAttributes(props.product, selectedAttributes)
  }

  return null
})

// Show price and stock only when variant is selected or for simple products
const showPriceAndStock = computed(() => {
  return !isComplexProduct.value || selectedVariant.value !== null
})

// Get display image (variant image if available, otherwise product primary image)
const displayImage = computed(() => {
  if (selectedVariant.value?.image) {
    return selectedVariant.value.image
  }
  return props.product?.images?.[0]?.image || null
})

// Get display price
const displayPrice = computed(() => {
  if (selectedVariant.value) {
    return format(Number(selectedVariant.value.price))
  }
  return format(0)
})

// Get stock left
const stockLeft = computed(() => {
  if (selectedVariant.value) {
    return selectedVariant.value.sellable_stock || 0
  }
  return 0
})

// Determine chip color based on stock
const stockChipColor = computed(() => {
  return stockLeft.value < 5 ? "error" : "success"
})

// Can show action-specific fields only when:
// - Action is selected
// - For simple products: always
// - For complex products: when variant is selected
const canShowActionFields = computed(() => {
  return selectedAction.value && (!isComplexProduct.value || selectedVariant.value !== null)
})

// Can submit only when variant is selected (or simple product)
const canSubmit = computed(() => {
  return !isComplexProduct.value || selectedVariant.value !== null
})

// Submit button label based on selected action
const submitButtonLabel = computed(() => {
  switch (selectedAction.value) {
    case "add":
      return "Add Stock"
    case "reduce":
      return "Remove Stock"
    case "transfer":
      return "Transfer Stock"
    case "request":
      return "Send Request"
    default:
      return "Submit"
  }
})

// Reset when the modal opens and again when asynchronously loaded product details
// first become available. Watching the UID avoids resetting an in-progress form
// during background refetches of the same product.
watch([() => props.open, () => props.product?.uid], ([isOpen]) => {
  if (isOpen) {
    const defaults = getAddStockDefaults()
    const initialValues: FormValues = {
      action: null,
      quantity: 0,
      unit_cost: "",
      note: "",
      loss_type: null,
      to_location: null,
    }

    // Reset attribute fields
    productAttributes.value.forEach((attr) => {
      initialValues[attr.attribute_uid] = null
    })

    resetForm({ values: initialValues })
    recordExpense.value = defaults.recordExpense
  }
})

// Only add-stock uses the purchase reason default. Other stock actions must not
// inherit it when the merchant switches actions in the shared modal.
watch(selectedAction, (action, previousAction) => {
  if (action === "add") {
    setFieldValue("note", getAddStockDefaults().note)
  } else if (previousAction === "add") {
    setFieldValue("note", "")
  }
})

// Update unit cost when variant is selected for add stock
watch(
  [selectedVariant, selectedAction],
  ([variant, action]) => {
    if (action === "add" && variant) {
      setFieldValue("unit_cost", getAddStockDefaults(variant.cost_price).unitCost)
    }
  },
  { immediate: true },
)

const onSubmit = handleSubmit((formValues) => {
  if (!selectedVariant.value) return

  const variantUid = selectedVariant.value.uid

  if (formValues.action?.value === "add") {
    if (!settingsStore.activeLocation?.is_hq) {
      toast.error("Only HQ locations can manually add stock")
      emit("close")
      return
    }

    const payload: IAddStockPayload & { uid: string } = {
      uid: variantUid,
      quantity: formValues.quantity,
      unit_cost: formValues.unit_cost,
      note: formValues.note,
      create_expense: recordExpense.value,
    }

    const onSuccess = () => {
      toast.success("Stock added successfully")
      if (props.product) inventoryCache.stockChanged(queryClient, props.product.uid)
      emit("close")
    }

    addStock(payload, { onSuccess, onError: displayError })
  } else if (formValues.action?.value === "reduce") {
    // Only HQ locations can reduce stock
    if (!settingsStore.activeLocation?.is_hq) {
      toast.error("Only HQ locations can manually reduce stock")
      emit("close")
      return
    }

    if (!formValues.loss_type) return

    const payload: IReduceStockPayload & { uid: string } = {
      uid: variantUid,
      quantity: formValues.quantity,
      reason: formValues.loss_type.value,
      note: formValues.note,
    }

    const onSuccess = () => {
      toast.success("Stock reduced successfully")
      if (props.product) inventoryCache.stockChanged(queryClient, props.product.uid)
      emit("close")
    }

    reduceStock(payload, { onSuccess, onError: displayError })
  } else if (formValues.action?.value === "transfer" || formValues.action?.value === "request") {
    if (!formValues.to_location) return

    const action = formValues.action.value === "transfer" ? "transfer" : "request"

    const payload: IStockTransferPayload = {
      to_location: formValues.to_location.value,
      transfers: [
        {
          variant: variantUid,
          quantity: formValues.quantity,
        },
      ],
      note: formValues.note,
    }

    const onSuccess = () => {
      toast.success(`Stock ${action === "transfer" ? "transferred" : "request sent"} successfully`)
      // A direct transfer moves stock; a request only creates a transfer request.
      if (props.product) {
        inventoryCache.transferChanged(queryClient, action === "transfer", props.product.uid)
      }
      emit("close")
    }

    if (action === "transfer") {
      directTransfer(payload, { onSuccess, onError: displayError })
    } else {
      requestTransfer(payload, { onSuccess, onError: displayError })
    }
  }
})
</script>
