<template>
  <Modal
    :open="modelValue"
    title="Manage Settings"
    max-width="3xl"
    @close="emit('update:modelValue', false)"
    variant="bottom-nav"
    :handle-padding="false"
  >
    <div class="space-y-4 px-4 py-4 md:space-y-8 md:px-6">
      <div class="space-y-4">
        <div class="flex size-10 items-center justify-center rounded-xl bg-neutral-50 p-2">
          <Icon name="shop" size="20" />
        </div>

        <p class="text-xs md:text-sm">
          Choose the location where customers can pick up their orders and pickup time.
        </p>
      </div>

      <div class="space-y-5 rounded-xl bg-white px-4 py-4 md:px-6">
        <GooglePlacesAutocomplete
          name="pickup_location"
          label="Select Pickup Address"
          type="select"
          placeholder="Enter a keyword to get suggestions"
          v-model="pickup_location"
          direction="down"
          required
        />

        <hr class="border-gray-200" />

        <!-- Pickup Times Section -->
        <div class="space-y-4">
          <h3 class="text-core-800 text-base font-semibold">Select Pickup Times</h3>

          <!-- One row per day; each day can be toggled on/off -->
          <div
            v-for="day in days"
            :key="day.dayOfWeek"
            class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
          >
            <!-- Day name + on/off switch -->
            <div class="flex items-center justify-between md:w-40 md:justify-start md:gap-3">
              <span class="text-core-800 order-1 text-base font-semibold md:order-2">
                {{ day.label }}
              </span>
              <Switch v-model="day.enabled" class="order-2 md:order-1" />
            </div>

            <!-- Times when enabled -->
            <div v-if="day.enabled" class="grid grid-cols-2 gap-3 md:flex md:gap-3">
              <TimeField label="From" v-model="day.from" class="md:min-w-[150px]" />
              <TimeField label="To" v-model="day.to" class="md:min-w-[150px]" />
            </div>

            <!-- Closed state when disabled -->
            <div
              v-else
              class="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 md:min-w-[312px]"
            >
              <Icon name="moon" size="18" class="text-gray-400" />
              <span class="text-sm text-gray-400">Closed</span>
            </div>
          </div>
        </div>

        <div class="flex justify-end">
          <AppButton
            type="submit"
            label="Save Settings"
            :loading="saving"
            :disabled="saving || !pickup_location"
            class="w-full md:w-40"
            @click="onSubmit"
          />
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, watch } from "vue"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"
import AppButton from "@/components/AppButton.vue"
import Modal from "@/components/Modal.vue"
import Icon from "@components/Icon.vue"
import Switch from "@components/form/Switch.vue"
import TimeField from "@components/form/TimeField.vue"
import GooglePlacesAutocomplete from "@components/GooglePlacesAutocomplete.vue"
import {
  useUpdateStoreDetails,
  useGetStoreDetails,
  useGetPickupSchedules,
  useUpdatePickupSchedule,
} from "@modules/settings/api"
import type { IPickupSchedule } from "@modules/settings/types"
import { useAuthStore } from "@modules/auth/store"

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  "update:modelValue": [value: boolean]
  refresh: []
}>()

const authStore = useAuthStore()
const storeUid = authStore.user?.store_uid || ""

const { mutateAsync: updateStore } = useUpdateStoreDetails()
const { mutateAsync: updateSchedule } = useUpdatePickupSchedule()
const { data: storeDetails } = useGetStoreDetails(storeUid)
// Only fetch the day-by-day schedules while the modal is open.
const { data: schedulesData } = useGetPickupSchedules(() => props.modelValue)

const pickup_location = ref("")
const saving = ref(false)

interface DaySchedule {
  /** pickup-schedule record uid (empty until the API has loaded) */
  uid: string
  /** 0 = Monday … 6 = Sunday */
  dayOfWeek: number
  label: string
  /** whether pickup is available on this day */
  enabled: boolean
  /** 24h "HH:MM" */
  from: string
  to: string
}

const DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const DEFAULT_FROM = "09:00"
const DEFAULT_TO = "17:00"

// Normalize backend times (which may arrive as "HH:MM:SS" or null) to "HH:MM"
const normalizeTime = (value?: string | null): string => (value ? value.slice(0, 5) : "")

// Placeholder rows shown immediately while the schedules request is in flight.
const buildDefaultDays = (): DaySchedule[] =>
  DAY_LABELS.map((label, index) => ({
    uid: "",
    dayOfWeek: index,
    label,
    enabled: index < 5, // weekdays on, weekend off by default
    from: DEFAULT_FROM,
    to: DEFAULT_TO,
  }))

const buildDaysFromApi = (results: IPickupSchedule[]): DaySchedule[] =>
  [...results]
    .sort((a, b) => a.day_of_week - b.day_of_week)
    .map((schedule) => ({
      uid: schedule.uid,
      dayOfWeek: schedule.day_of_week,
      label: schedule.day_of_week_display || DAY_LABELS[schedule.day_of_week] || "",
      enabled: schedule.is_enabled,
      from: normalizeTime(schedule.start_time) || DEFAULT_FROM,
      to: normalizeTime(schedule.end_time) || DEFAULT_TO,
    }))

const days = ref<DaySchedule[]>(buildDefaultDays())

// Snapshot of the values loaded from the API, used to only PATCH days that changed.
type DaySnapshot = { enabled: boolean; from: string; to: string }
const loadedSchedules = ref<Record<string, DaySnapshot>>({})
const snapshot = (list: DaySchedule[]): Record<string, DaySnapshot> =>
  Object.fromEntries(list.map((d) => [d.uid, { enabled: d.enabled, from: d.from, to: d.to }]))

// Hydrate the form once per open: set location + replace the placeholder rows
// with the real per-day schedules as soon as both requests have resolved.
const initialized = ref(false)
const hydrate = () => {
  if (initialized.value) return
  if (!pickup_location.value && storeDetails.value?.pickup_location) {
    pickup_location.value = storeDetails.value.pickup_location
  }
  const results = schedulesData.value?.results
  if (results && results.length) {
    days.value = buildDaysFromApi(results)
    loadedSchedules.value = snapshot(days.value)
    initialized.value = true
  }
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      initialized.value = false
      pickup_location.value = storeDetails.value?.pickup_location || ""
      days.value = buildDefaultDays()
      hydrate()
    }
  },
  { immediate: true },
)

// The two queries may resolve after the modal is opened — hydrate when they do.
watch([schedulesData, storeDetails], () => {
  if (props.modelValue) hydrate()
})

const isDayChanged = (day: DaySchedule): boolean => {
  const original = loadedSchedules.value[day.uid]
  return (
    !original ||
    original.enabled !== day.enabled ||
    original.from !== day.from ||
    original.to !== day.to
  )
}

const onSubmit = async () => {
  saving.value = true
  try {
    // 1. Pickup address lives on the store record.
    await updateStore({ id: storeUid, body: { pickup_location: pickup_location.value } })

    // 2. Persist each changed day via the per-day pickup-schedule endpoint.
    const changedDays = days.value.filter((day) => day.uid && isDayChanged(day))
    await Promise.all(
      changedDays.map((day) =>
        updateSchedule({
          uid: day.uid,
          body: { is_enabled: day.enabled, start_time: day.from, end_time: day.to },
        }),
      ),
    )

    toast.success("Pickup settings saved!")
    emit("update:modelValue", false)
    emit("refresh")
  } catch (error) {
    displayError(error)
  } finally {
    saving.value = false
  }
}
</script>
