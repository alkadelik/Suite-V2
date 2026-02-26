<script setup lang="ts">
import Icon from "@components/Icon.vue"
</script>

<template>
  <section>
    <!-- heading -->
    <header class="flex items-center gap-2 border-b border-gray-400 bg-gray-200 px-5 pt-4 pb-3">
      <span class="text-sm text-gray-600 italic">12</span>
      <h3 class="text-base font-semibold text-gray-900">Orders</h3>
      <span class="ml-auto text-xs font-medium text-gray-600 uppercase">17 orders</span>
    </header>
    <!-- content -->
    <div>
      <div class="rounded-r-lg border border-l-4 border-gray-200 border-l-gray-600 bg-white p-4">
        <h4 class="mb-3 flex items-center gap-2 text-xs font-medium uppercase">
          <Icon name="box-filled" class="text-warning-400" size="16" /> Closing Note
        </h4>
        <p class="text-sm">
          Solid Saturday. <b>₦218,400</b> in gross revenue across <b>17 orders</b>, your second-best
          Saturday this month. Net revenue landed at <b>₦189,650</b> after one refund (<b>₦8,500</b>
          — wrong size, Ankara Wrap Dress again) and <b>₦6,250</b> in discounts. Digital payments
          dominated at <b>76%</b>, with cash-on-delivery accounting for <b>₦52,400</b> — all
          collected.
        </p>
      </div>
    </div>
  </section>
</template>
