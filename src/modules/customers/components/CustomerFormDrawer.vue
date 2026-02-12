<template>
  <component
    :is="isMobile ? Modal : Drawer"
    variant="fullscreen"
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
          label="Phone Number (Optional)"
          type="text"
          placeholder="Enter phone number"
          prefix="+234"
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
            name="city"
            label="City (optional)"
            type="text"
            placeholder="Nigeria"
            class="flex-1"
          />
        </div>

        <div class="flex flex-col gap-2 md:flex-row">
          <FormField
            name="date_of_birth"
            label="Date of Birth (optional)"
            type="date"
            placeholder="Enter date of birth"
            class="flex-1"
          />

          <FormField
            name="instagram_handle"
            label="Instagram Handle (optional)"
            type="text"
            placeholder="Enter Instagram handle"
            class="flex-1"
          />
        </div>
      </div>

      <div class="py-10 lg:hidden" />

      <div
        class="fixed right-0 bottom-0 left-0 w-full space-y-3 border-t border-gray-200 bg-white px-4 py-4 md:px-6"
      >
        <AppButton
          type="submit"
          :label="mode === 'add' ? 'Add Customer' : 'Save Changes'"
          :loading="isPending"
          class="w-full"
          :disabled="!meta.valid || isPending"
        />
      </div>
    </AppForm>
  </component>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue"
import * as yup from "yup"
import { toast } from "@/composables/useToast"
import Drawer from "@components/Drawer.vue"
import AppButton from "@/components/AppButton.vue"
import AppForm from "@/components/form/AppForm.vue"
import FormField from "@/components/form/FormField.vue"
import type { ICustomer, TCustomerFormMode, ICustomerFormPayload, ICustomerDetail } from "../types"
import GooglePlacesAutocomplete from "@components/GooglePlacesAutocomplete.vue"
import { useCreateCustomer, useUpdateCustomer } from "../api"
import { displayError } from "@/utils/error-handler"
import { useAuthStore } from "@modules/auth/store"
import { formatPhoneNumber } from "@/utils/others"
import Modal from "@components/Modal.vue"
import { useMediaQuery } from "@vueuse/core"

const isMobile = useMediaQuery("(max-width: 1024px)")

interface FormValues {
  [key: string]: unknown
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string
  state: string
  city: string
  date_of_birth: string
  instagram_handle: string
}

interface Props {
  /** Whether the drawer is open/visible */
  modelValue: boolean
  /** Form mode - add new customer or edit existing */
  mode?: TCustomerFormMode
  /** Customer data for editing (required when mode is 'edit') */
  customer?: ICustomer | ICustomerDetail | null
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

const { user } = useAuthStore()

const { mutate: createCustomer, isPending: isCreating } = useCreateCustomer()
const { mutate: updateCustomer, isPending: isUpdating } = useUpdateCustomer()

// Reactive state
const formKey = ref(0) // Force form re-render when switching modes

// Computed loading state based on mode
const isPending = computed(() => {
  return props.mode === "add" ? isCreating.value : isUpdating.value
})

// Watch for changes in customer or mode to force form re-render
watch([() => props.customer, () => props.mode, () => props.modelValue], () => {
  formKey.value += 1
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
    city: yup.string().optional(),
    date_of_birth: yup.string().optional(),
    instagram_handle: yup.string().optional(),
  })
})

const initialValues = computed<FormValues>(() => {
  if (props.mode === "edit" && props.customer) {
    const customerData = props.customer as Record<string, unknown>
    const recentAddresses = customerData.recent_addresses as
      | Array<{ is_default: boolean; address?: string; state?: string; city?: string }>
      | undefined
    const defaultAddress = recentAddresses?.find((addr) => addr.is_default) || null

    return {
      first_name:
        (customerData.first_name as string) || props.customer.full_name?.split(" ")[0] || "",
      last_name:
        (customerData.last_name as string) || props.customer.full_name?.split(" ")[1] || "",
      email: props.customer.email || "",
      phone: props.customer.phone || "",
      address: defaultAddress?.address || "",
      state: defaultAddress?.state || "",
      city: defaultAddress?.city || "",
      date_of_birth: (customerData.date_of_birth as string) || "",
      instagram_handle: (customerData.instagram_handle as string) || "",
    }
  }

  return {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    state: "",
    city: "",
    date_of_birth: "",
    instagram_handle: "",
  }
})

// Handle form submission
const onSubmit = (values: FormValues) => {
  const payload: ICustomerFormPayload = {
    uid: props.customer?.uid || "",
    first_name: values.first_name.trim(),
    last_name: values.last_name.trim(),
    email: values.email.trim().toLowerCase(),
    phone: values.phone.trim() ? formatPhoneNumber(values.phone.trim()) : "",
    address: values.address.trim() || undefined,
    state: values.state.trim() || undefined,
    city: values.city.trim() || undefined,
    date_of_birth: values.date_of_birth || undefined,
    instagram_handle: values.instagram_handle.trim() || undefined,
    location: user?.assigned_locations[0].uid || "",
  }

  // remove empty strings from payload
  Object.keys(payload).forEach((key) => {
    if (payload[key as keyof ICustomerFormPayload] === "") {
      delete payload[key as keyof ICustomerFormPayload]
    }
  })

  if (props.mode === "add") {
    createCustomer(payload, {
      onSuccess: () => {
        toast.success("Customer added successfully!")
        emit("update:modelValue", false)
        emit("refresh")
        emit("submit", payload, props.mode)
      },
      onError: displayError,
    })
  } else if (props.mode === "edit" && props.customer?.uid) {
    updateCustomer(payload, {
      onSuccess: () => {
        toast.success("Customer updated successfully!")
        emit("update:modelValue", false)
        emit("refresh")
        emit("submit", payload, props.mode)
      },
      onError: displayError,
    })
  }
}
</script>
