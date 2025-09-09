<template>
  <Drawer
    :open="modelValue"
    :title="mode === 'add' ? 'Add New Customer' : 'Edit Customer'"
    :position="drawerPosition"
    max-width="xl"
    @close="emit('update:modelValue', false)"
    body-class="!p-0"
  >
    <AppForm
      :schema="schema"
      :initial-values="initialValues"
      @submit="onSubmit"
      v-slot="{ meta }"
      class="flex h-full flex-col"
      :key="formKey"
    >
      <div class="flex-1 space-y-4 px-4 py-4 md:space-y-6 md:px-6">
        <FormField name="first_name" label="First Name" type="text" placeholder="e.g. Adebola" />

        <FormField
          name="last_name"
          label="Last Name (optional)"
          type="text"
          placeholder="e.g. Smith"
        />

        <FormField
          name="email"
          label="Email Address (optional)"
          type="email"
          placeholder="Enter email address"
        />

        <FormField
          name="phone"
          label="Phone Number (optional)"
          type="text"
          placeholder="Enter phone number"
        />

        <GooglePlacesAutocomplete
          name="address"
          label="Address (optional)"
          placeholder="Enter a keyword to get suggestions"
          :initial-value="initialValues.address"
        />

        <div class="flex flex-col gap-2 md:flex-row">
          <FormField
            name="state"
            label="State (optional)"
            type="text"
            placeholder="Lagos"
            class="flex-1"
          />

          <FormField
            name="country"
            label="Country (optional)"
            type="text"
            placeholder="Nigeria"
            class="flex-1"
          />
        </div>

        <div class="flex flex-col gap-2 md:flex-row">
          <FormField
            name="dateOfBirth"
            label="Date of Birth (optional)"
            type="date"
            placeholder="Enter date of birth"
            class="flex-1"
          />

          <FormField
            name="instagramHandle"
            label="Instagram Handle (optional)"
            type="text"
            placeholder="Enter Instagram handle"
            class="flex-1"
          />
        </div>
      </div>

      <div class="sticky bottom-0 space-y-3 border-t border-gray-200 bg-white px-4 py-4 md:px-6">
        <AppButton
          type="submit"
          :label="mode === 'add' ? 'Add Customer' : 'Save Changes'"
          :loading="isPending"
          class="w-full"
          :disabled="!meta.valid"
        />
      </div>
    </AppForm>
  </Drawer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue"
import * as yup from "yup"
import { toast } from "@/composables/useToast"
import Drawer from "@components/Drawer.vue"
import AppButton from "@/components/AppButton.vue"
import AppForm from "@/components/form/AppForm.vue"
import FormField from "@/components/form/FormField.vue"
import type { TCustomer, TCustomerFormMode, ICustomerFormPayload } from "../types"
import GooglePlacesAutocomplete from "@components/GooglePlacesAutocomplete.vue"

interface FormValues {
  [key: string]: unknown
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string
  state: string
  country: string
  dateOfBirth: string
  instagramHandle: string
}

interface Props {
  /** Whether the drawer is open/visible */
  modelValue: boolean
  /** Form mode - add new customer or edit existing */
  mode?: TCustomerFormMode
  /** Customer data for editing (required when mode is 'edit') */
  customer?: TCustomer | null
  /** Loading state for async operations */
  loading?: boolean
}

interface Emits {
  /** Update the modelValue */
  "update:modelValue": [value: boolean]
  /** Emitted when form is submitted successfully */
  submit: [payload: ICustomerFormPayload, mode: TCustomerFormMode]
  /** Emitted when drawer should refresh parent data */
  refresh: []
}

const props = withDefaults(defineProps<Props>(), {
  mode: "add",
  customer: null,
  loading: false,
})

const emit = defineEmits<Emits>()

// Reactive state
const isPending = ref(false)
const isMobile = ref(false)
const formKey = ref(0) // Force form re-render when switching modes

// Watch for changes in customer or mode to force form re-render
watch([() => props.customer, () => props.mode, () => props.modelValue], () => {
  formKey.value += 1
})

// Check if mobile on mount and window resize
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768 // md breakpoint
}

onMounted(() => {
  checkMobile()
  window.addEventListener("resize", checkMobile)
})

// Computed drawer position based on screen size
const drawerPosition = computed(() => {
  return isMobile.value ? "bottom" : "right"
})

// Validation schema - updated to match form fields
const schema = computed(() => {
  return yup.object({
    first_name: yup.string().required("First name is required"),
    last_name: yup.string().optional(),
    email: yup.string().email("Please enter a valid email address").optional(),
    phone: yup.string().optional(),
    address: yup.string().optional(),
    state: yup.string().optional(),
    country: yup.string().optional(),
    dateOfBirth: yup.string().optional(),
    instagramHandle: yup.string().optional(),
  })
})

// Compute initial values based on mode and customer data
const initialValues = computed<FormValues>(() => {
  if (props.mode === "edit" && props.customer) {
    return {
      first_name: props.customer.first_name || "",
      last_name: props.customer.last_name || "",
      email: props.customer.email || "",
      phone: props.customer.phone || "",
      address: props.customer.address || "",
      state: props.customer.state || "",
      country: props.customer.country || "",
      dateOfBirth: props.customer.dateOfBirth || "",
      instagramHandle: props.customer.instagramHandle || "",
    }
  }

  return {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    state: "",
    country: "",
    dateOfBirth: "",
    instagramHandle: "",
  }
})

// Handle form submission
const onSubmit = (values: FormValues) => {
  const payload: ICustomerFormPayload = {
    first_name: values.first_name.trim(),
    last_name: values.last_name.trim(),
    email: values.email.trim().toLowerCase(),
    phone: values.phone.trim(),
    address: values.address.trim() || undefined,
    state: values.state.trim() || undefined,
    country: values.country.trim() || undefined,
    dateOfBirth: values.dateOfBirth || undefined,
    instagramHandle: values.instagramHandle.trim() || undefined,
  }

  console.log(`${props.mode === "add" ? "Adding" : "Updating"} customer:`, payload)

  // Emit the submit event with payload and mode
  emit("submit", payload, props.mode)

  // Show success message
  const successMessage =
    props.mode === "add" ? "Customer added successfully!" : "Customer updated successfully!"

  toast.success(successMessage)

  // Close drawer and refresh parent
  emit("update:modelValue", false)
}
</script>
