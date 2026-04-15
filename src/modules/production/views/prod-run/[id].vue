<script setup lang="ts">
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"
// import { formatDate } from "@/utils/formatDate"
import AppButton from "@components/AppButton.vue"
import BackButton from "@components/BackButton.vue"
import Chip from "@components/Chip.vue"
import ConfirmationModal from "@components/ConfirmationModal.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import EmptyState from "@components/EmptyState.vue"
import PageHeader from "@components/PageHeader.vue"
import StatCard from "@components/StatCard.vue"
import { useDeleteProdRun, useGetSingleProdRun, useUpdateProdRun } from "@modules/production/api"
import CreateProdRunDrawer from "@modules/production/components/prod-run/CreateProdRunDrawer.vue"
import { useMediaQuery } from "@vueuse/core"
import { computed, ref } from "vue"
import { useRoute, useRouter } from "vue-router"

const route = useRoute()
const router = useRouter()
const isMobile = computed(() => useMediaQuery("(max-width: 1024px)").value)
const { format } = useFormatCurrency()

const showCreateModal = ref<"edit" | "duplicate" | null>(null)
const showDisableModal = ref<"enable" | "disable" | null>(null)
const showDeleteModal = ref(false)
const showFinaliseModal = ref(false)

const { data: prodRun, isPending, refetch } = useGetSingleProdRun(route.params.id as string)

const prodRunStats = computed(() => [
  ...(isMobile.value
    ? []
    : [
        {
          label: "Producible Quantity",
          value: prodRun.value?.total_cost,
          icon: "bag",
        },
      ]),
  {
    label: "Estimated Cost per Batch",
    value: `${format(prodRun.value?.cost_per_unit || 0)}`,
    icon: "bag",
  },
])

const actionMenus = computed(() => [
  {
    label: `View run`,
    icon: "eye",
    action: () => router.push(`/production/runs/${prodRun.value?.uid}`),
  },
  {
    label: `Duplicate run`,
    icon: "copy",
    action: () => (showCreateModal.value = "duplicate"),
  },
  ...(prodRun.value?.status === "draft"
    ? [
        {
          label: `Edit run`,
          icon: "edit",
          action: () => (showCreateModal.value = "edit"),
        },
        {
          label: `Finalise run`,
          icon: "close-circle",
          action: () => (showFinaliseModal.value = true),
        },
        {
          label: `Delete run`,
          icon: "trash",
          danger: true,
          action: () => (showDeleteModal.value = true),
        },
      ]
    : []),
])

const { mutate: deleteProdRun, isPending: isDeleting } = useDeleteProdRun()
const { mutate: updateProdRun, isPending: isUpdating } = useUpdateProdRun()

const confirmDeleteRecipe = () => {
  if (!prodRun.value) return
  deleteProdRun(prodRun.value.uid, {
    onSuccess: () => {
      toast.success(`${prodRun.value.output_item_name} deleted successfully`)
      router.push("/production/runs")
      showDeleteModal.value = false
    },
    onError: displayError,
  })
}

const onConfirmDisable = () => {
  if (!prodRun.value) return
  updateProdRun(
    { uid: prodRun.value.uid, body: { status: "complete" } },
    {
      onSuccess: () => {
        toast.success(
          `${prodRun.value.output_item_name} ${showDisableModal.value + "d"} successfully`,
        )
        showDisableModal.value = null
        refetch()
      },
      onError: displayError,
    },
  )
}
</script>

<template>
  <div class="px-3 lg:px-6 lg:pt-8">
    <PageHeader v-if="isMobile" :title="`Run Details`" inner />

    <BackButton v-else :label="`Back to Runs`" to="/production/runs" />

    <div class="mt-4" />

    <EmptyState
      v-if="isPending || !prodRun"
      :loading="isPending"
      icon="box"
      :title="`Loading run details...`"
    />

    <div v-else>
      <section class="mb-6 flex justify-between gap-4">
        <div>
          <h2 class="mb-4 text-2xl font-semibold capitalize">{{ prodRun.output_item_name }}</h2>
          <div class="flex gap-1">
            <Chip
              :label="parseInt(prodRun.quantity_to_produce) + ' ' + prodRun.output_unit"
              color="blue"
            />
            <Chip
              :label="prodRun.status"
              :color="prodRun.status === 'completed' ? 'success' : 'warning'"
            />
          </div>
          <!-- <p class="mt-2 text-sm">
            Date completed: <span class="font-medium">{{ formatDate(prodRun.completed_at) }}</span>
          </p> -->
        </div>

        <div>
          <DropdownMenu :items="actionMenus">
            <template #trigger>
              <AppButton
                variant="outlined"
                icon="dots-vertical"
                class="!flex-row-reverse"
                :label="!isMobile ? `Manage run` : ''"
              />
            </template>
          </DropdownMenu>
        </div>
      </section>

      <section class="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard v-for="item in prodRunStats" :key="item.label" :stat="item" />
      </section>

      <section class="mt-8 grid gap-6 md:grid-cols-2">
        <!-- Ingredients -->
        <!-- <div class="rounded-xl border border-gray-200 bg-white p-5">
          <div class="flex items-center gap-2.5 rounded-t-xl p-2">
            <span class="bg-warning-100 flex size-10 items-center justify-center rounded-xl">
              <Icon name="box" :size="24" class="text-primary-700" />
            </span>
            <h3 class="!font-outfit truncate font-medium">Ingredients</h3>
          </div>
          <div class="mt-4 divide-y divide-gray-200 rounded-xl bg-gray-50 px-4">
            <div
              v-for="ingr in recipe.ingredients"
              :key="ingr.uid"
              class="flex justify-between py-4 text-sm"
            >
              <p class="space-x-1">
                <span class="font-medium">{{ ingr.material_name }}</span>
                <span>({{ ingr.quantity }} {{ ingr.unit }})</span>
              </p>
              <p>
                <span class="font-medium">{{ format(ingr.estimated_cost) }}</span>
              </p>
            </div>
          </div>
        </div> -->

        <!-- Process Cost -->
        <!-- <div class="rounded-xl border border-gray-200 bg-white p-5">
          <div class="flex items-center gap-2.5 rounded-t-xl p-2">
            <span class="bg-warning-100 flex size-10 items-center justify-center rounded-xl">
              <Icon name="box" :size="24" class="text-primary-700" />
            </span>
            <h3 class="!font-outfit truncate font-medium">Process Cost/Expenses</h3>
            <span class="ml-auto" />
            <button type="button" class="text-primary-600 text-sm underline">View note</button>
          </div>
          <div class="mt-4 divide-y divide-gray-200 rounded-xl bg-gray-50 px-4">
            <div
              v-for="process in recipe.process_costs"
              :key="process.uid"
              class="flex justify-between py-4 text-sm"
            >
              <p>
                <span class="font-medium">{{ process.name }}</span>
              </p>
              <p class="space-x-1">
                <span class="font-medium">{{ format(process.cost_per_batch) }}</span>
                <Icon v-if="process.notes" name="note" class="text-primary-600" />
                <span v-else class="px-2"></span>
              </p>
            </div>
          </div>
        </div> -->
      </section>

      <!--  -->
      <CreateProdRunDrawer
        :open="!!showCreateModal"
        :mode="showCreateModal"
        :run="prodRun"
        @close="showCreateModal = null"
        @refresh="refetch"
      />

      <ConfirmationModal
        :model-value="showDeleteModal"
        @update:model-value="() => (showDeleteModal = false)"
        :loading="isDeleting"
        :header="'Delete run'"
        :paragraph="`Are you sure you want to permanently delete this production run?`"
        @confirm="confirmDeleteRecipe"
        action-label="Delete"
        variant="error"
      />

      <ConfirmationModal
        v-model="showFinaliseModal"
        :loading="isUpdating"
        :header="`Finalise production run`"
        :paragraph="`Are you sure you want to finalise this production run?  `"
        :action-label="`Finalise`"
        :variant="'success'"
        @confirm="onConfirmDisable"
      />
    </div>
  </div>
</template>
