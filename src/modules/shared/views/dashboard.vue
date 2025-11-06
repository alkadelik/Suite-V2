<template>
  <div class="px-2 py-4 md:p-4">
    <SectionHeader size="lg" :title="`Good Afternoon, ${user?.first_name} 👋`" />

    <div class="my-4 rounded-xl bg-white px-0 pb-2 md:my-8 md:p-6">
      <h2 class="mb-3 text-lg font-semibold md:text-xl">Quick Actions</h2>
      <div class="grid grid-cols-3 gap-2 md:gap-4 xl:grid-cols-5">
        <div
          v-for="action in quickActions.slice(0, isMobile ? 3 : 5)"
          :key="action.label"
          class="cursor-pointer rounded-lg px-2 py-3 text-center md:p-4 md:text-left"
          :class="action.color"
          @click="action.action && action.action()"
        >
          <div class="mb-1 flex items-center justify-between md:mb-4">
            <div
              class="border-core-200 mx-auto flex size-10 items-center justify-center rounded-xl border bg-white p-2 md:mx-0"
            >
              <Icon :name="action.icon" size="28" />
            </div>

            <Icon v-if="!isMobile" name="arrow-right" />
          </div>
          <span class="text-xs font-medium md:text-base">{{ action.label }}</span>
        </div>
      </div>
    </div>

    <SectionHeader
      size="md"
      title="Your store at a glance"
      subtitle="Here’s what’s happening in your store this week."
      class="mb-4"
    />

    <EmptyState
      title="You don’t have any sales data yet!"
      description="Once you start adding products and recording orders, your performance will show up here."
      class="!min-h-[50vh]"
    />

    <!--  -->
    <WelcomeToTeamModal v-model="openModal" />
  </div>
</template>

<script setup lang="ts">
import SectionHeader from "@components/SectionHeader.vue"
import { useAuthStore } from "@modules/auth/store"
import WelcomeToTeamModal from "../components/WelcomeToTeamModal.vue"
import { ref } from "vue"
import Icon from "@components/Icon.vue"
import EmptyState from "@components/EmptyState.vue"
import { useMediaQuery } from "@vueuse/core"
import { toast } from "@/composables/useToast"

const { user } = useAuthStore()
const openModal = ref(false)

const isMobile = useMediaQuery("(max-width: 768px)")

const quickActions = [
  {
    label: "Add a product",
    icon: "box",
    color: "bg-blue-50 text-blue-700",
  },
  {
    label: "Record a sale",
    icon: "bag",
    color: "bg-green-50 text-green-700",
  },
  {
    label: "Create popup",
    icon: "calendar-tick",
    color: "bg-purple-50 text-purple-700",
  },
  {
    label: "Add a customer",
    icon: "profile-add",
    color: "bg-primary-50 text-primary-700",
  },
  {
    label: "Record expense",
    icon: "receipt-add",
    color: "bg-pink-50 text-pink-700",
    action: () => {
      toast.info("Expense module is coming soon!")
    },
  },
]
</script>
