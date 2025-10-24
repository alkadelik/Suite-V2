<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import FormField from "@components/form/FormField.vue"
import Switch from "@components/form/Switch.vue"
import SectionHeader from "@components/SectionHeader.vue"
import { ref, watch } from "vue"
import { useForm } from "vee-validate"
import * as yup from "yup"
import { onInvalidSubmit } from "@/utils/validations"
import { useGetPopupSettings, useUpdatePopupSettings } from "@modules/settings/api"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"

const enablePopup = ref(false)

// Yup validation schema for the popup form
const popupSchema = yup.object({
  headline: yup
    .string()
    .required("Headline is required")
    .min(5, "Headline must be at least 5 characters")
    .max(100, "Headline must not exceed 100 characters"),
  body_text: yup
    .string()
    .required("Body text is required")
    .min(10, "Body text must be at least 10 characters")
    .max(500, "Body text must not exceed 500 characters"),
  cta_button_text: yup
    .string()
    .required("CTA button text is required")
    .min(2, "CTA button text must be at least 2 characters")
    .max(30, "CTA button text must not exceed 30 characters"),
  cta_button_link: yup
    .string()
    .required("CTA button link is required")
    .url("Please enter a valid URL (e.g., https://example.com)"),
})

const { handleSubmit, setValues, meta } = useForm({
  validationSchema: popupSchema,
  initialValues: {
    headline: "",
    body_text: "",
    cta_button_text: "",
    cta_button_link: "",
  },
})

const { mutate: updatePopupSettings, isPending } = useUpdatePopupSettings()
const { data: popupSettings, refetch } = useGetPopupSettings()

watch(
  () => popupSettings.value,
  (newSettings) => {
    if (newSettings) {
      enablePopup.value = newSettings.is_enabled
      setValues({
        headline: newSettings.headline || "",
        body_text: newSettings.body_text || "",
        cta_button_text: newSettings.cta_button_text || "",
        cta_button_link: newSettings.cta_button_link || "",
      })
    }
  },
  { immediate: true },
)

const onSubmit = handleSubmit((formData) => {
  updatePopupSettings(formData, {
    onSuccess: () => {
      toast.success("Popup settings updated successfully")
      refetch()
    },
    onError: displayError,
  })
}, onInvalidSubmit)
</script>

<template>
  <section>
    <div class="mb-4 flex items-center gap-6 border-b border-gray-200 pb-4">
      <SectionHeader title="Pop Up" size="sm" subtitle="Set up your pop-up preferences" />
      <AppButton icon="clock-rewind" color="alt" size="sm" class="ml-auto" />
      <AppButton
        label="Publish PopUp"
        class="!hidden md:!inline-flex"
        :loading="isPending"
        :inactive="!meta.valid"
        @click="onSubmit"
      />
    </div>
    <!-- mobile -->
    <div class="fixed bottom-0 left-0 z-10 w-full border-t border-gray-200 bg-white p-4 md:hidden">
      <AppButton
        label="Publish PopUp"
        class="w-full"
        :loading="isPending"
        :inactive="!meta.valid"
        @click="onSubmit"
      />
    </div>

    <div class="border-core-200 rounded-lg border bg-white">
      <div class="p-3 md:p-6">
        <div
          class="flex items-center justify-between gap-8 rounded-2xl border border-gray-400 bg-gray-50 p-4"
        >
          <div class="flex-1 text-sm">
            <h3 class="font-medium text-gray-700">Enable Pop Up</h3>
            <p class="text-gray-500">Visitors will see this once per session</p>
          </div>
          <Switch v-model="enablePopup" />
        </div>
      </div>

      <div v-if="enablePopup" class="border-core-200 border-t p-6">
        <div class="grid gap-6">
          <FormField
            name="headline"
            label="Headline"
            placeholder="Enter Popup headline here"
            required
          />

          <FormField
            name="body_text"
            type="textarea"
            label="Body Text"
            placeholder="Enter Popup body text here"
            required
          />

          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormField
              name="cta_button_text"
              label="CTA Button Text"
              placeholder="e.g. Shop Now"
              required
            />
            <FormField
              name="cta_button_link"
              label="CTA Button Link"
              placeholder="e.g. https://yourstore.com/shop"
              type="url"
              required
            />
          </div>
        </div>
      </div>
    </div>
    <div class="py-10" />
  </section>
</template>
