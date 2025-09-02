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

        <!-- Dynamic Location/Role Sections -->
        <div
          v-for="(locationRole, index) in locationRoles"
          :key="locationRole.id"
          class="space-y-3 rounded-xl bg-white"
        >
          <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <p class="text-sm font-medium">
              {{ index === 0 ? "Default Location" : `Location ${index + 1}` }}
            </p>
            <button v-if="index > 0" type="button" @click="removeLocationRole(index)">
              <Icon name="x-close" size="16" />
            </button>
          </div>
          <div class="flex flex-col gap-3 px-6 pb-4 md:flex-row">
            <FormField
              :name="`locationRoles.${index}.location`"
              label="Location"
              type="select"
              :options="locations"
              placeholder="Select Location"
              required
              class="flex-1"
              placement="top"
            />
            <FormField
              :name="`locationRoles.${index}.role`"
              label="Role"
              type="select"
              :options="roles"
              placeholder="Select Role"
              required
              class="flex-1"
              placement="top"
            />
          </div>
        </div>

        <!-- Add Location Button -->
        <div class="flex">
          <button
            type="button"
            @click="addLocationRole"
            class="text-primary-600 flex items-center gap-2 text-sm font-medium"
          >
            <Icon name="add" size="16" />
            Add Location
          </button>
        </div>
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
import { ref, computed, watch } from "vue"
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
}

interface LocationRoleItem {
  id: number
}

interface LocationRoleFormData {
  location: SelectOption
  role: SelectOption
}

interface FormValues {
  first_name: string
  last_name: string
  email: string
  locationRoles: LocationRoleFormData[]
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

// Location/Role management
const locationRoles = ref<LocationRoleItem[]>([{ id: 1 }])

// Initialize location roles based on member data
const initializeLocationRoles = () => {
  if (props.member?.locations && props.member.locations.length > 0) {
    locationRoles.value = props.member.locations.map((_, index) => ({
      id: index + 1,
    }))
  } else {
    locationRoles.value = [{ id: 1 }]
  }
}

// Watch for member prop changes to reinitialize
watch(
  () => props.member,
  () => {
    initializeLocationRoles()
  },
  { immediate: true },
)

const addLocationRole = () => {
  locationRoles.value.push({
    id: Date.now(),
  })
}

const removeLocationRole = (index: number) => {
  if (index > 0) {
    locationRoles.value.splice(index, 1)
  }
}

// Dynamic validation schema
const schema = computed(() => {
  const locationRoleSchema = yup.object({
    location: yup
      .object()
      .shape({
        label: yup.string().required(),
        value: yup.string().required(),
      })
      .required(),
    role: yup
      .object()
      .shape({
        label: yup.string().required(),
        value: yup.string().required(),
      })
      .required(),
  })

  return yup.object({
    first_name: yup.string().required(),
    last_name: yup.string().required(),
    email: yup.string().email().required(),
    locationRoles: yup.array().of(locationRoleSchema).min(1).required(),
  })
})

// Mock data for development
const locations = ref<SelectOption[]>(
  LOCATIONS.map((loc) => ({ label: loc.name, value: String(loc.id) })),
)
const roles = ref<SelectOption[]>(ROLE_OPTIONS)
const isPending = ref(false)

// Compute initial values from member prop
const initialValues = computed(() => {
  if (!props.member) {
    return {
      first_name: "",
      last_name: "",
      email: "",
      locationRoles: [
        {
          location: { label: "", value: "" },
          role: { label: "", value: "" },
        },
      ],
    }
  }

  // Map member locations to form format
  const memberLocationRoles =
    props.member.locations.length > 0
      ? props.member.locations.map((location) => {
          // Find matching location option
          const locationOption = locations.value.find((loc) => loc.value === String(location.id))

          // Find matching role option - assuming member.role applies to all locations
          // You might need to adjust this logic based on your actual data structure
          const roleOption = roles.value.find((role) => role.label === props.member!.role)

          return {
            location: locationOption || { label: location.name, value: String(location.id) },
            role: roleOption || {
              label: props.member!.role,
              value: props.member!.role.toLowerCase(),
            },
          }
        })
      : [
          {
            location: { label: "", value: "" },
            role: { label: "", value: "" },
          },
        ]

  return {
    first_name: props.member.firstName,
    last_name: props.member.lastName,
    email: props.member.email,
    locationRoles: memberLocationRoles,
  }
})

const onSubmit = (values: FormValues) => {
  // Transform the form data to the required payload format
  const payload: UpdateMemberPayload = {
    first_name: values.first_name,
    last_name: values.last_name,
    email: values.email,
    roles: values.locationRoles.map((lr) => lr.role.value),
    locations: values.locationRoles.map((lr) => lr.location.value),
  }

  console.log("Submitting update member payload:", payload)

  // Mock success for development
  toast.success("Member updated successfully!")
  emit("update:modelValue", false)
  emit("refresh")
}
</script>
