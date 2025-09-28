<template>
  <div class="text-core-800">
    <SectionHeader
      title="Join Team"
      subtitle="Create your free Leyyow account and get your store online today."
      class="mb-4"
    />

    <AppForm :schema="validationSchema" @submit="onSubmit" v-slot="{ meta }" class="space-y-5">
      <div class="grid grid-cols-2 gap-5">
        <FormField name="first_name" label="First Name" placeholder="e.g. John" required />
        <FormField name="last_name" label="Last Name" placeholder="e.g. Doe" required />
      </div>

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
        label="Join Team Now"
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
import { useRoute, useRouter } from "vue-router"
import PasswordStrength from "@components/form/PasswordStrength.vue"
import * as yup from "yup"
import { passwordSchema } from "@/utils/validationSchemas"
import { useSignupWithInvite } from "../api"
import { displayError } from "@/utils/error-handler"
import { toast } from "@/composables/useToast"
import AppForm from "@components/form/AppForm.vue"
import FormField from "@components/form/FormField.vue"
import SectionHeader from "@components/SectionHeader.vue"
import AppButton from "@components/AppButton.vue"
import { useAuthStore } from "../store"

const { mutate: signupFn, isPending } = useSignupWithInvite()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

interface FormValues {
  first_name: string
  last_name: string
  password: string
  confirm_password: string
}

const validationSchema = yup.object().shape({
  first_name: yup.string().required("First name is required"),
  last_name: yup.string().required("Last name is required"),
  password: passwordSchema,
  confirm_password: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Please confirm your password"),
})

const currentPassword = ref("")
// Initialize values immediately from query parameters
const inviteCode = ref((route.query.invite_code as string) || "")

const onSubmit = (values: FormValues) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { confirm_password, ...rest } = values
  const payload = {
    ...rest,
    invite_code: inviteCode.value,
  }

  console.log("Payload:", payload)

  signupFn(payload, {
    onSuccess: (res) => {
      const { access, refresh, ...user } = res.data?.data || {}
      authStore.setTokens({ accessToken: access, refreshToken: refresh })
      authStore.setAuthUser({
        ...user,
      })
      toast.success("Team joined successfully!")
      // check for redirect query param
      const redirectPath = router.currentRoute.value.query.redirect as string
      router.push(redirectPath || "/dashboard")
    },
    onError: displayError,
  })
}
</script>
