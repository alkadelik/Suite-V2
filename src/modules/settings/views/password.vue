<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import AppForm from "@components/form/AppForm.vue"
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
        title="Password"
        size="sm"
        subtitle="Please enter your current password to change your password."
      />

      <AppForm
        @submit="onUpdateProfile"
        :schema="validSchema"
        class="border-core-100 mt-6 rounded-2xl border bg-white"
      >
        <div class="grid gap-6 p-6">
          <FormField
            type="password"
            name="password"
            label="Current Password"
            placeholder="Enter your current password"
            required
          />
          <FormField
            type="password"
            name="new_password"
            label="New Password"
            placeholder="Enter a new password"
            required
          />
          <FormField
            type="password"
            name="confirm_password"
            label="Confirm New Password"
            placeholder="Re-enter your new password"
            required
          />
        </div>

        <div class="border-core-100 flex justify-end gap-6 border-t px-6 py-4">
          <AppButton type="submit" label="Update Password" />
        </div>
      </AppForm>
    </section>
  </div>
</template>
