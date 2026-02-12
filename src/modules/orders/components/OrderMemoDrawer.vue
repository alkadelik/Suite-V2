<script setup lang="ts">
import Drawer from "@components/Drawer.vue"
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"
import { ref } from "vue"
import { useGetOrderMemos } from "../api"
import { TOrder } from "../types"
import AddMemoModal from "./AddMemoModal.vue"
import { useMediaQuery } from "@vueuse/core"
import Modal from "@components/Modal.vue"

// Props & Emits
const props = defineProps<{ open: boolean; order: TOrder }>()

const emit = defineEmits<{
  close: []
}>()

// State
const openAddMemo = ref(false)

const statusChipColor = (status: "merchant-action" | "customer-action") => {
  return status === "merchant-action" ? "warning" : "blue"
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
  emit("close")
}

const { data: memosData, refetch } = useGetOrderMemos(props.order.uid)

const isMobile = useMediaQuery("(max-width: 1024px)")
</script>

<template>
  <div>
    <component
      :is="isMobile ? Modal : Drawer"
      variant="fullscreen"
      :open="open"
      title="Order Memos"
      max-width="2xl"
      @close="emit('close')"
    >
      <div class="mb-6 flex items-center justify-between gap-8">
        <div>
          <div class="bg-core-50 mb-2 flex size-10 items-center justify-center rounded-xl p-2">
            <Icon name="note" size="28" />
          </div>
          <p class="text-sm text-gray-600">View and manage memos for this order</p>
        </div>
        <AppButton
          label="Create Memo"
          icon="add"
          size="sm"
          class="flex-shrink-0"
          color="primary"
          @click="openCreateMemoModal"
        />
      </div>

      <!-- Memos List -->
      <div class="space-y-4">
        <div
          v-for="memo in memosData?.results"
          :key="memo.uid"
          class="border-core-200 rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <!-- Title -->
          <h3 class="text-core-900 mb-3 text-base font-semibold">{{ memo.title }}</h3>

          <!-- Dates -->
          <div class="mb-3 grid gap-3 text-xs text-gray-600">
            <div class="flex items-center justify-between gap-1">
              <span class="font-medium">Date created:</span>
              <span class="ml-1">{{ formatDate(memo.created_at) }}</span>
            </div>
            <div class="flex items-center justify-between gap-1">
              <span class="font-medium">Last update:</span>
              <span class="ml-1">{{ formatDate(memo.updated_at) }}</span>
            </div>
            <div class="flex items-center justify-between gap-12">
              <span class="font-medium">Content:</span>
              <div class="line-clamp-2 text-right break-words">{{ memo.content }}</div>
            </div>
          </div>

          <!-- Divider -->
          <div class="border-core-200 mb-4 border-t"></div>

          <!-- Chips -->
          <div class="flex flex-wrap items-center gap-2">
            <Chip
              :label="
                memo.status === 'merchant-action'
                  ? 'Merchant Action Required'
                  : 'Customer Action Required'
              "
              :color="statusChipColor(memo.status)"
              size="sm"
            />
            <!-- <Chip
              :label="memo.severity.charAt(0).toUpperCase() + memo.severity.slice(1) + ' Priority'"
              :color="severityChipColor(memo.severity)"
              size="sm"
            /> -->
          </div>
        </div>

        <div
          v-if="memosData?.results?.length === 0"
          class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-12"
        >
          <Icon name="note" size="48" class="mb-3 text-gray-400" />
          <p class="mb-2 text-sm font-medium text-gray-900">No memos yet</p>
          <p class="mb-4 text-sm text-gray-500">Create your first memo to get started</p>
          <AppButton
            label="Create Memo"
            icon="add"
            size="sm"
            color="primary"
            @click="openCreateMemoModal"
          />
        </div>
      </div>
    </component>

    <!-- Create Memo Modal -->
    <AddMemoModal
      :open="openAddMemo"
      :order-id="props.order.uid"
      @close="openAddMemo = false"
      @refresh="refetch"
    />
  </div>
</template>
