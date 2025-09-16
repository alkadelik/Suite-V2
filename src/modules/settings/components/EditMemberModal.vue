<template>
  <Modal
    :open="modelValue"
    title="Edit Member"
    max-width="xl"
    @close="emit('update:modelValue', false)"
    variant="bottom-nav"
    :handle-padding="false"
  >
    <AppForm :schema="schema" :initial-values="initialValues" @submit="onSubmit" v-slot="{ meta }">
      <div class="space-y-4 px-4 py-4 md:space-y-8 md:px-6">
        <IconHeader
          icon-name="user-edit"
          subtext="Edit and make changes to this member's roles and locations."
          class="mb-4"
        />

        <FormField
          name="first_name"
          label="First Name"
          type="text"
          placeholder="Adebola"
          :disabled="true"
          required
        />

        <FormField
          name="last_name"
          label="Last Name"
          type="text"
          placeholder="Adeola"
          :disabled="true"
          required
        />

        <FormField
          name="email"
          label="Email Address"
          type="email"
          placeholder="Enter email address"
          :disabled="true"
          required
        />

        <FormField
          name="roles"
          label="Roles"
          type="tags"
          :options="ROLE_OPTIONS"
          placeholder="Select Role"
          required
          placement="top"
        />

        <FormField
          name="locations"
          label="Locations"
          type="tags"
          :options="locations"
          placeholder="Select Location"
          required
          placement="top"
        />
      </div>

      <div class="space-y-3 bg-white px-6 py-4">
        <AppButton
          type="submit"
          label="Save Changes"
          :loading="isPending"
          class="w-full"
          :disabled="!meta.valid"
        />
      </div>
    </AppForm>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"
import * as yup from "yup"
import { toast } from "@/composables/useToast"
import AppButton from "@/components/AppButton.vue"
import Modal from "@/components/Modal.vue"
import AppForm from "@/components/form/AppForm.vue"
import FormField from "@/components/form/FormField.vue"
import { LOCATIONS } from "../constants"
import { ROLE_OPTIONS } from "@modules/shared/constants"
import { TTeam } from "../types"
import IconHeader from "@components/IconHeader.vue"
import { IUpdateMemberPayload } from "../types"
import { useUpdateMember } from "../api"
import { displayError } from "@/utils/error-handler"

interface SelectOption {
  label: string
  value: string
  class?: string
}

interface FormValues {
  roles: string[]
  locations: string[]
}

const props = defineProps<{
  modelValue: boolean
  member?: TTeam | null
}>()

const emit = defineEmits<{
  "update:modelValue": [value: boolean]
  refresh: []
}>()

const { mutate: updateMember, isPending } = useUpdateMember()

// Dynamic validation schema
const schema = computed(() => {
  return yup.object({
    roles: yup.array().of(yup.string()).min(1).required(),
    locations: yup.array().of(yup.string()).min(1).required(),
  })
})

// Mock data for development
const locations = ref<SelectOption[]>(LOCATIONS.map((loc) => ({ label: loc.name, value: loc.uid })))

// Compute initial values from member prop
const initialValues = computed(() => {
  if (!props.member) {
    return {
      first_name: "",
      last_name: "",
      email: "",
      roles: [], // Empty array for roles
      locations: [], // Empty array for locations
    }
  }

  // Extract roles - assuming member.role is a single role
  // If member can have multiple roles, adjust this logic
  const memberRoles = props.member.roles ? props.member.roles.map((role) => role.uid) : []

  // Extract location IDs
  const memberLocations = props.member.assigned_locations?.map((location) => location.uid) || []

  return {
    first_name: props.member.first_name,
    last_name: props.member.last_name,
    email: props.member.email,
    roles: memberRoles,
    locations: memberLocations,
  }
})

const onSubmit = (values: FormValues) => {
  // Transform the form data to the required payload format
  const payload: IUpdateMemberPayload = {
    uid: props.member?.uid || "",
    roles: values.roles,
    locations: values.locations,
  }

  console.log("Submitting update member payload:", payload)

  updateMember(payload, {
    onSuccess: () => {
      toast.success("Member updated successfully!")
      emit("update:modelValue", false)
      emit("refresh")
    },
    onError: displayError,
  })
}
</script>
