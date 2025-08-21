<template>
  <div class="space-y-8 p-8">
    <div class="mx-auto max-w-4xl">
      <h1 class="text-core-900 mb-2 text-3xl font-bold">Dropdown Menu Examples</h1>
      <p class="text-core-600 mb-8">
        Various examples of the DropdownMenu component with different configurations and use cases.
      </p>

      <!-- Basic Example -->
      <section class="mb-12">
        <h2 class="text-core-800 mb-4 text-xl font-semibold">Basic Dropdown</h2>
        <div class="flex flex-wrap gap-4">
          <DropdownMenu label="Select Option" :items="basicItems" @select="handleSelect" />

          <DropdownMenu
            placeholder="Choose an action"
            :items="actionItems"
            @select="handleSelect"
          />
        </div>
      </section>

      <!-- With Icons -->
      <section class="mb-12">
        <h2 class="text-core-800 mb-4 text-xl font-semibold">With Icons</h2>
        <div class="flex flex-wrap gap-4">
          <DropdownMenu
            label="User Menu"
            left-icon="people"
            :items="userMenuItems"
            @select="handleSelect"
          />

          <DropdownMenu
            placeholder="Settings"
            left-icon="setting"
            right-icon="star"
            :show-chevron="false"
            :items="settingsItems"
            @select="handleSelect"
          />
        </div>
      </section>

      <!-- Sizes -->
      <section class="mb-12">
        <h2 class="text-core-800 mb-4 text-xl font-semibold">Sizes</h2>
        <div class="flex flex-wrap items-end gap-4">
          <DropdownMenu label="Small" size="sm" :items="basicItems" @select="handleSelect" />

          <DropdownMenu label="Medium" size="md" :items="basicItems" @select="handleSelect" />

          <DropdownMenu label="Large" size="lg" :items="basicItems" @select="handleSelect" />
        </div>
      </section>

      <!-- Menu Width Options -->
      <section class="mb-12">
        <h2 class="text-core-800 mb-4 text-xl font-semibold">Menu Width</h2>
        <div class="space-y-4">
          <div>
            <label class="text-core-700 mb-2 block text-sm font-medium">Auto Width</label>
            <DropdownMenu
              label="Auto width menu"
              menu-width="auto"
              :items="longLabelItems"
              @select="handleSelect"
            />
          </div>

          <div>
            <label class="text-core-700 mb-2 block text-sm font-medium">Match Trigger Width</label>
            <DropdownMenu
              label="Trigger width menu"
              menu-width="trigger"
              :items="basicItems"
              @select="handleSelect"
            />
          </div>
        </div>
      </section>

      <!-- With Dividers and Shortcuts -->
      <section class="mb-12">
        <h2 class="text-core-800 mb-4 text-xl font-semibold">Advanced Features</h2>
        <div class="flex flex-wrap gap-4">
          <DropdownMenu
            label="File Menu"
            left-icon="folder"
            :items="fileMenuItems"
            @select="handleSelect"
          />

          <DropdownMenu label="Edit Menu" :items="editMenuItems" @select="handleSelect" />
        </div>
      </section>

      <!-- Custom Slots -->
      <section class="mb-12">
        <h2 class="text-core-800 mb-4 text-xl font-semibold">Custom Slots</h2>
        <div class="flex flex-wrap gap-4">
          <!-- Custom Trigger -->
          <DropdownMenu @select="handleSelect">
            <template #trigger="{ open }">
              <button
                class="bg-primary-500 hover:bg-primary-600 flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-colors"
              >
                <Icon name="star" class="h-4 w-4" />
                Custom Trigger
                <Icon
                  name="arrow-down-double"
                  :class="['h-4 w-4 transition-transform', open ? 'rotate-180' : '']"
                />
              </button>
            </template>
            <template #prepend>
              <div class="text-core-500 px-4 py-2 text-xs font-medium tracking-wide uppercase">
                Quick Actions
              </div>
            </template>
            <template #content>
              <button
                class="text-core-700 hover:bg-core-50 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm"
                @click="handleCustomAction"
              >
                <Icon name="star" class="h-4 w-4" />
                Custom Action
              </button>
            </template>
            <template #append>
              <div class="border-core-100 border-t pt-1">
                <button
                  class="hover:bg-red-25 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600"
                  @click="handleDangerousAction"
                >
                  <Icon name="star" class="h-4 w-4" />
                  Dangerous Action
                </button>
              </div>
            </template>
          </DropdownMenu>

          <!-- With Header and Footer -->
          <DropdownMenu
            label="Account Menu"
            left-icon="people"
            :items="basicItems"
            @select="handleSelect"
          >
            <template #header>
              <div class="flex items-center gap-3">
                <div class="bg-primary-100 flex h-8 w-8 items-center justify-center rounded-full">
                  <Icon name="people" class="text-primary-600 h-4 w-4" />
                </div>
                <div>
                  <div class="text-core-900 text-sm font-medium">John Doe</div>
                  <div class="text-core-500 text-xs">john@example.com</div>
                </div>
              </div>
            </template>
            <template #footer>
              <button
                class="text-core-600 hover:text-core-800 w-full text-left text-sm transition-colors"
                @click="handleSignOut"
              >
                Sign out
              </button>
            </template>
          </DropdownMenu>
        </div>
      </section>

      <!-- Disabled State -->
      <section class="mb-12">
        <h2 class="text-core-800 mb-4 text-xl font-semibold">Disabled State</h2>
        <div class="flex flex-wrap gap-4">
          <DropdownMenu label="Disabled Dropdown" :disabled="true" :items="basicItems" />

          <DropdownMenu
            label="With Disabled Items"
            :items="mixedStateItems"
            @select="handleSelect"
          />
        </div>
      </section>

      <!-- Events Demo -->
      <section class="mb-12">
        <h2 class="text-core-800 mb-4 text-xl font-semibold">Event Handling</h2>
        <div class="flex flex-wrap items-start gap-4">
          <DropdownMenu
            label="Event Demo"
            :items="basicItems"
            @open="handleOpen"
            @close="handleClose"
            @toggle="handleToggle"
            @select="handleSelect"
          />

          <div class="bg-core-25 min-w-64 rounded-lg p-4">
            <h3 class="text-core-800 mb-2 font-medium">Event Log:</h3>
            <div class="text-core-600 max-h-32 space-y-1 overflow-y-auto text-sm">
              <div v-for="(event, index) in eventLog" :key="index" class="flex justify-between">
                <span>{{ event.type }}</span>
                <span class="text-core-400 text-xs">{{ event.time }}</span>
              </div>
              <div v-if="eventLog.length === 0" class="text-core-400 italic">No events yet...</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import DropdownMenu from "../DropdownMenu.vue"
import Icon from "../common/icon.vue"

interface DropdownItem {
  id?: string | number
  label?: string
  icon?: string
  appendIcon?: string
  class?: string
  iconClass?: string
  disabled?: boolean
  action?: () => void
  divider?: boolean
  shortcut?: string
  data?: Record<string, unknown>
}

// Sample data
const basicItems: DropdownItem[] = [
  { id: 1, label: "Option 1" },
  { id: 2, label: "Option 2" },
  { id: 3, label: "Option 3" },
]

const actionItems: DropdownItem[] = [
  { id: 1, label: "Edit", icon: "star" },
  { id: 2, label: "Delete", icon: "star" },
  { id: 3, label: "Share", icon: "star" },
]

const userMenuItems: DropdownItem[] = [
  { id: 1, label: "Profile", icon: "people" },
  { id: 2, label: "Settings", icon: "setting" },
  { divider: true },
  { id: 3, label: "Help", icon: "life-buoy" },
  { id: 4, label: "Sign out", icon: "star" },
]

const settingsItems: DropdownItem[] = [
  { id: 1, label: "General", icon: "setting" },
  { id: 2, label: "Security", icon: "star" },
  { id: 3, label: "Notifications", icon: "bell" },
]

const longLabelItems: DropdownItem[] = [
  { id: 1, label: "This is a very long option name that might wrap" },
  { id: 2, label: "Short option" },
  { id: 3, label: "Another extremely long option that demonstrates width behavior" },
]

const fileMenuItems: DropdownItem[] = [
  { id: 1, label: "New File", icon: "folder", shortcut: "⌘N" },
  { id: 2, label: "Open File", icon: "folder", shortcut: "⌘O" },
  { id: 3, label: "Save", icon: "star", shortcut: "⌘S" },
  { divider: true },
  { id: 4, label: "Export", icon: "box" },
  { id: 5, label: "Print", icon: "star", shortcut: "⌘P" },
]

const editMenuItems: DropdownItem[] = [
  { id: 1, label: "Cut", shortcut: "⌘X" },
  { id: 2, label: "Copy", shortcut: "⌘C" },
  { id: 3, label: "Paste", shortcut: "⌘V" },
  { divider: true },
  { id: 4, label: "Undo", shortcut: "⌘Z" },
  { id: 5, label: "Redo", shortcut: "⌘⇧Z" },
]

const mixedStateItems: DropdownItem[] = [
  { id: 1, label: "Available Option" },
  { id: 2, label: "Disabled Option", disabled: true },
  { id: 3, label: "Another Available Option" },
  { id: 4, label: "Also Disabled", disabled: true },
]

// Event handling
const eventLog = ref<Array<{ type: string; time: string }>>([])

const addEvent = (type: string) => {
  eventLog.value.unshift({
    type,
    time: new Date().toLocaleTimeString(),
  })

  // Keep only last 10 events
  if (eventLog.value.length > 10) {
    eventLog.value = eventLog.value.slice(0, 10)
  }
}

const handleOpen = () => {
  addEvent("Opened")
  console.log("Dropdown opened")
}

const handleClose = () => {
  addEvent("Closed")
  console.log("Dropdown closed")
}

const handleToggle = (open: boolean) => {
  addEvent(`Toggled (${open ? "open" : "closed"})`)
  console.log("Dropdown toggled:", open)
}

const handleSelect = (item: DropdownItem, index: number) => {
  addEvent(`Selected: ${item.label}`)
  console.log("Item selected:", item, "at index:", index)
}

const handleCustomAction = () => {
  console.log("Custom action triggered")
}

const handleDangerousAction = () => {
  console.log("Dangerous action triggered")
}

const handleSignOut = () => {
  console.log("Sign out clicked")
}
</script>
