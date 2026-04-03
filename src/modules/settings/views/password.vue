<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import AppForm from "@components/form/AppForm.vue"
import FormField from "@components/form/FormField.vue"
import SectionHeader from "@components/SectionHeader.vue"
import * as yup from "yup"
import { useUpdatePassword } from "../api"
import PasswordStrength from "@components/form/PasswordStrength.vue"
import { ref } from "vue"
import { displayError } from "@/utils/error-handler"
import { passwordSchema } from "@/utils/validationSchemas"
import { toast } from "@/composables/useToast"
import { useAuthStore } from "@modules/auth/store"

type TPasswordValues = {
  old_password: string
  new_password: string
  confirm_password: string
}

const validSchema = yup.object({
  old_password: yup.string().required("Current password is required"),
  new_password: passwordSchema,
  confirm_password: yup
    .string()
    .oneOf([yup.ref("new_password")], "Passwords do not match")
    .required("Please confirm your password"),
})

const newPassword = ref("")

const { mutate: updatePassword, isPending } = useUpdatePassword()

const onUpdatePassword = (values: TPasswordValues) => {
  updatePassword(
    { password: values.new_password, old_password: values.old_password },
    {
      onSuccess: () => {
        toast.success("Password updated successfully")
        useAuthStore().logout()
      },
      onError: displayError,
    },
  )
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
        @submit="onUpdatePassword"
        :schema="validSchema"
        v-slot="{ meta }"
        class="border-core-100 mt-6 rounded-2xl border bg-white"
      >
        <div class="grid gap-6 p-6">
          <FormField
            type="password"
            name="old_password"
            label="Current Password"
            placeholder="Enter your current password"
            required
          />

          <div>
            <FormField
              type="password"
              name="new_password"
              label="New Password"
              placeholder="Enter your new password"
              required
              @update:model-value="newPassword = $event"
            />
            <PasswordStrength v-if="newPassword" :model-value="newPassword" />
          </div>

          <FormField
            type="password"
            name="confirm_password"
            label="Confirm New Password"
            placeholder="Re-enter your new password"
            required
          />
        </div>

        <div class="border-core-100 flex justify-end gap-6 border-t px-6 py-4">
          <AppButton
            type="submit"
            label="Update Password"
            :loading="isPending"
            :inactive="!meta.valid"
          />
        </div>
      </AppForm>
    </section>
  </div>
</template>
