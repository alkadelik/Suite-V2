<script setup lang="ts">
import { useDebouncedRef } from "@/composables/useDebouncedRef"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import ConfirmationModal from "@components/ConfirmationModal.vue"
import DataTable from "@components/DataTable.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import EmptyState from "@components/EmptyState.vue"
import TextField from "@components/form/TextField.vue"
import PageHeader from "@components/PageHeader.vue"
import SectionHeader from "@components/SectionHeader.vue"
import StatCard from "@components/StatCard.vue"
import {
  useDeleteRecipe,
  useGetRecipes,
  useGetRecipesStats,
  useUpdateRecipe,
} from "@modules/production/api"
import AddNewRecipeDrawer from "@modules/production/components/recipes/AddNewRecipeDrawer.vue"
import PreferredTerminologies from "@modules/production/components/recipes/PreferredTerminologies.vue"
import RecipeCard from "@modules/production/components/recipes/RecipeCard.vue"
import { RECIPES_COLUMN } from "@modules/production/constant"
import { useProductionStore } from "@modules/production/store"
import { TRecipe } from "@modules/production/types"
import { useMediaQuery } from "@vueuse/core"
import { capitalize, computed, ref } from "vue"
import { useRouter } from "vue-router"

const page = ref(1)
const itemsPerPage = ref(10)
const searchQuery = ref("")
const debouncedSearch = useDebouncedRef(searchQuery, 750)
const selectedRecipe = ref<TRecipe | null>(null)
const showDeleteModal = ref(false)
const showCreateModal = ref<"create" | "edit" | "duplicate" | null>(null)
const showDisableModal = ref<"enable" | "disable" | null>(null)

const isMobile = computed(() => useMediaQuery("(max-width: 1024px)").value)
const router = useRouter()

const selectedComponent = computed(() => useProductionStore().selectedRecipeOption)
const recipeLabel = computed(() => selectedComponent.value?.label || "Recipe")
const recipeValue = computed(() => selectedComponent.value?.value || "recipe")

const onSelect = (option: { label: string; value: string }) => {
  useProductionStore().setSelectedRecipeOption(option)
}

const computedParams = computed(() => {
  const params: Record<string, string> = {}
  if (debouncedSearch.value) params.search = debouncedSearch.value
  params.offset = ((page.value - 1) * itemsPerPage.value).toString()
  params.limit = itemsPerPage.value.toString()
  return params
})

const { data: recipes, isPending, isFetching, refetch } = useGetRecipes(computedParams)
const { data: stats, isLoading: isLoadingStats } = useGetRecipesStats()

const recipesStats = computed(() => [
  ...(isMobile.value
    ? []
    : [
        {
          label: `Total ${recipeLabel.value}`,
          value: stats.value?.total_recipes || 0,
          icon: "bag",
          iconClass: "lg:text-gray-700",
        },
      ]),
  {
    label: `Active ${recipeLabel.value}`,
    value: stats.value?.active_recipes || 0,
    icon: "bag",
    iconClass: "lg:text-gray-700",
  },
  {
    label: "Producible Now",
    value: stats.value?.producible_now || 0,
    icon: "bag",
    iconClass: "lg:text-gray-700",
    chipColor: "pink",
  },
])

const getActionItems = (item: TRecipe) => [
  {
    label: `View ${recipeLabel.value}`,
    icon: "eye",
    action: () => router.push(`/production/recipes/${item.uid}`),
  },
  ...(item.is_active
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
]

const { mutate: deleteRecipeMutate, isPending: isDeleting } = useDeleteRecipe()
const { mutate: updateRecipeFn, isPending: isUpdating } = useUpdateRecipe()

const confirmDeleteRecipe = () => {
  if (!selectedRecipe.value) return
  deleteRecipeMutate(selectedRecipe.value.uid, {
    onSuccess: () => {
      toast.success(`${recipeLabel.value} deleted successfully`)
      showDeleteModal.value = false
      selectedRecipe.value = null
      refetch()
    },
    onError: displayError,
  })
}

const onConfirmDisable = () => {
  if (!selectedRecipe.value) return
  console.log("Selected Recipe", selectedRecipe.value.output_item_name)
  updateRecipeFn(
    { uid: selectedRecipe.value.uid, body: { is_active: !selectedRecipe.value.is_active } },
    {
      onSuccess: () => {
        toast.success(`${recipeLabel.value} ${showDisableModal.value + "d"} successfully`)
        showDisableModal.value = null
        selectedRecipe.value = null
        refetch()
      },
      onError: displayError,
    },
  )
}

const formatWithUnit = (item: TRecipe) => {
  const { output_quantity: quantity, output_unit: unit } = item
  if (!quantity || !unit) return ""
  return `${parseInt(quantity)} ${unit}`
}
</script>

<template>
  <div class="px-3 pb-6 lg:pt-6">
    <PageHeader
      v-if="isMobile"
      :title="selectedComponent?.label || 'Recipe'"
      :count="recipes?.count || 0"
    />
    <SectionHeader
      v-else-if="selectedComponent"
      :title="selectedComponent?.label || 'Recipe'"
      :subtitle="`Manage and organize your ${selectedComponent?.value?.toLowerCase() || 'recipe'} efficiently.`"
    />

    <div class="mt-6" />

    <PreferredTerminologies v-if="!selectedComponent" @select="onSelect" />

    <div v-else class="flex flex-col gap-8">
      <EmptyState
        v-if="isPending && !recipes?.count && !searchQuery"
        :title="`You don't have any recipe yet!`"
        :description="`Start tracking everything you use to make your products by adding your recipe`"
        :action-label="`Add ${selectedComponent.value}`"
        :loading="isPending"
        action-icon="add"
        @action="showCreateModal = 'create'"
      >
        <template #image>
          <img src="@/assets/images/empty-material.svg?url" class="mx-auto mb-4" />
        </template>
      </EmptyState>

      <section v-else class="flex flex-col gap-5 lg:gap-8">
        <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            v-for="item in recipesStats"
            :key="item.label"
            :stat="item"
            :loading="isLoadingStats"
          />
        </div>

        <div
          class="space-y-4 overflow-hidden rounded-xl border-gray-200 pt-3 md:border md:bg-white"
        >
          <div class="flex flex-col justify-between md:flex-row md:items-center md:px-4">
            <h3 class="mb-2 hidden items-center gap-1 text-lg font-semibold md:mb-0 lg:flex">
              {{ "All " + recipeLabel }}
              <Chip v-if="recipes?.count" :label="recipes?.count" />
            </h3>

            <div class="flex items-center gap-2">
              <TextField
                left-icon="search-lg"
                size="sm"
                class="w-full md:min-w-64"
                placeholder="Search by recipe or item name"
                v-model="searchQuery"
              />

              <AppButton
                icon="filter-lines"
                size="sm"
                color="alt"
                class="relative flex-shrink-0"
                :label="isMobile ? '' : 'Filter'"
              />

              <AppButton
                icon="add"
                size="sm"
                class="flex-shrink-0"
                :label="isMobile ? '' : `Add ${recipeValue}`"
                @click="showCreateModal = 'create'"
              />
            </div>
          </div>

          <DataTable
            :data="recipes?.results ?? []"
            :columns="RECIPES_COLUMN"
            :loading="isFetching"
            :row-class="(row) => (!row.is_active ? 'opacity-50' : '')"
            @row-click="(row) => $router.push(`/production/recipes/${row.uid}`)"
          >
            <template #cell:output_item_name="{ item }">
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-700">{{ item.output_item_name }}</span>
                <Chip v-if="formatWithUnit(item)" color="blue" :label="formatWithUnit(item)" />
                <Chip v-if="item.item_type === 'sub_assembly'" color="purple" />
              </div>
            </template>

            <template #cell:is_active="{ item }">
              <Chip
                :label="item.is_active ? 'Active' : 'Disabled'"
                :color="item.is_active ? 'success' : 'error'"
              />
            </template>

            <template #cell:actions="{ item }">
              <DropdownMenu :items="getActionItems(item)" @toggle="selectedRecipe = item" />
            </template>

            <template #mobile="{ item }">
              <RecipeCard :recipe="item" @click="$router.push(`/production/recipes/${item.uid}`)" />
            </template>
          </DataTable>
        </div>
      </section>
    </div>

    <AddNewRecipeDrawer
      :open="!!showCreateModal"
      :mode="showCreateModal"
      :recipe="selectedRecipe"
      @close="showCreateModal = null"
      @refresh="refetch"
    />

    <ConfirmationModal
      :model-value="showDeleteModal"
      @update:model-value="() => ((showDeleteModal = false), (selectedRecipe = null))"
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
</template>
