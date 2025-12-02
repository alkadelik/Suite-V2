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
      v-slot="{ meta }"
      class="flex flex-col gap-6"
      :initialValues="{ currency: CURRENCY_OPTIONS[0] }"
    >
      <FormField
        name="name"
        label="Store Name"
        placeholder="e.g. smile socks"
        description="This is the name your customers will see. You can change it anytime."
        required
        @update:modelValue="watchStoreNameForSlug"
      />

      <div>
        <FormField
          name="slug"
          label="Slug"
          placeholder="smile-socks"
          required
          :modelValue="currentSlug"
          @update:modelValue="watchSlugForDisplay"
        />
        <p class="text-core-400 mt-1.5 inline-flex items-center text-xs font-medium">
          <Icon name="global" size="12" class="mr-1 text-gray-400" />
          {{
            environment === "staging"
              ? "https://storefronts-staging.vercel.app/"
              : "https://shop.leyyow.com/"
          }}
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
        name="currency"
        label="Currency"
        type="select"
        :options="CURRENCY_OPTIONS.slice(0, 1)"
        placeholder="NGN"
        required
        disabled
      />

      <AppButton
        type="submit"
        :loading="isPending"
        label="Create Store"
        class="w-full"
        :disabled="!meta.valid"
      />
    </AppForm>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue"
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
  CURRENCY_OPTIONS,
  updateStoreIndustryOptions,
} from "@modules/shared/constants"
// import { useAuthStore } from "../store"
import { slugify } from "@/utils/validations"
import { displayError } from "@/utils/error-handler"
import type { ICreateStorePayload, IStoreFormData } from "../types"
import type { IIndustriesApiResponse } from "@modules/shared/types"
import IconHeader from "@components/IconHeader.vue"
import { useGetStoreIndustries } from "@/modules/shared/api"
import { useAuthStore } from "../store"

const authStore = useAuthStore()
const router = useRouter()
// const authStore = useAuthStore()
const { data: industriesData } = useGetStoreIndustries()
watch<IIndustriesApiResponse | undefined>(
  () => industriesData.value,
  (newData) => {
    if (newData?.data?.results) {
      updateStoreIndustryOptions(newData.data.results)
    }
  },
)
const environment = import.meta.env.VITE_ENVIRONMENT

// Form validation schema
const validationSchema = yup.object().shape({
  name: yup
    .string()
    .required("Store name is required")
    .min(2, "Store name must be at least 2 characters")
    .max(50, "Store name cannot exceed 50 characters")
    .matches(
      /^[a-zA-Z\s'-]+$/,
      "Store name cannot contain numbers or special characters (except hyphens and apostrophes)",
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
  currency: yup
    .object({
      label: yup.string().required(),
      value: yup.string().required(),
    })
    .required("Please select a currency"),
})

// Track current slug for display
const currentSlug = ref("")

// API mutation
const { mutate: createStore, isPending } = useCreateStoreApi()

// Form submission handler
const onSubmit = (values: IStoreFormData) => {
  const payload: ICreateStorePayload = {
    name: values.name,
    industry: values.industry.value,
    slug: values.slug,
    currency: values.currency.value,
  }

  createStore(payload, {
    onSuccess: (res) => {
      toast.success("Store created successfully")
      console.log("Store created:", res.data.data)
      const { uid, slug } = res.data.data as { uid: string; slug: string }
      authStore.updateAuthUser({ store_uid: uid, store_slug: slug })
      // authStore.setAuthUser({ ...authStore.user, store_uid: uid, store_slug: slug })
      // check for redirect query param
      const redirectPath = router.currentRoute.value.query.redirect as string
      // window.location.href = redirectPath || "/dashboard"
      router.push(redirectPath || "/onboarding")
    },
    onError: displayError,
  })
}

// Watch for store name changes to auto-generate slug
const watchStoreNameForSlug = (storeName: string) => {
  if (storeName) {
    const slug = slugify(storeName)
    currentSlug.value = slug
    // programmatically update slug field if using vee-validate
    // Example:
    // setFieldValue("slug", slug)
  }
}

// Watch for slug changes to clean and update display
const watchSlugForDisplay = (slug: string) => {
  if (slug) {
    const cleanSlug = slugify(slug)
    currentSlug.value = cleanSlug
    // programmatically update slug field here too
    // setFieldValue("slug", cleanSlug)
  }
}
</script>
