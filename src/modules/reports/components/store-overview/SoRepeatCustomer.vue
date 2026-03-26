<script setup lang="ts">
import { computed } from "vue"
import DonutChart from "@components/DonutChart.vue"
import { SO_REPEAT_CUSTOMER, SO_REPEAT_CUSTOMER_EMPTY } from "../../constants"

const props = defineProps<{ useDummyData: boolean }>()

const data = computed(() => (props.useDummyData ? SO_REPEAT_CUSTOMER : SO_REPEAT_CUSTOMER_EMPTY))
</script>

<template>
  <section class="rounded-xl border border-gray-200 bg-white">
    <div class="p-5 md:p-6">
      <h3 class="text-core-800 text-base font-semibold">Repeat Customer Rate</h3>
      <p class="text-core-600 mt-1 text-sm">
        Proportion of customers who made more than one purchase within a 180-day window.
      </p>
    </div>

    <hr class="border-gray-200" />

    <div class="flex justify-center p-6 lg:p-8">
      <DonutChart :percentage="data.percent" label="Repeated Customer Purchase" color="#3b82f6" />
    </div>
  </section>
</template>
