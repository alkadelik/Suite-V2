<template>
  <div
    class="border-core-300 bg-core-25 text-core-600 w-full cursor-pointer rounded-xl border p-4"
    :class="props.class"
    @click="emit('click', customer)"
  >
    <div class="flex items-start gap-3">
      <!-- Custom Avatar on the left -->
      <span
        :aria-label="`${customer.full_name?.split(' ')[0]} ${customer.full_name?.split(' ')[1]} avatar`"
        class="bg-bloom-300 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold shadow-sm"
      >
        {{ getInitials(customer?.full_name || "Guest") }}
      </span>

      <!-- Customer details on the right -->
      <div class="flex-1">
        <h2 class="text-core-700 mb-2 text-base font-semibold">
          {{ customer.full_name || "Guest" }}
        </h2>
        <div class="flex flex-wrap items-center gap-3">
          <div class="flex items-center gap-1">
            <Icon name="sms" class="text-core-600 h-5 w-5" />
            <p class="text-sm">{{ customer.email }}</p>
          </div>
          <div class="flex items-center gap-1">
            <Icon name="call" class="text-core-600 h-5 w-5" />
            <p class="text-sm">{{ customer.phone }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Icon from "@components/Icon.vue"
import { getInitials } from "@/utils/format-strings"
import { ICustomer } from "../types"

interface CustomerCardProps {
  customer: ICustomer
  class?: string
}

const props = defineProps<CustomerCardProps>()

const emit = defineEmits<{
  (e: "click", customer: CustomerCardProps["customer"]): void
}>()
</script>
