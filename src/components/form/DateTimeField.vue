<template>
  <div class="w-full">
    <label v-if="label && !hideLabel" class="text-core-800 mb-1.5 block text-sm font-medium">
      {{ label }} <span v-if="required" class="text-error-500">*</span>
    </label>

    <Dropdown :distance="6" placement="bottom-start" :triggers="['click']">
      <!-- Trigger: input-styled box matching TextField (md) -->
      <div
        class="border-core-50 bg-core-25 focus-within:border-primary-300 focus-within:ring-primary-300 flex cursor-pointer items-center overflow-hidden rounded-xl border px-4 py-3 text-base focus-within:ring-1"
      >
        <span :class="['flex-1 truncate', hasValue ? 'text-core-800' : 'text-core-400']">
          {{ displayText }}
        </span>
        <Icon name="calendar" size="18" class="text-core-400 ml-2 shrink-0" />
      </div>

      <!-- Popover panel -->
      <template #popper="{ hide }">
        <div class="w-72 rounded-xl border border-gray-100 bg-white p-3 shadow-lg">
          <!-- Month header -->
          <div class="mb-2 flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous month"
              class="text-core-500 hover:bg-primary-50 flex h-8 w-8 items-center justify-center rounded-lg"
              @click="prevMonth"
            >
              <Icon name="arrow-left" size="18" />
            </button>
            <span class="text-core-800 text-sm font-semibold">
              {{ MONTHS_FULL[viewMonth] }} {{ viewYear }}
            </span>
            <button
              type="button"
              aria-label="Next month"
              class="text-core-500 hover:bg-primary-50 flex h-8 w-8 items-center justify-center rounded-lg"
              @click="nextMonth"
            >
              <Icon name="arrow-right" size="18" />
            </button>
          </div>

          <!-- Weekday header row -->
          <div class="grid grid-cols-7">
            <span
              v-for="wd in WEEKDAYS"
              :key="wd"
              class="text-core-400 flex h-8 items-center justify-center text-xs font-medium"
            >
              {{ wd }}
            </span>
          </div>

          <!-- Day grid -->
          <div class="grid grid-cols-7 gap-1">
            <button
              v-for="(cell, idx) in calendarDays"
              :key="idx"
              type="button"
              :disabled="cell.disabled"
              :aria-label="cell.ariaLabel"
              :class="dayClasses(cell)"
              @click="selectDay(cell)"
            >
              {{ cell.day }}
            </button>
          </div>

          <!-- Time row -->
          <div class="border-core-50 mt-3 flex items-center gap-2 border-t pt-3">
            <select
              v-model.number="hour"
              aria-label="Hour"
              class="border-core-50 bg-core-25 text-core-800 focus:border-primary-300 focus:ring-primary-300 rounded-lg border px-2 py-1.5 text-sm focus:ring-1 focus:outline-none"
              @change="emitChange"
            >
              <option v-for="h in HOURS" :key="h" :value="h">{{ pad(h) }}</option>
            </select>
            <span class="text-core-400">:</span>
            <select
              v-model.number="minute"
              aria-label="Minute"
              class="border-core-50 bg-core-25 text-core-800 focus:border-primary-300 focus:ring-primary-300 rounded-lg border px-2 py-1.5 text-sm focus:ring-1 focus:outline-none"
              @change="emitChange"
            >
              <option v-for="m in MINUTES" :key="m" :value="m">{{ pad(m) }}</option>
            </select>

            <!-- AM/PM segmented toggle -->
            <div class="border-core-50 ml-auto flex overflow-hidden rounded-lg border">
              <button
                type="button"
                :class="[
                  'px-3 py-1.5 text-sm font-medium',
                  ampm === 'AM' ? 'bg-primary-600 text-white' : 'bg-core-25 text-core-600',
                ]"
                @click="setAmpm('AM')"
              >
                AM
              </button>
              <button
                type="button"
                :class="[
                  'px-3 py-1.5 text-sm font-medium',
                  ampm === 'PM' ? 'bg-primary-600 text-white' : 'bg-core-25 text-core-600',
                ]"
                @click="setAmpm('PM')"
              >
                PM
              </button>
            </div>
          </div>

          <!-- Footer -->
          <div class="border-core-50 mt-3 flex items-center justify-between border-t pt-3">
            <button
              type="button"
              class="text-primary-600 hover:text-primary-700 text-sm font-medium"
              @click="selectToday"
            >
              Today
            </button>
            <button
              v-if="clearable"
              type="button"
              class="text-core-500 hover:text-core-700 text-sm font-medium"
              @click="clear(hide)"
            >
              Clear
            </button>
          </div>
        </div>
      </template>
    </Dropdown>

    <p v-if="error" class="text-error-500 mt-1 text-xs">{{ error }}</p>
    <p v-else-if="hint" class="mt-1 text-xs text-gray-500">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { Dropdown } from "floating-vue"
import Icon from "@components/Icon.vue"

interface Props {
  /** The current value as an ISO date string (or null when empty) */
  modelValue?: string | null
  /** Label text displayed above the field */
  label?: string
  /** Placeholder shown when no value is selected */
  placeholder?: string
  /** Whether the field is required for form validation */
  required?: boolean
  /** Show a "Clear" action in the picker footer that emits null */
  clearable?: boolean
  /** Hide the label even when one is provided */
  hideLabel?: boolean
  /** Earliest selectable date; days before it are disabled */
  minDate?: Date | string
  /** Error message to display below the field */
  error?: string
  /** Hint text to display below the field when there's no error */
  hint?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "27th May, 2026 - 09:00 AM",
  clearable: false,
})

const emit = defineEmits<{ "update:modelValue": [value: string | null] }>()

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const MONTHS_FULL = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
const HOURS = Array.from({ length: 12 }, (_, i) => i + 1)
const MINUTES = Array.from({ length: 60 }, (_, i) => i)

const pad = (n: number) => String(n).padStart(2, "0")

const ordinal = (d: number) => {
  if (d > 3 && d < 21) return "th"
  switch (d % 10) {
    case 1:
      return "st"
    case 2:
      return "nd"
    case 3:
      return "rd"
    default:
      return "th"
  }
}

const formatDisplay = (date: Date) => {
  const day = date.getDate()
  const month = MONTHS[date.getMonth()]
  const year = date.getFullYear()
  let hours = date.getHours()
  const minutes = pad(date.getMinutes())
  const meridian = hours >= 12 ? "PM" : "AM"
  hours = hours % 12 || 12
  return `${day}${ordinal(day)} ${month}, ${year} - ${pad(hours)}:${minutes} ${meridian}`
}

// --- Internal state ---
const selected = ref<Date | null>(props.modelValue ? new Date(props.modelValue) : null)
const initial = selected.value ?? new Date()
const viewYear = ref(initial.getFullYear())
const viewMonth = ref(initial.getMonth()) // 0-11

// Time state — default to 9:00 AM when nothing selected yet
const hour = ref(1)
const minute = ref(0)
const ampm = ref<"AM" | "PM">("AM")

const syncTimeFromDate = (d: Date) => {
  const h24 = d.getHours()
  ampm.value = h24 >= 12 ? "PM" : "AM"
  hour.value = h24 % 12 || 12
  minute.value = d.getMinutes()
}

if (selected.value) {
  syncTimeFromDate(selected.value)
} else {
  // default 09:00 AM
  hour.value = 9
  minute.value = 0
  ampm.value = "AM"
}

// Normalised minDate (start of that day) for comparisons
const minDateValue = computed<Date | null>(() => {
  if (!props.minDate) return null
  const d = props.minDate instanceof Date ? new Date(props.minDate) : new Date(props.minDate)
  if (isNaN(d.getTime())) return null
  d.setHours(0, 0, 0, 0)
  return d
})

const hasValue = computed(() => selected.value !== null)
const displayText = computed(() =>
  selected.value ? formatDisplay(selected.value) : props.placeholder,
)

// --- Calendar grid ---
interface DayCell {
  day: number
  year: number
  month: number
  inMonth: boolean
  disabled: boolean
  ariaLabel: string
}

const sameDay = (a: Date | null, y: number, m: number, d: number) =>
  !!a && a.getFullYear() === y && a.getMonth() === m && a.getDate() === d

const today = new Date()

const calendarDays = computed<DayCell[]>(() => {
  const year = viewYear.value
  const month = viewMonth.value
  const firstDay = new Date(year, month, 1)
  const startWeekday = firstDay.getDay() // 0 = Sunday
  const cells: DayCell[] = []

  // 6 rows * 7 cols = 42 cells, starting from leading days of previous month
  const startDate = new Date(year, month, 1 - startWeekday)
  for (let i = 0; i < 42; i++) {
    const d = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i)
    const cellYear = d.getFullYear()
    const cellMonth = d.getMonth()
    const cellDay = d.getDate()
    const disabled = !!minDateValue.value && d < minDateValue.value
    cells.push({
      day: cellDay,
      year: cellYear,
      month: cellMonth,
      inMonth: cellMonth === month,
      disabled,
      ariaLabel: `${cellDay} ${MONTHS_FULL[cellMonth]} ${cellYear}`,
    })
  }
  return cells
})

const dayClasses = (cell: DayCell) => {
  const base = "h-9 w-9 rounded-lg text-sm flex items-center justify-center transition-colors"
  if (cell.disabled) {
    return [base, "text-core-200 cursor-not-allowed"].join(" ")
  }
  const isSelected = sameDay(selected.value, cell.year, cell.month, cell.day)
  if (isSelected) {
    return [base, "bg-primary-600 text-white"].join(" ")
  }
  const isToday =
    cell.year === today.getFullYear() &&
    cell.month === today.getMonth() &&
    cell.day === today.getDate()
  const tone = cell.inMonth ? "text-core-800" : "text-core-300"
  const todayTone = isToday ? "text-primary-600 font-semibold ring-1 ring-primary-200" : tone
  return [base, todayTone, "hover:bg-primary-50 cursor-pointer"].join(" ")
}

// --- Month navigation (view only, does not change selection) ---
const prevMonth = () => {
  if (viewMonth.value === 0) {
    viewMonth.value = 11
    viewYear.value -= 1
  } else {
    viewMonth.value -= 1
  }
}
const nextMonth = () => {
  if (viewMonth.value === 11) {
    viewMonth.value = 0
    viewYear.value += 1
  } else {
    viewMonth.value += 1
  }
}

// --- Build & emit ---
const to24 = () => {
  if (ampm.value === "AM") return hour.value === 12 ? 0 : hour.value
  return hour.value === 12 ? 12 : hour.value + 12
}

const buildDate = (y: number, m: number, d: number) => new Date(y, m, d, to24(), minute.value, 0, 0)

const emitChange = () => {
  if (!selected.value) return
  const d = buildDate(
    selected.value.getFullYear(),
    selected.value.getMonth(),
    selected.value.getDate(),
  )
  selected.value = d
  emit("update:modelValue", d.toISOString())
}

const selectDay = (cell: DayCell) => {
  if (cell.disabled) return
  const d = buildDate(cell.year, cell.month, cell.day)
  selected.value = d
  // keep the viewed month in sync with the chosen day
  viewYear.value = cell.year
  viewMonth.value = cell.month
  emit("update:modelValue", d.toISOString())
}

const setAmpm = (val: "AM" | "PM") => {
  ampm.value = val
  emitChange()
}

const selectToday = () => {
  const now = new Date()
  viewYear.value = now.getFullYear()
  viewMonth.value = now.getMonth()
  const d = buildDate(now.getFullYear(), now.getMonth(), now.getDate())
  selected.value = d
  emit("update:modelValue", d.toISOString())
}

const clear = (hide: () => void) => {
  selected.value = null
  emit("update:modelValue", null)
  hide()
}

// --- Sync when modelValue changes externally ---
watch(
  () => props.modelValue,
  (val) => {
    if (!val) {
      selected.value = null
      return
    }
    const d = new Date(val)
    if (isNaN(d.getTime())) return
    // avoid clobbering identical value
    if (selected.value && selected.value.toISOString() === d.toISOString()) return
    selected.value = d
    viewYear.value = d.getFullYear()
    viewMonth.value = d.getMonth()
    syncTimeFromDate(d)
  },
)
</script>
