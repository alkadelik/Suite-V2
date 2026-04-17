<template>
  <div class="py-8">
    <IconHeader
      iconName="shop-add"
      title="Create your store"
      subtext="Create a unique store link, set your industry, and go live in minutes."
      class="mb-6"
    />

    <AppForm
      :schema="validationSchema"
      @submit="onSubmit"
      v-slot="{ setFieldValue, validateField }"
      class="flex flex-col gap-6"
    >
      <FormField
        name="name"
        label="Store Name"
        placeholder="e.g. smile socks"
        description="This is the name your customers will see. You can change it anytime."
        required
        @update:modelValue="(val: string) => watchStoreNameForSlug(val, setFieldValue)"
      />

      <div>
        <FormField
          name="slug"
          label="Slug"
          placeholder="smile-socks"
          required
          :modelValue="currentSlug"
          @update:modelValue="(val: string) => watchSlugForDisplay(val, setFieldValue)"
        />
        <p class="text-core-400 mt-1.5 inline-flex items-center text-xs font-medium">
          <Icon name="global" size="12" class="mr-1 text-gray-400" />
          {{ isStaging ? "https://storefronts-v2.vercel.app/" : "https://buy.leyyow.com/" }}
          <span class="text-core-600 font-semibold">
            {{ currentSlug || "[SLUG]" }}
          </span>
        </p>
      </div>

      <FormField
        name="industry"
        label="Industry"
        type="select"
        :options="INDUSTRY_OPTIONS"
        placeholder="Select"
        required
      />

      <FormField
        name="country"
        label="Country"
        type="select"
        :options="countryOptions"
        placeholder="Select country"
        required
        @update:modelValue="
          (val: { label: string; value: string }) =>
            onCountryChange(val, setFieldValue, validateField)
        "
      />

      <FormField
        name="currency"
        label="Currency"
        type="select"
        :options="currencyOptions"
        placeholder="Select currency"
        required
        :disabled="!selectedCountryCode"
      />

      <AppButton type="submit" :loading="isPending" label="Create Store" class="w-full" />
    </AppForm>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue"
import { useRouter } from "vue-router"
import * as yup from "yup"
import { toast } from "@/composables/useToast"
import AppForm from "@components/form/AppForm.vue"
import FormField from "@components/form/FormField.vue"
import AppButton from "@components/AppButton.vue"
import Icon from "@components/Icon.vue"
import { useCreateStoreApi } from "../api"
import {
  INDUSTRY_OPTIONS,
  CURRENCY_LABELS,
  updateStoreIndustryOptions,
} from "@modules/shared/constants"
import { slugify } from "@/utils/validations"
import { displayError } from "@/utils/error-handler"
import type { ICreateStorePayload, IStoreFormData } from "../types"
import type { IIndustriesApiResponse } from "@modules/shared/types"
import IconHeader from "@components/IconHeader.vue"
import { useGetStoreIndustries, useGetCountries } from "@/modules/shared/api"
import { useAuthStore } from "../store"
import { isStaging } from "@/utils/others"
import { useSettingsStore } from "@modules/settings/store"
import { TLocation } from "@modules/settings/types"

const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const router = useRouter()

// Fetch industries
const { data: industriesData } = useGetStoreIndustries()
watch<IIndustriesApiResponse | undefined>(
  () => industriesData.value,
  (newData) => {
    if (newData?.data?.results) {
      updateStoreIndustryOptions(newData.data.results)
    }
  },
)

// Fetch countries
const { data: countries } = useGetCountries()

const countryOptions = computed(() => {
  if (!countries.value) return []
  return countries.value.map((c) => ({ label: c.name, value: c.code }))
})

// Track selected country
const selectedCountryCode = ref<string | null>(null)

const selectedCountryData = computed(() => {
  if (!selectedCountryCode.value || !countries.value) return null
  return countries.value.find((c) => c.code === selectedCountryCode.value) ?? null
})

// Currency options based on selected country
const currencyOptions = computed(() => {
  const country = selectedCountryData.value
  if (!country) return []

  const defaultCode = country.default_currency_code
  const options = [{ label: CURRENCY_LABELS[defaultCode] || `${defaultCode}`, value: defaultCode }]

  if (defaultCode !== "USD") {
    options.push({ label: CURRENCY_LABELS["USD"] || "US Dollar (USD)", value: "USD" })
  }

  return options
})

let isInternalCountryUpdate = false

const onCountryChange = (
  val: { label: string; value: string } | null,
  setFieldValue: (field: string, value: unknown) => void,
  validateField: (field: string) => void,
) => {
  if (isInternalCountryUpdate) return
  isInternalCountryUpdate = true

  selectedCountryCode.value = val?.value ?? null
  // Re-validate country to clear any previous error
  setFieldValue("country", val)
  validateField("country")

  // Reset currency and auto-select default
  if (val && countries.value) {
    const country = countries.value.find((c) => c.code === val.value)
    if (country) {
      const defaultCode = country.default_currency_code
      setFieldValue("currency", {
        label: CURRENCY_LABELS[defaultCode] || defaultCode,
        value: defaultCode,
      })
    }
  } else {
    setFieldValue("currency", null)
  }

  void nextTick(() => {
    isInternalCountryUpdate = false
  })
}

// Form validation schema
const validationSchema = yup.object().shape({
  name: yup
    .string()
    .required("Store name is required")
    .min(2, "Store name must be at least 2 characters")
    .max(50, "Store name cannot exceed 50 characters")
    .matches(
      /^[a-zA-Z0-9\s'-]+$/,
      "Store name can only contain letters, numbers, spaces, hyphens and apostrophes",
    ),
  slug: yup
    .string()
    .required("Store slug is required")
    .matches(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
    .min(2, "Slug must be at least 2 characters")
    .max(30, "Slug cannot exceed 30 characters"),
  industry: yup
    .object({
      label: yup.string().required(),
      value: yup.string().required(),
    })
    .required("Please select an industry"),
  country: yup
    .object({
      label: yup.string().required("Please select a country"),
      value: yup.string().required("Please select a country"),
    })
    .required("Please select a country")
    .nullable(),
  currency: yup
    .object({
      label: yup.string().required("Please select a currency"),
      value: yup.string().required("Please select a currency"),
    })
    .required("Please select a currency")
    .nullable(),
})

// Track current slug for display
const currentSlug = ref("")

// API mutation
const { mutate: createStore, isPending } = useCreateStoreApi()

// Form submission handler
const onSubmit = (values: IStoreFormData) => {
  const countryCode = values.country.value
  const currencyCode = values.currency.value
  const isInternational = countryCode !== "NG" || currencyCode === "USD"

  const payload: ICreateStorePayload = {
    name: values.name,
    industry: values.industry.value,
    slug: values.slug,
    country: countryCode,
    currency: currencyCode,
    is_international: isInternational,
  }

  createStore(payload, {
    onSuccess: (res) => {
      toast.success("Store created successfully")
      const { uid, slug } = res.data.data as { uid: string; slug: string }
      authStore.updateAuthUser({ store_uid: uid, store_slug: slug })
      const locations = (res.data.data.locations ?? []) as TLocation[]
      if (locations && locations.length > 0) {
        settingsStore.setActiveLocation(locations[0])
        settingsStore.setLocations(locations)
      }
      // check for redirect query param
      const redirectPath = router.currentRoute.value.query.redirect as string
      window.location.href = redirectPath || "/onboarding"
    },
    onError: displayError,
  })
}

// Watch for store name changes to auto-generate slug
const watchStoreNameForSlug = (
  storeName: string,
  setFieldValue: (field: string, value: unknown) => void,
) => {
  if (storeName) {
    const slug = slugify(storeName)
    currentSlug.value = slug
    setFieldValue("slug", slug)
  }
}

// Watch for slug changes to clean and update display
const watchSlugForDisplay = (
  slug: string,
  setFieldValue: (field: string, value: unknown) => void,
) => {
  if (slug) {
    const cleanSlug = slugify(slug)
    currentSlug.value = cleanSlug
    setFieldValue("slug", cleanSlug)
  }
}
</script>
