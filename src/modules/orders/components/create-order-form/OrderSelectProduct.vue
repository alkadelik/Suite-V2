<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import TextField from "@components/form/TextField.vue"
import Icon from "@components/Icon.vue"
import { ref } from "vue"

const searchQuery = ref("")
const emit = defineEmits(["next"])
</script>

<template>
  <div>
    <div class="bg-core-50 mb-2 flex size-10 items-center justify-center rounded-xl p-2">
      <Icon name="box" size="28" />
    </div>
    <p class="mb-4 text-sm">Select what they are buying</p>

    <div class="mb-8 flex flex-col gap-3">
      <h3 class="text-lg font-semibold">All Products <Chip :label="String(20)" /></h3>
      <div class="flex items-center gap-3">
        <TextField
          left-icon="search-lg"
          size="md"
          class="w-full"
          placeholder="Search by name"
          v-model="searchQuery"
        />
        <AppButton icon="filter-lines" variant="outlined" color="alt" class="flex-shrink-0" />
        <AppButton icon="add" class="flex-shrink-0" />
      </div>
    </div>

    <section class="grid grid-cols-3 gap-6">
      <div v-for="n in 12" :key="n" class="rounded-xl bg-white p-1.5">
        <div class="relative flex h-[88px] items-center justify-center rounded-xl bg-gray-200">
          <img v-if="false" src="" alt="" class="h-20 rounded-xl" />
          <Icon v-else name="box" class="h-20 w-20" />

          <Chip
            v-if="n % 4 === 0"
            label="Out of stock"
            size="sm"
            color="error"
            class="absolute top-2 right-2 !rounded-lg"
          />
          <input
            v-else
            type="checkbox"
            class="accent-primary-600 absolute top-2 right-2 h-4 w-4 rounded border-gray-300 bg-white"
            readonly
          />
        </div>
        <div class="space-y-1 p-1 py-2">
          <h4 class="text-xs font-medium">Product name</h4>
          <div class="flex justify-between gap-2 text-xs">
            <span class="text-primary-600 flex items-center gap-1">
              <Icon name="box" class="h-3 w-3" />
              6 var.
            </span>
            <!--  -->
            <span class="flex items-center gap-1">
              <Icon name="box" class="h-3 w-3" />
              82
            </span>
          </div>
        </div>
      </div>
    </section>

    <div class="h-24" />

    <div class="border-core-200 bg-base-background fixed right-0 bottom-0 left-0 border-t p-6">
      <AppButton label="Next" class="w-full" @click="emit('next')" />
    </div>
  </div>
</template>
