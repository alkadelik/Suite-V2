import { useApiMutation } from "@/composables/baseApi"
import { ComputedRef } from "vue"

/** Login api request  */
export function useLogin() {
  return useApiMutation({ url: "/accounts/auth/login/" })
}

/** Register api request  */
export function useRegister() {
  return useApiMutation({ url: "/accounts/signup/" })
}

/** Triggers an email with reset token   */
export function useForgotPassword() {
  return useApiMutation({ url: "/accounts/auth/password/request-token/" })
}

/** Reset password api request  */
export function useResetPassword(otp: ComputedRef<string>) {
  return useApiMutation({ url: `/accounts/auth/password/${otp.value}/reset/` })
}

/** Verify email api request  */
export function useVerifyEmail() {
  return useApiMutation({ url: "/account/verify_email/" })
}

/** Resend verification code api request  */
export function useResendVerificationCode() {
  return useApiMutation({ url: "/account/resend_verification_code/" })
}
