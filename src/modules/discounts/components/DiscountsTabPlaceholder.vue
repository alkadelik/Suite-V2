<template>
  <EmptyState
    title="You don't have any discount or promo yet!"
    description="Add a new discount type for your orders by clicking the button below."
  >
    <template #action>
      <div class="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <AppButton label="Add a discount" icon="add" disabled />
        <AppButton label="Add a Coupon" icon="add" disabled />
      </div>
    </template>
  </EmptyState>
</template>

<script setup lang="ts">
import EmptyState from "@components/EmptyState.vue"
import AppButton from "@components/AppButton.vue"
</script>
