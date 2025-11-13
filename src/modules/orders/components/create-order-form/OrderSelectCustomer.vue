<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import EmptyState from "@components/EmptyState.vue"
import TextField from "@components/form/TextField.vue"
import Icon from "@components/Icon.vue"
import { useGetCustomers } from "@modules/customers/api"
import AddCustomerModal from "@modules/customers/components/AddCustomerModal.vue"
import CustomerCard from "@modules/customers/components/CustomerCard.vue"
import { anonymousCustomer } from "@modules/orders/constants"
import type { ICustomer } from "@modules/customers/types"
import { computed, ref } from "vue"

const props = defineProps<{
  selectedCustomer: ICustomer | null
}>()

const emit = defineEmits<{
  next: []
  prev: []
  "update:selectedCustomer": [customer: ICustomer | null]
}>()

const openAdd = ref(false)
const searchQuery = ref("")

const { data: customersData, isFetching, refetch } = useGetCustomers()
const customers = computed(() => customersData?.value?.data?.results ?? [])

const filteredCustomers = computed(() => {
  if (!searchQuery.value.trim()) {
    return customers.value
  }

  const query = searchQuery.value.toLowerCase().trim()
  return customers.value.filter(
    (customer: ICustomer) =>
      customer.first_name?.toLowerCase().includes(query) ||
      customer.last_name?.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query) ||
      customer.phone?.toLowerCase().includes(query),
  )
})

const selectCustomer = (customer: ICustomer) => {
  emit("update:selectedCustomer", customer)
}

const handleAddCustomer = (customer: ICustomer) => {
  emit("update:selectedCustomer", customer)
  openAdd.value = false
}

const canProceed = computed(() => props.selectedCustomer !== null)

const handleNext = () => {
  if (canProceed.value) {
    emit("next")
  }
}
</script>

<template>
  <div>
    <div class="bg-core-50 mb-2 flex size-10 items-center justify-center rounded-xl p-2">
      <Icon name="bank" size="28" />
    </div>
    <p class="mb-4 text-sm">Select who placed this order?</p>

    <div class="mb-8 flex flex-col gap-3">
      <h3 class="text-lg font-semibold">
        All Customers <Chip :label="String(filteredCustomers.length)" />
      </h3>
      <div class="flex items-center gap-3">
        <TextField
          left-icon="search-lg"
          size="md"
          class="w-full"
          placeholder="Search by name, email or phone"
          v-model="searchQuery"
        />
        <AppButton icon="filter-lines" variant="outlined" color="alt" class="flex-shrink-0" />
        <AppButton icon="add" class="flex-shrink-0" @click="openAdd = true" />
      </div>
    </div>

    <section class="space-y-4">
      <div
        class="cursor-pointer rounded-xl transition-all"
        :class="
          selectedCustomer?.uid === anonymousCustomer.uid
            ? 'ring-primary-600 ring-2'
            : 'hover:shadow-md'
        "
        @click="selectCustomer(anonymousCustomer)"
      >
        <CustomerCard :customer="anonymousCustomer" />
      </div>
      <div
        v-for="customer in filteredCustomers"
        :key="customer.uid"
        class="cursor-pointer rounded-xl transition-all"
        :class="
          selectedCustomer?.uid === customer.uid ? 'ring-primary-600 ring-2' : 'hover:shadow-md'
        "
        @click="selectCustomer(customer)"
      >
        <CustomerCard :customer="customer" />
      </div>
    </section>

    <EmptyState
      v-if="!isFetching && filteredCustomers.length === 0"
      title="No Customers Found"
      :description="
        searchQuery ? 'Try adjusting your search query' : 'Add a customer to get started'
      "
      class="!min-h-[500px] md:!bg-none"
    />

    <div v-if="isFetching" class="flex min-h-[500px] items-center justify-center">
      <div class="text-center">
        <Icon name="user" class="text-core-300 mx-auto mb-4 h-16 w-16 animate-pulse" />
        <p class="text-core-400 text-sm">Loading customers...</p>
      </div>
    </div>

    <div class="h-24" />

    <div class="border-core-200 fixed right-0 bottom-0 left-0 flex gap-3 border-t bg-white p-6">
      <AppButton
        label="Back"
        color="alt"
        variant="outlined"
        class="w-1/3"
        icon="arrow-left"
        @click="emit('prev')"
      />
      <AppButton label="Next" class="w-2/3" :disabled="!canProceed" @click="handleNext" />
    </div>

    <!-- Add Customer Modal -->
    <AddCustomerModal
      :open="openAdd"
      @close="openAdd = false"
      @submit="handleAddCustomer"
      @refresh="refetch"
    />
  </div>
</template>
