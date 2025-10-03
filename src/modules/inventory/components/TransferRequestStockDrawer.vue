<template>
  <Drawer
    :open="open"
    :title="`${type === 'transfer' ? 'Transfer' : 'Request'} Stock`"
    @close="emit('close')"
  >
    <div class="space-y-4">
      <IconHeader
        icon-name="shop-add"
        :subtext="
          type === 'transfer'
            ? 'Transfer stock directly to another location.'
            : 'Request stock transfer from another location.'
        "
      />

      <div class="rounded-xl border-gray-200 bg-white">
        <div class="flex items-center gap-3 border-b border-gray-200 p-4">
          <!-- first product image -->
          <div class="h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-gray-200">
            <img
              v-if="productImage"
              :src="productImage"
              :alt="productName"
              class="h-full w-full object-cover"
            />
            <div v-else class="flex h-full w-full items-center justify-center">
              <Icon name="shop-add" class="text-core-800" />
            </div>
          </div>

          <div class="flex h-full min-w-0 flex-1 flex-col justify-between gap-2">
            <p class="truncate font-medium">{{ productName }}</p>
            <div class="flex items-center gap-2">
              <Icon name="tag-2" class="text-core-600 h-4 w-4" />
              <p class="text-core-700">{{ displayPrice }}</p>
            </div>
          </div>
          <Chip icon="box-outline" :label="`${stockLeft} in Stock`" :color="stockChipColor" />
        </div>
        <div class="p-4">
          <div class="mb-2 flex flex-wrap gap-1">
            <Chip
              v-for="attr in variantAttributes"
              :key="attr.uid"
              :label="attr.attribute_value"
              color="primary"
              size="sm"
            />
          </div>
          <FormField
            name="quantity"
            type="number"
            placeholder="Enter quantity"
            required
            :show-steppers="true"
            :hide-label="true"
          />
        </div>
      </div>

      <FormField
        name="note"
        label="Notes"
        type="textarea"
        placeholder="Enter additional notes"
        required
      />

      <FormField
        name="to_location"
        label="Select Location"
        type="radio"
        :radio-options="locationOptions"
        required
      />
    </div>

    <template #footer>
      <div class="flex gap-2">
        <AppButton label="Cancel" color="alt" class="flex-1" @click="emit('close')" />
        <AppButton
          :label="type === 'transfer' ? 'Transfer' : 'Send Request'"
          :loading="isPending"
          class="flex-1"
          @click="onSubmit"
          :disabled="!meta.valid"
        />
      </div>
    </template>
  </Drawer>
</template>

<script setup lang="ts">
import { computed, watch } from "vue"
import { useForm } from "vee-validate"
import * as yup from "yup"
import Drawer from "@components/Drawer.vue"
import AppButton from "@components/AppButton.vue"
import FormField from "@components/form/FormField.vue"
import IconHeader from "@components/IconHeader.vue"
import Chip from "@components/Chip.vue"
import { useDirectStockTransfer, useRequestStockTransfer } from "../api"
import { displayError } from "@/utils/error-handler"
import { toast } from "@/composables/useToast"
import type {
  IStockTransferPayload,
  IProductVariantAttribute,
  IProductVariantDetails,
  IProductDetails,
} from "../types"
import { useSettingsStore } from "@modules/settings/store"
import Icon from "@components/Icon.vue"
import { formatCurrency } from "@/utils/format-currency"

interface Props {
  open: boolean
  type: "transfer" | "request"
  variantUid: string
  productName: string
  variantAttributes?: IProductVariantAttribute[]
  variant?: IProductVariantDetails
  product?: IProductDetails
}

interface Emits {
  (e: "close"): void
  (e: "success"): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const settingsStore = useSettingsStore()
const { mutate: directTransfer, isPending: isTransferring } = useDirectStockTransfer()
const { mutate: requestTransfer, isPending: isRequesting } = useRequestStockTransfer()

const isPending = computed(() => isTransferring.value || isRequesting.value)

// Map locations from settings store to radio options, excluding current location
const locationOptions = computed(() => {
  if (!settingsStore.locations) return []
  return settingsStore.locations
    .filter((location) => location.uid !== settingsStore.activeLocation?.uid)
    .map((location) => ({
      label: location.name,
      value: location.uid,
    }))
})

// Get first product image
const productImage = computed(() => {
  return props.product?.images?.[0]?.image || null
})

// Get variant or product price
const displayPrice = computed(() => {
  if (props.product?.variants && props.product.variants.length === 1) {
    // Single variant - use product price
    return formatCurrency(Number(props.product.variants[0].price))
  } else if (props.variant) {
    // Multiple variants - use variant price
    return formatCurrency(Number(props.variant.price))
  }
  return formatCurrency(0)
})

// Get stock left
const stockLeft = computed(() => {
  if (props.product?.variants && props.product.variants.length === 1) {
    // Single variant
    return props.product.variants[0].sellable_stock || 0
  } else if (props.variant) {
    // Multiple variants
    return props.variant.sellable_stock || 0
  }
  return 0
})

// Determine chip color based on stock
const stockChipColor = computed(() => {
  return stockLeft.value < 5 ? "error" : "success"
})

interface FormValues {
  to_location: string
  quantity: number
  note: string
}

const { handleSubmit, meta, resetForm } = useForm<FormValues>({
  validationSchema: yup.object({
    to_location: yup.string().required("Location is required"),
    quantity: yup
      .number()
      .typeError("Please enter a valid number")
      .required("Quantity is required")
      .positive("Quantity must be positive"),
    note: yup.string().required("Notes are required"),
  }),
  initialValues: {
    to_location: "",
    quantity: stockLeft.value,
    note: "",
  },
})

// Reset form when drawer opens
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      resetForm({
        values: {
          to_location: "",
          quantity: stockLeft.value,
          note: "",
        },
      })
    }
  },
)

const onSubmit = handleSubmit((values) => {
  if (!values.to_location) return

  const payload: IStockTransferPayload = {
    to_location: values.to_location,
    transfers: [
      {
        variant: props.variantUid,
        quantity: values.quantity,
      },
    ],
    note: values.note,
  }

  const onSuccess = () => {
    toast.success(
      `Stock ${props.type === "transfer" ? "transferred" : "request sent"} successfully`,
    )
    emit("success")
    emit("close")
  }

  if (props.type === "transfer") {
    directTransfer(payload, { onSuccess, onError: displayError })
  } else {
    requestTransfer(payload, { onSuccess, onError: displayError })
  }
})
</script>
