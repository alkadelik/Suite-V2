<template>
  <Modal
    :open="modelValue"
    title="Invite Member"
    max-width="xl"
    @close="emit('update:modelValue', false)"
    variant="bottom-nav"
    :handle-padding="false"
  >
    <AppForm :schema="schema" @submit="onSubmit" v-slot="{ meta }">
      <div class="space-y-4 px-4 py-4 md:space-y-8 md:px-6">
        <IconHeader
          icon-name="profile-add"
          subtext="Invite members and assign their locations and respective roles"
        />

        <FormField
          name="email"
          label="Email Address"
          type="email"
          placeholder="Enter email address"
          required
        />

        <FormField
          name="roles"
          label="Role"
          type="tags"
          :options="filteredRoleOptions"
          placeholder="Select Role"
          required
          placement="top"
        />

        <FormField
          name="locations"
          label="Location"
          type="tags"
          :options="locationOptions"
          placeholder="Select Location"
          required
          placement="top"
        />
      </div>

      <div class="space-y-3 bg-white px-6 py-4">
        <AppButton
          type="submit"
          label="Invite Member"
          :loading="isPending"
          class="w-full"
          :disabled="!meta.valid"
        />
      </div>
    </AppForm>
  </Modal>
</template>

<script setup lang="ts">
import { computed } from "vue"
import * as yup from "yup"
import { toast } from "@/composables/useToast"
import AppButton from "@/components/AppButton.vue"
import Modal from "@/components/Modal.vue"
import AppForm from "@/components/form/AppForm.vue"
import FormField from "@/components/form/FormField.vue"
import IconHeader from "@/components/IconHeader.vue"
import { ROLE_OPTIONS } from "@modules/shared/constants"
import { IInvitePayload } from "../types"
import { useInviteUserToLocation } from "../api"
import { displayError } from "@/utils/error-handler"
import { useSettingsStore } from "../store"

interface FormValues {
  email: string
  roles: string[]
  locations: string[]
}

defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  "update:modelValue": [value: boolean]
  refresh: []
}>()

const { mutate: inviteUser, isPending } = useInviteUserToLocation()
const settingsStore = useSettingsStore()

const schema = computed(() => {
  return yup.object({
    email: yup.string().email().required(),
    roles: yup.array().of(yup.string()).min(1).required(),
    locations: yup.array().of(yup.string()).min(1).required(),
  })
})

const locationOptions = computed(() => {
  return settingsStore.locations?.map((loc) => ({ label: loc.name, value: loc.uid })) || []
})

// Filter out "Owner" role from the options
const filteredRoleOptions = computed(() => {
  return ROLE_OPTIONS.value.filter(
    (role) => role.label.toLowerCase() !== "owner" && role.label.toLowerCase() !== "store owner",
  )
})

const onSubmit = (values: FormValues) => {
  const payload: IInvitePayload = {
    email: values.email,
    roles: values.roles,
    locations: values.locations,
  }

  inviteUser(payload, {
    onSuccess: () => {
      toast.success("Member invitation sent!")
      emit("update:modelValue", false)
    },
    onError: displayError,
  })
}
</script>
