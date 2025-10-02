<template>
  <Modal
    :open="open"
    max-width="xl"
    :variant="isMobile ? 'bottom-nav' : 'centered'"
    :title="`${type === 'add' ? 'Add' : 'Reduce'} Stock (Manual Entry)`"
    @close="emit('close')"
  >
    <div class="space-y-4">
      <IconHeader icon-name="shop-add" subtext="Record a stock-in movement to update inventory.">
        <template v-if="variantAttributes && variantAttributes.length > 0" #header-content>
          <div class="flex flex-wrap gap-1">
            <Chip
              v-for="attr in variantAttributes"
              :key="attr.uid"
              :label="attr.attribute_value"
              color="primary"
              size="sm"
            />
          </div>
        </template>
      </IconHeader>

      <FormField
        name="quantity"
        label="Quantity"
        type="number"
        placeholder="Enter quantity"
        required
      />

      <template v-if="type === 'add'">
        <FormField
          name="unit_cost"
          label="Unit Cost (Optional)"
          type="number"
          placeholder="Enter unit cost"
        />

        <FormField
          name="note"
          label="Reason for Manual Entry"
          type="textarea"
          placeholder="Enter reason"
          required
        />
      </template>

      <template v-else>
        <FormField
          name="loss_type"
          label="Loss Type/Reason"
          type="select"
          placeholder="Select loss type"
          :options="lossTypeOptions"
          required
        />

        <FormField
          name="note"
          label="Additional Notes"
          type="textarea"
          placeholder="Enter additional notes"
          required
        />
      </template>
    </div>

    <template #footer>
      <AppButton
        :label="`${type === 'add' ? 'Add' : 'Remove'} Stock`"
        :loading="isPending"
        class="w-full"
        @click="onSubmit"
        :disabled="!meta.valid"
      />
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useForm } from "vee-validate"
import * as yup from "yup"
import { useMediaQuery } from "@vueuse/core"
import Modal from "@components/Modal.vue"
import AppButton from "@components/AppButton.vue"
import FormField from "@components/form/FormField.vue"
import IconHeader from "@components/IconHeader.vue"
import Chip from "@components/Chip.vue"
import { useAddStock, useReduceStock } from "../api"
import { displayError } from "@/utils/error-handler"
import { toast } from "@/composables/useToast"
import type { IAddStockPayload, IProductVariantAttribute } from "../types"

interface Props {
  open: boolean
  type: "add" | "reduce"
  variantUid: string
  productName: string
  variantAttributes?: IProductVariantAttribute[]
}

interface Emits {
  (e: "close"): void
  (e: "success"): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isMobile = useMediaQuery("(max-width: 768px)")

const { mutate: addStock, isPending: isAdding } = useAddStock()
const { isPending: isReducing } = useReduceStock()

const isPending = computed(() => isAdding.value || isReducing.value)

const lossTypeOptions = [
  { label: "Damages", value: "damages" },
  { label: "Spoilage", value: "spoilage" },
  { label: "Wastage", value: "wastage" },
  { label: "Loss", value: "loss" },
]

const { handleSubmit, meta } = useForm({
  validationSchema: computed(() =>
    yup.object({
      quantity: yup.number().required("Quantity is required").positive("Quantity must be positive"),
      ...(props.type === "add"
        ? {
            unit_cost: yup.string().optional(),
            note: yup.string().required("Reason is required"),
          }
        : {
            loss_type: yup
              .object()
              .shape({
                label: yup.string().required(),
                value: yup.string().required(),
              })
              .required("Loss type is required"),
            note: yup.string().required("Additional notes are required"),
          }),
    }),
  ),
})

const onSubmit = handleSubmit((values) => {
  if (props.type === "add") {
    const payload: IAddStockPayload & { uid: string } = {
      uid: props.variantUid,
      quantity: values.quantity,
      ...(values.unit_cost && { unit_cost: values.unit_cost }),
      note: values.note,
    }

    const onSuccess = () => {
      toast.success("Stock added successfully")
      emit("success")
      emit("close")
    }

    addStock(payload, { onSuccess, onError: displayError })
  } else {
    const reducePayload = {
      uid: props.variantUid,
      quantity: values.quantity,
      loss_type: values.loss_type,
      note: values.note,
    }

    console.log("Reduce stock payload:", reducePayload)
    toast.success("Stock reduced successfully")
    emit("success")
    emit("close")
  }
})
</script>
