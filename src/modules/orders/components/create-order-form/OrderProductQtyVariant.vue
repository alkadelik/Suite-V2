<script setup lang="ts">
import { formatCurrency } from "@/utils/format-currency"
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import TextField from "@components/form/TextField.vue"
import Icon from "@components/Icon.vue"

const emit = defineEmits(["next", "prev"])
</script>

<template>
  <div>
    <div class="bg-core-50 mb-2 flex size-10 items-center justify-center rounded-xl p-2">
      <Icon name="box" size="28" />
    </div>
    <p class="mb-4 text-sm">Adjust quantities, and review prices.</p>

    <h3 class="mb-8 text-lg font-semibold">Select Products <Chip :label="String(6)" /></h3>

    <section class="grid gap-6">
      <div v-for="n in 3" :key="n" class="rounded-xl bg-white">
        <div class="flex gap-4 p-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
            <Icon name="box" class="h-6 w-6 text-gray-400" />
          </div>
          <div class="flex-1 space-y-1.5">
            <h4 class="text-sm font-medium capitalize">Derby Shoes Pro Max</h4>
            <span class="text-primary-600 flex items-center gap-1 text-xs">
              <Icon name="box" class="h-3 w-3" />
              {{ formatCurrency(59.99) }}
            </span>
          </div>
          <Chip color="success" label="24 in Stock" icon="box" />
          <DropdownMenu :items="[{ label: 'Remove' }, { label: 'Edit' }]">
            <template #trigger>
              <Icon name="dots-vertical" class="h-5 w-5 cursor-pointer text-gray-400" />
            </template>
          </DropdownMenu>
        </div>
        <div class="border-core-200 grid grid-cols-2 gap-4 border-t p-4">
          <TextField name="quantity" placeholder="15" />
          <TextField name="price" placeholder="e.g. N59.99" />
        </div>
      </div>
    </section>

    <div class="h-24" />

    <div
      class="border-core-200 bg-base-background fixed right-0 bottom-0 left-0 flex gap-3 border-t p-6"
    >
      <AppButton
        label="Back"
        color="alt"
        variant="outlined"
        class="w-1/3"
        icon="arrow-left"
        @click="emit('prev')"
      />
      <AppButton label="Next" class="w-2/3" @click="emit('next')" />
    </div>
  </div>
</template>
