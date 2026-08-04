<template>
  <Modal
    :open="open"
    max-width="xl"
    :variant="isMobile ? 'bottom-nav' : 'centered'"
    :title="title"
    body-class="!pb-12"
    @close="emit('close')"
  >
    <div class="mt-8 space-y-8">
      <FormField name="name" label="Location Name" required :disabled="location?.is_hq" />

      <GooglePlacesAutocomplete
        name="address"
        label="Location Address"
        placeholder="Enter a keyword to get suggestions"
        :modelValue="values.address"
        @update:modelValue="setFieldValue('address', $event)"
        @selected="(item: any) => setFieldValue('address', item.description)"
        required
        direction="up"
        :error="errors.address"
        :country-restriction="storeCountryCode"
      />
    </div>

    <template #footer>
      <AppButton
        :label="title"
        :loading="isPending || isUpdating"
        class="w-full"
        @click="onSubmit"
      />
    </template>
  </Modal>
</template>

<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import FormField from "@components/form/FormField.vue"
import Modal from "@components/Modal.vue"
import { useForm } from "vee-validate"
import * as yup from "yup"
import { useCreateLocation, useUpdateLocation } from "../api"
import { displayError } from "@/utils/error-handler"
import { toast } from "@/composables/useToast"
import { TLocation, TLocationFormData } from "../types"
import { computed, watch } from "vue"
import { useMediaQuery } from "@vueuse/core"
import GooglePlacesAutocomplete from "@components/GooglePlacesAutocomplete.vue"
import { onInvalidSubmit } from "@/utils/validations"
import { useSettingsStore } from "../store"

type Props = {
  open: boolean
  location?: TLocation | null
}

const props = defineProps<Props>()
const emit = defineEmits(["close", "refresh"])
const title = computed(() => (props.location ? "Update Location" : "Add Location"))
const isMobile = useMediaQuery("(max-width: 768px)")

const { mutate: createFn, isPending } = useCreateLocation()
const { mutate: updateFn, isPending: isUpdating } = useUpdateLocation()

// Lock the Places autocomplete to the store's country (lowercase ISO code).
// The country field in storeDetails should already be an ISO alpha-2 code
// ("NG", "CA", "US") because create-store.vue submits it that way — but if
// for any reason it's a full country name like "Canada", we normalise it via
// a small lookup. Falls back to "ng" if storeDetails hasn't loaded yet.
const settingsStore = useSettingsStore()

// Minimal name→code map for the countries we currently support / are likely
// to see in storeDetails. Extend as we open up more countries.
const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  nigeria: "ng",
  canada: "ca",
  "united states": "us",
  "united states of america": "us",
  usa: "us",
  "united kingdom": "gb",
  uk: "gb",
  ghana: "gh",
  kenya: "ke",
}

const storeCountryCode = computed(() => {
  const raw = settingsStore.storeDetails?.country
  if (!raw) return "ng"
  const lower = raw.toLowerCase().trim()
  // ISO alpha-2 already
  if (lower.length === 2) return lower
  // Fall back to name lookup; default to "ng" if unknown
  return COUNTRY_NAME_TO_CODE[lower] || "ng"
})

// TEMP: surface what's actually in storeDetails so we can confirm the shape.
// Remove once verified.
if (import.meta.env.DEV) {
  console.log("[LocationModal] storeDetails.country =", settingsStore.storeDetails?.country)
  console.log("[LocationModal] resolved countryRestriction =", storeCountryCode.value)
}

const { handleSubmit, setValues, values, errors, setFieldValue } = useForm<TLocationFormData>({
  validationSchema: yup.object({
    name: yup.string().required("Location name is required"),
    address: yup.string().required("Address is required"),
  }),
})

watch(
  () => props.location,
  (newLocation) => {
    if (newLocation) {
      setValues({ name: newLocation.name, address: newLocation.address })
    }
  },
)

const onSubmit = handleSubmit((values) => {
  const onSuccess = () => {
    toast.success(`Location ${props.location ? "updated" : "created"} successfully`)
    emit("refresh")
    emit("close")
  }
  if (props.location) {
    updateFn({ id: props.location.uid, body: values }, { onSuccess, onError: displayError })
  } else {
    createFn(values, { onSuccess, onError: displayError })
  }
}, onInvalidSubmit)
</script>
