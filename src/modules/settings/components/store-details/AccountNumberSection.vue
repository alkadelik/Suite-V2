<script setup lang="ts">
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"
import { onInvalidSubmit } from "@/utils/validations"
import AppButton from "@components/AppButton.vue"
import FormField from "@components/form/FormField.vue"
import SectionHeader from "@components/SectionHeader.vue"
import {
  useCreateBankAccount,
  useGetSupportedBanks,
  useResolveBankAccount,
} from "@modules/shared/api"
import { useForm } from "vee-validate"
import { ref } from "vue"
import { computed, watch } from "vue"
import * as yup from "yup"

const accountName = ref<string>("")

const { data: banks, isPending: isLoading } = useGetSupportedBanks()
const { mutate: addBankAccount, isPending } = useCreateBankAccount()
const { mutate: resolveAccount, isPending: isResolving } = useResolveBankAccount()

const supportedBanks = computed(() => {
  const apiData = banks.value?.data.data
  if (Array.isArray(apiData)) {
    return apiData.map((bank) => ({ label: bank.name, value: bank.code }))
  }
  return []
})

const { handleSubmit, meta, setErrors, setValues, values } = useForm<{
  account_number: string
  bank_name: { label: string; value: string }
  account_name: string
}>({
  validationSchema: yup.object({
    account_number: yup
      .string()
      .length(10, "Enter a valid account number")
      .required("Account number is required"),
    bank_name: yup.object().required("Bank name is required"),
    account_name: yup.string().required("Could not resolve account name"),
  }),
})

const validateAccountNumber = (account_number: string, bank_code: string) => {
  resolveAccount(
    { account_number, bank_code },
    {
      onSuccess: ({ data }) => {
        console.log("Resolved account name:", data?.data?.data)
        const acct_name = data?.data?.data?.account_name
        if (acct_name) {
          accountName.value = acct_name
          setValues({ account_name: acct_name })
        } else {
          accountName.value = ""
          setErrors({ account_number: "Could not resolve account name" })
        }
      },
    },
  )
}

watch(
  () => values,
  (newValue) => {
    if (newValue.bank_name && newValue.account_number?.length === 10) {
      validateAccountNumber(newValue.account_number, newValue.bank_name.value)
    } else {
      accountName.value = ""
    }
  },
  { deep: true },
)

const onUpdateBank = handleSubmit((values) => {
  const payload = {
    ...values,
    bank_name: values.bank_name.label,
    bank_code: values.bank_name.value,
  }
  addBankAccount(payload, {
    onSuccess: () => {
      toast.success("Bank account added successfully")
    },
    onError: displayError,
  })
}, onInvalidSubmit)
</script>

<template>
  <section class="mt-10">
    <SectionHeader
      title="Bank Account Details"
      subtitle="This is the bank account where you’ll receive payments from your orders on Leyyow."
      size="sm"
      class="mb-6"
    />

    <form @submit.prevent="onUpdateBank" class="space-y-6 md:space-y-8">
      <FormField
        name="account_number"
        label="Account Number"
        placeholder="e.g. 1234567890"
        required
      />

      <FormField
        name="bank_name"
        type="select"
        label="Bank Name"
        placeholder="Select your bank"
        required
        searchable
        :options="supportedBanks"
        :hint="
          isLoading ? 'Loading...' : isResolving ? 'Validating...' : accountName ? accountName : ''
        "
        placement="top"
      />

      <AppButton
        type="submit"
        :loading="isPending"
        label="Save Bank Details"
        class="w-full"
        :class="{ 'cursor-not-allowed opacity-50': !meta.valid || !accountName || isResolving }"
      />
    </form>
  </section>
</template>
