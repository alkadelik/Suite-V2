<template>
  <div>
    <!-- Desktop: tinted cards with a white icon tile -->
    <div class="hidden grid-cols-3 gap-3 md:grid md:grid-cols-6 md:gap-4">
      <button
        v-for="action in actions"
        :key="action.label"
        type="button"
        class="flex flex-col items-center gap-3 rounded-2xl border p-4 text-center transition-colors"
        :class="TONES[action.tone].card"
        @click="go(action.to)"
      >
        <span class="flex size-12 items-center justify-center rounded-xl bg-white">
          <Icon :name="action.icon" size="26" :class="TONES[action.tone].icon" />
        </span>
        <span class="text-[13px] font-medium whitespace-nowrap" :class="TONES[action.tone].label">
          {{ action.label }}
        </span>
      </button>
    </div>

    <!-- Mobile: horizontal-scroll circular icons -->
    <div class="flex gap-4 overflow-x-auto pb-1 md:hidden">
      <button
        v-for="action in actions"
        :key="`m-${action.label}`"
        type="button"
        class="flex shrink-0 flex-col items-center gap-1.5"
        @click="go(action.to)"
      >
        <span
          class="flex size-14 items-center justify-center rounded-full"
          :class="TONES[action.tone].card"
        >
          <Icon :name="action.icon" size="24" :class="TONES[action.tone].icon" />
        </span>
        <span class="text-[11px] whitespace-nowrap" :class="TONES[action.tone].label">
          {{ action.label }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router"
import Icon from "@components/Icon.vue"

type Tone = "blue" | "gold" | "green" | "red" | "purple" | "brown"

/** Card/circle background+border and icon/label colour per tone (icon colour is
 *  applied to the currentColor bulk icons through the Icon component). */
const TONES: Record<Tone, { card: string; icon: string; label: string }> = {
  blue: { card: "bg-blue-50 border-blue-200", icon: "text-blue-700", label: "text-blue-700" },
  gold: {
    card: "bg-warning-50 border-warning-200",
    icon: "text-[#8F6000]",
    label: "text-[#8F6000]",
  },
  green: {
    card: "bg-success-50 border-success-200",
    icon: "text-[#3B7C0F]",
    label: "text-[#3B7C0F]",
  },
  red: { card: "bg-error-50 border-error-200", icon: "text-[#BF4555]", label: "text-[#BF4555]" },
  purple: {
    card: "bg-purple-50 border-purple-200",
    icon: "text-[#6927DA]",
    label: "text-[#6927DA]",
  },
  brown: {
    card: "bg-primary-50 border-primary-200",
    icon: "text-primary-700",
    label: "text-primary-700",
  },
}

interface QuickAction {
  label: string
  icon: string
  tone: Tone
  to: string
}

const actions: QuickAction[] = [
  { label: "Add Product", icon: "box-add-bulk", tone: "blue", to: "/inventory?create=true" },
  { label: "Add Customer", icon: "profile-add-bulk", tone: "gold", to: "/customers?create=true" },
  { label: "Add Order", icon: "bag-bulk", tone: "green", to: "/orders?create=true" },
  { label: "Add Expense", icon: "receipt-add-bulk", tone: "red", to: "/expenses?create=true" },
  { label: "Add Popup", icon: "calendar-tick-bulk", tone: "purple", to: "/popups?create=true" },
  { label: "Add Discount", icon: "tag-bulk", tone: "brown", to: "/discounts?create=true" },
]

const router = useRouter()
function go(to: string) {
  void router.push(to)
}
</script>
