<script setup lang="ts">
import { toast } from "@/composables/useToast"
import { clipboardCopy } from "@/utils/others"
import Chip from "@components/Chip.vue"
import Drawer from "@components/Drawer.vue"
import TextField from "@components/form/TextField.vue"
import Icon from "@components/Icon.vue"
import { useAuthStore } from "@modules/auth/store"
import { useProductionStore } from "@modules/production/store"
import { useSettingsStore } from "@modules/settings/store"
import { useSharedStore } from "@modules/shared/store"
import { computed, ref } from "vue"

defineProps<{ open: boolean }>()

const emit = defineEmits<{ (e: "close"): void }>()

// Prefer the connected custom domain when one is active (LYW-2618).
const storefrontUrl = computed(() => useSettingsStore().displayDomain)
const storeDetails = computed(() => useSettingsStore().storeDetails)
const currentLocation = computed(() => useSettingsStore().activeLocation)
const user = computed(() => useAuthStore().user)
const recipeValue = computed(() => {
  const v = useProductionStore().recipeValue
  return v === "bom" ? v.toUpperCase() : v
})
const componentLabel = computed(() => useProductionStore().componentLabel)

const isHQ = computed(() => currentLocation.value?.is_hq ?? true)

const searchQuery = ref("")

type Action = {
  label: string
  icon: string
  to?: string
  hqOnly?: boolean
  action?: () => void
}

type ActionGroup = {
  label: string
  items: Action[]
}

const quickActionGroups = computed<ActionGroup[]>(() => {
  const groups: ActionGroup[] = [
    {
      label: "",
      items: [
        { label: "Orders", icon: "shopping-cart", to: "/orders" },
        { label: "Inventory", icon: "folder", to: "/inventory" },
        { label: "Customers", icon: "people", to: "/customers" },
        { label: "Popups", icon: "calendar-tick", to: "/popups", hqOnly: true },
        {
          label: "Discounts",
          icon: "tag",
          action: () => toast.info("This module is coming soon!", { title: "Discounts" }),
        },
        { label: "Expenses", icon: "receipt-text", to: "/expenses" },
        { label: "Email List", icon: "sms", to: "/email-list", hqOnly: true },
        {
          label: "Support",
          icon: "life-buoy",
          action: () => {
            emit("close")
            useSharedStore().openSupportModal()
          },
        },
        { label: "Settings", icon: "setting", to: "/settings" },
      ],
    },
    {
      label: "Production",
      items: [
        { label: componentLabel.value, icon: "archive", to: "/production/raw-materials" },
        { label: recipeValue.value, icon: "clipboard-text-outline", to: "/production/recipes" },
        { label: "Runs", icon: "chart", to: "/production/runs" },
      ],
    },
    {
      label: "Reports",
      items: [
        { label: "Overview", icon: "pie-chart", to: "/reports/store-overview" },
        { label: "End of Day", icon: "pie-chart", to: "/reports/end-of-day" },
        { label: "Monthly", icon: "pie-chart", to: "/reports/monthly" },
      ],
    },
  ]

  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          item.label.toLowerCase().includes(searchQuery.value.toLowerCase()) &&
          (!item.hqOnly || isHQ.value),
      ),
    }))
    .filter((group) => group.items.length > 0)
})

const settingsStore = useSettingsStore()
const isInternational = computed(() => settingsStore.isInternational)

const currentPlanName = computed(() => user.value?.subscription?.plan_name?.toLowerCase() ?? "")

const { setPlanUpgradeModal } = settingsStore
</script>

<template>
  <div>
    <Drawer
      :open="open"
      @close="emit('close')"
      max-width="full"
      body-class="bg-white pt-0!"
      :show-header="false"
    >
      <div class="sticky top-0 z-20 bg-white pt-2 pb-4">
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
            <div
              v-if="!isInternational"
              class="flex min-w-0 items-center gap-2 text-sm text-gray-600"
            >
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
      </div>

      <div
        v-if="!isInternational && currentPlanName !== 'burst'"
        :class="['relative mb-4 flex cursor-pointer flex-col gap-2 rounded-2xl p-4 text-white']"
        style="
          background: linear-gradient(136.41deg, #1a2a6c -3.7%, #b21f1f 53.98%, #fdbb2d 99.39%);
        "
        @click="setPlanUpgradeModal(true)"
      >
        <div class="w-full max-w-3/4">
          <template v-if="!user?.subscription?.trial_mode && !user?.subscription?.is_active">
            <h3 class="mb-1 text-sm font-bold">Your trial has ended!</h3>
            <p class="text-xs">Upgrade to regain full access.</p>
          </template>

          <template v-else>
            <h3 class="mb-1 text-sm font-semibold">Do more with Burst!</h3>
            <p class="text-xs">Get advanced tools to mange every aspect of your business.</p>
          </template>
        </div>

        <img
          v-if="!user?.subscription?.trial_mode && !user?.subscription?.is_active"
          src="@/assets/images/gift-timer.png"
          class="absolute top-4 right-4 h-14 w-auto object-contain"
        />
        <img
          v-else
          src="@/assets/images/bloom-plant.png"
          class="absolute top-4 right-4 h-14 w-auto object-contain"
        />
      </div>

      <div>
        <div class="sticky top-[100px] z-10 mb-2 bg-white pb-2">
          <TextField
            left-icon="search-lg"
            size="sm"
            class="w-full"
            placeholder="Search menu..."
            v-model="searchQuery"
            container-class="bg-white!"
          />
        </div>
        <div class="flex flex-col gap-3 overflow-y-auto">
          <div
            v-if="quickActionGroups.length === 0"
            class="flex flex-col items-center gap-2 py-10 text-center"
          >
            <Icon name="search-lg" size="32" class="text-gray-300" />
            <p class="text-sm font-medium text-gray-500">No results for "{{ searchQuery }}"</p>
            <p class="text-xs text-gray-400">Try a different search term</p>
          </div>
          <div v-for="group in quickActionGroups" :key="group.label" class="mb-2">
            <p class="text-core-600 mb-2 text-[11px] font-medium tracking-widest uppercase">
              {{ group.label }}
            </p>
            <div class="bg-primary-25 grid grid-cols-3 gap-2 rounded-2xl p-2">
              <div
                v-for="action in group.items"
                :key="action.label"
                class="border-primary-200 text-primary-700 cursor-pointer rounded-xl border bg-white px-2 py-2.5 text-center"
                @click="
                  () => {
                    if (action.action) {
                      action.action()
                    } else {
                      $router.push(action.to!)
                      $emit('close')
                    }
                  }
                "
              >
                <div class="mb-1 flex items-center">
                  <div
                    class="border-core-200 bg-bloom-50 mx-auto flex size-8 items-center justify-center rounded-full border p-2"
                  >
                    <Icon :name="action.icon" size="24" />
                  </div>
                </div>
                <span class="text-xs font-normal md:text-base">{{ action.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="py-8" />
    </Drawer>
  </div>
</template>
