<script setup>
import { ref } from "vue";
// import { useRouter } from "vue-router";
import AppButton from "../../components/common/app-button.vue";
import TextInput from "../../components/common/text-input.vue";
import { Form, Field } from "vee-validate";
import * as yup from "yup";
import { onInvalidSubmit } from "../../utilities/validations";
import { passwordSchema } from "../../utilities/validationSchemas";

// const { mutate: signupFn, isPending: loading } = useRegisterApi();
// const authStore = useAuthStore();
// const router = useRouter();

// Validation schema using yup
const validationSchema = yup.object().shape({
	email: yup
		.string()
		.email("Enter a valid email address")
		.required("Email is required"),
	password: passwordSchema,
});

const currentPassword = ref("");

const onSubmit = (values) => {
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
};
</script>

<template>
	<div class="py-10 px-4 md:p-24 text-neutral-800">
		<div class="mb-4">
			<img
				src="../../../public/images/logos/leyyow-logo-2.svg"
				alt="leyyow logo"
				class="mb-6 h-8"
			/>
			<h1 class="font-medium text-4xl md:text-5xl mb-3.5">
				Welcome back!
			</h1>
			<p class="text-neutral-600">
				Sign in to your Leyyow account to continue.
			</p>
		</div>

		<Form
			v-slot="{ errors }"
			:validation-schema="validationSchema"
			@submit="onSubmit"
			@invalid-submit="onInvalidSubmit"
		>
			<div class="flex flex-col gap-4">
				<Field
					v-slot="{ field, errors: fieldErrors }"
					name="email"
					validate-on-model-update
				>
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
					</div>
				</Field>

				<AppButton
					type="submit"
					:loading="false"
					label="Log In"
					class="w-full"
					:disabled="Object.keys(errors).length > 0"
				/>
			</div>
		</Form>

		<div class="mt-5 pb-4">
			<p class="text-sm font-normal text-center text-gray-500">
				New to Leyyow?
				<RouterLink
					to="/auth/signup"
					class="text-sm text-brand-500 font-medium underline"
				>
					Sign Up
				</RouterLink>
			</p>
		</div>
	</div>
</template>
