<template>
  <div>
    <SectionHeader
      size="lg"
      title="Welcome back!"
      subtitle="Good to see you again—pick up right where you left off"
      class="mb-10"
    />

    <AppForm :schema="loginSchema" @submit="onSubmit" v-slot="{ meta }" class="space-y-8">
      <FormField name="email" label="Email Address" placeholder="example@gmail.com" required />

      <FormField name="password" type="password" required />

      <AppButton
        type="submit"
        :loading="isPending"
        label="Log In"
        class="w-full"
        :disabled="!meta.valid"
      />
    </AppForm>

    <div class="mt-5 pb-4">
      <p class="text-center text-sm font-normal text-gray-500">
        I don't have an account?
        <RouterLink to="/signup" class="text-primary-600 text-sm font-semibold">
          Sign Up
        </RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router"
import AppButton from "@components/common/app-button.vue"
import { useLogin } from "../api"
import * as yup from "yup"
import { displayError } from "@/utils/error-handler"
import { useAuthStore } from "../store"
import { TLoginPayload } from "../types"
import { toast } from "vue3-toastify"
import AppForm from "@components/form/AppForm.vue"
import FormField from "@components/form/FormField.vue"
import SectionHeader from "@components/SectionHeader.vue"

const authStore = useAuthStore()
const router = useRouter()
const { mutate: loginFn, isPending } = useLogin()

const loginSchema = yup.object({
  email: yup.string().email("Enter a valid email address").required("Email is required"),
  password: yup.string().required("Password is required"),
})

const onSubmit = (values: TLoginPayload) => {
  loginFn(values, {
    onSuccess: (res) => {
      const { access, refresh, ...user } = res.data?.data || {}
      authStore.setTokens({ accessToken: access, refreshToken: refresh })
      authStore.setAuthUser({ ...user, email: values.email })
      toast.success("Login successful!")
      router.push("/dashboard")
    },
    onError: displayError,
  })
}
</script>
