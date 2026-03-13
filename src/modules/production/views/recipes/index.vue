<!-- eslint-disable @typescript-eslint/no-unsafe-argument -->
<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { useMediaQuery } from "@vueuse/core"
import { useDebouncedRef } from "@/composables/useDebouncedRef"
import { formatCurrency } from "@/utils/format-currency"
import { toast } from "@/composables/useToast"
import RecipeMobileCard from "./components/RecipeCard.vue"
import PageHeader from "@components/PageHeader.vue"
import SectionHeader from "@components/SectionHeader.vue"
import EmptyState from "@components/EmptyState.vue"
import DataTable from "@components/DataTable.vue"
import Icon from "@components/Icon.vue"
import Chip from "@components/Chip.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import AppButton from "@components/AppButton.vue"
import TextField from "@components/form/TextField.vue"
import DeleteConfirmationModal from "@components/DeleteConfirmationModal.vue"
import Modal from "@components/Modal.vue"
import PreferredTerminologies from "../recipes/components/PreferredTerminologies.vue"
import RecipesDrawer from "./components/RecipesDrawer.vue"
import { RECIPES_COLUMN } from "../../constants"
import { useProductionStore } from "../../store"
import {
  useDeleteRecipe,
  RecipesAPI,
  getTotalCostFromDetail,
  type TRecipes,
  type RecipeDetail,
} from "../../recipes.api"

const productionStore = useProductionStore()
const router = useRouter()
const { mutateAsync: deleteRecipeMutate } = useDeleteRecipe()

const isMobile = computed(() => useMediaQuery("(max-width: 1024px)").value)

const showDrawer = ref(false)
const drawerMode = ref<"create" | "edit">("create")
const drawerRecipe = ref<Partial<RecipeDetail> | null>(null)

// ── Filter ─────────────────────────────────────────────────────────────────────
const showFilter = ref(false)
const filterRef = ref<HTMLElement | null>(null)
const activeFilters = ref<{ status?: "active" | "inactive" | "" }>({})

const hasActiveFilters = computed(() =>
  Object.values(activeFilters.value).some((v) => v != null && v !== ""),
)

const filterOptions: { label: string; value: "active" | "inactive" }[] = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
]

const selectFilter = (value: "active" | "inactive") => {
  activeFilters.value = activeFilters.value.status === value ? {} : { status: value }
  showFilter.value = false
  page.value = 1
  void loadList()
}

const clearFilters = () => {
  activeFilters.value = {}
  showFilter.value = false
  page.value = 1
  void loadList()
}

const onFilterDocClick = (e: MouseEvent) => {
  if (!showFilter.value) return
  if (filterRef.value?.contains(e.target as Node)) return
  showFilter.value = false
}

onMounted(() => document.addEventListener("click", onFilterDocClick, true))
onBeforeUnmount(() => document.removeEventListener("click", onFilterDocClick, true))

// ── Pagination & search ────────────────────────────────────────────────────────
const page = ref(1)
const itemsPerPage = ref(100)
const searchQuery = ref("")
const debouncedSearch = useDebouncedRef(searchQuery, 750)

const selectedComponent = computed(() => productionStore.selectedComponentOption)

const onSelect = (option: { label: string; value: string }) => {
  productionStore.setSelectedRecipeOption(option)
}

const toApiItemType = (v: string): "product" | "sub_assembly" | undefined => {
  const s = v.trim().toLowerCase()
  if (s === "product") return "product"
  if (s === "sub_assembly" || s === "sub-assembly") return "sub_assembly"
  return undefined
}

const loadList = async () => {
  if (!selectedComponent.value) return
  const itemType = toApiItemType(selectedComponent.value.value)
  const isActive =
    activeFilters.value.status === "active"
      ? true
      : activeFilters.value.status === "inactive"
        ? false
        : undefined

  await productionStore.fetchRecipes({
    search: debouncedSearch.value || undefined,
    limit: itemsPerPage.value,
    offset: (page.value - 1) * itemsPerPage.value,
    item_type: itemType,
    ...(isActive !== undefined ? { is_active: isActive } : {}),
  })
}

watch(
  selectedComponent,
  () => {
    page.value = 1
    void loadList()
  },
  { immediate: true },
)
watch(debouncedSearch, () => {
  page.value = 1
  void loadList()
})
watch([page, itemsPerPage], () => void loadList())

const recipes = computed(() => ({
  count: productionStore.recipesCount,
  results: productionStore.recipes,
}))

const isFetching = computed(() => productionStore.recipesLoading)

// ── Cost hydration — only calls /recipes/:uid/ ─────────────────────────────────
//
// The list endpoint returns output_unit directly on each item, so unit display
// needs no extra API calls. Cost is fetched from the recipe detail endpoint only
// when missing from the list item (last_cost field).

const totalCostByUid = ref<Record<string, number>>({})
const loadingDetails = ref(false)

const hydrateVisibleCosts = async () => {
  const rows = recipes.value.results
  if (!rows.length) return

  // Use last_cost from the list item if present — no extra call needed
  const nextCosts = { ...totalCostByUid.value }
  for (const r of rows) {
    const uid = String(r.uid)
    if (uid in nextCosts) continue
    const fromList = Number(r.last_cost ?? r.average_cost ?? 0)
    if (fromList > 0) {
      nextCosts[uid] = fromList
    }
  }

  // Only hit the detail endpoint for rows where cost is still unknown
  const stillMissing = rows.map((r) => String(r.uid)).filter((uid) => !(uid in nextCosts))

  if (stillMissing.length) {
    loadingDetails.value = true
    try {
      const details = await Promise.all(stillMissing.map((uid) => RecipesAPI.getByUid(uid)))
      for (const d of details) {
        if (!d) continue
        nextCosts[String(d.uid)] = getTotalCostFromDetail(d)
      }
    } finally {
      loadingDetails.value = false
    }
  }

  totalCostByUid.value = nextCosts
}

watch(
  () => recipes.value.results,
  () => void hydrateVisibleCosts(),
  { immediate: true },
)

// ── Output quantity display (unit comes from list item's output_unit field) ────

const outputQtyWithUnit = (item: TRecipes): string => {
  const qty = item.output_quantity
  if (qty == null || qty === "") return "—"
  const unit = (item.output_unit ?? "").trim()
  const n = typeof qty === "number" ? qty : Number(qty)
  const formatted = Number.isFinite(n) ? n.toString() : String(qty)
  return unit ? `${formatted} ${unit}` : formatted
}

// ── Status chip ────────────────────────────────────────────────────────────────

const statusChipProps = (isActive: boolean) => ({
  label: isActive ? "Active" : "Disabled",
  class: isActive
    ? "bg-green-50 text-green-700 border border-green-200"
    : "bg-gray-100 text-gray-600 border border-gray-200",
})

const safeDateOnly = (iso?: string | null): string => {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return String(iso).slice(0, 10)
  return d.toISOString().slice(0, 10)
}

// ── Drawer helpers ─────────────────────────────────────────────────────────────

const mapDetailToDrawer = (d: RecipeDetail): Partial<RecipeDetail> => ({
  uid: d.uid,
  output_item: d.output_product ?? d.output_raw_material ?? d.output_item ?? "",
  output_quantity: d.output_quantity,
  unit: d.unit ?? d.output_unit ?? "",
  notes: d.notes ?? "",
  ingredients: (d.ingredients ?? []).map((x) => ({
    material_uid: x.material_uid,
    quantity: x.quantity,
  })),
  process_costs: (d.process_costs ?? []).map((p) => ({
    name: p.name ?? "",
    cost_per_batch: p.cost_per_batch ?? 0,
    notes: p.notes ?? "",
  })),
})

const openEdit = async (row: TRecipes) => {
  const d = await RecipesAPI.getByUid(String(row.uid))
  if (!d) return toast.error("Could not load recipe details")
  drawerMode.value = "edit"
  drawerRecipe.value = mapDetailToDrawer(d)
  showDrawer.value = true
}

const openDuplicate = async (row: TRecipes) => {
  const d = await RecipesAPI.getByUid(String(row.uid))
  if (!d) return toast.error("Could not load recipe details")
  drawerMode.value = "create"
  drawerRecipe.value = { ...mapDetailToDrawer(d) }
  showDrawer.value = true
}

// ── Delete / Disable ───────────────────────────────────────────────────────────

const showDeleteModal = ref(false)
const deleting = ref(false)
const recipeToDelete = ref<TRecipes | null>(null)

const showDisableModal = ref(false)
const disabling = ref(false)
const recipeToDisable = ref<TRecipes | null>(null)

const confirmDisableRecipe = async () => {
  const item = recipeToDisable.value
  if (!item) return
  disabling.value = true
  try {
    await productionStore.patchRecipe(String(item.uid), { is_active: !item.is_active })
    toast.success(item.is_active ? "Recipe disabled" : "Recipe enabled")
    showDisableModal.value = false
    recipeToDisable.value = null
    await loadList()
  } catch (e: unknown) {
    const err = e as { response?: { data?: { detail?: string } }; message?: string }
    toast.error(err?.response?.data?.detail || err?.message || "Failed to update recipe")
  } finally {
    disabling.value = false
  }
}

const openDeleteRecipe = (item: TRecipes) => {
  recipeToDelete.value = item
  nextTick(() => {
    showDeleteModal.value = true
  })
}

const confirmDeleteRecipe = async () => {
  const uid = String(recipeToDelete.value?.uid ?? "")
  if (!uid) return
  deleting.value = true
  try {
    await deleteRecipeMutate(uid)
    toast.success("Recipe deleted")
    showDeleteModal.value = false
    recipeToDelete.value = null
    page.value = 1
    totalCostByUid.value = {}
    await loadList()
  } catch (e: unknown) {
    const err = e as { response?: { data?: { detail?: string } }; message?: string }
    toast.error(err?.response?.data?.detail || err?.message || "Failed to delete recipe")
  } finally {
    deleting.value = false
  }
}

const getActionItems = (item: TRecipes) => [
  {
    label: `View ${selectedComponent.value?.label || "recipe"}`,
    icon: "eye",
    action: () => router.push(`/recipes/${item.uid}`),
  },
  ...(item.is_active
    ? [
        {
          label: `Edit ${selectedComponent.value?.label || "recipe"}`,
          icon: "edit",
          action: () => void openEdit(item),
        },
        {
          label: `Duplicate ${selectedComponent.value?.label || "recipe"}`,
          icon: "copy",
          action: () => void openDuplicate(item),
        },
        {
          label: `Disable ${selectedComponent.value?.label || "recipe"}`,
          icon: "close-circle",
          action: () => {
            recipeToDisable.value = item
            showDisableModal.value = true
          },
        },
      ]
    : [
        {
          label: `Enable ${selectedComponent.value?.label || "recipe"}`,
          icon: "tick-circle",
          action: () => {
            recipeToDisable.value = item
            showDisableModal.value = true
          },
        },
      ]),
  {
    label: `Delete ${selectedComponent.value?.label || "recipe"}`,
    icon: "trash",
    danger: true,
    action: () => openDeleteRecipe(item),
  },
]

const ingredientLabel = computed(() => {
  const val = selectedComponent.value?.value?.toLowerCase() ?? ""
  return val === "bom" || val === "formula" ? "Component(s)" : "Ingredient(s)"
})

const openAddRecipeDrawer = () => {
  drawerMode.value = "create"
  drawerRecipe.value = null
  showDrawer.value = true
}

const onCreatedOrUpdated = async () => {
  showDrawer.value = false
  drawerRecipe.value = null
  page.value = 1
  totalCostByUid.value = {}
  productionStore.invalidateInventoryCache()
  await loadList()
}

// ── Duplicate flag for table rows ──────────────────────────────────────────────

const recipesWithDuplicateFlag = computed(() => {
  const rows = recipes.value.results
  const lastIndex = new Map<string, number>()
  rows.forEach((r, i) => {
    const name = String(r.output_item_name ?? "").trim()
    if (name) lastIndex.set(name, i)
  })
  return rows.map((r, i) => ({
    ...r,
    is_duplicate: String(r.output_item_name ?? "").trim()
      ? i !== lastIndex.get(String(r.output_item_name ?? "").trim())
      : false,
  }))
})
</script>

<template>
  <div class="px-3 pb-6">
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
        v-if="isFetching && !recipes?.count"
        :title="`You don't have any recipe yet!`"
        :description="`Start tracking everything you use to make your products by adding your recipe`"
        :action-label="`Add ${selectedComponent.value}`"
        :loading="isFetching"
        action-icon="add"
        @action="openAddRecipeDrawer"
      >
        <template #image>
          <img src="@/assets/images/empty-material.svg?url" class="mx-auto mb-4" />
        </template>
      </EmptyState>

      <section v-else class="flex flex-col gap-5 lg:gap-8">
        <div
          class="space-y-4 overflow-hidden rounded-xl border-gray-200 pt-3 md:border md:bg-white"
        >
          <div class="flex flex-col justify-between md:flex-row md:items-center md:px-4">
            <h3 class="mb-2 hidden items-center gap-1 text-lg font-semibold md:mb-0 lg:flex">
              {{ "All " + selectedComponent.label + "(s)" }}
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

              <div ref="filterRef" class="relative flex-shrink-0">
                <button
                  type="button"
                  class="relative inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors"
                  :class="
                    hasActiveFilters
                      ? 'border-leyyow-400 bg-primary-50 text-leyyow-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  "
                  @click="showFilter = !showFilter"
                >
                  <Icon name="filter-lines" size="16" />
                  <span v-if="!isMobile">Filter</span>
                  <span
                    v-if="hasActiveFilters"
                    class="bg-primary-500 absolute -top-1 -right-1 size-2.5 rounded-full"
                  />
                </button>

                <div
                  v-if="showFilter"
                  class="absolute top-full right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
                >
                  <p
                    class="px-3 pt-3 pb-1 text-xs font-medium tracking-wide text-gray-400 uppercase"
                  >
                    Status
                  </p>
                  <div class="p-1">
                    <button
                      v-for="opt in filterOptions"
                      :key="opt.value"
                      type="button"
                      class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors"
                      :class="
                        activeFilters.status === opt.value
                          ? 'bg-primary-50 text-primary-700 font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      "
                      @click="selectFilter(opt.value)"
                    >
                      <div class="flex items-center gap-2">
                        <span
                          class="size-2 rounded-full"
                          :class="opt.value === 'active' ? 'bg-green-500' : 'bg-gray-400'"
                        />
                        {{ opt.label }}
                      </div>
                      <Icon
                        v-if="activeFilters.status === opt.value"
                        name="check"
                        size="14"
                        class="text-primary-500"
                      />
                    </button>
                  </div>
                  <div v-if="hasActiveFilters" class="border-t border-gray-100 p-1">
                    <button
                      type="button"
                      class="w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-gray-500 hover:bg-gray-50"
                      @click="clearFilters"
                    >
                      Clear filter
                    </button>
                  </div>
                </div>
              </div>

              <AppButton
                icon="add"
                size="sm"
                class="flex-shrink-0"
                :label="isMobile ? '' : `Add ${selectedComponent.value}`"
                @click="openAddRecipeDrawer"
              />
            </div>
          </div>

          <!-- Mobile -->
          <div v-if="isMobile" class="flex flex-col gap-4 px-0">
            <RecipeMobileCard
              v-for="item in recipesWithDuplicateFlag"
              :key="String(item.uid)"
              :item="item"
              :output-qty-with-unit="outputQtyWithUnit(item)"
              :action-items="getActionItems(item)"
              :ingredient-label="ingredientLabel"
              @click="$router.push(`/recipes/${item.uid}`)"
            />
          </div>

          <!-- Desktop -->
          <DataTable
            v-else
            :data="recipesWithDuplicateFlag"
            :columns="RECIPES_COLUMN"
            :loading="isFetching"
            :row-class="
              (row: TRecipes & { is_duplicate: boolean }) => (!row.is_active ? 'opacity-50' : '')
            "
            @row-click="(row: TRecipes) => $router.push(`/recipes/${row.uid}`)"
          >
            <template #cell:output_item_name="{ item }">
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-700">{{ item.output_item_name || "—" }}</span>
                <span
                  v-if="outputQtyWithUnit(item) !== '—'"
                  class="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                >
                  {{ outputQtyWithUnit(item) }}
                </span>
                <span
                  v-if="item.item_type === 'sub_assembly' || item.output_raw_material"
                  class="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700"
                >
                  Sub-assembly
                </span>
              </div>
            </template>

            <template #cell:is_active="{ item }">
              <span
                class="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium"
                :class="statusChipProps(!!item.is_active).class"
              >
                {{ statusChipProps(!!item.is_active).label }}
              </span>
            </template>

            <template #cell:updated_at="{ item }">
              <span class="text-sm text-gray-700">{{ safeDateOnly(item.updated_at) }}</span>
            </template>

            <template #cell:output_quantity="{ item }">
              <span class="text-sm text-gray-700 tabular-nums">{{ outputQtyWithUnit(item) }}</span>
            </template>

            <template #cell:last_cost="{ item }">
              <span class="text-sm text-gray-700 tabular-nums">
                <span v-if="loadingDetails && !(String(item.uid) in totalCostByUid)" />
                <span v-else>
                  {{
                    (totalCostByUid[String(item.uid)] ?? 0) > 0
                      ? formatCurrency(totalCostByUid[String(item.uid)])
                      : "—"
                  }}
                </span>
              </span>
            </template>

            <template #cell:actions="{ item }">
              <div data-no-row-click @click.stop @mousedown.stop @pointerdown.stop>
                <DropdownMenu :items="getActionItems(item)" />
              </div>
            </template>
          </DataTable>
        </div>
      </section>
    </div>

    <DeleteConfirmationModal
      v-model="showDeleteModal"
      :header="`Delete ${selectedComponent?.label || 'recipe'}`"
      :loading="deleting"
      max-width="md"
      @delete="confirmDeleteRecipe"
    >
      <template #paragraph>
        <p class="mt-2 text-xs md:text-sm">
          Are you sure you want to delete
          {{
            recipeToDelete?.output_item_name ||
            `this ${selectedComponent?.label?.toLowerCase() || "recipe"}`
          }}?
        </p>
      </template>
    </DeleteConfirmationModal>

    <Modal
      :open="showDisableModal"
      :title="
        recipeToDisable?.is_active
          ? `Disable ${selectedComponent?.label || 'recipe'}`
          : `Enable ${selectedComponent?.label || 'recipe'}`
      "
      max-width="md"
      @close="showDisableModal = false"
    >
      <p class="mt-1 text-sm text-gray-600">
        <template v-if="recipeToDisable?.is_active">
          Are you sure you want to disable
          <strong>{{ recipeToDisable?.output_item_name || "this recipe" }}</strong
          >? It will no longer appear as active.
        </template>
        <template v-else>
          Are you sure you want to enable
          <strong>{{ recipeToDisable?.output_item_name || "this recipe" }}</strong
          >? It will appear as active again.
        </template>
      </p>
      <template #footer>
        <div class="flex gap-3">
          <button
            type="button"
            class="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            :disabled="disabling"
            @click="showDisableModal = false"
          >
            Cancel
          </button>
          <button
            type="button"
            class="flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            :class="
              recipeToDisable?.is_active
                ? 'bg-primary-600 hover:bg-primary-700'
                : 'bg-green-600 hover:bg-green-700'
            "
            :disabled="disabling"
            @click="confirmDisableRecipe"
          >
            {{
              disabling ? "Saving..." : recipeToDisable?.is_active ? "Yes, disable" : "Yes, enable"
            }}
          </button>
        </div>
      </template>
    </Modal>

    <RecipesDrawer
      v-model:open="showDrawer"
      :mode="drawerMode"
      :recipe="drawerRecipe"
      @close="showDrawer = false"
      @refresh="showDrawer = false"
      @created="onCreatedOrUpdated"
      @updated="onCreatedOrUpdated"
    />
  </div>
</template>
