<script setup lang="ts">
import { computed } from "vue"
import DonutChart from "@components/DonutChart.vue"
import { SO_CUSTOMER_GROWTH, SO_CUSTOMER_GROWTH_EMPTY } from "../../constants"

const props = defineProps<{ useDummyData: boolean }>()

const data = computed(() => (props.useDummyData ? SO_CUSTOMER_GROWTH : SO_CUSTOMER_GROWTH_EMPTY))
</script>

<template>
  <section class="rounded-xl border border-gray-200 bg-white">
    <div class="p-5 md:p-6">
      <h3 class="text-core-800 text-base font-semibold">Overall Customer Growth Rate</h3>
      <p class="text-core-600 mt-1 text-sm">
        How your customer base is growing within the last 30 days.
      </p>
    </div>

    <hr class="border-gray-200" />

    <div class="flex justify-center p-6 lg:p-8">
      <DonutChart :percentage="data.percent" label="Customer Growth" color="#8b5cf6" />
    </div>
  </section>
</template>
