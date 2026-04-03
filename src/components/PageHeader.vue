<script setup lang="ts">
import Chip from "@components/Chip.vue"
import BackButton from "@components/BackButton.vue"
import Icon from "./Icon.vue"

interface Props {
  title: string
  count?: number | string
  countLabel?: string
  showTutorial?: boolean
  inner?: boolean
}

withDefaults(defineProps<Props>(), {
  showTutorial: true,
  inner: false,
})
</script>

<template>
  <header
    class="bg-primary-25 border-primary-200 fixed top-0 right-0 left-0 z-30 border-b lg:hidden"
  >
    <div class="flex items-end gap-1 px-4 py-3">
      <div class="flex-1">
        <BackButton v-if="!inner" label="Back" icon="arrow-left" />
        <div class="flex items-center gap-2">
          <Icon v-if="inner" name="arrow-left" size="20" @click="$router.back()" />
          <h1 :class="inner ? 'text-lg font-semibold' : 'text-xl font-bold'">{{ title }}</h1>
          <Chip v-if="count && !inner" :label="`${count} ${countLabel || ''}`" color="blue" />
        </div>
      </div>
      <Chip v-if="showTutorial" icon="info-circle" label="Tutorial" />
    </div>
  </header>
</template>
