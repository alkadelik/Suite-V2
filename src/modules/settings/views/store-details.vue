<script setup lang="ts">
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"
import { onInvalidSubmit } from "@/utils/validations"
import AppButton from "@components/AppButton.vue"
import Avatar from "@components/Avatar.vue"
import FormField from "@components/form/FormField.vue"
import Icon from "@components/Icon.vue"
import SectionHeader from "@components/SectionHeader.vue"
import StorefrontNotLiveBanner from "@components/StorefrontNotLiveBanner.vue"
import StoreDetailsSkeleton from "../components/skeletons/StoreDetailsSkeleton.vue"
import { useAuthStore } from "@modules/auth/store"
import { useSettingsStore } from "@modules/settings/store"
import { CURRENCY_OPTIONS } from "@modules/shared/constants"
import { useFieldValue, useForm } from "vee-validate"
import { computed, watch } from "vue"
import * as yup from "yup"
import {
  useCheckSlugTaken,
  useGetCustomDomains,
  useGetStoreDetails,
  useGetStoreIndustries,
  useUpdateStoreDetails,
} from "../api"
import { useDebouncedRef } from "@/composables/useDebouncedRef"
import { IStoreDetailsForm, IUpdateStoreDetailsPayload } from "../types"
import AccountNumberSection from "../components/store-details/AccountNumberSection.vue"
import { formatPhoneNumber, isStaging } from "@/utils/others"

const validSchema = yup.object({
  store_name: yup.string().required("Store name is required"),
  slug: yup
    .string()
    .required("Store slug is required")
    .matches(/^[a-z0-9-]+$/, "Store slug can only contain lowercase letters, numbers, and hyphens")
    .min(2, "Store slug must be at least 2 characters")
    .max(30, "Store slug cannot exceed 30 characters"),
  currency: yup.object().required("Currency is required"),
  store_email: yup.string().email("Invalid email").nullable(),
  store_phone: yup.string().nullable(),
  support_email: yup.string().email("Invalid email").nullable(),
  support_phone: yup.string().nullable(),
  industry: yup.object().required("Industry is required"),
  instagram_handle: yup.string().nullable(),
  logo: yup.mixed().nullable(),
})

const { user, updateAuthUser } = useAuthStore()

const { data: industries, isPending: isLoadingIndustries } = useGetStoreIndustries()
const {
  data: storeDetails,
  refetch,
  isPending: isLoadingDetails,
} = useGetStoreDetails(user?.store_uid || "")
const { data: customDomainsData, isPending: isLoadingDomains } = useGetCustomDomains()
const settingsStore = useSettingsStore()
const customDomain = computed(() => customDomainsData.value?.results?.[0] ?? null)
const activeCustomDomain = computed(
  () => customDomainsData.value?.results?.find((domain) => domain.status === "ACTIVE") ?? null,
)
const isSlugLockedByCustomDomain = computed(() => !!customDomain.value)

const isLoading = computed(
  () => isLoadingIndustries.value || isLoadingDetails.value || isLoadingDomains.value,
)

const { mutate: updateStoreDetails, isPending: isUpdating } = useUpdateStoreDetails()

const { handleSubmit: handleStoreSubmit, setValues: setStoreValues } = useForm<IStoreDetailsForm>({
  validationSchema: validSchema,
})

// Drive the slug preview from the live vee-validate field value so the input is
// owned solely by vee-validate (LYW-2573).
const slugValue = useFieldValue<string>("slug")

// Debounced slug availability check, mirroring the bank-account verification UX
// (LYW-2573). Only runs for a validly-shaped slug that differs from the saved one.
const debouncedSlug = useDebouncedRef(slugValue, 600)
const slugCheckEnabled = computed(() => {
  const slug = debouncedSlug.value
  return (
    !isSlugLockedByCustomDomain.value &&
    !!slug &&
    slug !== storeDetails.value?.slug &&
    slug.length >= 2 &&
    /^[a-z0-9-]+$/.test(slug)
  )
})
const { data: slugTaken, isFetching: isCheckingSlug } = useCheckSlugTaken(
  () => debouncedSlug.value || "",
  slugCheckEnabled,
)

const onSubmitStoreDetails = handleStoreSubmit((formData) => {
  // Block saving while the slug is taken or still being checked (LYW-2573).
  if (slugCheckEnabled.value && (isCheckingSlug.value || slugTaken.value)) {
    return toast.error("Please choose an available store slug")
  }

  const payload = new FormData()

  payload.append("name", formData.store_name)
  if (!isSlugLockedByCustomDomain.value) {
    payload.append("slug", formData.slug)
  }
  payload.append("currency", formData.currency.value)

  // Always send these (even when empty) so clearing a previously-saved value
  // persists — an absent field leaves the old value unchanged on the backend.
  payload.append("store_email", formData.store_email || "")
  payload.append("store_phone", formData.store_phone ? formatPhoneNumber(formData.store_phone) : "")
  payload.append("support_email", formData.support_email || "")
  payload.append(
    "support_phone",
    formData.support_phone ? formatPhoneNumber(formData.support_phone) : "",
  )

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

watch(
  storeDetails,
  (newDetails) => {
    if (newDetails) {
      // Hydrate the persisted settings store directly so a freshly-saved slug
      // propagates app-wide (live-status, storefront URL) even when the
      // LocationDropdown hydration watcher isn't mounted.
      settingsStore.setStoreDetails(newDetails)
      // Keep the persisted auth snapshot's slug in sync — it's the live-status
      // fallback and is otherwise only refreshed at the next login.
      if (newDetails.slug && user?.store_slug !== newDetails.slug) {
        updateAuthUser({ store_slug: newDetails.slug })
      }
      setStoreValues({
        store_name: newDetails.name,
        slug: newDetails.slug,
        industry: { label: newDetails.industry_name, value: newDetails.industry },
        currency: { label: "Nigerian Naira", value: "NGN" },
        store_email: newDetails.store_email,
        store_phone: newDetails.store_phone,
        support_email: newDetails.support_email,
        support_phone: newDetails.support_phone,
        instagram_handle: newDetails.instagram_handle,
        logo: (newDetails.logo as File) || null,
      })
    }
  },
  { immediate: true },
)

watch(
  activeCustomDomain,
  (domain) => {
    settingsStore.setActiveCustomDomain(domain?.domain ?? null)
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
</script>

<template>
  <StoreDetailsSkeleton v-if="isLoading" />
  <div v-else>
    <StorefrontNotLiveBanner />

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
          <FormField
            name="store_name"
            label="Store Name"
            placeholder="e.g. John's Store"
            required
          />

          <div>
            <div class="mb-1.5 flex items-center justify-between">
              <label class="text-core-800 text-sm font-medium">
                Store Slug <span class="text-red-500">*</span>
              </label>
              <span
                v-if="
                  !isSlugLockedByCustomDomain &&
                  slugCheckEnabled &&
                  (isCheckingSlug || slugTaken !== undefined)
                "
                :class="[
                  'inline-flex items-center gap-1 text-xs font-medium',
                  isCheckingSlug
                    ? 'text-core-800'
                    : slugTaken
                      ? 'text-error-600'
                      : 'text-green-800',
                ]"
              >
                <Icon
                  v-if="!isCheckingSlug && slugTaken === false"
                  name="check-circle"
                  size="14"
                  class="[&_path]:fill-current"
                />
                {{
                  isCheckingSlug
                    ? "Checking availability..."
                    : slugTaken
                      ? "Slug is already taken"
                      : "Slug is available"
                }}
              </span>
            </div>
            <FormField
              name="slug"
              placeholder="e.g. johns-store"
              required
              hide-label
              :disabled="isSlugLockedByCustomDomain"
            />
            <p class="text-core-400 mt-1.5 inline-flex items-center text-xs font-medium">
              <Icon name="global" size="12" class="mr-1 text-gray-400" />
              {{ `https://${isStaging ? "storefronts-v2.vercel.app" : "buy.leyyow.com"}/` }}
              <span class="text-core-600 font-semibold">
                {{ slugValue || "[SLUG]" }}
              </span>
            </p>
            <p v-if="isSlugLockedByCustomDomain" class="text-core-500 mt-1 text-xs">
              Locked while {{ customDomain?.domain }} is connected or being set up.
            </p>
          </div>

          <FormField
            name="currency"
            label="Currency"
            type="select"
            :options="CURRENCY_OPTIONS"
            placeholder="NGN"
            required
            :disabled="true"
          />

          <FormField
            name="store_email"
            label="Store Email"
            placeholder="e.g. john.doe@example.com"
          />

          <FormField type="tel" name="store_phone" label="Store Phone" placeholder="8012345678" />

          <FormField
            name="support_email"
            label="Support Email"
            placeholder="e.g. john.doe@example.com"
          />

          <FormField
            type="tel"
            name="support_phone"
            label="Support Phone"
            placeholder="8012345678"
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
          <AppButton type="submit" label="Save Changes" :loading="isUpdating" />
        </div>
      </form>
    </section>

    <AccountNumberSection />
  </div>
</template>
