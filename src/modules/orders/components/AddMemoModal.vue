<script setup lang="ts">
import Modal from "@components/Modal.vue"
import { computed, ref } from "vue"
import { useCreateOrderMemo } from "../api"
import { displayError } from "@/utils/error-handler"
import { toast } from "@/composables/useToast"
import RadioInputField from "@components/form/RadioInputField.vue"
import SelectField from "@components/form/SelectField.vue"
import TextField from "@components/form/TextField.vue"
import AppButton from "@components/AppButton.vue"
import TextAreaField from "@components/form/TextAreaField.vue"
import { useMediaQuery } from "@vueuse/core"
import Drawer from "@components/Drawer.vue"

const props = defineProps<{ open: boolean; orderId: string }>()

const emit = defineEmits<{ close: []; refresh: [] }>()

const statusOptions = [
  { label: "Merchant Action Required", value: "merchant-action" },
  { label: "Customer Action Required", value: "customer-action" },
]

const memoForm = ref({
  title: "",
  status: statusOptions[0],
  severity: "low" as "low" | "medium" | "high",
  content: "",
})

const { mutate: createMemo, isPending } = useCreateOrderMemo()

const onSubmit = () => {
  createMemo(
    { id: props.orderId, body: { ...memoForm.value, status: memoForm.value.status.value } },
    {
      onSuccess: () => {
        toast.success("Memo created successfully!")
        emit("close")
        emit("refresh")
      },
      onError: displayError,
    },
  )
}

const isMobile = computed(() => useMediaQuery("(max-width: 1024px)").value)
</script>

<template>
  <component
    :is="isMobile ? Modal : Drawer"
    :open="open"
    title="Create Memo"
    max-width="2xl"
    variant="fullscreen"
    @close="emit('close')"
  >
    <div class="space-y-5">
      <!-- Title -->
      <TextField
        v-model="memoForm.title"
        label="Memo Title"
        placeholder="Enter memo title"
        required
      />

      <!-- Status -->
      <SelectField v-model="memoForm.status" label="Status" :options="statusOptions" />

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
  </component>
</template>
