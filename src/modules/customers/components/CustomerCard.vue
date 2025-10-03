<template>
  <div class="border-primary-700 bg-primary-25 text-core-600 w-full rounded-xl border p-4">
    <div class="flex items-start gap-3">
      <!-- Custom Avatar on the left -->
      <span
        :aria-label="`${customer.full_name?.split(' ')[0]} ${customer.full_name?.split(' ')[1]} avatar`"
        class="bg-bloom-300 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold shadow-sm"
      >
        {{ getInitials(customer?.full_name || "") }}
      </span>

      <!-- Customer details on the right -->
      <div class="flex-1">
        <h2 class="text-core-700 mb-2 text-lg font-semibold">
          {{ customer.full_name }}
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
import { ICustomer } from "../types"
import { getInitials } from "@/utils/format-strings"

defineProps<{
  customer: ICustomer
}>()
</script>
