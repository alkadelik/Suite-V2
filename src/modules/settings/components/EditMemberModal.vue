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
        <div class="space-y-4">
          <div class="flex size-10 items-center justify-center rounded-xl bg-neutral-50 p-2">
            <Icon name="user-edit" size="20" />
          </div>

          <p class="text-xs md:text-sm">Edit and make changes to this member</p>
        </div>

        <FormField
          name="first_name"
          label="First Name"
          type="text"
          placeholder="Adebola"
          required
        />

        <FormField name="last_name" label="Last Name" type="text" placeholder="Adeola" required />

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
          :options="roles"
          placeholder="Select Role"
          required
          placement="top"
        />

        <FormField
          name="locations"
          label="Location"
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
import Icon from "@components/Icon.vue"
import { LOCATIONS, ROLE_OPTIONS } from "../constants"
import { TTeam } from "../types"

interface SelectOption {
  label: string
  value: string
  class?: string
}

interface FormValues {
  first_name: string
  last_name: string
  email: string
  roles: string[]
  locations: string[]
}

interface UpdateMemberPayload {
  first_name: string
  last_name: string
  email: string
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

// Dynamic validation schema
const schema = computed(() => {
  return yup.object({
    first_name: yup.string().required(),
    last_name: yup.string().required(),
    email: yup.string().email().required(),
    roles: yup.array().of(yup.string()).min(1).required(),
    locations: yup.array().of(yup.string()).min(1).required(),
  })
})

// Mock data for development
const locations = ref<SelectOption[]>(LOCATIONS.map((loc) => ({ label: loc.name, value: loc.uid })))
const roles = ref<SelectOption[]>(ROLE_OPTIONS)
const isPending = ref(false)

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
  const memberRoles = props.member.role ? [props.member.role.toLowerCase()] : []

  // Extract location IDs
  const memberLocations = props.member.locations?.map((location) => String(location.uid)) || []

  return {
    first_name: props.member.firstName,
    last_name: props.member.lastName,
    email: props.member.email,
    roles: memberRoles,
    locations: memberLocations,
  }
})

const onSubmit = (values: FormValues) => {
  // Transform the form data to the required payload format
  const payload: UpdateMemberPayload = {
    first_name: values.first_name,
    last_name: values.last_name,
    email: values.email,
    roles: values.roles,
    locations: values.locations,
  }

  console.log("Submitting update member payload:", payload)

  // Mock success for development
  toast.success("Member updated successfully!")
  emit("update:modelValue", false)
  emit("refresh")
}
</script>
