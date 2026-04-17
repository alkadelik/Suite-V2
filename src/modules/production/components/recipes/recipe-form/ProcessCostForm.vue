<script setup lang="ts">
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import TextAreaField from "@components/form/TextAreaField.vue"
import TextField from "@components/form/TextField.vue"
import Icon from "@components/Icon.vue"
import AppButton from "@components/AppButton.vue"
import type { ProcessRow } from "../AddNewRecipeDrawer.vue"
import { ref } from "vue"

const props = defineProps<{
  initialRows: ProcessRow[]
  loading: boolean
}>()

const emit = defineEmits<{
  (e: "prev"): void
  (e: "submit", rows: ProcessRow[]): void
}>()

const { currency } = useFormatCurrency()

// ─── Process rows ────────────────────────────────────────────────────────
const makeEmptyRow = (): ProcessRow => ({
  id: `process-${Date.now()}-${Math.random()}`,
  name: "",
  cost: "",
  note: "",
})

const processRows = ref<ProcessRow[]>(
  props.initialRows.length ? [...props.initialRows] : [makeEmptyRow()],
)

const addProcessRow = () => {
  processRows.value.push(makeEmptyRow())
}

const removeProcessRow = (row: ProcessRow) => {
  processRows.value = processRows.value.filter((r) => r.id !== row.id)
  if (!processRows.value.length) processRows.value = [makeEmptyRow()]
}

// ─── Per-row note toggle ─────────────────────────────────────────────────
const visibleNotes = ref<Set<string>>(new Set())

const openProcessNote = (row: ProcessRow) => {
  visibleNotes.value.add(row.id as string)
}

const isNoteVisible = (row: ProcessRow) => visibleNotes.value.has(row.id as string) || !!row.note

// ─── Submit ──────────────────────────────────────────────────────────────
function handleSubmit() {
  emit("submit", [...processRows.value])
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div class="bg-core-50 mb-2 flex size-10 items-center justify-center rounded-xl p-2">
      <Icon name="box" size="28" />
    </div>
    <p class="mb-4 text-sm">Add Process Costs</p>

    <div class="space-y-4">
      <div
        v-for="(row, idx) in processRows"
        :key="row.id"
        class="rounded-2xl border border-gray-200 bg-white px-4 py-4"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
              <Icon name="setting" size="18" class="text-gray-700" />
            </span>
            <p class="text-sm font-medium text-gray-900">Process {{ idx + 1 }}</p>
          </div>
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-xl text-gray-700 hover:bg-gray-50"
              aria-label="Add note"
              @click="openProcessNote(row)"
            >
              <Icon name="note-add" size="24" />
            </button>
            <button
              type="button"
              class="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
              aria-label="Remove process"
              @click="removeProcessRow(row)"
            >
              <span class="text-lg leading-none">−</span>
            </button>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-2 gap-4">
          <div class="col-span-1">
            <TextField v-model="row.name" label="Process name" placeholder="e.g Boiling, Labour" />
          </div>
          <div class="col-span-1">
            <TextField v-model="row.cost" :label="`Cost ${currency}`" placeholder="₦5,000" />
          </div>
        </div>

        <!-- note field, visible if toggled or has content -->
        <TextAreaField
          v-if="isNoteVisible(row)"
          v-model="row.note"
          class="mt-3"
          :rows="2"
          label="Note"
          placeholder="e.g. I spent too much money on this process"
        />
      </div>

      <button
        type="button"
        class="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-600"
        @click="addProcessRow"
      >
        <span class="text-lg leading-none">+</span>
        <span>Add process cost</span>
      </button>
    </div>

    <div class="h-40" />

    <div
      class="border-core-200 fixed right-0 bottom-0 left-0 space-y-2 border-t bg-white p-4 md:p-6"
    >
      <div class="flex gap-3">
        <AppButton label="Back" color="alt" class="w-1/3" icon="arrow-left" @click="emit('prev')" />
        <AppButton label="Save Recipe" class="w-2/3" type="submit" :loading="loading" />
      </div>
    </div>
  </form>
</template>
