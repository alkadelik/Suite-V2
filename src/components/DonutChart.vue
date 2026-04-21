<script setup lang="ts">
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js"
import { Doughnut } from "vue-chartjs"
import { computed } from "vue"

ChartJS.register(ArcElement, Tooltip)

const props = withDefaults(
  defineProps<{
    percentage: number
    label: string
    color?: string
    emptyColor?: string
    size?: "sm" | "md"
  }>(),
  {
    color: "#22c55e",
    emptyColor: "#e5e7eb",
    size: "md",
  },
)

const sizeInPx = computed(() => (props.size === "sm" ? "200px" : "260px"))

const chartData = computed(() => ({
  datasets: [
    {
      data: [props.percentage, 100 - props.percentage],
      backgroundColor: [props.percentage > 0 ? props.color : props.emptyColor, props.emptyColor],
      borderWidth: 0,
      borderRadius: props.percentage > 0 && props.percentage < 100 ? 4 : 0,
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: true,
  cutout: "60%",
  plugins: {
    tooltip: { enabled: false },
    legend: { display: false },
  },
}))
</script>

<template>
  <div
    class="relative flex items-center justify-center"
    :style="{ width: sizeInPx, height: sizeInPx }"
  >
    <Doughnut :data="chartData" :options="chartOptions" />
    <div class="absolute inset-[18%] flex flex-col items-center justify-center text-center">
      <span class="text-core-800 text-2xl font-bold">{{ percentage }}%</span>
      <span class="text-core-600 text-xs leading-tight">{{ label }}</span>
    </div>
  </div>
</template>
