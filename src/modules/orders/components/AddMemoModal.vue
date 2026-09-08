<script setup lang="ts">
import { ref } from "vue"
import { useCreateOrderMemo } from "../api"
import { TMemoAwaiting } from "../types"
import { displayError } from "@/utils/error-handler"
import { toast } from "@/composables/useToast"
import RadioInputField from "@components/form/RadioInputField.vue"
import SelectField from "@components/form/SelectField.vue"
import TextField from "@components/form/TextField.vue"
import AppButton from "@components/AppButton.vue"
import TextAreaField from "@components/form/TextAreaField.vue"
import Drawer from "@components/Drawer.vue"

const props = defineProps<{ open: boolean; orderId: string }>()

const emit = defineEmits<{ close: []; refresh: [] }>()

const awaitingOptions: { label: string; value: TMemoAwaiting }[] = [
  { label: "Merchant", value: "merchant" },
  { label: "Customer", value: "customer" },
  { label: "Nobody", value: "nobody" },
]

const emptyForm = () => ({
  title: "",
  awaiting: awaitingOptions[0],
  severity: "low" as "low" | "medium" | "high",
  content: "",
})

const memoForm = ref(emptyForm())

const { mutate: createMemo, isPending } = useCreateOrderMemo()

const onSubmit = () => {
  createMemo(
    { id: props.orderId, body: { ...memoForm.value, awaiting: memoForm.value.awaiting.value } },
    {
      onSuccess: () => {
        memoForm.value = emptyForm()
        toast.success("Memo created successfully!")
        emit("refresh")
        emit("close")
      },
      onError: displayError,
    },
  )
}

const handleClose = () => {
  memoForm.value = emptyForm()
  emit("close")
}
</script>

<template>
  <Drawer
    :open="open"
    title="Create Memo"
    max-width="2xl"
    variant="fullscreen"
    @close="handleClose"
  >
    <div class="space-y-5">
      <!-- Title -->
      <TextField
        v-model="memoForm.title"
        label="Memo Title"
        placeholder="Enter memo title"
        required
      />

      <!-- Awaiting -->
      <SelectField v-model="memoForm.awaiting" label="Awaiting" :options="awaitingOptions" />

      <!-- Severity -->
      <RadioInputField
        v-model="memoForm.severity"
        label="Severity"
        :options="[
          { label: 'Low', value: 'low' },
          { label: 'Medium', value: 'medium' },
          { label: 'High', value: 'high' },
        ]"
      />

      <!-- content -->
      <TextAreaField
        v-model="memoForm.content"
        label="Content"
        placeholder="Enter memo content..."
        :rows="4"
        :show-character-count="true"
        :maxlength="250"
      />
    </div>

    <!-- Footer -->
    <template #footer>
      <AppButton
        label="Create Memo"
        @click="onSubmit"
        class="w-full"
        :loading="isPending"
        :disabled="!memoForm.title || !memoForm.content"
      />
    </template>
  </Drawer>
</template>
