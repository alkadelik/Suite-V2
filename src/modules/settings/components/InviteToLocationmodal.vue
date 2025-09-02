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
        <div class="space-y-4">
          <div class="flex size-10 items-center justify-center rounded-xl bg-neutral-50 p-2">
            <Icon name="profile-add" size="20" />
          </div>

          <p class="text-xs md:text-sm">
            Invite members and assign their locations and respective roles
          </p>
        </div>

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
import { ref, computed } from "vue"
import * as yup from "yup"
import { toast } from "@/composables/useToast"
import AppButton from "@/components/AppButton.vue"
import Modal from "@/components/Modal.vue"
import AppForm from "@/components/form/AppForm.vue"
import FormField from "@/components/form/FormField.vue"
import Icon from "@components/Icon.vue"
import { LOCATIONS, ROLE_OPTIONS } from "../constants"

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
  email: string
  locationRoles: LocationRoleFormData[]
}

interface InvitePayload {
  email: string
  roles: string[]
  locations: string[]
}

defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  "update:modelValue": [value: boolean]
  refresh: []
}>()

// Location/Role management
const locationRoles = ref<LocationRoleItem[]>([{ id: 1 }])

const addLocationRole = () => {
  locationRoles.value.push({
    id: Date.now(), // Simple unique ID
  })
}

const removeLocationRole = (index: number) => {
  if (index > 0) {
    // Prevent removing the default location
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

const onSubmit = (values: FormValues) => {
  // Transform the form data to the required payload format
  const payload: InvitePayload = {
    email: values.email,
    roles: values.locationRoles.map((lr) => lr.role.value),
    locations: values.locationRoles.map((lr) => lr.location.value),
  }

  console.log("Submitting invite member payload:", payload)

  // Mock success for development
  toast.success("Member invitation sent!")
  emit("update:modelValue", false)
  emit("refresh")
}
</script>
