<template>
  <div class="text-core-800 flex flex-col gap-8">
    <RouterLink
      to="/login"
      class="flex gap-2 text-sm font-medium text-neutral-700 transition-colors duration-200 hover:underline"
    >
      <Icon name="back-arrow" />
      Back to Login
    </RouterLink>

    <div>
      <h3 class="mb-3.5 text-3xl font-medium">Forgot Password</h3>
      <p class="mb-4 text-sm">
        Enter your email to receive instructions on how to reset your password.
      </p>
    </div>

    <form class="flex flex-col gap-6" @submit.prevent="onSubmit">
      <TextInput v-model="form.email" type="email" placeholder="abc@gmail.com" required />

      <AppButton type="submit" label="Next" :loading="isPending" class="w-full" />
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { toast } from "vue3-toastify"
import AppButton from "@components/common/app-button.vue"
import TextInput from "@components/common/text-input.vue"
import { useForgotPassword } from "../api"
import Icon from "@components/common/icon.vue"
import { displayError, formatError } from "@/utils/error-handler"

const form = ref({ email: "" })
const router = useRouter()

const { mutate: forgotPassword, isPending } = useForgotPassword()
const onSubmit = () => {
  forgotPassword(form.value, {
    onSuccess: () => {
      toast.success("Password reset OTP sent to your email address.")
      void router.push(`/reset-password?email=${encodeURIComponent(form.value.email)}`)
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
