<template>
  <div class="flex flex-col gap-8">
    <BackButton to="/login" label="Back to Login" />

    <SectionHeader title="Confirm Your Email" class="mb-2">
      <template #subtitle>
        <p>We have sent a six-digit code to {{ email }}</p>
        <!-- <button type="button" class="text-primary-600 font-semibold underline underline-offset-4">
          Change email
        </button> -->
      </template>
    </SectionHeader>

    <OtpField v-model="otp" />

    <AppButton
      label="Verify & Continue"
      :loading="isPending"
      :disabled="otp.length !== 6"
      class="w-full"
      @click="onSubmit"
    />

    <p class="text-core-600 text-center text-sm">
      Didn't get the code?
      <button
        @click="onResend"
        class="btn btn-ghost text-primary-600 font-medium"
        :disabled="isResending"
      >
        {{ isResending ? "Resending..." : "Resend Code" }}
      </button>
    </p>
  </div>
</template>

<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import BackButton from "@components/BackButton.vue"
import OtpField from "@components/form/OtpField.vue"
import SectionHeader from "@components/SectionHeader.vue"
import { ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useResendVerificationCode, useVerifyEmail } from "../api"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"
import { useAuthStore } from "../store"

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const email = route.query.email as string
const otp = ref("")

const { mutate: resendCode, isPending: isResending } = useResendVerificationCode()
const { mutate: verifyEmail, isPending } = useVerifyEmail()

const onSubmit = () => {
  verifyEmail(
    { token: otp.value },
    {
      onSuccess: () => {
        toast.success("Email verified successfully")
        authStore.updateAuthUser({ is_email_verified: true })
        router.push("/create-store")
      },
      onError: displayError,
    },
  )
}

const onResend = () => {
  resendCode(null, {
    onSuccess: () => toast.success("Verification code resent"),
    onError: displayError,
  })
}
</script>
