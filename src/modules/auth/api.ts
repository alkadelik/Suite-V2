import { useApiMutation } from "@/composables/baseApi"

/** Login api request  */
export function useLogin() {
  return useApiMutation({ url: "/account/get_auth_token/" })
}

/** Register api request  */
export function useRegister() {
  return useApiMutation({ url: "/account/register/" })
}

/** Verify email api request  */
export function useVerifyEmail() {
  return useApiMutation({ url: "/account/verify_email/" })
}

/** Resend verification code api request  */
export function useResendVerificationCode() {
  return useApiMutation({ url: "/account/resend_verification_code/" })
}

/** Triggers an email with reset token   */
export function useSendResetTokenEmail() {
  return useApiMutation({ url: "/account/change_password/" })
}

/** Reset password api request  */
export function useResetPasswordApi() {
  return useApiMutation({ url: "/account/reset_password/" })
}
