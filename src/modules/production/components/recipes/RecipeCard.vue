<script setup lang="ts">
import Icon from "@components/Icon.vue"
import { TRecipe } from "../../types"
import { computed } from "vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import { useProductionStore } from "../../store"
import Chip from "@components/Chip.vue"

const props = defineProps<{ recipe: TRecipe; class?: string }>()
const emit = defineEmits(["click", "toggle", "edit", "delete", "disable", "duplicate"])

const recipeLabel = computed(() => useProductionStore().recipeLabel)

const actionMenus = computed(() => [
  {
    label: `View ${recipeLabel.value}`,
    icon: "eye",
    action: () => emit("click"),
  },
  ...(props.recipe?.is_active
    ? [
        {
          label: `Edit ${recipeLabel.value}`,
          icon: "edit",
          action: () => emit("edit"),
        },
        {
          label: `Duplicate ${recipeLabel.value}`,
          icon: "copy",
          action: () => emit("duplicate"),
        },
        {
          label: `Disable ${recipeLabel.value}`,
          icon: "close-circle",
          action: () => emit("disable"),
        },
      ]
    : [
        {
          label: `Enable ${recipeLabel.value}`,
          icon: "tick-circle",
          action: () => emit("disable"),
        },
      ]),
  {
    label: `Delete ${recipeLabel.value}`,
    icon: "trash",
    danger: true,
    action: () => emit("delete"),
  },
])
</script>

<template>
  <div
    @click="emit('click')"
    :class="['border-warning-200 cursor-pointer rounded-xl border', props.class]"
  >
    <div class="bg-warning-50 flex items-center gap-2.5 rounded-t-xl p-2">
      <span class="bg-warning-100 flex size-10 items-center justify-center rounded-xl">
        <Icon name="box" :size="24" class="text-primary-700" />
      </span>
      <h3 class="!font-outfit truncate font-medium">{{ recipe.output_item_name }}</h3>
      <span class="ml-auto" />
      <Chip v-if="recipe.item_type === 'sub_assembly'" label="Sub-assembly" color="purple" />
      <DropdownMenu :items="actionMenus" @toggle="emit('toggle')" />
    </div>
    <div class="flex justify-between p-5 pb-3">
      <div>
        <p class="text-sm font-medium">
          {{ parseInt(recipe.output_quantity).toLocaleString() + recipe.output_unit }}
        </p>
        <p class="text-core-600 text-xs">Output Quantity</p>
      </div>
      <!--  -->
      <div>
        <p class="text-sm font-medium">{{ recipe.ingredient_count }}</p>
        <p class="text-core-600 text-xs">Ingredient Count</p>
      </div>
      <!--  -->
      <div>
        <Chip
          :label="recipe.is_active ? 'Active' : 'Disabled'"
          :color="recipe.is_active ? 'success' : 'error'"
        />
      </div>
    </div>
  </div>
</template>
