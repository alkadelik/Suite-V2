<template>
  <div class="text-core-800">
    <SectionHeader
      title="Let's get started"
      subtitle="Create your free Leyyow account and get your store online today."
      class="mb-4"
    />

    <AppForm :schema="validationSchema" @submit="onSubmit" v-slot="{ meta }" class="space-y-5">
      <div class="grid grid-cols-2 gap-5">
        <FormField name="first_name" label="First Name" placeholder="e.g. John" required />
        <FormField name="last_name" label="Last Name" placeholder="e.g. Doe" />
      </div>

      <FormField name="email" label="Email Address" placeholder="example@gmail.com" required />

      <div>
        <FormField
          name="password"
          label="Password"
          type="password"
          placeholder="Enter password"
          required
          @update:model-value="currentPassword = $event"
        />
        <PasswordStrength v-if="currentPassword" :model-value="currentPassword" />
      </div>

      <FormField
        type="password"
        label="Confirm Password"
        placeholder="Re-enter password"
        name="confirm_password"
        required
      />

      <p class="text-center text-sm">
        By signing up, I agree to the Leyyow
        <a
          href="https://leyyow.notion.site/Refund-policy-162f3934f3148085a337fc0d3cbffb99?pvs=4"
          target="_blank"
          rel="noopener noreferrer"
          class="text-primary-600"
        >
          Privacy Policy
        </a>
        and
        <a
          href="https://leyyow.notion.site/Refund-policy-162f3934f3148085a337fc0d3cbffb99?pvs=4"
          target="_blank"
          rel="noopener noreferrer"
          class="text-primary-600"
        >
          Terms of Services
        </a>
      </p>

      <AppButton
        type="submit"
        :loading="isPending"
        label="Create Account"
        class="w-full"
        :disabled="!meta.valid"
      />
    </AppForm>

    <div class="mt-5 pb-4">
      <p class="text-center text-sm font-normal text-gray-500">
        Already have an account?
        <RouterLink
          to="/login"
          class="text-primary-600 text-sm font-semibold transition-colors duration-200 hover:underline"
        >
          Sign In
        </RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import PasswordStrength from "@components/form/PasswordStrength.vue"
import * as yup from "yup"
import { passwordSchema } from "@/utils/validationSchemas"
import { useRegister } from "../api"
import { displayError } from "@/utils/error-handler"
import { useAuthStore } from "../store"
import { TSignupPayload } from "../types"
import { toast } from "@/composables/useToast"
import AppForm from "@components/form/AppForm.vue"
import FormField from "@components/form/FormField.vue"
import SectionHeader from "@components/SectionHeader.vue"
import AppButton from "@components/AppButton.vue"

const { mutate: signupFn, isPending } = useRegister()
const authStore = useAuthStore()
const router = useRouter()

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

const onSubmit = (values: TSignupPayload) => {
  signupFn(values, {
    onSuccess: (res) => {
      const { access, refresh, ...user } = res.data?.data || {}
      authStore.setTokens({ accessToken: access, refreshToken: refresh })
      authStore.setAuthUser({ ...user, email: values.email, store_slug: "" })
      toast.success("Signup successful!")
      // check for redirect query param
      const redirectPath = router.currentRoute.value.query.redirect as string
      router.push(redirectPath || "/onboarding")
    },
    onError: displayError,
  })
}
</script>
