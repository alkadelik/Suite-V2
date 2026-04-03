<script setup lang="ts">
import Icon from "@components/Icon.vue"
import { TRawMaterial } from "../types"
import { computed } from "vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import { useProductionStore } from "../store"
import Chip from "@components/Chip.vue"
import { formatCurrency } from "@/utils/format-currency"
import { useRouter } from "vue-router"

const props = defineProps<{ material: TRawMaterial; class?: string }>()
const emit = defineEmits(["click", "toggle", "edit", "adjust", "view"])

const router = useRouter()

const selectedComponent = computed(() => useProductionStore().selectedComponentOption)

const actionMenus = computed(() => [
  {
    label: `Edit ${selectedComponent.value?.value || "material"}`,
    icon: "edit",
    action: () => emit("edit"),
  },
  {
    label: "Adjust stock",
    icon: "box",
    action: () => emit("adjust"),
  },
  {
    label: "View usage",
    icon: "eye",
    action: () => {
      router.push(`/${props.material.uid}?tab=usage`)
    },
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
      <h3 class="!font-outfit truncate font-medium">{{ material.name }}</h3>
      <Chip v-if="material.is_sub_assembly" label="Sub-assembly" color="purple" />
      <span class="ml-auto" />
      <Icon
        v-if="material.low_stock"
        name="danger"
        :class="material.low_stock ? 'text-warning-500' : 'text-error-25'"
      />
      <DropdownMenu :items="actionMenus" @toggle="emit('toggle')" />
    </div>
    <div class="flex justify-between p-5 pb-3">
      <div>
        <p class="text-sm font-medium">
          {{ Number(material.current_stock).toLocaleString() + material.unit }}
        </p>
        <p class="text-core-600 text-xs">Stock</p>
      </div>
      <!--  -->
      <div>
        <p class="text-sm font-medium">
          {{ formatCurrency(Number(material.last_cost)) }}/{{ material.unit }}
        </p>
        <p class="text-core-600 text-xs">Last Cost</p>
      </div>
      <!--  -->
      <div>
        <p class="text-sm font-medium">
          {{ formatCurrency(Number(material.avg_cost)) }}/{{ material.unit }}
        </p>
        <p class="text-core-600 text-xs">Avg Cost</p>
      </div>
    </div>
  </div>
</template>
