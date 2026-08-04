<script setup lang="ts">
import Drawer from "@components/Drawer.vue"
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"
import { computed, ref } from "vue"
import { useGetOrderMemos } from "../api"
import { TOrder, TOrderMemo } from "../types"
import AddMemoModal from "./AddMemoModal.vue"
import { startCase } from "@/utils/format-strings.ts"
import EmptyState from "@components/EmptyState.vue"

// Props & Emits
const props = defineProps<{ open: boolean; order: TOrder }>()

const emit = defineEmits<{
  close: []
  refresh: []
}>()

// State
const openAddMemo = ref(false)

const statusChipColor = (status: TOrderMemo["status"]) => {
  return status === "merchant-action" ? "primary" : "blue"
}

const severityChipColor = (severity: TOrderMemo["severity"]) => {
  return severity === "high" ? "error" : severity === "low" ? "blue" : "warning"
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Methods
const openCreateMemoModal = () => {
  openAddMemo.value = true
}

const id = computed(() => props.order.uid)

const { data: memosData, isFetching, refetch } = useGetOrderMemos(id)
</script>

<template>
  <div>
    <Drawer
      variant="fullscreen"
      :open="open"
      :title="`Order Memo (${order.order_number})`"
      max-width="2xl"
      @close="emit('close')"
    >
      <div class="mb-6 flex items-center justify-between gap-8">
        <div>
          <div class="bg-core-50 mb-2 flex size-10 items-center justify-center rounded-xl p-2">
            <Icon name="note-add" size="28" />
          </div>
          <p class="text-sm text-gray-600">View and manage memos for this order</p>
        </div>
        <AppButton
          v-if="memosData?.count"
          label="Add"
          icon="add"
          size="sm"
          class="flex-shrink-0"
          color="primary"
          @click="openCreateMemoModal"
        />
      </div>

      <!-- Loading skeleton -->
      <div v-if="isFetching" class="space-y-4">
        <div
          v-for="n in 3"
          :key="n"
          class="border-core-200 animate-pulse rounded-xl border bg-white p-4 shadow-sm"
        >
          <div class="mb-3 h-4 w-2/5 rounded bg-gray-200"></div>
          <div class="mb-3 grid gap-3">
            <div class="flex items-center justify-between">
              <div class="h-3 w-24 rounded bg-gray-200"></div>
              <div class="h-3 w-32 rounded bg-gray-200"></div>
            </div>
            <div class="flex items-center justify-between">
              <div class="h-3 w-24 rounded bg-gray-200"></div>
              <div class="h-3 w-32 rounded bg-gray-200"></div>
            </div>
            <div class="flex items-center justify-between">
              <div class="h-3 w-16 rounded bg-gray-200"></div>
              <div class="h-3 w-40 rounded bg-gray-200"></div>
            </div>
          </div>
          <div class="border-core-200 mb-4 border-t"></div>
          <div class="flex gap-2">
            <div class="h-6 w-28 rounded-full bg-gray-200"></div>
            <div class="h-6 w-16 rounded-full bg-gray-200"></div>
          </div>
        </div>
      </div>

      <!-- Memos List -->
      <div v-else-if="memosData?.count" class="space-y-4">
        <div
          v-for="memo in memosData?.results"
          :key="memo.uid"
          class="border-core-200 rounded-xl border bg-white px-4 py-3"
        >
          <!-- Title -->
          <h3 class="text-core-900 mb-2 text-base font-semibold">{{ memo.title }}</h3>

          <!-- Dates -->
          <div class="text-core-600 mb-3 grid gap-2 text-xs">
            <div class="flex items-center justify-between gap-1">
              <span class="font-medium">Date created:</span>
              <span class="text-core-800 ml-1">{{ formatDate(memo.created_at) }}</span>
            </div>
            <div class="flex items-center justify-between gap-1">
              <span class="font-medium">Last updated:</span>
              <span class="text-core-800 ml-1">{{ formatDate(memo.updated_at) }}</span>
            </div>
          </div>

          <!-- Divider -->
          <div v-if="memo.severity || memo.status" class="border-core-200 mb-2 border-t"></div>

          <!-- Chips -->
          <div v-if="memo.severity || memo.status" class="flex flex-wrap items-center gap-2">
            <Chip
              v-if="memo.status"
              :label="startCase(memo.status) + ' Required'"
              :color="statusChipColor(memo.status)"
            />
            <Chip
              v-if="memo.severity"
              :label="startCase(memo.severity)"
              :color="severityChipColor(memo.severity)"
            />
          </div>

          <!-- Divider -->
          <div class="border-core-200 my-2 border-t border-dashed"></div>

          <div
            class="border-core-300 bg-core-25 text-core-800 rounded-lg border border-dashed p-2 px-4 text-sm"
          >
            {{ memo.content }}
          </div>
        </div>
      </div>

      <EmptyState
        v-else
        class="min-h-[50vh]! bg-transparent! shadow-none!"
        title="No added memo"
        description="Add the first memo to this order"
        action-label="Add memo"
        action-icon="add"
        @action="openCreateMemoModal"
      >
        <template #image>
          <img src="@/assets/images/empty-memo.svg?url" class="mx-auto" />
        </template>
      </EmptyState>
    </Drawer>

    <!-- Create Memo Modal -->
    <AddMemoModal
      :open="openAddMemo"
      :order-id="props.order.uid"
      @close="openAddMemo = false"
      @refresh="
        () => {
          refetch()
          emit('refresh')
        }
      "
    />
  </div>
</template>
