<script setup lang="ts">
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"
import { onInvalidSubmit, slugify } from "@/utils/validations"
import AppButton from "@components/AppButton.vue"
import Avatar from "@components/Avatar.vue"
import FormField from "@components/form/FormField.vue"
import Icon from "@components/Icon.vue"
import SectionHeader from "@components/SectionHeader.vue"
import { useAuthStore } from "@modules/auth/store"
import { CURRENCY_OPTIONS } from "@modules/shared/constants"
import { useForm } from "vee-validate"
import { ref } from "vue"
import { computed, watch } from "vue"
import * as yup from "yup"
import { useGetStoreDetails, useGetStoreIndustries, useUpdateStoreDetails } from "../api"
import { IStoreDetailsForm, IUpdateStoreDetailsPayload } from "../types"
import AccountNumberSection from "../components/store-details/AccountNumberSection.vue"
import { useGetLiveStatus } from "@modules/shared/api"

const validSchema = yup.object({
  store_name: yup.string().required("Store name is required"),
  currency: yup.object().required("Currency is required"),
  store_email: yup.string().email("Invalid email").required("Store email is required"),
  store_phone: yup.string().required("Store phone is required"),
  support_email: yup.string().email("Invalid email").required("Support email is required"),
  support_phone: yup.string().required("Support phone is required"),
  industry: yup.object().required("Industry is required"),
  instagram_handle: yup.string(),
  logo: yup.mixed().nullable(),
})

const { user } = useAuthStore()

const { data: industries } = useGetStoreIndustries()
const { data: storeDetails, refetch } = useGetStoreDetails(user?.store_uid || "")
const { mutate: updateStoreDetails } = useUpdateStoreDetails()
const { data: liveStatusData } = useGetLiveStatus(user?.store_slug || "")
const isLive = computed(() => liveStatusData.value?.data?.is_live || false)

const { handleSubmit: handleStoreSubmit, setValues: setStoreValues } = useForm<IStoreDetailsForm>({
  validationSchema: validSchema,
})

const onSubmitStoreDetails = handleStoreSubmit((formData) => {
  const payload = new FormData()

  payload.append("name", formData.store_name)
  payload.append("currency", formData.currency.value)
  payload.append("store_email", formData.store_email)

  // Format phone numbers: add +234 and remove leading 0
  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\s+/g, "").replace(/^0+/, "")
    return `+234${cleaned}`
  }

  payload.append("store_phone", formatPhoneNumber(formData.store_phone))
  payload.append("support_email", formData.support_email)
  payload.append("support_phone", formatPhoneNumber(formData.support_phone))
  payload.append("industry", formData.industry.value)

  if (formData.instagram_handle) {
    payload.append("instagram_handle", formData.instagram_handle)
  }

  if (formData.logo instanceof File) {
    payload.append("logo", formData.logo)
  }

  if (!user?.store_uid) {
    return toast.error("Store ID not found")
  }

  updateStoreDetails(
    { id: user.store_uid, body: payload as unknown as IUpdateStoreDetailsPayload },
    {
      onSuccess: () => {
        toast.success("Store details updated successfully")
        refetch()
      },
      onError: displayError,
    },
  )
}, onInvalidSubmit)

const currentSlug = ref("")

watch(
  storeDetails,
  (newDetails) => {
    if (newDetails) {
      setStoreValues({
        store_name: newDetails.name,
        industry: { label: newDetails.industry_name, value: newDetails.industry },
        currency: { label: "Nigerian Naira", value: "NGN" },
        store_email: newDetails.store_email,
        store_phone: newDetails.store_phone,
        support_email: newDetails.support_email,
        support_phone: newDetails.support_phone,
        instagram_handle: newDetails.instagram_handle,
        logo: (newDetails.logo as File) || null,
      })

      if (newDetails.slug) currentSlug.value = newDetails.slug
    }
  },
  { immediate: true },
)

const INDUSTRIES = computed(() => {
  if (!industries.value?.results) return []
  return industries.value?.results.map((industry) => ({
    label: industry.name,
    value: industry.uid,
  }))
})

// Watch for store name changes to auto-generate slug
const watchStoreNameForSlug = (storeName: string) => {
  if (storeName) {
    const slug = slugify(storeName)
    currentSlug.value = slug
  }
}
</script>

<template>
  <div>
    <div
      v-if="!isLive"
      class="bg-primary-25 text-warning-700 border-warning-300 flex flex-col items-start gap-3 border-b px-6 py-3 md:flex-row md:items-center"
    >
      <span
        class="border-primary-200 ring-primary-100 hidden size-8 items-center justify-center rounded-full border-2 p-0.5 ring-2 ring-offset-2 md:flex"
      >
        <Icon name="info-circle" size="20" />
      </span>
      <div class="flex flex-1 flex-col gap-1 text-sm md:flex-row">
        <span class="font-medium">Your storefront isn't live yet! </span> Complete your bank
        details, delivery options, and KYC to start selling online.
      </div>
      <AppButton
        variant="text"
        label="Complete Setup"
        icon="arrow-right"
        size="sm"
        class="flex-row-reverse underline underline-offset-4"
        @click="$router.push('/onboarding')"
      />
    </div>

    <section class="mt-5">
      <SectionHeader
        title="Basic Details"
        subtitle="Set up the essential details that represent your store online."
        size="sm"
      />

      <form
        @submit.prevent="onSubmitStoreDetails"
        class="border-core-100 mt-6 rounded-2xl border bg-white"
      >
        <div class="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
          <div>
            <FormField
              name="store_name"
              label="Store Name"
              placeholder="e.g. John's Store"
              required
              @update:modelValue="watchStoreNameForSlug"
            />
            <p class="text-core-400 mt-1.5 inline-flex items-center text-xs font-medium">
              <Icon name="global" size="12" class="mr-1 text-gray-400" />
              {{ "https://shop.leyyow.com/" }}
              <span class="text-core-600 font-semibold">
                {{ currentSlug || "[SLUG]" }}
              </span>
            </p>
          </div>

          <FormField
            name="currency"
            label="Currency"
            type="select"
            :options="CURRENCY_OPTIONS"
            placeholder="NGN"
            required
          />

          <FormField
            name="store_email"
            label="Store Email"
            placeholder="e.g. john.doe@example.com"
            required
          />

          <FormField
            name="store_phone"
            label="Store Phone"
            prefix="+234"
            placeholder="8012345678"
            required
          />

          <FormField
            name="support_email"
            label="Support Email"
            placeholder="e.g. john.doe@example.com"
            required
          />

          <FormField
            name="support_phone"
            label="Support Phone"
            prefix="+234"
            placeholder="8012345678"
            required
          />

          <FormField
            name="industry"
            label="Industry"
            type="select"
            :options="INDUSTRIES"
            placeholder="Select"
            required
          />

          <FormField
            name="instagram_handle"
            label="Instagram Handle"
            placeholder="e.g. @yourstore"
          />

          <div class="flex gap-6 md:col-span-2">
            <div v-if="false" class="flex flex-col items-center gap-2">
              <Avatar
                :name="storeDetails?.name || 'Store Logo'"
                :src="storeDetails?.logo"
                size="lg"
              />
              <span class="text-sm text-gray-600">Current Logo</span>
            </div>

            <div class="flex-1">
              <FormField
                type="file"
                name="logo"
                label="Click to upload logo"
                accept="image/*"
                :show-preview="true"
                placeholder="Upload a logo"
                class="w-full"
              />
            </div>
          </div>
        </div>

        <div class="border-core-100 flex justify-end gap-6 border-t px-6 py-4">
          <AppButton type="submit" label="Save Changes" />
        </div>
      </form>
    </section>

    <AccountNumberSection />
  </div>
</template>
