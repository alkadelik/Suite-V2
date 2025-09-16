<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import Avatar from "@components/Avatar.vue"
import AppForm from "@components/form/AppForm.vue"
import FileUploadField from "@components/form/FileUploadField.vue"
import FormField from "@components/form/FormField.vue"
import Icon from "@components/Icon.vue"
import SectionHeader from "@components/SectionHeader.vue"
import { CURRENCY_OPTIONS, INDUSTRY_OPTIONS } from "@modules/shared/constants"
import * as yup from "yup"

const validSchema = yup.object({
  first_name: yup.string().required("First name is required"),
  last_name: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
})

const onUpdateProfile = (formData: Record<string, unknown>) => {
  console.log("Form submitted with data:", formData)
}
</script>

<template>
  <div>
    <div
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
      />
    </div>

    <section class="mt-5">
      <SectionHeader
        title="Basic Details"
        subtitle="Set up the essential details that represent your store online."
        size="sm"
      />

      <AppForm
        @submit="onUpdateProfile"
        :schema="validSchema"
        class="border-core-100 mt-6 rounded-2xl border bg-white"
      >
        <div class="grid grid-cols-2 gap-6 p-6">
          <div>
            <FormField
              name="store_name"
              label="Store Name"
              placeholder="e.g. John's Store"
              required
            />
            <p class="text-core-400 mt-1.5 inline-flex items-center text-xs font-medium">
              <Icon name="global" size="12" class="mr-1 text-gray-400" />
              https://shop.leyyow.com/
              <span class="text-core-600 font-semibold"> [SLUG] </span>
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
            :options="INDUSTRY_OPTIONS"
            placeholder="Select"
            required
          />

          <FormField
            name="instagram_handle"
            label="Instagram Handle"
            placeholder="e.g. @yourstore"
          />

          <div class="col-span-2 flex gap-6">
            <div>
              <Avatar name="John Doe" size="lg" />
              <span>Store Logo</span>
            </div>

            <div class="flex-1">
              <FileUploadField
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
      </AppForm>
    </section>

    <section class="mt-10">
      <SectionHeader
        title="Bank Account Details"
        subtitle="This is the bank account where you’ll receive payments from your orders on Leyyow."
        size="sm"
      />

      <AppForm
        @submit="onUpdateProfile"
        :schema="validSchema"
        class="border-core-100 mt-6 rounded-2xl border bg-white"
      >
        <div class="flex flex-col gap-6 p-6">
          <FormField
            name="account_number"
            label="Account Number"
            placeholder="e.g. 1234567890"
            required
          />

          <FormField
            name="bank_name"
            type="select"
            label="Bank Name"
            placeholder="Select your bank"
            required
            searchable
            :options="[]"
          />
          <!-- :hint="
              isLoading
                ? 'Loading...'
                : isResolving
                  ? 'Validating...'
                  : accountName
                    ? accountName
                    : ''
            " -->
        </div>

        <div class="border-core-100 flex justify-end gap-6 border-t px-6 py-4">
          <AppButton type="submit" label="Save Changes" />
        </div>
      </AppForm>
    </section>
  </div>
</template>
