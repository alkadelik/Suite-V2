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
        class="bg-primary-50 text-primary-700 border-primary-200 flex flex-col items-start gap-2 rounded-xl border px-2 py-2 lg:rounded-3xl xl:flex-row"
      >
        <Chip size="sm" label="✨ Returning users" variant="filled" />
        <div class="flex flex-wrap items-center gap-2 text-sm">
          <span class="font-medium">
            If you created your account before Nov 18, click here to sign in
            <Icon name="arrow-right" size="16" class="inline-block!" />
          </span>
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
        :loading="isPending || isCheckingLiveStatus"
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
import { useSettingsStore } from "@modules/settings/store"
import { TLoginPayload } from "../types"
import { toast } from "@/composables/useToast"
// import { fetchLiveStatusForLogin } from "@modules/shared/api"
// import { fetchLocationsForLogin } from "@modules/settings/api"
import AppForm from "@components/form/AppForm.vue"
import FormField from "@components/form/FormField.vue"
import SectionHeader from "@components/SectionHeader.vue"
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"
import { computed, ref } from "vue"
import * as Sentry from "@sentry/vue"

const authStore = useAuthStore()
const router = useRouter()
// const rememberMe = ref(true)
const { mutate: loginFn, isPending } = useLogin()
const isCheckingLiveStatus = ref(false)

const { setActiveLocation, setLocations } = useSettingsStore()

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
        // Set user context in Sentry
        Sentry.setUser({ id: user.uid, email: values.email })

        const assignedLocationsMap =
          user.assigned_locations?.map((loc) => ({
            ...loc,
            id: loc.uid,
            label: loc.name,
            active: false,
            is_hq: loc.name?.toLowerCase() === "headquarters" || false,
            created_at: "",
            address: "",
          })) || []

        setLocations(assignedLocationsMap)
        const hqLocation = assignedLocationsMap.find((loc) => loc.is_hq)
        setActiveLocation(hqLocation || assignedLocationsMap[0] || null)

        //===========================================================
        //  This will slow down the login flow. We can consider moving this to a background task after login
        // =====================================

        // Check live status before redirecting
        // const checkLiveStatusAndRedirect = async () => {
        //   if (user.store_slug) {
        //     isCheckingLiveStatus.value = true
        //     try {
        //       const liveStatus = await fetchLiveStatusForLogin(user.store_slug)
        //       if (!liveStatus.data?.is_live) {
        //         try {
        //           const locations = await fetchLocationsForLogin()
        //           const hqLocation = locations.find((loc) => loc.is_hq)
        //           if (hqLocation) {
        //             const settingsStore = useSettingsStore()
        //             settingsStore.setActiveLocation(hqLocation)
        //             settingsStore.setLocations(locations)
        //             router.push("/onboarding")
        //             return
        //           }
        //         } catch {
        //           // If fetching locations fails, go to dashboard
        //         }
        //         // Fallback to dashboard if no HQ found or fetch failed
        //         router.push("/dashboard")
        //         return
        //       }
        //     } catch {
        //       // If live status check fails, proceed to dashboard
        //     } finally {
        //       isCheckingLiveStatus.value = false
        //     }
        //   }

        // check for redirect query param
        const redirectPath = router.currentRoute.value.query.redirect as string
        router.push(redirectPath || "/dashboard")
        // }

        // void checkLiveStatusAndRedirect()
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
