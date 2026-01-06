<script setup lang="ts">
import { toast } from "@/composables/useToast"
import { clipboardCopy } from "@/utils/others"
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import Drawer from "@components/Drawer.vue"
import Icon from "@components/Icon.vue"
import { useAuthStore } from "@modules/auth/store"
import { useSettingsStore } from "@modules/settings/store"
import { computed } from "vue"

defineProps<{ open: boolean }>()

const emit = defineEmits<{ (e: "close"): void }>()

const storefrontUrl = computed(() => useSettingsStore().storefrontUrl)
const storeDetails = computed(() => useSettingsStore().storeDetails)
const currentLocation = computed(() => useSettingsStore().activeLocation)
const user = computed(() => useAuthStore().user)

const isHQ = computed(() => currentLocation.value?.is_hq ?? true)

const quickActions = computed(() => {
  const allActions = [
    { label: "Customers", icon: "people", to: "/customers" },
    { label: "Popups", icon: "calendar-tick", to: "/popups", hqOnly: true },
    {
      label: "Expenses",
      icon: "receipt-text",
      action: () => toast.info("This module is coming soon!", { title: "Expenses" }),
    },
    {
      label: "Reports",
      icon: "pie-chart",
      action: () => toast.info("This module is coming soon!", { title: "Reports" }),
    },
    { label: "Discounts", icon: "tag", to: "#" },
    { label: "Support", icon: "life-buoy", to: "#" },
    { label: "Settings", icon: "setting", to: "/settings" },
  ]

  return allActions.filter((action) => !action.hqOnly || isHQ.value)
})

const showPlans = computed(() => useSettingsStore().showPlanUpgradeModal)

const { setPlanUpgradeModal } = useSettingsStore()
</script>

<template>
  <div>
    <Drawer
      :open="open"
      @close="emit('close')"
      max-width="full"
      body-class="bg-white"
      :show-header="false"
    >
      <div class="flex justify-end">
        <Icon name="close-circle" size="20" @click="emit('close')" />
      </div>
      <div class="flex items-center gap-4">
        <div class="bg-core-200 flex size-10 items-center justify-center rounded-xl">
          <Icon name="shop" class="text-primary-800" size="24" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="mt-2 flex items-end gap-2">
            <p class="truncate font-medium">{{ storeDetails?.name }}</p>
            <Chip v-if="currentLocation?.is_hq" label="HQ" class="shrink-0" />
          </div>
          <div class="flex min-w-0 items-center gap-2 text-sm text-gray-600">
            <p class="truncate">{{ storefrontUrl }}</p>
            <Icon
              name="copy"
              size="24"
              class="text-primary-600 shrink-0 cursor-pointer"
              @click="clipboardCopy('https://' + storefrontUrl)"
            />
          </div>
        </div>
      </div>

      <div class="bg-primary-25 mt-6 mb-10 rounded-2xl p-3">
        <div class="grid grid-cols-2 gap-4">
          <div
            v-for="action in quickActions"
            :key="action.label"
            class="border-primary-200 text-primary-700 cursor-pointer rounded-xl border bg-white px-2 py-3 text-center"
            @click="
              () => {
                if (action.action) {
                  action.action()
                } else {
                  $router.push(action.to)
                  $emit('close')
                }
              }
            "
          >
            <div class="mb-1 flex items-center">
              <div
                class="border-core-200 bg-bloom-50 mx-auto flex size-10 items-center justify-center rounded-full border p-2"
              >
                <Icon :name="action.icon" size="28" />
              </div>
            </div>
            <span class="text-xs font-medium md:text-base">{{ action.label }}</span>
          </div>
        </div>
      </div>

      <div
        :class="['relative flex flex-col gap-2 rounded-3xl p-6 text-white']"
        style="
          background: linear-gradient(136.41deg, #1a2a6c -3.7%, #b21f1f 53.98%, #fdbb2d 99.39%);
        "
      >
        <div class="w-full max-w-3/4">
          <template v-if="!user?.subscription?.trial_mode && !user?.subscription?.is_active">
            <h3 class="mb-1 text-sm font-bold">Your trial has ended!</h3>
            <p class="mb-4 text-sm">Upgrade to regain full access.</p>
          </template>

          <template v-else>
            <h3 v-if="user?.subscription?.trial_mode" class="mb-1 text-sm font-bold">
              You are on trial mode
            </h3>
            <h3 v-else class="mb-1 text-sm font-semibold">
              Active: <b>{{ user?.subscription?.plan_name + " Plan" }}</b>
            </h3>
            <p class="mb-4 text-sm">
              Ends:
              {{
                new Date(user?.subscription?.active_until).toLocaleString("en-US", {
                  dateStyle: "medium",
                })
              }}
            </p>
          </template>
        </div>
        <AppButton
          color="alt"
          label="Upgrade"
          class="w-full flex-row-reverse"
          icon="star"
          @click="setPlanUpgradeModal(true)"
        />
        <img
          src="@/assets/images/gift.png"
          class="absolute top-4 right-6 h-16 w-auto object-contain"
        />
      </div>
    </Drawer>

    <!--  -->
    <PlansModal
      :model-value="showPlans"
      @update:model-value="(val: boolean) => setPlanUpgradeModal(val)"
    />
  </div>
</template>
