<template>
  <div class="text-core-800 px-4 py-10 md:p-20">
    <div class="mb-4">
      <img src="/images/logos/leyyow-logo-2.svg?url" alt="leyyow logo" class="mb-40 h-8" />
      <h1 class="mb-3.5 text-4xl font-medium md:text-5xl">Let's get started</h1>
      <p class="text-core-600">Create your free Leyyow account and get your store online today.</p>
    </div>

    <Form
      v-slot="{ meta }"
      :validation-schema="validationSchema"
      @submit="onSubmit"
      @invalid-submit="onInvalidSubmit"
    >
      <div class="flex flex-col gap-4">
        <div class="grid gap-3 md:grid-cols-2">
          <Field v-slot="{ field, errors: fieldErrors }" name="first_name" validate-on-model-update>
            <TextInput
              v-bind="field"
              label="First Name"
              placeholder="e.g. John"
              name="first_name"
              required
              :error="fieldErrors[0]"
            />
          </Field>

          <Field v-slot="{ field, errors: fieldErrors }" name="last_name" validate-on-model-update>
            <TextInput
              v-bind="field"
              label="Last Name"
              placeholder="e.g. Doe"
              name="last_name"
              :error="fieldErrors[0]"
            />
          </Field>
        </div>

        <Field v-slot="{ field, errors: fieldErrors }" name="email" validate-on-model-update>
          <TextInput
            v-bind="field"
            type="email"
            label="Email"
            placeholder="example@gmail.com"
            name="email"
            required
            :error="fieldErrors[0]"
          />
        </Field>

        <Field
          v-slot="{ field, errors: fieldErrors, value }"
          name="password"
          validate-on-model-update
        >
          <div>
            <TextInput
              v-bind="field"
              type="password"
              label="Password"
              placeholder="Enter password"
              name="password"
              required
              :error="fieldErrors[0]"
              @update:model-value="currentPassword = $event"
            />
            <PasswordStrength v-if="value" :model-value="value" />
          </div>
        </Field>

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
        <p class="mt-2 text-center text-sm">
          By signing up, I agree to the Leyyow
          <a
            href="https://leyyow.notion.site/Refund-policy-162f3934f3148085a337fc0d3cbffb99?pvs=4"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary-500 underline"
          >
            Privacy Policy
          </a>
          and
          <a
            href="https://leyyow.notion.site/Refund-policy-162f3934f3148085a337fc0d3cbffb99?pvs=4"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary-500 underline"
          >
            Terms of Services
          </a>
        </p>

        <AppButton
          type="submit"
          :loading="loading"
          label="Create account"
          class="w-full"
          :disabled="!meta.valid"
        />
      </div>
    </Form>

    <div class="mt-5 pb-4">
      <p class="text-center text-sm font-normal text-gray-500">
        Already have an account?
        <RouterLink to="/login" class="text-primary-500 text-sm font-medium underline">
          Sign In
        </RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import AppButton from "@/components/common/app-button.vue"
import TextInput from "@/components/common/text-input.vue"
import PasswordStrength from "@/components/others/password-strength.vue"
import { Form, Field } from "vee-validate"
import * as yup from "yup"
import { onInvalidSubmit } from "@/utils/validations"
import { passwordSchema } from "@/utils/validationSchemas"
import { useRegister } from "../api"
import { displayError, formatError } from "@/utils/error-handler"
import { useAuthStore } from "../store"
import { ILoginResponse } from "../types"
import { toast } from "vue3-toastify"

const { mutate: signupFn, isPending: loading } = useRegister()
const authStore = useAuthStore()
const router = useRouter()

// Validation schema using yup
const validationSchema = yup.object().shape({
  first_name: yup.string().required("First name is required"),
  last_name: yup.string(),
  email: yup.string().email("Enter a valid email address").required("Email is required"),
  password: passwordSchema,
  confirm_password: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Please confirm your password"),
})

const currentPassword = ref("")

interface SignupFormValues {
  first_name: string
  last_name?: string
  email: string
  password: string
  confirm_password: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onSubmit = (values: Record<string, any>) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { confirm_password, ...signupData } = values as SignupFormValues
  // Remove confirm_password from signupData before sending to API
  signupFn(signupData, {
    onSuccess: (response: { data: { data: ILoginResponse } }) => {
      const signupData = response.data.data
      console.log("Signup successful", signupData)
      toast.success("Signup successful!")
      void router.push("/dashboard")
      authStore.setTokens({
        accessToken: signupData.access,
        refreshToken: signupData.refresh,
      })

      authStore.setAuthUser({
        avatar_url: signupData.avatar_url,
        first_name: signupData.first_name,
        last_name: signupData.last_name,
        is_email_verified: signupData.is_email_verified,
        assigned_locations: signupData.assigned_locations,
        roles: signupData.roles,
        subscription: signupData.subscription,
      })
    },
    onError: (error) => {
      displayError(error)
      // or handle separately
      const errorMsg = formatError(error)
      console.error("Signup failed!!!", errorMsg)
    },
  })
}
</script>
