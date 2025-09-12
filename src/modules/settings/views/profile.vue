<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import Avatar from "@components/Avatar.vue"
import AppForm from "@components/form/AppForm.vue"
import FileUploadField from "@components/form/FileUploadField.vue"
import FormField from "@components/form/FormField.vue"
import SectionHeader from "@components/SectionHeader.vue"
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
    <section>
      <SectionHeader
        title="Personal Info"
        size="sm"
        subtitle="Update your photo and personal details."
      />

      <AppForm
        @submit="onUpdateProfile"
        :schema="validSchema"
        class="border-core-100 mt-6 rounded-2xl border bg-white"
      >
        <div class="grid grid-cols-2 gap-6 p-6">
          <FormField name="first_name" label="First Name" placeholder="e.g. John" required />
          <FormField name="last_name" label="Last Name" placeholder="e.g. Doe" required />
          <FormField
            name="email"
            label="Email Address"
            placeholder="e.g. john.doe@example.com"
            required
            class="col-span-2"
          />

          <div class="col-span-2 flex gap-6">
            <Avatar name="John Doe" size="lg" />

            <div class="flex-1">
              <FileUploadField
                name="profile_picture"
                label="Profile Picture"
                accept="image/*"
                :show-preview="true"
                placeholder="Upload a profile picture"
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
        title="KYC"
        size="sm"
        subtitle="We require your BVN and ID to verify your identity as part of KYC regulations."
      />

      <AppForm
        @submit="onUpdateProfile"
        :schema="validSchema"
        class="border-core-100 mt-6 rounded-2xl border bg-white"
      >
        <div class="flex flex-col gap-6 p-6">
          <FormField
            type="select"
            name="id_type"
            label="Select ID"
            :options="[
              { label: 'Passport', value: 'passport' },
              { label: `Driver's License`, value: 'drivers_license' },
              { label: 'National ID', value: 'national_id' },
            ]"
            placeholder="e.g. John"
            required
          />

          <FileUploadField
            name="id_picture"
            label="Click to upload your ID"
            accept="image/*"
            :show-preview="true"
            placeholder="Upload your ID"
            class="w-full"
          />

          <FormField
            name="license_number"
            label="License Number"
            placeholder="e.g. ABC123456"
            required
          />

          <FormField name="bvn" label="BVN" placeholder="e.g. 12345678901" required />
        </div>

        <div class="border-core-100 flex justify-end gap-6 border-t px-6 py-4">
          <AppButton type="submit" label="Save Changes" />
        </div>
      </AppForm>
    </section>
  </div>
</template>
