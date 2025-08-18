<template>
  <div class="text-core-800 px-4 py-10 md:p-24">
    <div class="mb-4">
      <img src="/images/logos/leyyow-logo-2.svg?url" alt="leyyow logo" class="mb-40 h-8" />
      <h1 class="mb-3.5 text-4xl font-medium md:text-5xl">Welcome back!</h1>
      <p class="text-core-600">Sign in to your Leyyow account to continue. <Icon name="vue" /></p>
    </div>

    <Form
      v-slot="{ errors }"
      :validation-schema="validationSchema"
      @submit="onSubmit"
      @invalid-submit="onInvalidSubmit"
    >
      <div class="flex flex-col gap-4">
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

        <AppButton
          type="submit"
          :loading="isPending"
          label="Log In"
          class="w-full"
          :disabled="Object.keys(errors).length > 0"
        />
      </div>
    </Form>

    <div class="mt-5 pb-4">
      <p class="text-center text-sm font-normal text-gray-500">
        New to Leyyow?
        <RouterLink to="/signup" class="text-primary-500 text-sm font-medium underline">
          Sign Up
        </RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
// import { useRouter } from "vue-router";
import AppButton from "@components/common/app-button.vue"
import TextInput from "@components/common/text-input.vue"
import { Form, Field } from "vee-validate"
import * as yup from "yup"
import { onInvalidSubmit } from "@/utils/validations"
import { passwordSchema } from "@/utils/validationSchemas"
import { useLogin } from "../api"
import { formatError } from "@/utils/error-handler"
import Icon from "@components/common/icon.vue"

// Define the form data type
type LoginFormData = {
  email: string
  password: string
}

// const { mutate: signupFn, isPending: loading } = useRegisterApi();
// const authStore = useAuthStore();
// const router = useRouter();

// Validation schema using yup
const validationSchema = yup.object().shape({
  email: yup.string().email("Enter a valid email address").required("Email is required"),
  password: passwordSchema,
})

const { mutate: loginFn, isPending } = useLogin()

const onSubmit = (values: Record<string, unknown>) => {
  const loginData = values as LoginFormData
  loginFn(loginData, {
    onSuccess: (response) => {
      console.log("Login successful", response)
    },
    onError: (error) => {
      const errorMsg = formatError(error)
      console.error("Login failed", errorMsg)
    },
  })
}
</script>
