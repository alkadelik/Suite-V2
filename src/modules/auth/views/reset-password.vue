<template>
  <div class="flex flex-col gap-8">
    <BackButton icon="back-arrow" label="Back to Login" to="/login" class="!text-core-700" />

    <StepperWizard v-model="activeStep" :steps="[1, 2]" :show-indicators="false" v-slot="{ step }">
      <div v-if="step === 0" class="flex flex-col gap-6">
        <SectionHeader
          title="Check Your Inbox"
          subtitle="Enter your email to receive instructions on how to reset your password."
          size="lg"
        >
          <template #subtitle>
            Enter the 6-digit password reset OTP sent to
            <b class="text-core-800">{{ email }}</b>
          </template>
        </SectionHeader>

        <OtpField v-model="otp" />

        <AppButton
          label="Continue"
          :disabled="otp.length !== 6"
          :loading="verifyTokenPending"
          class="w-full"
          @click="verifyToken"
        />

        <p class="text-core-600 text-center text-sm">
          Didn't get the code?
          <button to="/forgot-password" class="btn btn-ghost text-primary-600 font-medium">
            Resend Code
          </button>
        </p>
      </div>

      <div v-if="step === 1">
        <AppForm :schema="schema" @submit="onSubmit" v-slot="{ meta }" class="space-y-8">
          <SectionHeader
            title="Reset Password"
            subtitle="Enter your new password to complete reset process."
          />

          <div>
            <FormField
              name="password"
              type="password"
              placeholder="Enter password"
              required
              @update:model-value="newPassword = $event"
            />
            <PasswordStrength v-if="newPassword" :model-value="newPassword" />
          </div>

          <FormField
            type="password"
            placeholder="Re-enter password"
            name="confirm_password"
            required
          />

          <AppButton
            type="submit"
            label="Reset Password"
            :loading="isPending"
            :disabled="!meta.valid"
            class="w-full"
          />
        </AppForm>
      </div>
    </StepperWizard>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { toast } from "@/composables/useToast"
import * as yup from "yup"
import { useResetPassword, useVerifyToken } from "../api"
import { passwordSchema } from "@/utils/validationSchemas"
import PasswordStrength from "@components/form/PasswordStrength.vue"
import StepperWizard from "@components/StepperWizard.vue"
import { displayError } from "@/utils/error-handler"
import BackButton from "@components/BackButton.vue"
import SectionHeader from "@components/SectionHeader.vue"
import OtpField from "@components/form/OtpField.vue"
import AppForm from "@components/form/AppForm.vue"
import FormField from "@components/form/FormField.vue"
import AppButton from "@components/AppButton.vue"
import { TResetPasswordPayload } from "../types"

const activeStep = ref(0)
const otp = ref("")
const newPassword = ref("")
const router = useRouter()
const route = useRoute()
const email = route.query.email ? decodeURIComponent(route.query.email as string) : ""
const { mutate: resetPassword, isPending } = useResetPassword()
const { mutate: verifyTokenMutation, isPending: verifyTokenPending } = useVerifyToken()

const schema = yup.object({
  password: passwordSchema,
  confirm_password: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Please confirm your password"),
})

const verifyToken = () => {
  if (otp.value.length === 6) {
    verifyTokenMutation(otp.value, {
      onSuccess: () => {
        // Token is valid, proceed to next step
        activeStep.value = 1
        toast.success("OTP verified successfully")
      },
      onError: (error) => {
        displayError(error)
      },
    })
  }
}

const onSubmit = (values: TResetPasswordPayload) => {
  resetPassword(
    { password: values.password, forgot_password_token: otp.value },
    {
      onSuccess: () => {
        toast.success("Password reset successfully. Login to continue.")
        router.replace("/login")
      },
      onError: (error) => displayError(error),
    },
  )
}
</script>
