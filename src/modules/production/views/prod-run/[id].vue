<script setup lang="ts">
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"
import { formatDate } from "@/utils/formatDate"
import AppButton from "@components/AppButton.vue"
import BackButton from "@components/BackButton.vue"
import Chip from "@components/Chip.vue"
import ConfirmationModal from "@components/ConfirmationModal.vue"
import DataTable from "@components/DataTable.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import EmptyState from "@components/EmptyState.vue"
import Icon from "@components/Icon.vue"
import PageHeader from "@components/PageHeader.vue"
import { useFinaliseProdRun, useGetSingleProdRun } from "@modules/production/api"
import CreateProdRunDrawer from "@modules/production/components/prod-run/CreateProdRunDrawer.vue"
import { PROD_RUN_INGREDIENT_COLUMN } from "@modules/production/constant"
import { useMediaQuery } from "@vueuse/core"
import { computed, ref } from "vue"
import { useRoute } from "vue-router"

const route = useRoute()
const isMobile = computed(() => useMediaQuery("(max-width: 1024px)").value)
const { format } = useFormatCurrency()

const showCreateModal = ref<"edit" | "duplicate" | null>(null)
const showFinaliseModal = ref(false)

const { data: prodRun, isPending, refetch } = useGetSingleProdRun(route.params.id as string)

const actionMenus = computed(() => [
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
          icon: "circle-check",
          action: () => (showFinaliseModal.value = true),
        },
      ]
    : []),
])

const costBreakdown = computed(() => {
  return {
    Materials: format(prodRun.value?.material_cost_total || 0, { kobo: true }),
    "Process Costs": format(prodRun.value?.process_cost_total || 0, { kobo: true }),
    "Additional Expenses": format(prodRun.value?.extra_cost_total || 0, { kobo: true }),
    divider1: true,
    "Total Cost": format(prodRun.value?.total_cost || 0, { kobo: true }),
  }
})

const economicsBreakdown = computed(() => {
  return {
    "Produced Units": parseInt(prodRun.value?.quantity_to_produce || "0"),
    "Usable Units": parseInt(prodRun.value?.usable_quantity || "0"),
    "Cost per Unit": format(prodRun.value?.cost_per_unit || 0, { kobo: true }),
  }
})

// const { mutate: updateProdRun, isPending: isUpdating } = useUpdateProdRun()
const { mutate: finaliseProdRun, isPending: isFinalising } = useFinaliseProdRun()

const onFinaliseRun = () => {
  if (!prodRun.value) return
  finaliseProdRun(prodRun.value.uid, {
    onSuccess: () => {
      toast.success(`Production run finalised successfully`)
      showFinaliseModal.value = false
      refetch()
    },
    onError: displayError,
  })
}
</script>

<template>
  <div class="px-3 pb-6 lg:px-6 lg:pt-8">
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
              class="capitalize"
              :color="prodRun.status === 'finalized' ? 'success' : 'warning'"
            />
          </div>
          <p v-if="prodRun.finalized_at" class="mt-2 text-sm">
            Date finalized: <span class="font-medium">{{ formatDate(prodRun.finalized_at) }}</span>
          </p>
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

      <section class="mt-4 grid gap-6 border-t border-gray-200 pt-6 md:grid-cols-2 lg:grid-cols-3">
        <!--  -->
        <div class="lg:col-span-2">
          <div class="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
            <DataTable
              :data="prodRun?.ingredients_used ?? []"
              :columns="PROD_RUN_INGREDIENT_COLUMN"
              :loading="false"
              :show-pagination="false"
            />
          </div>

          <!-- process cost -->
          <div class="rounded-xl border border-gray-200 bg-white p-5">
            <div class="flex items-center gap-2.5 rounded-t-xl p-2">
              <span class="bg-warning-100 flex size-10 items-center justify-center rounded-xl">
                <Icon name="setting" :size="24" class="text-primary-700" />
              </span>
              <h3 class="!font-outfit truncate font-medium">Process Cost/Expenses</h3>
              <span class="ml-auto" />
              <button type="button" class="text-primary-600 text-sm underline">View note</button>
            </div>

            <section class="mt-4 divide-y divide-gray-200 rounded-xl bg-gray-50 px-4">
              <div
                v-for="pro in prodRun.process_costs_used"
                :key="pro.uid"
                class="flex justify-between py-4 text-sm"
              >
                <p>
                  <span class="font-medium">{{ pro.name }}</span>
                </p>
                <p class="space-x-1">
                  <span class="font-medium">{{ format(pro.total_cost, { kobo: true }) }}</span>
                  <Icon v-if="false" name="note" class="text-primary-600" />
                  <span v-else class="px-2"></span>
                </p>
              </div>
            </section>

            <section v-if="prodRun.additional_expenses?.length" class="mt-6">
              <h4 class="text-core-700 mb-2">Additional Expenses</h4>
              <div class="divide-y divide-gray-200 rounded-xl bg-gray-50 px-4">
                <div
                  v-for="exp in prodRun.additional_expenses"
                  :key="exp.uid"
                  class="flex justify-between py-4 text-sm"
                >
                  <p>
                    <span class="font-medium">{{ exp.name }}</span>
                  </p>
                  <p class="space-x-1">
                    <span class="font-medium">{{ format(exp.amount, { kobo: true }) }}</span>
                    <Icon v-if="false" name="note" class="text-primary-600" />
                    <span v-else class="px-2"></span>
                  </p>
                </div>
              </div>
            </section>
          </div>

          <!--  -->
          <div
            v-if="parseInt(prodRun.damaged_quantity)"
            class="mt-6 rounded-xl border border-gray-200 bg-white p-5"
          >
            <div class="flex items-center gap-2.5 rounded-t-xl p-2">
              <span class="bg-warning-100 flex size-10 items-center justify-center rounded-xl">
                <Icon name="danger" :size="24" class="text-primary-700" />
              </span>
              <h3 class="!font-outfit truncate font-medium">Damages & Losses</h3>
              <span class="ml-auto" />
              <Chip
                icon="danger"
                color="error"
                :label="`${parseInt(prodRun.damaged_quantity)} units`"
              />
            </div>

            <!-- <section class="mt-6">
              <h4 class="text-core-700 mb-2">Reason(s) Recorded</h4>
              <div class="divide-y divide-gray-200 rounded-xl bg-gray-50 px-4">
                <div v-for="v in 1" :key="v" class="flex justify-between py-4 text-sm">
                  <p>
                    <span class="font-medium">Chill Roasting {{ v }}</span>
                  </p>
                  <p class="space-x-1">
                    <span class="font-medium">{{ format(4000) }}</span>
                    <Icon v-if="false" name="note" class="text-primary-600" />
                    <span v-else class="px-2"></span>
                  </p>
                </div>
              </div>
            </section>
            <section class="mt-6">
              <h4 class="text-core-700 mb-2">Cost Impact</h4>
              <div class="divide-y divide-gray-200 rounded-xl bg-gray-50 px-4">
                <div v-for="v in 1" :key="v" class="flex justify-between py-4 text-sm">
                  <p>
                    <span class="font-medium">Chill Roasting {{ v }}</span>
                  </p>
                  <p class="space-x-1">
                    <span class="font-medium">{{ format(4000) }}</span>
                    <Icon v-if="false" name="note" class="text-primary-600" />
                    <span v-else class="px-2"></span>
                  </p>
                </div>
              </div>
            </section> -->
          </div>
        </div>

        <!--  -->
        <div>
          <div
            :class="[
              'bg-primary-50 flex flex-col gap-8 bg-no-repeat px-6 pt-10 pb-20',
              'bg-[url(@/assets/images/wavy.svg),url(@/assets/images/wavy-reverse.svg)] bg-[position:top_left,bottom_left]',
            ]"
          >
            <div>
              <h4 class="mb-3 text-lg font-semibold text-gray-900">Cost Breakdown</h4>
              <div class="space-y-4">
                <div
                  v-for="[key, value] in Object.entries(costBreakdown)"
                  :key="key"
                  class="flex items-center justify-between gap-4"
                >
                  <div
                    v-if="key.includes('divider')"
                    class="border-core-300 w-full border border-dashed"
                  />
                  <template v-else>
                    <span
                      :class="
                        key.includes('Total')
                          ? 'text-core-800 font-semibold'
                          : 'text-core-600 font-medium'
                      "
                    >
                      {{ key }}
                    </span>
                    <span :class="key.includes('Total') ? 'font-semibold' : 'font-medium'">
                      {{ value }}
                    </span>
                  </template>
                </div>
              </div>
            </div>
            <!--  -->
            <div>
              <h4 class="mb-3 text-lg font-semibold text-gray-900">Economics Breakdown</h4>
              <div class="space-y-4">
                <div
                  v-for="[key, value] in Object.entries(economicsBreakdown)"
                  :key="key"
                  class="flex items-center justify-between gap-4"
                >
                  <div
                    v-if="key.includes('divider')"
                    class="border-core-300 w-full border border-dashed"
                  />
                  <template v-else>
                    <span
                      :class="
                        key.includes('Total')
                          ? 'text-core-800 font-semibold'
                          : 'text-core-600 font-medium'
                      "
                    >
                      {{ key }}
                    </span>
                    <span :class="key.includes('Total') ? 'font-semibold' : 'font-medium'">
                      {{ value }}
                    </span>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
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
        v-model="showFinaliseModal"
        :loading="isFinalising"
        :header="`Finalise production run`"
        :paragraph="`Are you sure you want to finalise this production run?  `"
        :action-label="`Finalise`"
        variant="success"
        @confirm="onFinaliseRun"
      />
    </div>
  </div>
</template>
