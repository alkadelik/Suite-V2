<template>
  <Modal
    :open="modelValue"
    :title="modalTitle"
    max-width="3xl"
    @close="emit('update:modelValue', false)"
    :variant="isMobile ? 'fullscreen' : 'centered'"
    :handle-padding="false"
  >
    <div class="space-y-6 px-4 py-4 md:px-6">
      <IconHeader icon-name="truck-fast" :subtext="modalSubtext" />

      <div class="rounded-lg border border-gray-200 bg-white">
        <!-- Loading State -->
        <div v-if="isLoading" class="flex items-center justify-center p-8">
          <Icon name="loader" size="24" class="animate-spin text-gray-400" />
        </div>

        <!-- Delivery Locations -->
        <div v-else class="border-b border-gray-200 p-4 md:p-8">
          <div
            v-for="(location, index) in deliveryLocations"
            :key="location.uid || `new-${index}`"
            class="mt-3 rounded-lg border border-gray-200"
          >
            <!-- Location Header -->
            <div class="flex items-center gap-2 border-b border-gray-200 px-4 py-3">
              <Icon name="truck-fast" size="16" class="text-gray-600" />
              <span class="text-sm font-medium text-gray-900">
                {{ mode === "express" ? "Express" : "Delivery" }} Location {{ index + 1 }}
              </span>
            </div>

            <!-- Location Inputs -->
            <div class="flex items-center gap-2 p-3 md:gap-3 md:p-4">
              <TextField
                v-model="location.location"
                placeholder="e.g Lekki, Ibadan, Abuja"
                class="min-w-0 flex-1"
              />
              <TextField
                v-model="location.amount"
                placeholder="e.g 5800"
                class="min-w-0 flex-1"
                type="number"
              />
              <AppButton
                label="-"
                variant="outlined"
                class="shrink-0"
                :disabled="deliveryLocations.length === 1"
                @click="removeLocation(index)"
              />
            </div>
          </div>
          <!-- Add Location Button -->
          <AppButton variant="text" color="alt" label="+ Add location" @click="addLocation" />
        </div>

        <!-- Save Button -->
        <div class="flex justify-end p-4 md:p-6">
          <AppButton
            label="Save settings"
            :loading="isSaving"
            @click="handleSave"
            class="w-full md:w-40"
          />
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue"
import Modal from "@/components/Modal.vue"
import IconHeader from "@/components/IconHeader.vue"
import Icon from "@/components/Icon.vue"
import TextField from "@/components/form/TextField.vue"
import AppButton from "@/components/AppButton.vue"
import { useMediaQuery } from "@vueuse/core"
import {
  useGetManualDeliveryOptions,
  useGetExpressDeliveryOptions,
  useCreateManualDeliveryOption,
  useCreateExpressDeliveryOption,
  useUpdateManualDeliveryOption,
  useUpdateExpressDeliveryOption,
  useDeleteManualDeliveryOption,
  useDeleteExpressDeliveryOption,
} from "@modules/shared/api"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"

interface DeliveryLocationForm {
  uid?: string
  location: string
  amount: string
  _isNew?: boolean
  _original?: { location: string; amount: string }
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    mode?: "manual" | "express"
  }>(),
  {
    mode: "manual",
  },
)

const emit = defineEmits<{
  "update:modelValue": [value: boolean]
  refresh: []
}>()

const isMobile = useMediaQuery("(max-width: 768px)")
const isSaving = ref(false)

// Array to store UIDs pending deletion (will be deleted on save)
const pendingDeletions = ref<string[]>([])

// Dynamic title and subtext based on mode
const modalTitle = computed(() =>
  props.mode === "express" ? "Manage Express Delivery" : "Manage Manual Delivery",
)

const modalSubtext = computed(() =>
  props.mode === "express"
    ? "Set up express delivery options for faster deliveries."
    : "Control how you want to deliver orders from your Leyyow store.",
)

// API hooks based on mode
const {
  data: manualOptions,
  isLoading: isLoadingManual,
  refetch: refetchManual,
} = useGetManualDeliveryOptions()
const {
  data: expressOptions,
  isLoading: isLoadingExpress,
  refetch: refetchExpress,
} = useGetExpressDeliveryOptions()

const { mutateAsync: createManual } = useCreateManualDeliveryOption()
const { mutateAsync: createExpress } = useCreateExpressDeliveryOption()
const { mutateAsync: updateManual } = useUpdateManualDeliveryOption()
const { mutateAsync: updateExpress } = useUpdateExpressDeliveryOption()
const { mutateAsync: deleteManual } = useDeleteManualDeliveryOption()
const { mutateAsync: deleteExpress } = useDeleteExpressDeliveryOption()

const isLoading = computed(() =>
  props.mode === "express" ? isLoadingExpress.value : isLoadingManual.value,
)

const deliveryLocations = ref<DeliveryLocationForm[]>([{ location: "", amount: "", _isNew: true }])

// Watch for data changes and populate form
watch(
  [() => props.modelValue, () => props.mode, manualOptions, expressOptions],
  ([isOpen, mode]) => {
    if (isOpen) {
      // Reset pending deletions when modal opens
      pendingDeletions.value = []

      const options = mode === "express" ? expressOptions.value : manualOptions.value
      if (options && options.length > 0) {
        deliveryLocations.value = options.map((opt) => ({
          uid: opt.uid,
          location: opt.location,
          amount: opt.amount,
          _isNew: false,
          _original: { location: opt.location, amount: opt.amount },
        }))
      } else {
        deliveryLocations.value = [{ location: "", amount: "", _isNew: true }]
      }
    }
  },
  { immediate: true },
)

const addLocation = () => {
  deliveryLocations.value.push({ location: "", amount: "", _isNew: true })
}

const removeLocation = (index: number) => {
  const location = deliveryLocations.value[index]

  if (deliveryLocations.value.length <= 1) return

  // If it has a UID (exists in database), add to pending deletions
  if (location.uid && !location._isNew) {
    pendingDeletions.value.push(location.uid)
  }

  // Remove from UI immediately
  deliveryLocations.value.splice(index, 1)
}

const handleSave = async () => {
  // Validate that all locations have both area and price
  const invalidLocations = deliveryLocations.value.filter(
    (loc) => !loc.location.trim() || !loc.amount.trim(),
  )

  if (invalidLocations.length > 0) {
    toast.error("Please fill in all location and price fields")
    return
  }

  isSaving.value = true

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const promises: Promise<any>[] = []

    // Process deletions first
    for (const uid of pendingDeletions.value) {
      if (props.mode === "express") {
        promises.push(deleteExpress(uid))
      } else {
        promises.push(deleteManual(uid))
      }
    }

    // Process creates and updates
    for (const location of deliveryLocations.value) {
      const payload = {
        location: location.location.trim(),
        amount: location.amount.trim(),
      }

      if (location._isNew || !location.uid) {
        // Create new
        if (props.mode === "express") {
          promises.push(createExpress(payload))
        } else {
          promises.push(createManual(payload))
        }
      } else if (
        location._original &&
        (location.location !== location._original.location ||
          location.amount !== location._original.amount)
      ) {
        // Update existing (only if changed)
        if (props.mode === "express") {
          promises.push(updateExpress({ uid: location.uid, body: payload }))
        } else {
          promises.push(updateManual({ uid: location.uid, body: payload }))
        }
      }
    }

    await Promise.all(promises)

    // Clear pending deletions after successful save
    pendingDeletions.value = []

    toast.success(
      `${props.mode === "express" ? "Express" : "Manual"} delivery settings saved successfully`,
    )

    // Refetch the data
    if (props.mode === "express") {
      await refetchExpress()
    } else {
      await refetchManual()
    }

    emit("update:modelValue", false)
    emit("refresh")
  } catch (error) {
    displayError(error)
  } finally {
    isSaving.value = false
  }
}
</script>
