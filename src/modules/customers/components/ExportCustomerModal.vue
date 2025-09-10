<template>
  <Modal
    :open="modelValue"
    title="Export Customers"
    max-width="xl"
    @close="emit('update:modelValue', false)"
    variant="bottom-nav"
    :handle-padding="false"
  >
    <AppForm :schema="schema" @submit="onSubmit" v-slot="{ meta, values }">
      <div class="space-y-4 px-4 py-4 md:space-y-8 md:px-6">
        <div class="space-y-4">
          <div class="flex size-10 items-center justify-center rounded-xl bg-neutral-50 p-2">
            <Icon name="cloud-add" size="20" />
          </div>

          <p class="text-xs md:text-sm">
            This is the bank account where you’ll receive payments from your orders on Leyyow.
          </p>
        </div>

        <FormField
          name="export_fields"
          label="What fields do you want to export?"
          type="tags"
          :options="EXPORT_FIELD_OPTIONS"
          placeholder="Select Export Fields"
          required
        />

        <FormField
          name="period"
          label="Period"
          type="select"
          :options="EXPORT_PERIOD_OPTIONS"
          placeholder="Select period"
          required
          placement="top"
        />

        <!-- Conditional date fields when period is "custom" -->
        <div
          v-if="values?.period?.value === 'custom'"
          class="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <FormField
            name="start_date"
            label="Start Date"
            type="date"
            placeholder="Select start date"
            required
          />

          <FormField
            name="end_date"
            label="End Date"
            type="date"
            placeholder="Select end date"
            required
          />
        </div>
      </div>

      <div class="space-y-3 bg-white px-6 py-4">
        <AppButton
          type="submit"
          label="Send CSV to my email"
          :loading="isPending"
          class="w-full"
          :disabled="!meta.valid"
        />
      </div>
    </AppForm>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"
import * as yup from "yup"
import { toast } from "@/composables/useToast"
import AppButton from "@/components/AppButton.vue"
import Modal from "@/components/Modal.vue"
import AppForm from "@/components/form/AppForm.vue"
import FormField from "@/components/form/FormField.vue"
import Icon from "@components/Icon.vue"
import { EXPORT_FIELD_OPTIONS, EXPORT_PERIOD_OPTIONS } from "../constants"

interface FormValues {
  export_fields: string[]
  period: { label: string; value: string }
  activity: string
  start_date?: string
  end_date?: string
}

interface ExportPayload {
  export_fields: string[]
  period: string
  activity: string
  start_date?: string
  end_date?: string
}

defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  "update:modelValue": [value: boolean]
  refresh: []
}>()

// Dynamic validation schema
const schema = computed(() => {
  const baseSchema = {
    export_fields: yup.array().of(yup.string()).min(1).required(),
    period: yup
      .object({
        label: yup.string().required(),
        value: yup.string().required(),
      })
      .required(),
    activity: yup.string().default("all"),
  }

  // Add date validation when period is "custom"
  return yup.object({
    ...baseSchema,
    start_date: yup.string().when("period", {
      is: "custom",
      then: (schema) => schema.required("Start date is required for custom period"),
      otherwise: (schema) => schema.optional(),
    }),
    end_date: yup.string().when("period", {
      is: "custom",
      then: (schema) => schema.required("End date is required for custom period"),
      otherwise: (schema) => schema.optional(),
    }),
  })
})

// Mock data for development
const isPending = ref(false)

const onSubmit = (values: FormValues) => {
  // Transform the form data to the required payload format
  // Set activity to "all" by default as requested
  const payload: ExportPayload = {
    export_fields: values.export_fields,
    period: values.period.value,
    activity: "all", // Always set to "all" as requested
    start_date: values.start_date,
    end_date: values.end_date,
  }

  console.log("Submitting export payload:", payload)

  // Mock success for development
  toast.success("Export request sent!")
  emit("update:modelValue", false)
  emit("refresh")
}
</script>
