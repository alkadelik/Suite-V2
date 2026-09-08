<template>
  <section>
    <div class="mb-3 flex items-center justify-between gap-2">
      <h3 class="text-core-800 font-sato text-base font-semibold">Popups</h3>
      <button
        v-if="hasMore"
        type="button"
        class="text-core-600 flex shrink-0 items-center gap-1 text-sm font-medium"
        @click="drawerOpen = true"
      >
        See all
        <Icon name="arrow-right" size="14" />
      </button>
    </div>

    <div class="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
      <PopupRow v-for="popup in visible" :key="popup.id" :popup="popup" />
    </div>

    <SeeAllDrawer
      :open="drawerOpen"
      title="Popups"
      :items="popups"
      :search-text="(p) => p.name"
      @close="drawerOpen = false"
    >
      <template #item="{ item }">
        <PopupRow :popup="item" />
      </template>
    </SeeAllDrawer>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import Icon from "@components/Icon.vue"
import PopupRow from "./PopupRow.vue"
import SeeAllDrawer from "./SeeAllDrawer.vue"
import type { IPopupStatus } from "./types"

const props = defineProps<{ popups: IPopupStatus[] }>()

const LIMIT = 3
const visible = computed(() => props.popups.slice(0, LIMIT))
const hasMore = computed(() => props.popups.length > LIMIT)
const drawerOpen = ref(false)
</script>
