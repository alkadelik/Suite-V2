<template>
  <Modal
    :open="modelValue"
    title="Upgrade Plan"
    max-width="6xl"
    @close="emit('update:modelValue', false)"
    variant="bottom-nav"
  >
    <IconHeader
      icon-name="shop-add"
      subtext="Choose a plan that fits your business needs and budget."
      class="mb-6"
    />

    <div class="flex justify-center">
      <Tabs variant="pills" :tabs="tabs" v-model="activeTab" class="w-full md:w-1/2" />
    </div>

    <div class="text-core-700 mb-4 flex flex-col gap-3 md:flex-row">
      <div
        v-for="plan in plans"
        :key="plan.id"
        class="flex flex-1 flex-col rounded-xl border border-gray-200"
        :class="{
          'bg-primary-50 border-primary-600': plan.highlighted,
          'border-gray-400': plan.active && !plan.highlighted,
        }"
      >
        <!-- Header Section - Fixed Height -->
        <div class="mb-3 flex min-h-[40px] items-center justify-between p-4 pb-0">
          <div class="bg-primary-100 rounded-full p-1.5">
            <div class="bg-primary-200 rounded-full p-2">
              <Icon name="layers-three-01" size="16" class="text-primary-600" />
            </div>
          </div>

          <Chip v-if="plan.chipText" :label="plan.chipText" />
        </div>

        <!-- Plan Info Section - Fixed Height -->
        <div class="mb-4 min-h-[80px] px-4">
          <Chip
            :label="plan.name"
            :color="getPlanColor(plan.name)"
            class="mb-2 text-sm font-medium"
          />
          <p class="text-xs md:text-sm">{{ plan.description }}</p>
        </div>

        <!-- Price Section - Fixed Height -->
        <div
          class="mb-4 flex min-h-[80px] items-end border-b border-gray-200 px-4 pb-4"
          :class="{
            'border-primary-600': plan.highlighted,
            'border-gray-400': plan.active && !plan.highlighted,
          }"
        >
          <h4 class="text-2xl font-bold">
            {{
              activeTab === "monthly"
                ? formatCurrency(plan.priceMonthly)
                : formatCurrency(plan.priceYearly)
            }}<span class="text-xs font-normal md:text-sm"
              >/{{ activeTab === "monthly" ? "month" : "year" }}</span
            >
          </h4>
        </div>

        <!-- Features Section - Flexible Height -->
        <div
          class="flex flex-grow flex-col gap-2 border-b border-gray-200 px-4 pb-3"
          :class="{
            'border-primary-600': plan.highlighted,
            'border-gray-400': plan.active && !plan.highlighted,
          }"
        >
          <div
            v-for="(feature, index) in plan.features"
            :key="feature"
            class="flex gap-1"
            :class="{ hidden: !expandedPlans[plan.id] && index >= 4 }"
          >
            <Icon name="check" class="text-core-600 mt-0.5 flex-shrink-0" />
            <p class="text-xs md:text-sm">{{ feature }}</p>
          </div>

          <!-- See More Button - Centered -->
          <div
            v-if="plan.features.length > 4 && !expandedPlans[plan.id]"
            class="mt-1 flex justify-center"
          >
            <button
              @click="expandedPlans[plan.id] = true"
              class="text-primary-700 hover:text-primary-800 flex items-center gap-1 text-xs font-semibold transition-colors md:text-sm"
            >
              <span>See more</span>
              <Icon name="arrow-down" size="20" class="text-primary-700" />
            </button>
          </div>
        </div>

        <!-- Button Section - Fixed Height -->
        <div class="flex min-h-[60px] items-center px-4 pt-4 pb-4">
          <AppButton
            :label="
              plan.active
                ? 'Current Plan'
                : plan.id < (plans.find((p) => p.active)?.id ?? 0)
                  ? 'Downgrade'
                  : 'Upgrade'
            "
            :disabled="plan.active"
            class="w-full"
            @click="!plan.active && (emit('update:modelValue', false), emit('refresh'))"
          />
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import Modal from "@/components/Modal.vue"
import Chip from "@components/Chip.vue"
import IconHeader from "@components/IconHeader.vue"
import Tabs from "@components/Tabs.vue"
import { ref, reactive } from "vue"
import { getPlanColor } from "../constants"
import { formatCurrency } from "@/utils/format-currency"
import Icon from "@/components/Icon.vue"
import AppButton from "@/components/AppButton.vue"

defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  "update:modelValue": [value: boolean]
  refresh: []
}>()

const activeTab = ref("monthly")

// Track expanded state for each plan
const expandedPlans = reactive<Record<number, boolean>>({})

const tabs = ref([
  {
    title: "Monthly",
    key: "monthly",
  },
  {
    title: "Yearly (-20%)",
    key: "yearly",
  },
])

const plans = ref([
  {
    id: 1,
    name: "Bud",
    description: "Essential tools to manage your store. Free forever.",
    priceMonthly: 0,
    active: true,
    priceYearly: 0,
    features: [
      "Up to 100 products",
      "Basic analytics",
      "Email support",
      "Single staff account",
      "Basic inventory tracking",
      "Standard templates",
    ],
  },
  {
    id: 2,
    name: "Bloom",
    description: "Advanced features for growing businesses.",
    priceMonthly: 10000,
    priceYearly: 96000,
    chipText: "Leyyow's Choice",
    highlighted: true,
    features: [
      "Up to 1,000 products",
      "Advanced analytics",
      "Priority email support",
      "Up to 5 staff accounts",
      "Discounts and promotions",
      "Advanced inventory management",
    ],
  },
  {
    id: 3,
    name: "Burst",
    description: "All-in-one solution for established businesses.",
    priceMonthly: 45000,
    priceYearly: 432000,
    features: [
      "Unlimited products",
      "Comprehensive analytics",
      "24/7 phone & email support",
      "Unlimited staff accounts",
      "Advanced marketing tools",
      "Custom reporting",
    ],
  },
])
</script>
