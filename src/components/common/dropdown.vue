<script setup>
import { Icon } from "@iconify/vue"
import { Dropdown } from "floating-vue"
import "floating-vue/dist/style.css"
import AppIcon from "./app-icon.vue"

defineProps({
  items: { type: Array, required: true },
  menuClass: { type: [String, Array], default: "" },
})
const emit = defineEmits(["toggle"])
</script>

<template>
  <Dropdown placement="bottom-end" :triggers="['click']" :auto-placement="true" auto-hide>
    <template #default="{ toggle, shown }">
      <div @click.stop="() => {}">
        <button type="button" class="bg-transparent" @click="toggle">
          <slot name="label" :open="shown">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              @click="emit('toggle')"
            >
              <path
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 12a1 1 0 1 0 2 0a1 1 0 1 0-2 0m7 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0m7 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0"
              />
            </svg>
          </slot>
        </button>
      </div>
    </template>

    <template #popper="{ hide }">
      <div
        class="divide-brand-100 w-max min-w-40 divide-y rounded-md bg-white p-2 shadow"
        :class="menuClass"
      >
        <slot name="preprend" />
        <div v-for="item in items" :key="item.label" class="px-px py-0.5">
          <button
            type="button"
            :class="[
              'group flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-medium',
              item.class || '',
              item.isDisabled
                ? 'text-brand-200'
                : 'text-brand-400 hover:text-brand-500 hover:bg-brand-100',
            ]"
            :disabled="item.isDisabled"
            @click.stop="
              () => {
                item.action?.()
                hide()
              }
            "
          >
            <component
              :is="item.icon?.includes(':') ? Icon : AppIcon"
              v-if="item.icon"
              :icon="item.icon"
              :name="item.icon"
              :size="20"
              :class="[
                'h-5 w-5',
                item.iconClass || '',
                item.isDisabled ? 'text-brand-200' : 'text-brand-300 group-hover:text-brand-500',
              ]"
            />
            <span class="flex-1 text-left">{{ item.label }}</span>
            <component
              :is="item.appendIcon?.includes(':') ? Icon : AppIcon"
              v-if="item.appendIcon"
              :icon="item.appendIcon"
              :name="item.appendIcon"
              :size="20"
              class="text-brand-300 group-hover:text-brand-500 h-5 w-5"
            />
          </button>
        </div>
      </div>
    </template>
  </Dropdown>
</template>
