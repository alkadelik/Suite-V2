<template>
  <div class="text-core-800">
    <div class="mb-10">
      <h3 class="mb-3.5 text-3xl font-medium">Welcome back!</h3>
      <p class="text-core-600">Good to see you again—pick up right where you left off.</p>
    </div>

    <Form
      v-slot="{ meta }"
      :validation-schema="validationSchema"
      @submit="onSubmit"
      @invalid-submit="onInvalidSubmit"
    >
      <div class="flex flex-col gap-8">
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

        <Field v-slot="{ field, errors: fieldErrors }" name="password" validate-on-model-update>
          <div>
            <TextInput
              v-bind="field"
              type="password"
              label="Password"
              placeholder="Enter password"
              name="password"
              required
              :error="fieldErrors[0]"
            />
          </div>
        </Field>

        <div class="flex items-center justify-between">
          <Checkbox
            v-model="rememberMe"
            name="remember_me"
            label="Remember me"
            class="text-core-600 text-sm"
          />
          <RouterLink
            to="/forgot-password"
            class="text-primary-600 text-sm font-medium transition-colors duration-200 hover:underline"
          >
            Forgot Password?
          </RouterLink>
        </div>

        <AppButton
          type="submit"
          :loading="isPending"
          label="Log In"
          class="w-full"
          :disabled="!meta.valid"
        />
      </div>
    </Form>

    <div class="mt-5 pb-4">
      <p class="text-center text-sm font-normal text-gray-500">
        I don't have an account?
        <RouterLink
          to="/signup"
          class="text-primary-600 text-sm font-semibold transition-colors duration-200 hover:underline"
        >
          Sign Up
        </RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router"
import AppButton from "@components/common/app-button.vue"
import TextInput from "@components/common/text-input.vue"
import { Form, Field } from "vee-validate"
import * as yup from "yup"
import { onInvalidSubmit } from "@/utils/validations"
import { useLogin } from "../api"
import { displayError, formatError } from "@/utils/error-handler"
import { toast } from "vue3-toastify"
import { useAuthStore } from "../store"
import { ILoginResponse } from "../types"
import Checkbox from "@components/common/checkbox.vue"
import { ref } from "vue"

// Define the form data type
type LoginFormData = {
  email: string
  password: string
}

const authStore = useAuthStore()
const router = useRouter()
const rememberMe = ref(false)

// Validation schema using yup
const validationSchema = yup.object().shape({
  email: yup.string().email("Enter a valid email address").required("Email is required"),
  password: yup.string().required("Password is required"),
})

const { mutate: loginFn, isPending } = useLogin()

const onSubmit = (values: Record<string, unknown>) => {
  const loginData = values as LoginFormData
  loginFn(loginData, {
    onSuccess: (response: { data: { data: ILoginResponse } }) => {
      const loginData = response.data.data
      console.log("Login successful", loginData)
      console.log({
        accessToken: loginData.access,
        refreshToken: loginData.refresh,
      })
      toast.success("Login successful!")
      void router.push("/dashboard")
      authStore.setTokens({
        accessToken: loginData.access,
        refreshToken: loginData.refresh,
      })

      authStore.setAuthUser({
        avatar_url: loginData.avatar_url,
        first_name: loginData.first_name,
        last_name: loginData.last_name,
        is_email_verified: loginData.is_email_verified,
        assigned_locations: loginData.assigned_locations,
        roles: loginData.roles,
        subscription: loginData.subscription,
      })
    },
    onError: (error) => {
      displayError(error)
      // or handle separately
      const errorMsg = formatError(error)
      console.error("Login failed!!!", errorMsg)
    },
  })
}
</script>
