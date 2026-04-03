<template>
  <Drawer
    :open="modelValue"
    title="Version History"
    position="right"
    :max-width="drawerMaxWidth"
    @close="emit('update:modelValue', false)"
  >
    <IconHeader
      iconName="box-filled"
      subtext="Monitor the changes made to your design settings"
      class="mb-6"
    />

    <div v-if="isLoading" class="space-y-6">
      <div v-for="g in 2" :key="g">
        <div class="mb-4 h-6 w-20 animate-pulse rounded bg-gray-200"></div>
        <div class="relative">
          <div
            class="absolute top-0 left-4 h-full w-0.5 bg-gray-200"
            style="height: calc(100% - 2rem)"
          ></div>
          <div class="space-y-6">
            <div v-for="i in 3" :key="i" class="relative flex gap-3">
              <div
                class="z-10 flex h-8 w-8 flex-shrink-0 animate-pulse items-center justify-center rounded-full bg-gray-200"
              ></div>
              <div class="flex flex-col gap-1">
                <div class="h-4 w-40 animate-pulse rounded bg-gray-200"></div>
                <div class="h-3 w-28 animate-pulse rounded bg-gray-200"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="groupedHistory.length === 0" class="py-12 text-center">
      <p class="text-core-600 text-sm">No version history available</p>
    </div>

    <div v-else class="space-y-6">
      <div v-for="group in groupedHistory" :key="group.label">
        <Chip :label="group.label" color="alt" class="mb-4 rounded-sm bg-white" />

        <div class="relative">
          <div
            class="absolute top-0 left-4 h-full w-0.5 bg-gray-200"
            :style="{ height: 'calc(100% - 2rem)' }"
          />

          <div class="space-y-6">
            <div v-for="item in group.items" :key="item.uid" class="relative flex gap-3">
              <div
                class="z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white"
              >
                <Icon name="clock" class="text-core-600 h-5 w-5" />
              </div>
              <div class="flex flex-col gap-1">
                <h4 class="text-sm font-semibold">{{ formatDateTime(item.created_at) }}</h4>
                <p class="text-core-600 text-sm">{{ item.changed_by_name }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Drawer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue"
import Drawer from "@components/Drawer.vue"
import IconHeader from "@components/IconHeader.vue"
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"
import { useGetVersionHistory } from "@modules/settings/api"
import type { IVersionHistory } from "@modules/settings/types"

interface Props {
  modelValue: boolean
  storefrontUid: string
}

interface Emits {
  "update:modelValue": [value: boolean]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { data: versionHistory, isLoading } = useGetVersionHistory(
  computed(() => props.storefrontUid),
)

const isMobile = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener("resize", checkMobile)
})

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile)
})

const drawerMaxWidth = computed(() => {
  return isMobile.value ? "full" : "xl"
})

interface GroupedHistory {
  label: string
  items: IVersionHistory[]
}

const groupedHistory = computed<GroupedHistory[]>(() => {
  if (!versionHistory.value) return []

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const groups: Record<string, IVersionHistory[]> = {}

  versionHistory.value.forEach((item) => {
    const itemDate = new Date(item.created_at)
    const itemDay = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate())

    let label: string
    if (itemDay.getTime() === today.getTime()) {
      label = "Today"
    } else if (itemDay.getTime() === yesterday.getTime()) {
      label = "Yesterday"
    } else {
      label = itemDay.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    }

    if (!groups[label]) {
      groups[label] = []
    }
    groups[label].push(item)
  })

  return Object.entries(groups).map(([label, items]) => ({
    label,
    items: items.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    ),
  }))
})

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}
</script>
