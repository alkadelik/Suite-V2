<script setup>
import { ref } from "vue"
// import { useRouter } from "vue-router"
import AppButton from "../../components/common/app-button.vue"
import TextInput from "../../components/common/text-input.vue"
import PasswordStrength from "../../components/others/password-strength.vue"
import { Form, Field } from "vee-validate"
import * as yup from "yup"
import { onInvalidSubmit } from "../../utilities/validations"
import { passwordSchema } from "../../utilities/validationSchemas"

// const { mutate: signupFn, isPending: loading } = useRegisterApi();
// const authStore = useAuthStore();
// const router = useRouter()

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

// const onSubmit = (values) => {
//   signupFn(values, {
//     onSuccess: (response) => {
//       const { data } = response;
//       const { tokens, user } = data;
//       authStore.setAuth(tokens.access, tokens.refresh, user);
//       authStore.setUserEmail(values.email);
//       toast.success("Registration successful");
//       router.push("/auth/confirm-email");
//     },
//   });
// }
</script>

<template>
  <div class="px-4 py-10 text-neutral-800 md:p-24">
    <div class="mb-4">
      <img
        src="../../../public/images/logos/leyyow-logo-2.svg"
        alt="leyyow logo"
        class="mb-6 h-8"
      />
      <h1 class="mb-3.5 text-4xl font-medium md:text-5xl">Let's get started</h1>
      <p class="text-neutral-600">
        Create your free Leyyow account and get your store online today.
      </p>
    </div>

    <Form
      v-slot="{ errors }"
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
            class="text-brand-500 underline"
          >
            Privacy Policy
          </a>
          and
          <a
            href="https://leyyow.notion.site/Refund-policy-162f3934f3148085a337fc0d3cbffb99?pvs=4"
            target="_blank"
            rel="noopener noreferrer"
            class="text-brand-500 underline"
          >
            Terms of Services
          </a>
        </p>

        <AppButton
          type="submit"
          :loading="false"
          label="Create account"
          class="w-full"
          :disabled="Object.keys(errors).length > 0"
        />
      </div>
    </Form>

    <div class="mt-5 pb-4">
      <p class="text-center text-sm font-normal text-gray-500">
        Already have an account?
        <RouterLink to="/auth/signin" class="text-brand-500 text-sm font-medium underline">
          Sign In
        </RouterLink>
      </p>
    </div>
  </div>
</template>
