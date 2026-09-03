<script setup lang="ts">
import Drawer from "@components/Drawer.vue"
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import Icon from "@components/Icon.vue"
import { computed, ref } from "vue"
import { useGetOrderMemos, useReopenOrderMemo } from "../api"
import { TOrder, TOrderMemo } from "../types"
import AddMemoModal from "./AddMemoModal.vue"
import ResolveMemoModal from "./ResolveMemoModal.vue"
import { startCase } from "@/utils/format-strings.ts"
import { getRelativeTimeLabel } from "@/utils/formatDate"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"
import EmptyState from "@components/EmptyState.vue"

// Props & Emits
const props = defineProps<{ open: boolean; order: TOrder }>()

const emit = defineEmits<{
  close: []
  refresh: []
}>()

// State
const openAddMemo = ref(false)
const memoToResolve = ref<TOrderMemo | null>(null)
const reopeningUid = ref<string | null>(null)

const isResolved = (memo: TOrderMemo) => memo.status === "resolved"

/** Memos awaiting "nobody" have no party to show */
const hasAwaitingParty = (memo: TOrderMemo) => memo.awaiting !== "nobody"

const awaitingChipColor = (awaiting: TOrderMemo["awaiting"]) => {
  return awaiting === "merchant" ? "purple" : "pink"
}

const awaitingChipIcon = (awaiting: TOrderMemo["awaiting"]) => {
  return awaiting === "merchant" ? "shop" : "profile-circle"
}

const severityChipColor = (severity: TOrderMemo["severity"]) => {
  return severity === "high" ? "error" : severity === "low" ? "blue" : "warning"
}

const resolvedByLabel = (memo: TOrderMemo) =>
  memo.resolved_by_name || (memo.resolved_by === "customer" ? "Customer" : "You")

// Methods
const openCreateMemoModal = () => {
  openAddMemo.value = true
}

const id = computed(() => props.order.uid)

const { data: memosData, isFetching, refetch } = useGetOrderMemos(id)

const memos = computed(() => memosData.value?.results ?? [])
const openMemos = computed(() => memos.value.filter((memo) => !isResolved(memo)))
const resolvedMemos = computed(() => memos.value.filter(isResolved))

const memoGroups = computed(() =>
  [
    { label: "Open", memos: openMemos.value },
    { label: "Resolved", memos: resolvedMemos.value },
  ].filter((group) => group.memos.length),
)

const onRefresh = () => {
  refetch()
  emit("refresh")
}

const { mutate: reopenMemo } = useReopenOrderMemo()

const onReopen = (memo: TOrderMemo) => {
  reopeningUid.value = memo.uid
  reopenMemo(
    { id: props.order.uid, memoId: memo.uid },
    {
      onSuccess: () => {
        toast.success("Memo reopened")
        onRefresh()
      },
      onError: displayError,
      onSettled: () => {
        reopeningUid.value = null
      },
    },
  )
}

const memoMenuItems = (memo: TOrderMemo) =>
  isResolved(memo)
    ? [{ id: "reopen", label: "Reopen", icon: "refresh-2", action: () => onReopen(memo) }]
    : [
        {
          id: "resolve",
          label: "Resolve",
          icon: "tick-circle",
          action: () => (memoToResolve.value = memo),
        },
      ]
</script>

<template>
  <div>
    <Drawer variant="fullscreen" :open="open" max-width="2xl" @close="emit('close')">
      <template #header>
        <div class="flex items-center justify-between gap-3 border-b border-gray-200 p-5">
          <div class="flex flex-wrap items-center gap-2">
            <h2 class="m-0 text-lg font-semibold text-gray-800">
              Order Memo ({{ order.order_number }})
            </h2>
            <Chip v-if="openMemos.length" :label="`${openMemos.length} open`" color="blue" />
          </div>
          <button
            type="button"
            @click="emit('close')"
            class="cursor-pointer border-none bg-transparent p-0 text-gray-500 transition-colors duration-200 hover:text-gray-700"
          >
            <Icon name="close-circle" size="20" />
          </button>
        </div>
      </template>

      <div class="mb-4 flex items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <h3 class="text-core-800 text-base font-semibold">All Memos</h3>
          <Chip v-if="memosData?.count" :label="memosData.count" color="alt" />
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
            <div class="h-3 w-full rounded bg-gray-200"></div>
            <div class="h-3 w-4/5 rounded bg-gray-200"></div>
          </div>
          <div class="flex gap-2">
            <div class="h-6 w-28 rounded-full bg-gray-200"></div>
            <div class="h-6 w-16 rounded-full bg-gray-200"></div>
          </div>
          <div class="border-core-200 my-4 border-t"></div>
          <div class="flex items-center justify-between">
            <div class="h-9 w-28 rounded-lg bg-gray-200"></div>
            <div class="h-9 w-24 rounded-lg bg-gray-200"></div>
          </div>
        </div>
      </div>

      <!-- Memos List -->
      <div v-else-if="memos.length" class="space-y-6">
        <div v-for="group in memoGroups" :key="group.label" class="space-y-3">
          <!-- Section divider -->
          <div class="flex items-center gap-3">
            <p class="text-core-500 flex-shrink-0 text-sm">{{ group.label }}</p>
            <hr class="border-core-200 flex-1" />
          </div>

          <div
            v-for="memo in group.memos"
            :key="memo.uid"
            class="border-core-200 overflow-hidden rounded-xl border bg-white"
          >
            <div class="space-y-2 px-4 py-3">
              <!-- Title, severity & actions -->
              <div class="flex items-start justify-between gap-2">
                <h4 class="text-core-900 text-base font-semibold">{{ memo.title }}</h4>
                <div class="flex flex-shrink-0 items-center gap-1">
                  <Chip
                    v-if="memo.severity"
                    :label="startCase(memo.severity)"
                    :color="severityChipColor(memo.severity)"
                    show-dot
                  />
                  <DropdownMenu :items="memoMenuItems(memo)" />
                </div>
              </div>

              <!-- Content -->
              <p class="text-core-600 text-sm">{{ memo.content }}</p>

              <!-- Awaiting party & last update -->
              <div class="flex flex-wrap items-center gap-2">
                <Chip
                  v-if="hasAwaitingParty(memo)"
                  :label="`Awaiting ${startCase(memo.awaiting)}`"
                  :icon="awaitingChipIcon(memo.awaiting)"
                  :color="awaitingChipColor(memo.awaiting)"
                />
                <span class="text-core-500 flex items-center text-xs">
                  <span class="pr-1">&bull;</span>
                  Updated {{ getRelativeTimeLabel(memo.updated_at) }}
                </span>
              </div>

              <!-- Resolution -->
              <div
                v-if="isResolved(memo)"
                class="border-core-200 bg-core-25 mt-3 rounded-lg border p-3"
              >
                <p class="text-core-700 text-xs font-medium">Resolution</p>
                <p
                  class="mt-1 text-sm"
                  :class="memo.resolution_note ? 'text-core-800' : 'text-core-500 italic'"
                >
                  {{ memo.resolution_note || "No note added." }}
                </p>
                <p class="text-core-500 mt-2 flex items-center text-xs">
                  {{ resolvedByLabel(memo) }}
                  <span class="px-1">&bull;</span>
                  {{ getRelativeTimeLabel(memo.resolved_at ?? memo.updated_at) }}
                </p>
              </div>
            </div>

            <!-- Actions -->
            <div class="border-core-200 flex items-center justify-end gap-3 border-t px-4 py-3">
              <AppButton
                v-if="isResolved(memo)"
                label="Reopen"
                color="alt"
                size="sm"
                :loading="reopeningUid === memo.uid"
                @click="onReopen(memo)"
              />
              <AppButton
                v-else
                label="Resolve"
                variant="outlined"
                color="primary"
                size="sm"
                @click="memoToResolve = memo"
              />
            </div>
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
      @refresh="onRefresh"
    />

    <!-- Resolve Memo Modal -->
    <ResolveMemoModal
      :open="Boolean(memoToResolve)"
      :order-id="props.order.uid"
      :memo="memoToResolve"
      @close="memoToResolve = null"
      @refresh="onRefresh"
    />
  </div>
</template>
