<template>
  <div class="overflow-hidden rounded-lg border border-gray-200">
    <div
      class="cursor-pointer border-b border-gray-200 outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gray-600"
      @click="handleToggle"
      role="button"
      :aria-expanded="isOpen"
      tabindex="0"
      @keydown.enter="handleToggle"
      @keydown.space.prevent="handleToggle"
    >
      <slot name="trigger">
        <div
          class="hover:bg-gray-25 text-core-800 flex items-center justify-between bg-white p-4 text-xs font-semibold transition-colors duration-200 md:text-sm"
        >
          <slot name="header">
            <span>{{ header }}</span>
          </slot>
          <Icon :name="isOpen ? 'chevron-up' : 'chevron-down'" class="text-gray-600" size="24" />
        </div>
      </slot>
    </div>

    <transition
      name="collapse"
      @enter="onEnter"
      @after-enter="onAfterEnter"
      @leave="onLeave"
      @after-leave="onAfterLeave"
    >
      <div v-show="isOpen" class="bg-white">
        <div class="p-4">
          <slot name="body"></slot>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"
import Icon from "./Icon.vue"

interface CollapsibleProps {
  header?: string
  modelValue?: boolean
  defaultOpen?: boolean
}

const props = withDefaults(defineProps<CollapsibleProps>(), {
  header: "",
  modelValue: undefined,
  defaultOpen: true,
})

interface CollapsibleEmits {
  (e: "update:modelValue", value: boolean): void
}

const emit = defineEmits<CollapsibleEmits>()

// Internal state for uncontrolled mode
const internalOpen = ref<boolean>(props.defaultOpen)

// Determine if component is controlled by parent
const isControlled = computed<boolean>(() => props.modelValue !== undefined)

// Computed property for open state
const isOpen = computed<boolean>({
  get(): boolean {
    return isControlled.value ? props.modelValue! : internalOpen.value
  },
  set(value: boolean): void {
    if (isControlled.value) {
      emit("update:modelValue", value)
    } else {
      internalOpen.value = value
    }
  },
})

const handleToggle = (): void => {
  isOpen.value = !isOpen.value
}

// Animation handlers
const onEnter = (el: Element): void => {
  const element = el as HTMLElement
  element.style.height = "0"
  element.style.overflow = "hidden"
}

const onAfterEnter = (el: Element): void => {
  const element = el as HTMLElement
  element.style.height = "auto"
  element.style.overflow = "visible"
}

const onLeave = (el: Element): void => {
  const element = el as HTMLElement
  element.style.height = `${element.scrollHeight}px`
  element.style.overflow = "hidden"
  // Force reflow
  void element.offsetHeight
  element.style.height = "0"
}

const onAfterLeave = (el: Element): void => {
  const element = el as HTMLElement
  element.style.height = ""
  element.style.overflow = ""
}
</script>

<style scoped>
.collapse-enter-active,
.collapse-leave-active {
  transition: height 0.3s ease-in-out;
}
</style>
