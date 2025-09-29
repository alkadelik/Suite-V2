<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import TextField from "@components/form/TextField.vue"
import Icon from "@components/Icon.vue"
import CustomerCard from "@modules/customers/components/CustomerCard.vue"
import { ICustomer } from "@modules/customers/types"
import { ref } from "vue"

const customersList: ICustomer[] = [
  {
    uid: "cust_001",
    full_name: "John Doe",
    phone: "+1234567890",
    email: "john.doe@example.com",
    total_orders: 5,
    last_active: "2023-10-01",
    is_active: true,
    created_at: "2023-01-15",
  },
  {
    uid: "cust_002",
    full_name: "Jane Smith",
    phone: "+0987654321",
    email: "jane.smith@example.com",
    total_orders: 3,
    last_active: "2023-09-15",
    is_active: true,
    created_at: "2023-02-20",
  },
]

const searchQuery = ref("")
const emit = defineEmits(["next", "prev"])
</script>

<template>
  <div>
    <div class="bg-core-50 mb-2 flex size-10 items-center justify-center rounded-xl p-2">
      <Icon name="bank" size="28" />
    </div>
    <p class="mb-4 text-sm">Select who placed this order?</p>

    <div class="mb-8 flex flex-col gap-3">
      <h3 class="text-lg font-semibold">All Customers <Chip :label="String(20)" /></h3>
      <div class="flex items-center gap-3">
        <TextField
          left-icon="search-lg"
          size="md"
          class="w-full"
          placeholder="Search by customer or order ref"
          v-model="searchQuery"
        />
        <AppButton icon="filter-lines" variant="outlined" color="alt" class="flex-shrink-0" />
        <AppButton icon="add" class="flex-shrink-0" />
      </div>
    </div>

    <section>
      <div v-for="customer in customersList" :key="customer.uid" class="mb-4 cursor-pointer">
        <CustomerCard :customer="customer" />
      </div>
    </section>

    <div
      class="border-core-200 bg-base-background fixed right-0 bottom-0 left-0 flex gap-3 border-t p-6"
    >
      <AppButton
        label="Back"
        color="alt"
        variant="outlined"
        class="w-1/3"
        icon="arrow-left"
        @click="emit('prev')"
      />
      <AppButton label="Next" class="w-2/3" @click="emit('next')" />
    </div>
  </div>
</template>
