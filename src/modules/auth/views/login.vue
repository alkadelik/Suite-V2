<template>
  <div>
    <SectionHeader
      title="Welcome back!"
      subtitle="Good to see you again—pick up right where you left off"
      class="mb-10"
    />

    <a
      href="http://legacy.leyyow.com/auth/signin"
      class="mb-8 inline-block w-full"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div
        class="bg-primary-50 text-primary-700 border-primary-200 flex flex-col items-start gap-2 rounded-3xl border px-2 py-2 xl:flex-row"
      >
        <Chip size="sm" label="✨ Returning users" variant="filled" />
        <div class="flex flex-wrap items-center gap-2 text-sm">
          <span class="font-medium">
            If you created your account before Nov 18, click here to sign in
          </span>
          <Icon name="arrow-right" size="16" class="hidden! md:inline-block!" />
        </div>
      </div>
    </a>

    <AppForm :schema="loginSchema" @submit="onSubmit" v-slot="{ meta }" class="space-y-8">
      <FormField name="email" label="Email Address" placeholder="example@gmail.com" required />

      <FormField name="password" type="password" label="Password" required />

      <div class="flex items-center justify-between">
        <!-- <label class="flex cursor-pointer items-center gap-1.5 text-sm">
          <input v-model="rememberMe" type="checkbox" class="accent-primary-600 h-4 w-4" />
          Remember me
        </label> -->
        <RouterLink
          :to="`/forgot-password${redirectStr}`"
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
    </AppForm>

    <div class="mt-5 pb-4">
      <p class="text-center text-sm font-normal text-gray-500">
        I don't have an account?
        <RouterLink
          :to="`/signup${redirectStr}`"
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
import { useLogin } from "../api"
import * as yup from "yup"
import { displayError } from "@/utils/error-handler"
import { useAuthStore } from "../store"
import { TLoginPayload } from "../types"
import { toast } from "@/composables/useToast"
import AppForm from "@components/form/AppForm.vue"
import FormField from "@components/form/FormField.vue"
import SectionHeader from "@components/SectionHeader.vue"
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"
import { computed } from "vue"

const authStore = useAuthStore()
const router = useRouter()
// const rememberMe = ref(true)
const { mutate: loginFn, isPending } = useLogin()

const loginSchema = yup.object({
  email: yup.string().email("Enter a valid email address").required("Email is required"),
  password: yup.string().required("Password is required"),
})

const onSubmit = (values: TLoginPayload) => {
  loginFn(
    { ...values, email: values.email?.toLowerCase() },
    {
      onSuccess: (res) => {
        const { access, refresh, ...user } = res.data?.data || {}
        authStore.setTokens({ accessToken: access, refreshToken: refresh })
        authStore.setAuthUser({ ...user, email: values.email })
        toast.success("Your login was successful...")
        // check for redirect query param
        const redirectPath = router.currentRoute.value.query.redirect as string
        router.push(redirectPath || "/dashboard")
      },
      onError: displayError,
    },
  )
}

const redirectStr = computed(() =>
  router.currentRoute.value.query.redirect
    ? `?redirect=${router.currentRoute.value.query.redirect as string}`
    : "",
)
</script>
