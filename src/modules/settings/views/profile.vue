<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import AppForm from "@components/form/AppForm.vue"
import FormField from "@components/form/FormField.vue"
import SectionHeader from "@components/SectionHeader.vue"
import { useAuthStore } from "@modules/auth/store"
import { computed, watch } from "vue"
import * as yup from "yup"
import { useGetAccountKyc, useGetProfile, useUpdateAccountKyc, useUpdateProfile } from "../api"
import { toast } from "@/composables/useToast"
import { IkycInfo, IUser } from "@modules/auth/types"
import { displayError } from "@/utils/error-handler"

const { data: profile, refetch } = useGetProfile()
const { data: kycData } = useGetAccountKyc()
const { updateAuthUser, user } = useAuthStore()
const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile()
const { mutate: updateKyc, isPending: isKycUpdating } = useUpdateAccountKyc()

const validSchema = yup.object({
  first_name: yup.string().required("First name is required"),
  last_name: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
})

const kycSchema = yup.object({
  doc_type: yup
    .object()
    .shape({
      label: yup.string().required(),
      value: yup.string().required(),
    })
    .required("ID type is required"),
  file: yup.mixed().nullable(),
  doc_number: yup.string().required("Document number is required"),
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

const KYC_DOCUMENT_TYPES = [
  { label: "Passport", value: "international_passport" },
  { label: `Driver's License`, value: "drivers_license" },
  { label: "National ID", value: "national_id" },
  { label: "Voter's Card", value: "voters_card" },
]

watch(kycData, (val) => {
  console.log("KYC DATA UPDATED:", val)
})

const kycInitialValues = computed(() => ({
  doc_type: KYC_DOCUMENT_TYPES.find((type) => type.value === kycData.value?.doc_type) || null,
  file: kycData.value?.file || null,
  doc_number: kycData.value?.doc_number || "",
  bvn: kycData.value?.bvn || "",
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
  const payload = new FormData()
  const docType = (formData.doc_type as { value: string }).value
  payload.append("doc_type", docType)
  if (formData.file) payload.append("file", formData.file as File)
  payload.append("doc_number", formData.doc_number as string)
  payload.append("bvn", formData.bvn as string)

  updateKyc(
    { id: kycData.value?.uid || "", body: payload as unknown as Partial<IkycInfo> },
    {
      onSuccess: () => {
        toast.success("KYC information updated successfully")
      },
      onError: displayError,
    },
  )
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
        <div class="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2">
          <FormField name="first_name" label="First Name" placeholder="e.g. John" required />
          <FormField name="last_name" label="Last Name" placeholder="e.g. Doe" required />
          <FormField
            name="email"
            label="Email Address"
            placeholder="e.g. john.doe@example.com"
            required
            class="sm:col-span-2"
            disabled
          />

          <div class="sm:col-span-2">
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
        :initial-values="kycInitialValues"
      >
        <div class="flex flex-col gap-6 p-6">
          <FormField
            type="select"
            name="doc_type"
            label="Select ID"
            :options="KYC_DOCUMENT_TYPES"
            placeholder="Select ID type"
            required
          />

          <FormField
            type="file"
            name="file"
            label="Click to upload your ID"
            accept="image/*"
            :show-preview="true"
            placeholder="Upload your ID"
            class="w-full"
          />

          <FormField
            name="doc_number"
            label="Document Number"
            placeholder="e.g. ABC123456"
            required
          />

          <FormField name="bvn" label="BVN" placeholder="e.g. 12345678901" required />
        </div>

        <div class="border-core-100 flex justify-end gap-6 border-t px-6 py-4">
          <AppButton type="submit" label="Save Changes" :loading="isKycUpdating" />
        </div>
      </AppForm>
    </section>
  </div>
</template>
