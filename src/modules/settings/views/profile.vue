<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import Avatar from "@components/Avatar.vue"
import AppForm from "@components/form/AppForm.vue"
import FileUploadField from "@components/form/FileUploadField.vue"
import FormField from "@components/form/FormField.vue"
import SectionHeader from "@components/SectionHeader.vue"
import { useAuthStore } from "@modules/auth/store"
import { computed, watch } from "vue"
import * as yup from "yup"
import { useGetProfile, useUpdateProfile } from "../api"
import { toast } from "@/composables/useToast"
import { IUser } from "@modules/auth/types"
import { displayError } from "@/utils/error-handler"

const { data: profile, refetch } = useGetProfile()
const { updateAuthUser, user } = useAuthStore()
const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile()

const validSchema = yup.object({
  first_name: yup.string().required("First name is required"),
  last_name: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
})

const kycSchema = yup.object({
  id_type: yup.string().required("ID type is required"),
  id_picture: yup.mixed().required("ID picture is required"),
  license_number: yup.string().required("License number is required"),
  bvn: yup
    .string()
    .matches(/^\d{11}$/, "BVN must be exactly 11 digits")
    .required("BVN is required"),
})

const initialValues = computed(() => ({
  first_name: user?.first_name || "",
  last_name: user?.last_name || "",
  email: user?.email || "",
  avatar: null,
}))

const onUpdateProfile = (values: Record<string, unknown>) => {
  const payload = new FormData()
  const initialVals = initialValues.value
  const changedFields = Object.keys(values).filter(
    (key) => values[key] !== initialVals[key as keyof typeof initialVals],
  )

  if (!changedFields.length) {
    return toast.info("No changes made to update")
  }

  changedFields.forEach((field) => {
    payload.append(field, values[field] as string)
  })
  updateProfile(payload as Partial<IUser>, {
    onSuccess: () => {
      toast.success("Profile updated successfully")
      refetch()
    },
    onError: displayError,
  })
}

const onUpdateKyc = (formData: Record<string, unknown>) => {
  console.log("KYC form submitted with data:", formData)
}

watch(
  profile,
  (val) => {
    if (val) updateAuthUser(val)
  },
  { immediate: true },
)
</script>

<template>
  <div>
    <section>
      <SectionHeader
        title="Personal Info"
        size="sm"
        subtitle="Update your photo and personal details."
      />

      <AppForm
        @submit="onUpdateProfile"
        :schema="validSchema"
        class="border-core-100 mt-6 rounded-2xl border bg-white"
        :initial-values="initialValues"
      >
        <div class="grid grid-cols-2 gap-6 p-6">
          <FormField name="first_name" label="First Name" placeholder="e.g. John" required />
          <FormField name="last_name" label="Last Name" placeholder="e.g. Doe" required />
          <FormField
            name="email"
            label="Email Address"
            placeholder="e.g. john.doe@example.com"
            required
            class="col-span-2"
            disabled
          />

          <div class="col-span-2 flex gap-6">
            <Avatar
              :name="`${user?.first_name} ${user?.last_name}`"
              size="lg"
              :url="user?.avatar || ''"
            />

            <div class="flex-1">
              <FormField
                name="avatar"
                type="file"
                label="Profile Picture"
                :required="true"
                accept="image/*"
                :max-size="2"
                placeholder="Upload your profile picture"
                hint="Max size: 2MB, Images only"
              />
            </div>
          </div>
        </div>

        <div class="border-core-100 flex justify-end gap-6 border-t px-6 py-4">
          <AppButton type="submit" label="Save Changes" :loading="isUpdating" />
        </div>
      </AppForm>
    </section>

    <section class="mt-10">
      <SectionHeader
        title="KYC"
        size="sm"
        subtitle="We require your BVN and ID to verify your identity as part of KYC regulations."
      />

      <AppForm
        @submit="onUpdateKyc"
        :schema="kycSchema"
        class="border-core-100 mt-6 rounded-2xl border bg-white"
      >
        <div class="flex flex-col gap-6 p-6">
          <FormField
            type="select"
            name="id_type"
            label="Select ID"
            :options="[
              { label: 'Passport', value: 'passport' },
              { label: `Driver's License`, value: 'drivers_license' },
              { label: 'National ID', value: 'national_id' },
            ]"
            placeholder="e.g. John"
            required
          />

          <FileUploadField
            name="id_picture"
            label="Click to upload your ID"
            accept="image/*"
            :show-preview="true"
            placeholder="Upload your ID"
            class="w-full"
          />

          <FormField
            name="license_number"
            label="License Number"
            placeholder="e.g. ABC123456"
            required
          />

          <FormField name="bvn" label="BVN" placeholder="e.g. 12345678901" required />
        </div>

        <div class="border-core-100 flex justify-end gap-6 border-t px-6 py-4">
          <AppButton type="submit" label="Save Changes" />
        </div>
      </AppForm>
    </section>
  </div>
</template>
