<template>
  <div class="flex flex-col gap-8">
    <!-- ── Change Email Screen ── -->
    <template v-if="showChangeEmail">
      <BackButton label="Back" @click="showChangeEmail = false" />

      <SectionHeader title="Change your email" class="mb-2">
        <template #subtitle>
          <p>Enter the new email address you'd like to use for this account.</p>
        </template>
      </SectionHeader>

      <TextField
        v-model="newEmail"
        type="email"
        name="new_email"
        label="New Email Address"
        placeholder="Enter new email address"
        :error="changeEmailError"
        required
      />

      <AppButton
        label="Update Email"
        :loading="isRequestingChange"
        :disabled="!newEmail || newEmail === displayEmail"
        class="w-full"
        @click="onRequestEmailChange"
      />
    </template>

    <!-- ── Verify OTP Screen ── -->
    <template v-else>
      <BackButton :to="`/login${redirectStr}`" label="Back to Login" />

      <SectionHeader title="Confirm your email" class="mb-2">
        <template #subtitle>
          <p>
            We've sent a six-digit code to {{ displayEmail }}.
            <button
              type="button"
              class="text-primary-600 font-semibold underline underline-offset-4"
              @click="showChangeEmail = true"
            >
              Change email
            </button>
          </p>
        </template>
      </SectionHeader>

      <div class="bg-primary-25 border-primary-300 rounded-lg border px-4 py-3 text-sm">
        <p class="text-primary-700">
          We've sent a verification code to your email. It may take a moment to arrive — be sure to
          check your junk or spam folder.
        </p>
      </div>

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
          {{ isResending ? "Resending..." : "Resend code" }}
        </button>
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import BackButton from "@components/BackButton.vue"
import OtpField from "@components/form/OtpField.vue"
import TextField from "@components/form/TextField.vue"
import SectionHeader from "@components/SectionHeader.vue"
import { computed, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import {
  useResendVerificationCode,
  useVerifyEmail,
  useRequestEmailChange,
  useConfirmEmailChange,
} from "../api"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"
import { useAuthStore } from "../store"

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const originalEmail = authStore.user?.email || (route.query.email as string)
const currentEmail = ref(originalEmail)
const otp = ref("")

// Change email state
const showChangeEmail = ref(false)
const newEmail = ref("")
const changeEmailError = ref("")
const emailChangeMode = ref(false)

const displayEmail = computed(() => currentEmail.value || originalEmail)

const { mutate: resendCode, isPending: isResending } = useResendVerificationCode()
const { mutate: verifyEmail, isPending } = useVerifyEmail()
const { mutate: requestEmailChange, isPending: isRequestingChange } = useRequestEmailChange()
const { mutate: confirmEmailChange } = useConfirmEmailChange()

const redirectStr = computed(() =>
  router.currentRoute.value.query.redirect
    ? `?redirect=${router.currentRoute.value.query.redirect as string}`
    : "",
)

const onRequestEmailChange = () => {
  changeEmailError.value = ""

  if (!newEmail.value || !newEmail.value.includes("@")) {
    changeEmailError.value = "Please enter a valid email address"
    return
  }

  requestEmailChange(
    { old_email: currentEmail.value, new_email: newEmail.value },
    {
      onSuccess: () => {
        currentEmail.value = newEmail.value
        emailChangeMode.value = true
        showChangeEmail.value = false
        otp.value = ""
        toast.success(`Verification code sent to ${newEmail.value}`)
        newEmail.value = ""
      },
      onError: (error: unknown) => {
        const err = error as { response?: { data?: { error?: string; detail?: string } } }
        changeEmailError.value =
          err?.response?.data?.error || err?.response?.data?.detail || "Failed to change email"
      },
    },
  )
}

const onSubmit = () => {
  if (emailChangeMode.value) {
    confirmEmailChange(
      { otp: otp.value },
      {
        onSuccess: (res) => {
          toast.success("Email changed and verified successfully")
          const profile = res?.data?.data
          if (profile?.email) {
            authStore.updateAuthUser({ email: profile.email, is_email_verified: true })
          } else {
            authStore.updateAuthUser({ is_email_verified: true })
          }
          router.push(`/create-store${redirectStr.value}`)
        },
        onError: displayError,
      },
    )
  } else {
    verifyEmail(
      { token: otp.value },
      {
        onSuccess: () => {
          toast.success("Email verified successfully")
          authStore.updateAuthUser({ is_email_verified: true })
          router.push(`/create-store${redirectStr.value}`)
        },
        onError: displayError,
      },
    )
  }
}

const onResend = () => {
  if (emailChangeMode.value) {
    requestEmailChange(
      { old_email: originalEmail, new_email: currentEmail.value },
      {
        onSuccess: () => toast.success("Verification code resent"),
        onError: displayError,
      },
    )
  } else {
    resendCode(null, {
      onSuccess: () => toast.success("Verification code resent"),
      onError: displayError,
    })
  }
}
</script>
