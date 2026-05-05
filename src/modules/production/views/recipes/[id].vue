<script setup lang="ts">
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"
import { startCase } from "@/utils/format-strings"
import { formatDate } from "@/utils/formatDate"
import AppButton from "@components/AppButton.vue"
import BackButton from "@components/BackButton.vue"
import Chip from "@components/Chip.vue"
import ConfirmationModal from "@components/ConfirmationModal.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import EmptyState from "@components/EmptyState.vue"
import Icon from "@components/Icon.vue"
import PageHeader from "@components/PageHeader.vue"
import StatCard from "@components/StatCard.vue"
import { useDeleteRecipe, useGetSingleRecipe, useUpdateRecipe } from "@modules/production/api"
import AddNewRecipeDrawer from "@modules/production/components/recipes/AddNewRecipeDrawer.vue"
import { useProductionStore } from "@modules/production/store"
import { useMediaQuery } from "@vueuse/core"
import { capitalize, computed, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"

const route = useRoute()
const router = useRouter()
const isMobile = computed(() => useMediaQuery("(max-width: 1024px)").value)
const recipeLabel = computed(() => useProductionStore().recipeLabel)
const recipeValue = computed(() => useProductionStore().recipeValue)
const { format } = useFormatCurrency()

const showCreateModal = ref<"edit" | "duplicate" | null>(null)
const showDisableModal = ref<"enable" | "disable" | null>(null)
const showDeleteModal = ref(false)

const { data: recipe, isPending, refetch } = useGetSingleRecipe(route.params.id as string)

const recipeStats = computed(() => [
  ...(isMobile.value
    ? []
    : [
        {
          label: "Producible Quantity",
          value: recipe.value?.producible_quantity + " " + recipe.value?.output_unit,
          icon: "bag",
        },
      ]),
  {
    label: "Estimated Cost per Batch",
    value: `${format(recipe.value?.estimated_cost_per_batch || 0)}`,
    icon: "bag",
  },
  {
    label: "Last Used in Production",
    value: recipe.value?.last_used_in_production
      ? formatDate(recipe.value?.last_used_in_production)
      : "N/A",
    icon: "bag",
    chip: recipe.value?.last_used_in_production ? "x77 times" : undefined,
    chipColor: "blue",
  },
])

const actionMenus = computed(() => [
  ...(recipe.value?.is_active
    ? [
        {
          label: `Edit ${recipeLabel.value}`,
          icon: "edit",
          action: () => (showCreateModal.value = "edit"),
        },
        {
          label: `Duplicate ${recipeLabel.value}`,
          icon: "copy",
          action: () => (showCreateModal.value = "duplicate"),
        },
        {
          label: `Disable ${recipeLabel.value}`,
          icon: "close-circle",
          action: () => (showDisableModal.value = "disable"),
        },
      ]
    : [
        {
          label: `Enable ${recipeLabel.value}`,
          icon: "tick-circle",
          action: () => (showDisableModal.value = "enable"),
        },
      ]),
  {
    label: `Delete ${recipeLabel.value}`,
    icon: "trash",
    danger: true,
    action: () => (showDeleteModal.value = true),
  },
])

const { mutate: deleteRecipeMutate, isPending: isDeleting } = useDeleteRecipe()
const { mutate: updateRecipeFn, isPending: isUpdating } = useUpdateRecipe()

const confirmDeleteRecipe = () => {
  if (!recipe.value) return
  deleteRecipeMutate(recipe.value.uid, {
    onSuccess: () => {
      toast.success(`${recipeLabel.value} deleted successfully`)
      router.push("/production/recipes")
      showDeleteModal.value = false
    },
    onError: displayError,
  })
}

const onConfirmDisable = () => {
  if (!recipe.value) return
  updateRecipeFn(
    { uid: recipe.value.uid, body: { is_active: !recipe.value.is_active } },
    {
      onSuccess: () => {
        toast.success(`${recipeLabel.value} ${showDisableModal.value + "d"} successfully`)
        showDisableModal.value = null
        refetch()
      },
      onError: displayError,
    },
  )
}

const pendingAction = route.query.action as string | undefined
if (pendingAction) {
  router.replace({ query: { ...route.query, action: undefined } })
}

watch(
  recipe,
  (data) => {
    if (data && pendingAction === "edit") {
      showCreateModal.value = "edit"
    }
  },
  { once: true },
)
</script>

<template>
  <div class="px-3 lg:px-6 lg:pt-8">
    <PageHeader
      v-if="isMobile"
      :title="`${startCase(recipeValue)} Details`"
      inner
      backLink="/production/recipes"
    />

    <BackButton v-else :label="`Back to ${startCase(recipeLabel)}`" to="/production/recipes" />

    <div class="mt-4" />

    <EmptyState
      v-if="isPending || !recipe"
      :loading="isPending"
      icon="box"
      :title="`Loading ${recipeValue} details...`"
    />

    <div v-else>
      <section class="mb-6 flex justify-between gap-4">
        <div>
          <h2 class="mb-4 text-2xl font-semibold capitalize">{{ recipe.output_item_name }}</h2>
          <div class="flex gap-1">
            <Chip
              :label="parseInt(recipe.output_quantity) + ' ' + recipe.output_unit"
              color="blue"
            />
            <Chip v-if="recipe.item_type === 'sub_assembly'" label="Sub-assembly" color="purple" />
            <Chip
              :label="recipe.is_active ? 'Active' : 'Disabled'"
              :color="recipe.is_active ? 'success' : 'error'"
            />
          </div>
          <p class="mt-2 text-sm">
            Last Edited: <span class="font-medium">{{ formatDate(recipe.updated_at) }}</span>
          </p>
        </div>

        <div>
          <DropdownMenu :items="actionMenus">
            <template #trigger>
              <AppButton
                variant="outlined"
                icon="dots-vertical"
                class="!flex-row-reverse"
                :label="!isMobile ? `Manage ${recipeValue}` : ''"
              />
            </template>
          </DropdownMenu>
        </div>
      </section>

      <section class="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard v-for="item in recipeStats" :key="item.label" :stat="item" />
      </section>

      <section class="mt-8 grid gap-6 md:grid-cols-2">
        <!-- Ingredients -->
        <div class="rounded-xl border border-gray-200 bg-white p-5">
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
        </div>

        <!-- Process Cost -->
        <div class="rounded-xl border border-gray-200 bg-white p-5">
          <div class="flex items-center gap-2.5 rounded-t-xl p-2">
            <span class="bg-warning-100 flex size-10 items-center justify-center rounded-xl">
              <Icon name="box" :size="24" class="text-primary-700" />
            </span>
            <h3 class="!font-outfit truncate font-medium">Process Cost/Expenses</h3>
            <span class="ml-auto" />
            <button
              v-if="recipe.notes"
              type="button"
              class="text-primary-600 flex-shrink-0 text-sm underline"
            >
              View note
            </button>
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
        </div>
      </section>

      <!--  -->
      <AddNewRecipeDrawer
        :open="!!showCreateModal"
        :mode="showCreateModal"
        :recipe="recipe"
        @close="
          () => {
            showCreateModal = null
            router.replace({ query: undefined })
          }
        "
        @refresh="refetch"
      />

      <ConfirmationModal
        :model-value="showDeleteModal"
        @update:model-value="() => (showDeleteModal = false)"
        :loading="isDeleting"
        :header="'Delete ' + recipeLabel"
        :paragraph="`Are you sure you want to permanently delete this ${recipeValue}?`"
        @confirm="confirmDeleteRecipe"
        action-label="Delete"
        variant="error"
      />

      <ConfirmationModal
        :model-value="!!showDisableModal"
        :loading="isUpdating"
        :header="`${capitalize(showDisableModal || '')} ${recipeLabel}`"
        :paragraph="`Are you sure you want to ${showDisableModal} this ${recipeLabel.toLowerCase()}?  `"
        :action-label="capitalize(showDisableModal || '')"
        :variant="showDisableModal === 'disable' ? 'warning' : 'success'"
        @confirm="onConfirmDisable"
      />
    </div>
  </div>
</template>
