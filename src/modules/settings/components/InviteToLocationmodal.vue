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
  class?: string
}

interface FormValues {
  email: string
  roles: string[]
  locations: string[]
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

// Dynamic validation schema
const schema = computed(() => {
  return yup.object({
    email: yup.string().email().required(),
    roles: yup.array().of(yup.string()).min(1).required(),
    locations: yup.array().of(yup.string()).min(1).required(),
  })
})

// Mock data for development
const locationOptions = ref<SelectOption[]>(
  LOCATIONS.map((loc) => ({ label: loc.name, value: String(loc.id) })),
)
const roles = ref<SelectOption[]>(ROLE_OPTIONS)
const isPending = ref(false)

const onSubmit = (values: FormValues) => {
  // Transform the form data to the required payload format
  const payload: InvitePayload = {
    email: values.email,
    roles: values.roles,
    locations: values.locations,
  }

  console.log("Submitting invite member payload:", payload)

  // Mock success for development
  toast.success("Member invitation sent!")
  emit("update:modelValue", false)
  emit("refresh")
}
</script>
