<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import TextField from "@components/form/TextField.vue"
import Icon from "@components/Icon.vue"
import { useGetCustomers } from "@modules/customers/api"
import AddCustomerModal from "@modules/customers/components/AddCustomerModal.vue"
import CustomerCard from "@modules/customers/components/CustomerCard.vue"
import { anonymousCustomer } from "@modules/orders/constants"
import type { ICustomer } from "@modules/customers/types"
import { computed, ref } from "vue"
import { useDebouncedRef } from "@/composables/useDebouncedRef"

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
const debouncedSearch = useDebouncedRef(searchQuery, 750)
const page = ref(1)
const itemsPerPage = ref(50)
const computedParams = computed(() => {
  const params: Record<string, string> = {}
  if (debouncedSearch.value) params.search = debouncedSearch.value
  params.offset = ((page.value - 1) * itemsPerPage.value).toString()
  params.limit = itemsPerPage.value.toString()
  return params
})
const { data: customersData, isFetching, refetch } = useGetCustomers(computedParams)
const customers = computed(() => customersData?.value?.data?.results ?? [])

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
        All Customers
        <Chip v-if="customersData?.data?.count" :label="String(customersData?.data?.count)" />
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
        v-for="customer in customers"
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

    <div v-if="isFetching" class="flex items-center justify-center py-12">
      <Icon name="loader" size="64" class="!animate text-primary-600 !animate-spin" />
    </div>

    <div class="h-24" />

    <div
      class="border-core-200 fixed right-0 bottom-0 left-0 flex gap-3 border-t bg-white p-4 md:p-6"
    >
      <AppButton label="Back" color="alt" class="w-1/3" icon="arrow-left" @click="emit('prev')" />
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
