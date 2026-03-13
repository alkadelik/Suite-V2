<!-- eslint-disable @typescript-eslint/no-explicit-any  -->

<script setup lang="ts">
import { computed } from "vue"
import Icon from "@components/Icon.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import type { TRecipes } from "../../../types"

const props = defineProps<{
  item: TRecipes
  outputQtyWithUnit: string
  actionItems: Array<any>
  ingredientLabel?: string
}>()

defineEmits<{
  (e: "click"): void
}>()

const isSubAssembly = computed(() => {
  const t = (props.item as any).item_type
  // ✅ Also check output_raw_material — when a recipe's output is a raw material/sub-assembly,
  // the API sets output_raw_material to a UID even if item_type is wrongly stored as "product"
  return (
    t === "sub_assembly" ||
    (props.item as any).subassembly === true ||
    !!(props.item as any).output_raw_material
  )
})

const ingredientCount = computed(() => (props.item as any).ingredient_count ?? "—")
</script>

<template>
  <article
    class="w-full overflow-hidden rounded-2xl border"
    :class="
      item.is_active ? 'border-[#F6E8CB] bg-[#FBF4E6]' : 'border-gray-200 bg-white opacity-60'
    "
    @click="$emit('click')"
  >
    <!-- Header -->
    <header class="mb-2 flex items-center gap-3 px-4 pt-4">
      <div
        class="flex size-10 shrink-0 items-center justify-center rounded-xl"
        :class="item.is_active ? 'bg-[#F4E0B8]' : 'bg-gray-100'"
        aria-hidden="true"
      >
        <Icon name="blur" size="20" :class="item.is_active ? 'text-[#B56B00]' : 'text-gray-400'" />
      </div>

      <div class="w-full justify-between">
        <div class="flex items-center justify-between gap-2">
          <p
            class="truncate text-[15px] font-semibold"
            :class="item.is_active ? 'text-gray-900' : 'text-gray-400'"
          >
            {{ item.output_item_name }}
          </p>

          <div class="flex justify-between gap-1">
            <!-- Sub-assembly chip -->
            <span
              v-if="isSubAssembly"
              class="ml-auto inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-[12px] font-medium"
              :class="
                item.is_active
                  ? 'border-purple-200 bg-white text-purple-700'
                  : 'border-gray-200 bg-gray-50 text-gray-400'
              "
            >
              Sub-assembly
            </span>

            <!-- Actions -->
            <div class="ml-auto" data-no-row-click @click.stop @mousedown.stop @pointerdown.stop>
              <DropdownMenu :items="actionItems" />
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Footer -->
    <div
      class="flex items-center justify-between border-t border-t-[#F6E8CB] bg-white px-4 pt-4 pb-4"
    >
      <div class="flex w-full items-center justify-between">
        <div>
          <p
            class="text-[15px] font-medium"
            :class="item.is_active ? 'text-gray-900' : 'text-gray-400'"
          >
            {{ outputQtyWithUnit }}
          </p>
          <p class="mt-0.5 text-[12px] text-gray-400">Quantity</p>
        </div>

        <div>
          <p
            class="text-[15px] font-medium"
            :class="item.is_active ? 'text-gray-900' : 'text-gray-400'"
          >
            {{ ingredientCount }}
          </p>
          <p class="mt-0.5 text-[12px] text-gray-400">{{ ingredientLabel || "Ingredient(s)" }}</p>
        </div>

        <div>
          <span
            class="inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-medium"
            :class="
              item.is_active
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-gray-200 bg-gray-100 text-gray-400'
            "
          >
            {{ item.is_active ? "Active" : "Disabled" }}
          </span>
        </div>
      </div>
    </div>
  </article>
</template>
