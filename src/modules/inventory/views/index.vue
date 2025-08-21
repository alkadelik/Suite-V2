<template>
  <div class="overflow-hidden">
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

    <AppButton icon="chevron-right" label="Promise" size="sm" variant="outlined" />

    <SelectFieldExampleNew />

    <DataTableExample />
  </div>
</template>

<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import DataTableExample from "@components/examples/DataTableExample.vue"
import DropdownExample from "@components/examples/DropdownExample.vue"
import SelectFieldExampleNew from "@components/examples/SelectFieldExampleNew.vue"
import TextAreaField from "@components/form/TextAreaField.vue"
import TextField from "@components/form/TextField.vue"
import { ref } from "vue"

const input = ref("")
</script>
