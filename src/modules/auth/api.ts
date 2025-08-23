import baseApi, { TApiPromise } from "@/composables/baseApi"
import { useMutation } from "@tanstack/vue-query"
import { ILoginResponse, TLoginPayload, TSignupPayload } from "./types"

/** Login api request  */
export function useLogin() {
  return useMutation({
    mutationFn: (body: TLoginPayload): TApiPromise<ILoginResponse> =>
      baseApi.post("/accounts/auth/login/", body),
  })
}

/** Register api request  */
export function useRegister() {
  return useMutation({
    mutationFn: (body: TSignupPayload): TApiPromise<ILoginResponse> =>
      baseApi.post("/accounts/signup/", body),
  })
}

/** Verify email api request  */
export function useVerifyEmail() {
  return useMutation({
    mutationFn: (body) => baseApi.post("/account/verify_email/", body),
  })
}

/** Resend verification code api request  */
export function useResendVerificationCode() {
  return useMutation({
    mutationFn: (body) => baseApi.post("/account/resend_verification_code/", body),
  })
}

/** Triggers an email with reset token   */
export function useSendResetTokenEmail() {
  return useMutation({
    mutationFn: (body) => baseApi.post("/account/change_password/", body),
  })
}

/** Reset password api request  */
export function useResetPasswordApi() {
  return useMutation({
    mutationFn: (body) => baseApi.post("/account/reset_password/", body),
  })
}
