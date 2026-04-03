<template>
  <div class="space-y-8 p-8">
    <h1 class="text-2xl font-bold text-gray-800">SelectField Component Examples</h1>

    <!-- Basic Single Select -->
    <div class="space-y-4">
      <h2 class="text-lg font-semibold text-gray-700">Basic Single Select</h2>
      <SelectField
        v-model="singleValue"
        label="Choose a fruit"
        placeholder="Select a fruit..."
        :options="fruits"
        required
      />
      <p class="text-sm text-gray-600">Selected: {{ singleValue || "None" }}</p>
    </div>

    <!-- Searchable Single Select -->
    <div class="space-y-4">
      <h2 class="text-lg font-semibold text-gray-700">Searchable Single Select</h2>
      <SelectField
        v-model="searchableValue"
        label="Search countries"
        placeholder="Select a country..."
        :options="countries"
        searchable
        clearable
      />
      <p class="text-sm text-gray-600">Selected: {{ searchableValue || "None" }}</p>
    </div>

    <!-- Multiple Select with Chips -->
    <div class="space-y-4">
      <h2 class="text-lg font-semibold text-gray-700">Multiple Select</h2>
      <SelectField
        v-model="multipleValues"
        label="Choose fruits"
        placeholder="Select multiple fruits..."
        :options="fruits"
        multiple
        searchable
        clearable
      />
      <p class="text-sm text-gray-600">Selected: {{ multipleValues.length }} items</p>
    </div>

    <!-- Object Options -->
    <div class="space-y-4">
      <h2 class="text-lg font-semibold text-gray-700">Object Options</h2>
      <SelectField
        v-model="selectedUser"
        label="Select user"
        placeholder="Choose a user..."
        :options="users"
        label-key="name"
        value-key="id"
        searchable
        clearable
      />
      <p class="text-sm text-gray-600">
        Selected: {{ selectedUser ? users.find((u) => u.id === selectedUser)?.name : "None" }}
      </p>
    </div>

    <!-- With Left Icon -->
    <div class="space-y-4">
      <h2 class="text-lg font-semibold text-gray-700">With Left Icon</h2>
      <SelectField
        v-model="iconValue"
        label="Location"
        placeholder="Select location..."
        :options="countries"
        left-icon="house"
        searchable
        clearable
      />
    </div>

    <!-- Error State -->
    <div class="space-y-4">
      <h2 class="text-lg font-semibold text-gray-700">Error State</h2>
      <SelectField
        v-model="errorValue"
        label="Required field"
        placeholder="Please select..."
        :options="fruits"
        error="This field is required"
        required
      />
    </div>

    <!-- Disabled -->
    <div class="space-y-4">
      <h2 class="text-lg font-semibold text-gray-700">Disabled</h2>
      <SelectField
        v-model="disabledValue"
        label="Disabled select"
        placeholder="Cannot select..."
        :options="fruits"
        disabled
      />
    </div>

    <!-- Different Sizes -->
    <div class="space-y-4">
      <h2 class="text-lg font-semibold text-gray-700">Different Sizes</h2>
      <div class="space-y-3">
        <SelectField
          v-model="smallValue"
          label="Small size"
          placeholder="Small select..."
          :options="fruits.slice(0, 3)"
          size="sm"
          searchable
        />
        <SelectField
          v-model="mediumValue"
          label="Medium size (default)"
          placeholder="Medium select..."
          :options="fruits.slice(0, 3)"
          size="md"
          searchable
        />
        <SelectField
          v-model="largeValue"
          label="Large size"
          placeholder="Large select..."
          :options="fruits.slice(0, 3)"
          size="lg"
          searchable
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import SelectField from "@/components/form/SelectField.vue"

// Simple string options
const fruits = [
  "Apple",
  "Banana",
  "Orange",
  "Grape",
  "Strawberry",
  "Mango",
  "Pineapple",
  "Watermelon",
]
const countries = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "Brazil",
  "India",
  "China",
]

// Object options
const users = [
  { id: 1, name: "John Doe", email: "john@example.com" },
  { id: 2, name: "Jane Smith", email: "jane@example.com" },
  { id: 3, name: "Bob Johnson", email: "bob@example.com" },
  { id: 4, name: "Alice Brown", email: "alice@example.com" },
]

// Reactive values
const singleValue = ref<string>()
const searchableValue = ref<string>()
const multipleValues = ref<string[]>([])
const selectedUser = ref()
const iconValue = ref<string>()
const errorValue = ref<string>()
const disabledValue = ref<string>("Apple")
const smallValue = ref<string>()
const mediumValue = ref<string>()
const largeValue = ref<string>()
</script>
