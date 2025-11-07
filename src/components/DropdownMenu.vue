<template>
  <Dropdown
    :placement="props.placement"
    :triggers="['click']"
    :auto-placement="props.placement === 'auto'"
    :auto-hide="closeOnClickOutside"
  >
    <template #default="{ toggle, shown }">
      <!-- Trigger Button -->
      <button
        type="button"
        :class="$slots.trigger ? triggerClass : ''"
        :disabled="disabled"
        @click.stop="
          () => {
            emit('toggle', !shown)
            toggle
          }
        "
      >
        <slot name="trigger" :open="shown" :disabled="disabled">
          <Icon name="dots-vertical" size="20" />
        </slot>
      </button>
    </template>

    <template #popper="{ hide }">
      <div :class="dropdownClasses">
        <!-- Header Slot -->
        <div v-if="$slots.header" class="border-core-100 border-b p-3">
          <slot name="header" :close="() => handleClose(hide)" />
        </div>

        <!-- Menu Items -->
        <div :class="menuContainerClasses">
          <slot name="prepend" :close="() => handleClose(hide)" />

          <template v-if="items && items.length > 0">
            <div
              v-for="(item, index) in items"
              :key="getItemKey(item, index)"
              :class="getItemWrapperClasses(item)"
            >
              <!-- Divider -->
              <hr v-if="item.divider" class="border-core-100 my-1" />

              <!-- Menu Item -->
              <button
                v-else
                type="button"
                :class="getItemClasses(item)"
                :disabled="item.disabled"
                @click="handleItemClick(item, hide)"
              >
                <Icon v-if="item.icon" :name="item.icon" :class="getItemIconClasses(item)" />

                <slot
                  name="item"
                  :item="item"
                  :index="index"
                  :close="() => handleClose(hide)"
                  :disabled="item.disabled"
                >
                  <span class="flex-1 truncate text-left">{{ item.label }}</span>
                </slot>

                <Icon
                  v-if="item.appendIcon"
                  :name="item.appendIcon"
                  :class="getItemIconClasses(item)"
                />

                <!-- Keyboard shortcut -->
                <span v-if="item.shortcut" class="text-core-400 ml-2 font-mono text-xs">
                  {{ item.shortcut }}
                </span>
              </button>
            </div>
          </template>

          <slot v-if="!items || items.length === 0" :close="() => handleClose(hide)" />

          <slot name="append" :close="() => handleClose(hide)" />
        </div>

        <!-- Footer Slot -->
        <div v-if="$slots.footer" class="border-core-100 border-t px-3 py-2">
          <slot name="footer" :close="() => handleClose(hide)" />
        </div>
      </div>
    </template>
  </Dropdown>
</template>

<script setup lang="ts">
import { Dropdown, Placement } from "floating-vue"
import Icon from "@components/Icon.vue"
import { computed } from "vue"

interface DropdownItem {
  /** Unique identifier for the item */
  id?: string | number
  /** Label text to display */
  label?: string
  /** Icon to show before the label */
  icon?: string
  /** Icon to show after the label */
  appendIcon?: string
  /** Custom CSS classes for the item */
  class?: string
  /** Custom CSS classes for the item's icon */
  iconClass?: string
  /** Whether the item is disabled */
  disabled?: boolean
  /** Whether the item is active/selected */
  active?: boolean
  /** Function to execute when item is clicked */
  action?: () => void
  /** Whether this item is a divider */
  divider?: boolean
  /** Keyboard shortcut text to display */
  shortcut?: string
  /** Custom data associated with the item */
  data?: Record<string, unknown>
}

interface Props {
  /** Array of menu items to display */
  items?: DropdownItem[]
  /** Label text for the trigger button */
  label?: string
  /** Placeholder text when no label is provided */
  placeholder?: string
  /** Icon to display on the left side of the trigger */
  leftIcon?: string
  /** Icon to display on the right side of the trigger */
  rightIcon?: string
  /** Whether to show the default chevron icon */
  showChevron?: boolean
  /** Whether the dropdown is disabled */
  disabled?: boolean
  /** Size variant of the dropdown */
  size?: "sm" | "md" | "lg"
  /** Placement direction of the dropdown menu */
  placement?: Placement
  /** Width of the dropdown menu */
  menuWidth?: "auto" | "trigger" | "full"
  /** Maximum height of the dropdown menu */
  maxHeight?: string
  /** Whether clicking outside should close the dropdown */
  closeOnClickOutside?: boolean
  /** Whether clicking an item should close the dropdown */
  closeOnItemClick?: boolean
  /** Custom CSS classes for the trigger button */
  triggerClass?: string
  /** Custom CSS classes for the dropdown menu */
  menuClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Select option",
  showChevron: true,
  disabled: false,
  size: "md",
  placement: "bottom-end",
  menuWidth: "auto",
  maxHeight: "12rem",
  closeOnClickOutside: true,
  closeOnItemClick: true,
})

const emit = defineEmits<{
  /** Emitted when dropdown is opened */
  open: []
  /** Emitted when dropdown is closed */
  close: []
  /** Emitted when dropdown visibility changes */
  toggle: [open: boolean]
  /** Emitted when an item is selected */
  select: [item: DropdownItem, index: number]
}>()

// Styling computed properties
// const triggerClasses = computed(() => {
//   const baseClasses =
//     "inline-flex items-center justify-between w-full rounded-xl border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2" +
//     " bg-core-25 border-core-50 text-core-800 hover:bg-core-50 focus:border-primary-300 focus:ring-primary-300"

//   const sizeClasses = {
//     sm: "min-h-[36px] px-3 py-1.5 text-sm",
//     md: "min-h-[44px] px-3 py-2 text-sm",
//     lg: "min-h-[48px] px-4 py-2.5 text-base",
//   }

//   const disabledClasses = props.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"

//   return [baseClasses, sizeClasses[props.size], disabledClasses, props.triggerClass || ""]
//     .filter(Boolean)
//     .join(" ")
// })

// const contentClasses = computed(() => {
//   const base = "flex flex-1 items-center gap-2 min-w-0"
//   const padding = props.leftIcon ? "pl-2" : ""
//   return [base, padding].filter(Boolean).join(" ")
// })

const iconSizeClasses = computed(() => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }
  return sizeClasses[props.size]
})

const dropdownClasses = computed(() => {
  const baseClasses = "overflow-hidden rounded-xl bg-white"

  const widthClasses = {
    auto: "w-max min-w-48",
    trigger: "w-full",
    full: "w-screen",
  }

  return [baseClasses, widthClasses[props.menuWidth], props.menuClass || ""]
    .filter(Boolean)
    .join(" ")
})

const menuContainerClasses = computed(() => {
  return `overflow-auto p-1` + (props.maxHeight ? ` max-h-[${props.maxHeight}]` : "")
})

// Helper functions
const getItemKey = (item: DropdownItem, index: number): string | number => {
  return item.id ?? index
}

const getItemWrapperClasses = (item: DropdownItem): string => {
  return item.divider ? "" : "px-1 py-0.5"
}

const getItemClasses = (item: DropdownItem): string => {
  const base =
    "flex items-center gap-2 w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 text-left"

  const stateClasses = item.disabled
    ? "text-core-300 cursor-not-allowed"
    : item.active
      ? "bg-primary-50 text-primary-700 hover:bg-primary-100"
      : "text-core-800 hover:bg-core-25 focus:bg-core-100 focus:outline-none"

  return [base, stateClasses, item.class || ""].filter(Boolean).join(" ")
}

const getItemIconClasses = (item: DropdownItem): string => {
  const base = iconSizeClasses.value
  const stateClasses = item.disabled ? "text-core-300" : "text-core-500"

  return [base, stateClasses, item.iconClass || ""].filter(Boolean).join(" ")
}

// Actions - updated for Floating Vue
// const handleToggle = (shown: boolean) => {
//   if (props.disabled) return

//   emit("toggle", !shown)

//   if (!shown) {
//     emit("open")
//   } else {
//     emit("close")
//   }
// }

const handleClose = (hide: () => void) => {
  hide()
  emit("close")
}

const handleItemClick = (item: DropdownItem, hide: () => void) => {
  if (item.disabled) return

  const itemIndex = props.items?.indexOf(item) ?? -1
  emit("select", item, itemIndex)

  if (item.action) {
    item.action()
  }

  if (props.closeOnItemClick) {
    hide()
  }
}
</script>
