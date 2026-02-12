<template>
  <Modal
    :open="modelValue"
    title="Add Bank Details"
    max-width="xl"
    @close="emit('update:modelValue', false)"
    variant="bottom-nav"
    :handle-padding="false"
  >
    <AppForm :schema="bankAccountSchema" @submit="onSubmit" v-slot="{ meta, values }">
      <div class="space-y-4 px-4 py-4 md:space-y-8 md:px-6">
        <div class="flex size-10 items-center justify-center rounded-xl bg-neutral-50 p-2">
          <Icon name="shop-add" size="20" />
        </div>

        <p class="text-xs md:text-sm">
          This is the bank account where you'll receive payments from your orders on Leyyow.
        </p>

        <FormField
          name="account_number"
          label="Enter Account Number"
          placeholder="e.g. 0123456789"
          required
        />

        <div>
          <FormField
            name="bank_code"
            label="Select Your Bank"
            type="select"
            :options="supportedBanks"
            placeholder="Choose your bank"
            required
            searchable
          />
          <p
            v-if="errorMsg || resolvedAccountName || isResolving"
            :class="[
              'mt-1.5 text-xs font-medium',
              isResolving ? 'text-core-800' : errorMsg ? 'text-error' : 'text-green-500',
            ]"
          >
            {{ isResolving ? "Validating..." : errorMsg || resolvedAccountName }}
          </p>
        </div>
      </div>

      <div class="bg-white px-6 py-4">
        <AppButton
          type="submit"
          label="Save Bank Details"
          :loading="isPending"
          class="w-full"
          :disabled="!meta.valid || !resolvedAccountName || !!errorMsg"
        />
      </div>

      <!-- Hidden component to watch form values -->
      <FormValuesWatcher :values="values" @values-changed="handleFormValuesChange" />
    </AppForm>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, defineComponent } from "vue"
import * as yup from "yup"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"
import AppButton from "@/components/AppButton.vue"
import Modal from "@/components/Modal.vue"
import AppForm from "@/components/form/AppForm.vue"
import FormField from "@/components/form/FormField.vue"
import Icon from "@components/Icon.vue"
import { useCreateBankAccount, useGetSupportedBanks, useResolveBankAccount } from "../api"
import { TCreateAccountPayload } from "../types.ts"

interface BankOption {
  label: string
  value: string
}

interface BankAccountPayload {
  bank_code: BankOption
  account_number: string
}

// Helper component to watch form values
const FormValuesWatcher = defineComponent({
  props: ["values"],
  emits: ["valuesChanged"],
  watch: {
    values: {
      handler(newValues) {
        this.$emit("valuesChanged", newValues)
      },
      deep: true,
      immediate: true,
    },
  },
  render() {
    return null
  },
})

defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  "update:modelValue": [value: boolean]
  refresh: []
}>()

// Form state
const resolvedAccountName = ref("")
const errorMsg = ref("")

// API hooks
const { data: banks } = useGetSupportedBanks()
const { mutate: resolveAccount, isPending: isResolving } = useResolveBankAccount()
const { mutate: createBankAccount, isPending } = useCreateBankAccount()

interface Bank {
  name: string
  code: string
}

const supportedBanks = computed(() => {
  const apiData = banks.value?.data.data
  if (Array.isArray(apiData)) {
    return apiData.map((bank: Bank) => ({
      label: bank.name,
      value: bank.code,
    }))
  }
  return []
})

// Validation schema
const bankAccountSchema = yup.object({
  bank_code: yup
    .object()
    .shape({
      label: yup.string().required(),
      value: yup.string().required(),
    })
    .required("Please select a bank"),
  account_number: yup
    .string()
    .matches(/^\d{10}$/, "Account number must be exactly 10 digits")
    .required("Account number is required"),
})

// Handle form values changes
const handleFormValuesChange = (values: BankAccountPayload) => {
  const { account_number, bank_code } = values

  // Reset states when form changes
  if (!account_number || !bank_code?.value) {
    resolvedAccountName.value = ""
    errorMsg.value = ""
    return
  }

  // Only resolve if we have both account number (10 digits) and bank code
  if (account_number.length === 10 && bank_code.value) {
    resolveAccount(
      {
        account_number: account_number,
        bank_code: bank_code.value,
      },
      {
        onSuccess: (res: { data: { data: { data: { account_name: string } } } }) => {
          // Access the nested data structure: res.data.data.data.account_name
          if (res.data?.data?.data?.account_name) {
            resolvedAccountName.value = res.data.data.data.account_name
            errorMsg.value = ""
          } else {
            errorMsg.value = "No account name found."
            resolvedAccountName.value = ""
          }
        },
        onError: displayError,
      },
    )
  } else {
    resolvedAccountName.value = ""
    errorMsg.value = ""
  }
}

const onSubmit = (values: BankAccountPayload) => {
  const payload: TCreateAccountPayload = {
    account_number: values.account_number,
    bank_code: values.bank_code.value,
    bank_name: values.bank_code.label,
  }

  createBankAccount(payload, {
    onSuccess: () => {
      toast.success("Bank account details saved!")
      emit("update:modelValue", false)
      emit("refresh")
    },
    onError: (error) => displayError(error),
  })
}
</script>
