<template>
  <Modal
    :open="modelValue"
    title="Add Bank Details"
    max-width="xl"
    @close="emit('update:modelValue', false)"
    variant="bottom-nav"
    :handle-padding="false"
  >
    <AppForm :schema="bankAccountSchema" @submit="onSubmit" v-slot="{ meta }">
      <div class="space-y-4 px-4 py-4 md:space-y-8 md:px-6">
        <div class="flex size-10 items-center justify-center rounded-xl bg-neutral-50 p-2">
          <Icon name="shop-add" size="20" />
        </div>

        <p class="text-xs md:text-sm">
          This is the bank account where you’ll receive payments from your orders on Leyyow.
        </p>

        <div>
          <FormField
            name="account_number"
            label="Enter Account Number"
            placeholder="e.g. 0123456789"
            required
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

        <FormField
          name="bank_code"
          label="Select Your Bank"
          type="select"
          :options="supportedBanks"
          placeholder="Choose your bank"
          required
          searchable
        />

        <WarningBox header="Payment Processing Fees">
          <ul class="list-disc space-y-1 pl-5">
            <li><span class="font-semibold">2%</span> for online orders below ₦2000.</li>
            <li>
              <span class="font-semibold">2% + ₦100 flat fee</span> for online orders ₦2000 and
              above.
            </li>
            <li><span class="font-semibold">Capped at ₦2500</span> per transaction.</li>
          </ul>
        </WarningBox>
      </div>

      <div class="bg-white px-6 py-4">
        <AppButton
          type="submit"
          label="Save Bank Details"
          :loading="isPending"
          class="w-full"
          :disabled="!meta.valid || !resolvedAccountName"
        />
      </div>
    </AppForm>
  </Modal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue"
import * as yup from "yup"
import { toast } from "@/composables/useToast"
// import { displayError } from "@/utils/error-handler"
import AppButton from "@/components/AppButton.vue"
import Modal from "@/components/Modal.vue"
import AppForm from "@/components/form/AppForm.vue"
import FormField from "@/components/form/FormField.vue"
import Icon from "@components/Icon.vue"
import WarningBox from "@components/WarningBox.vue"
// import {
//   useCreateBankAccount,
//   useGetSupportedBanks,
//   useResolveBankAccount,
// } from "@/composables/api/business"

interface BankOption {
  label: string
  value: string
}

interface BankAccountPayload {
  bank_code: BankOption
  account_number: string
}

defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  "update:modelValue": [value: boolean]
  refresh: []
}>()

// Form state
const resolvedAccountName = ref("")
const errorMsg = ref("")

// API hooks (uncomment when ready to use)
// const { data: banks = [] } = useGetSupportedBanks()
// const { mutate: resolveAccount, isPending: isResolving } = useResolveBankAccount()
// const { mutate: createBankAccount, isPending } = useCreateBankAccount()

// Mock data for development (remove when API is ready)
const banks = ref([])
const isResolving = ref(false)
const isPending = ref(false)

interface Bank {
  name: string
  code: string
}

const supportedBanks = computed(
  () => banks.value?.map((bank: Bank) => ({ label: bank.name, value: bank.code })) || [],
)

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

// Form values for watching
const formValues = ref<BankAccountPayload>({
  bank_code: { label: "", value: "" },
  account_number: "",
})

// Watch for account number and bank code changes to resolve account name
watch(
  () => [formValues.value.account_number, formValues.value.bank_code],
  ([accountNumber, bankCode]) => {
    if (bankCode && typeof accountNumber === "string" && accountNumber.length === 10) {
      // resolveAccount(
      //   { account_number: accountNumber, bank_code: bankCode.value },
      //   {
      //     onSuccess: (res) => {
      //       if (res.data.account_name) {
      //         resolvedAccountName.value = res.data.account_name
      //         errorMsg.value = ""
      //       } else {
      //         errorMsg.value = "No account name found."
      //         resolvedAccountName.value = ""
      //       }
      //     },
      //     onError: (err) => {
      //       console.log("error", err)
      //       errorMsg.value = "Invalid account details. Please check."
      //       resolvedAccountName.value = ""
      //     },
      //   }
      // )
    } else {
      resolvedAccountName.value = ""
    }
  },
  { deep: true },
)

// Watch for bank code changes to reset form
watch(
  () => bankAccountSchema.fields.bank_code,
  () => {
    resolvedAccountName.value = ""
    errorMsg.value = ""
  },
  { deep: true },
)

const onSubmit = (values: BankAccountPayload) => {
  const payload = {
    account_number: values.account_number,
    bank_code: values.bank_code.value,
    bank_name: values.bank_code.label,
    account_name: resolvedAccountName.value,
  }

  // createBankAccount(payload, {
  //   onSuccess: () => {
  //     toast.success("Bank account details saved!")
  //     emit("update:modelValue", false)
  //     emit("refresh")
  //   },
  //   onError: displayError,
  // })

  // Mock success for development
  console.log("Submitting bank account:", payload)
  toast.success("Bank account details saved!")
  emit("update:modelValue", false)
  emit("refresh")
}
</script>
