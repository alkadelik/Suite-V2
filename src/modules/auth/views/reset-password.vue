<template>
  <div class="text-core-800 flex flex-col gap-8">
    <RouterLink
      to="/login"
      class="flex gap-2 text-sm font-medium text-neutral-700 transition-colors duration-200 hover:underline"
    >
      <Icon name="back-arrow" />
      Back to Login
    </RouterLink>

    <StepperWizard v-model="activeStep" :steps="[1, 2]" :show-indicators="false">
      <template #default="{ step, onNext }">
        <div v-if="step === 0" class="flex flex-col gap-6">
          <div>
            <h3 class="mb-3 text-3xl font-medium">Check Your Inbox</h3>
            <p class="text-core-600 mb-2 text-sm">
              Enter the 6-digit password reset OTP sent to
              <b class="text-core-800">{{ email }}</b>
            </p>
          </div>
          <OtpInput v-model="otp" />

          <AppButton label="Continue" :disabled="otp.length !== 6" class="w-full" @click="onNext" />

          <p class="text-core-600 text-center text-sm">
            Didn't get the code?
            <button to="/forgot-password" class="btn btn-ghost text-primary-600 font-medium">
              Resend Code
            </button>
          </p>
        </div>

        <div v-if="step === 1">
          <Form
            v-slot="{ errors: formErrors }"
            class="flex flex-col gap-6"
            :validation-schema="schema"
            @submit="onSubmit"
          >
            <div>
              <h3 class="mb-3 text-3xl font-medium">Reset Password</h3>
              <p class="text-core-600 text-sm">
                Enter your new password to complete reset process.
              </p>
            </div>

            <Field
              v-slot="{ field, errors: fieldErrors }"
              name="new_password"
              validate-on-model-update
            >
              <TextInput
                v-bind="field"
                type="password"
                label="New Password"
                placeholder="Enter password"
                name="new_password"
                required
                :error="fieldErrors[0]"
                @update:model-value="newPassword = $event"
              />
            </Field>

            <div>
              <PasswordStrength :model-value="newPassword" />
            </div>

            <Field
              v-slot="{ field, errors: fieldErrors }"
              name="confirm_password"
              validate-on-model-update
            >
              <TextInput
                v-bind="field"
                type="password"
                label="Confirm Password"
                placeholder="Re-enter password"
                name="confirm_password"
                required
                :error="fieldErrors[0]"
              />
            </Field>

            <div class="mt-4">
              <AppButton
                type="submit"
                label="Reset Password"
                :loading="isPending"
                :disabled="isPending || Object.keys(formErrors).length > 0"
                class="w-full"
              />
            </div>
          </Form>
        </div>
      </template>
    </StepperWizard>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { toast } from "vue3-toastify"
import { Form, Field } from "vee-validate"
import * as yup from "yup"

import AppButton from "@components/common/app-button.vue"
import TextInput from "@components/common/text-input.vue"
import { useResetPassword } from "../api"
import { passwordSchema } from "@/utils/validationSchemas"
import PasswordStrength from "@components/others/password-strength.vue"
import StepperWizard from "@components/common/stepper-wizard.vue"
import OtpInput from "@components/common/otp-input.vue"
import Icon from "@components/common/icon.vue"
import { displayError, formatError } from "@/utils/error-handler"

const activeStep = ref(0)
const otp = ref("")
const newPassword = ref("")
const router = useRouter()
const route = useRoute()
const email = route.query.email ? decodeURIComponent(route.query.email as string) : ""

const { mutate: resetPassword, isPending } = useResetPassword()

const schema = yup.object({
  new_password: passwordSchema,
  confirm_password: yup
    .string()
    .oneOf([yup.ref("new_password")], "Passwords do not match")
    .required("Please confirm your password"),
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onSubmit = (values: Record<string, any>) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  resetPassword(
    otp.value,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    { password: values.new_password },
    {
      onSuccess: () => {
        void router.replace("/login")
        setTimeout(() => {
          toast.success("Password reset successfully. Login to continue.")
        }, 100)
      },
      onError: (error: unknown) => {
        displayError(error)
        // or handle separately
        const errorMsg = formatError(error)
        console.error("Login failed!!!", errorMsg)
      },
    },
  )
}
</script>
