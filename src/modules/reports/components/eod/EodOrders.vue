<script setup lang="ts">
import DataTable from "@components/DataTable.vue"
import Icon from "@components/Icon.vue"
import { EOD_ORDER_COLUMNS, EOD_ORDERS } from "@modules/reports/constants"
</script>

<template>
  <section v-bind="$attrs">
    <!-- heading -->
    <header class="flex items-center gap-2 border-b border-gray-400 bg-gray-200 px-5 pt-4 pb-3">
      <span class="text-sm text-gray-600 italic">11</span>
      <h3 class="text-base font-semibold text-gray-900">Orders</h3>
      <span class="ml-auto text-xs font-medium text-gray-600 uppercase">17 orders</span>
    </header>
    <!-- content -->
    <div class="space-y-6 py-4">
      <div class="overflow-hidden rounded-lg bg-white shadow">
        <DataTable :columns="EOD_ORDER_COLUMNS" :data="EOD_ORDERS ?? []" :show-pagination="false" />
      </div>

      <div class="rounded-r-lg border border-l-4 border-gray-200 border-l-gray-600 bg-white p-4">
        <h4 class="mb-3 flex items-center gap-2 text-xs font-medium uppercase">
          <Icon name="box-filled" class="text-warning-400" size="16" /> DAILY SUMMARY & CLOSING NOTE
        </h4>
        <p class="text-sm">
          Solid Saturday. <b>₦218,400</b> in gross revenue across <b>17 orders</b>, your second-best
          Saturday this month. Net revenue landed at <b>₦189,650</b> after one refund (<b>₦8,500</b>
          — wrong size, Ankara Wrap Dress again) and <b>₦6,250</b> in discounts. Digital payments
          dominated at <b>76%</b>, with cash-on-delivery accounting for <b>₦52,400</b> — all
          collected. All <b>12 fulfilled orders</b> shipped via GIG Logistics today with a
          <b>100% on-time handoff</b>. You have <b>5 pending orders</b> carrying into Monday —
          <b>3 awaiting payment confirmation</b> and <b>2 awaiting stock</b> (Adire Bucket Hat is
          now at just <b>2 units</b>). Reorder the bucket hat tonight — at current velocity, you'll
          stock out by <b>Tuesday</b>.
        </p>
        <br />
        <p class="text-sm">
          Three things for Monday: (1) Reorder <b>Adire Bucket Hats</b> and
          <b>Lagos Life Totes</b> — both are at critical stock and you'll lose sales this week
          without them. (2) Follow up on the <b>3 pending payments</b> (<b>₦38,200 total</b>) — send
          a friendly WhatsApp reminder before <b>10am</b>. (3) Confirm Monday delivery for
          <b>Order #1038</b> (Abuja, <b>₦18,200</b>) to avoid a second failed delivery attempt.
          Overall, a good Saturday. Your returning customer revenue share (<b>67.9%</b>) is strong —
          your regulars are showing up.
        </p>
      </div>
    </div>
  </section>
</template>
