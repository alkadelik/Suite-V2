<template>
  <div class="flex flex-col gap-8">
    <BackButton
      icon="back-arrow"
      label="Back to Login"
      :to="`/login${redirectStr}`"
      class="!text-core-700"
    />

    <SectionHeader
      title="Forgot Password"
      subtitle="Enter your email to receive instructions on how to reset your password."
    />

    <AppForm :schema="schema" @submit="onSubmit" v-slot="{ meta }" class="space-y-8">
      <FormField name="email" label="Email" placeholder="abc@gmail.com" required />
      <AppButton
        type="submit"
        label="Next"
        :loading="isPending"
        class="w-full"
        :disabled="!meta.valid"
      />
    </AppForm>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router"
import { useForgotPassword } from "../api"
import { displayError } from "@/utils/error-handler"
import BackButton from "@components/BackButton.vue"
import AppForm from "@components/form/AppForm.vue"
import FormField from "@components/form/FormField.vue"
import * as yup from "yup"
import SectionHeader from "@components/SectionHeader.vue"
import { toast } from "@/composables/useToast"
import AppButton from "@components/AppButton.vue"
import { computed } from "vue"

const router = useRouter()
const { mutate: forgotPassword, isPending } = useForgotPassword()

const schema = yup.object({
  email: yup.string().email("Enter a valid email address").required(),
})

const redirectStr = computed(() =>
  router.currentRoute.value.query.redirect
    ? `?redirect=${router.currentRoute.value.query.redirect as string}`
    : "",
)

const onSubmit = (values: { email: string }) => {
  forgotPassword(values, {
    onSuccess: () => {
      toast.success("Password reset OTP sent to your email address.")
      router.push(
        `/reset-password?email=${encodeURIComponent(values.email)}${redirectStr.value?.length ? redirectStr.value.replace("?", "&") : ""}`,
      )
    },
    onError: displayError,
  })
}
</script>
