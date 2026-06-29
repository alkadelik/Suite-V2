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
            :key="day.key"
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
            :loading="isPending"
            :disabled="isPending || !pickup_location"
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
import { useUpdateStoreDetails, useGetStoreDetails } from "@modules/settings/api"
import { useAuthStore } from "@modules/auth/store"

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  "update:modelValue": [value: boolean]
  refresh: []
}>()

const authStore = useAuthStore()
const storeUid = authStore.user?.store_uid || ""

const { mutate: updateStore, isPending } = useUpdateStoreDetails()
const { data: storeDetails } = useGetStoreDetails(storeUid)

const pickup_location = ref("")

interface DaySchedule {
  key: string
  label: string
  /** true for Saturday/Sunday */
  weekend: boolean
  /** whether pickup is available on this day */
  enabled: boolean
  /** 24h "HH:MM" */
  from: string
  to: string
}

const DAY_DEFINITIONS: Array<Pick<DaySchedule, "key" | "label" | "weekend">> = [
  { key: "monday", label: "Monday", weekend: false },
  { key: "tuesday", label: "Tuesday", weekend: false },
  { key: "wednesday", label: "Wednesday", weekend: false },
  { key: "thursday", label: "Thursday", weekend: false },
  { key: "friday", label: "Friday", weekend: false },
  { key: "saturday", label: "Saturday", weekend: true },
  { key: "sunday", label: "Sunday", weekend: true },
]

const DEFAULT_FROM = "09:00"
const DEFAULT_TO = "17:00"

// Normalize backend times (which may arrive as "HH:MM:SS") to "HH:MM"
const normalizeTime = (value?: string): string => (value ? value.slice(0, 5) : "")

const buildDefaultDays = (): DaySchedule[] =>
  DAY_DEFINITIONS.map((day) => ({
    ...day,
    enabled: !day.weekend, // weekdays on, weekend off by default
    from: DEFAULT_FROM,
    to: DEFAULT_TO,
  }))

const days = ref<DaySchedule[]>(buildDefaultDays())

// Prefill data when modal opens or store details load.
//
// NOTE: the backend currently only persists a single combined weekday window
// (pickup_weekday_*) and a single combined weekend window (pickup_weekend_*).
// There are no per-day fields and no per-day on/off flags. The UI below is the
// full per-day design; on save we map it back to those four fields as best we
// can (see onSubmit). Until the backend exposes per-day fields, individual
// weekday differences and per-weekday "Closed" states cannot be persisted.
watch(
  [() => props.modelValue, storeDetails],
  ([isOpen, details]) => {
    if (isOpen && details) {
      pickup_location.value = details.pickup_location || ""

      const weekdayFrom = normalizeTime(details.pickup_weekday_start_time) || DEFAULT_FROM
      const weekdayTo = normalizeTime(details.pickup_weekday_end_time) || DEFAULT_TO
      const weekendFrom = normalizeTime(details.pickup_weekend_start_time)
      const weekendTo = normalizeTime(details.pickup_weekend_end_time)
      const weekendEnabled = Boolean(weekendFrom && weekendTo)

      days.value = DAY_DEFINITIONS.map((day) =>
        day.weekend
          ? {
              ...day,
              enabled: weekendEnabled,
              from: weekendFrom || DEFAULT_FROM,
              to: weekendTo || DEFAULT_TO,
            }
          : { ...day, enabled: true, from: weekdayFrom, to: weekdayTo },
      )
    }
  },
  { immediate: true },
)

const onSubmit = () => {
  // Map the per-day UI back onto the available backend fields. Weekday times
  // come from the first enabled weekday (falling back to Monday); weekend times
  // from the first enabled weekend day. When no weekend day is enabled we send
  // empty weekend times so pickup reads as weekday-only.
  const firstWeekday =
    days.value.find((day) => !day.weekend && day.enabled) || days.value.find((day) => !day.weekend)
  const firstWeekend = days.value.find((day) => day.weekend && day.enabled)

  const payload = {
    pickup_location: pickup_location.value,
    pickup_weekday_start_time: firstWeekday?.from || DEFAULT_FROM,
    pickup_weekday_end_time: firstWeekday?.to || DEFAULT_TO,
    pickup_weekend_start_time: firstWeekend?.from || "",
    pickup_weekend_end_time: firstWeekend?.to || "",
  }

  updateStore(
    { id: storeUid, body: payload },
    {
      onSuccess: () => {
        toast.success("Pickup settings saved!")
        emit("update:modelValue", false)
        emit("refresh")
      },
      onError: displayError,
    },
  )
}
</script>
