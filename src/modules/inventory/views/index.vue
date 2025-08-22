<template>
  <div>
    <h1 class="text-core-600">Inventory</h1>

    <TextField
      v-model="input"
      label="First Name"
      required
      type="password"
      placeholder="Enter first name..."
      left-icon="house"
      hint="Your govt first name"
    />
    <TextAreaField
      v-model="input"
      label="Description"
      required
      placeholder="Enter description..."
      showCharacterCount
      :maxlength="50"
      :minlength="10"
    />

    <DropdownExample />

    <AppButton @click="showModal = true" label="Promise" size="sm" variant="outlined" />

    <SelectFieldExampleNew />

    <OtpField v-model="otpCode" label="Enter verification code" />

    <DataTableExample />

    <Modal :open="showModal" title="Add Member" @close="showModal = false">
      <!-- Modal Content -->
      <div>Your form or content here...</div>

      <!-- Footer Slot -->
      <template #footer>
        <button
          class="w-full rounded-lg bg-orange-700 py-2 font-medium text-white hover:bg-orange-800"
        >
          Add Member(s)
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import DataTableExample from "@components/examples/DataTableExample.vue"
import DropdownExample from "@components/examples/DropdownExample.vue"
import SelectFieldExampleNew from "@components/examples/SelectFieldExampleNew.vue"
import OtpField from "@components/form/OtpField.vue"
import TextAreaField from "@components/form/TextAreaField.vue"
import TextField from "@components/form/TextField.vue"
import Modal from "@components/Modal.vue"
import { ref } from "vue"

const input = ref("")
const otpCode = ref("")
const showModal = ref(false)
</script>
