<script setup lang="ts">
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js"
import { Bar } from "vue-chartjs"
import Icon from "@components/Icon.vue"

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

defineProps<{
  items: {
    label: string
    value: string | number
    prev_value: string | number
    icon: string
    chartData?: number[]
    labelTag?: string
    labelTagClass?: string
    valueTag?: string
    valueTagClass?: string
    chartColor: string
    iconClass?: string
  }[]
  loading?: boolean
}>()
</script>

<template>
  <div class="space-y-4">
    <div v-if="loading" class="p-8">
      <p>loading...</p>
    </div>

    <div class="grid grid-cols-2 gap-4 md:grid-cols-2">
      <div
        v-for="(item, i) in items"
        :key="i"
        class="bg-primary-25 border-primary-200 flex flex-col gap-3 rounded-lg border px-3.5 py-3 shadow-sm md:border-0 md:bg-white"
      >
        <!-- Top section -->
        <div class="inline-flex flex-col gap-1">
          <span class="flex h-6 w-6 items-center justify-center rounded-md bg-gray-50">
            <Icon :name="item.icon" :class="['text-primary-600', item.iconClass]" />
          </span>
          <h4 class="text-core-600 flex items-end gap-1.5 text-sm">
            {{ item.label }}
            <span
              v-if="item.labelTag"
              class="bg-primary-50 text-primary-400 inline-flex h-5 w-fit items-center justify-center rounded-xl !px-2.5 text-[12px] font-medium"
              :class="item.labelTagClass"
            >
              {{ item.labelTag }}
            </span>
          </h4>
        </div>

        <!-- Value -->
        <p class="text-core-800 flex items-end gap-1.5 text-xl font-bold">
          {{ item.value }}
          <span
            v-if="item.valueTag"
            class="bg-primary-50 text-primary-400 inline-flex h-5 w-fit items-center justify-center rounded-xl !px-2.5 text-[12px] font-medium"
            :class="item.valueTagClass"
          >
            {{ item.valueTag }}
          </span>
        </p>

        <!-- Previous value comparison -->
        <p class="text-xs text-gray-500">vs. {{ item.prev_value }} last mth</p>

        <!-- Chart (hidden on mobile) -->
        <div class="hidden md:block">
          <Bar
            v-if="item.chartData"
            :data="{
              labels: item.chartData.map((_, idx) => idx + 1),
              datasets: [
                {
                  label: item.label,
                  data: item.chartData,
                  backgroundColor: item.chartColor,
                },
              ],
            }"
            :options="{
              responsive: true,
              plugins: { legend: { display: false }, tooltip: { enabled: false } },
              scales: {
                x: {
                  display: true,
                  grid: {
                    drawBorder: true,
                    display: false, // hides vertical gridlines
                  },
                  ticks: { display: false },
                  barPercentage: 1.0,
                  categoryPercentage: 1,
                },
                y: { display: false },
              },
            }"
            height="40"
          />
        </div>
      </div>
    </div>
  </div>
</template>
