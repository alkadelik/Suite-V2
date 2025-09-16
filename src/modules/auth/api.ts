import baseApi, { TApiPromise } from "@/composables/baseApi"
import { useMutation } from "@tanstack/vue-query"
import {
  ILoginResponse,
  TLoginPayload,
  TResetPasswordPayload,
  TSignupPayload,
  ICreateStorePayload,
  TSignupWithInvitePayload,
} from "./types"

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

/** Triggers an email with reset token   */
export function useForgotPassword() {
  return useMutation({
    mutationFn: (body: { email: string }) =>
      baseApi.post("/accounts/auth/password/request-token/", body),
  })
}

/** Verify token api request */
export function useVerifyToken() {
  return useMutation({
    mutationFn: (forgot_password_token: string) =>
      baseApi.get(`/accounts/auth/password/${forgot_password_token}/reset/`),
  })
}

/** Reset password api request  */
export function useResetPassword() {
  return useMutation({
    mutationFn: ({ forgot_password_token, ...body }: TResetPasswordPayload) =>
      baseApi.post(`/accounts/auth/password/${forgot_password_token}/reset/`, body),
  })
}

/** Verify email api request  */
export function useVerifyEmail() {
  return useMutation({
    mutationFn: (body: { token: string }) => baseApi.post("/accounts/verifications/email/", body),
  })
}

/** Resend verification code api request  */
export function useResendVerificationCode() {
  return useMutation({
    mutationFn: (body: unknown) =>
      baseApi.post("/accounts/verifications/resend-email-token/", body || {}),
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
/** Create store api request  */
export function useCreateStoreApi() {
  return useMutation({
    mutationFn: (body: ICreateStorePayload) => baseApi.post("/stores/", body),
  })
}

/** sign up with invite code  */
export function useSignupWithInvite() {
  return useMutation({
    mutationFn: (body: TSignupWithInvitePayload) =>
      baseApi.post("/accounts/signup/with-invite/", body),
  })
}
