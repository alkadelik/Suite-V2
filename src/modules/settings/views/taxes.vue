<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import Switch from "@components/form/Switch.vue"
import Icon from "@components/Icon.vue"
import SectionHeader from "@components/SectionHeader.vue"
import { useAuthStore } from "@modules/auth/store"
import { useGetStoreDetails, useUpdateStoreDetails } from "@modules/settings/api"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"
import { computed, ref, watch } from "vue"

const form = ref({ tax_collection_enabled: false })
const originalValues = ref({ tax_collection_enabled: false })

const storeUid = computed(() => useAuthStore().user?.store_uid || "")
const { data: storeDetails, refetch: refetchStoreDetails } = useGetStoreDetails(storeUid.value)
const { mutate: updateStore, isPending: isUpdating } = useUpdateStoreDetails()

watch(
  storeDetails,
  (newVal) => {
    if (newVal) {
      // Tax collection enabled
      form.value.tax_collection_enabled = newVal.tax_collection_enabled || false
      originalValues.value.tax_collection_enabled = newVal.tax_collection_enabled || false
    }
  },
  { immediate: true },
)

// Check if form has changes
const hasChanges = computed(() => {
  return form.value.tax_collection_enabled !== originalValues.value.tax_collection_enabled
})

// Handle save
const handleSave = () => {
  const payload: Record<string, unknown> = {}

  if (form.value.tax_collection_enabled !== originalValues.value.tax_collection_enabled) {
    payload.tax_collection_enabled = form.value.tax_collection_enabled
  }

  updateStore(
    { id: storeUid.value, body: payload },
    {
      onSuccess: () => {
        toast.success("Tax settings updated successfully")
        refetchStoreDetails()
      },
      onError: displayError,
    },
  )
}
</script>

<template>
  <div>
    <section>
      <SectionHeader title="Taxes" size="sm" subtitle="Enable/Disable taxes on all orders." />

      <div class="border-core-100 mt-6 rounded-2xl border bg-white">
        <div class="grid gap-10 p-4 md:p-6">
          <!-- VAT Collection -->
          <div class="flex items-start gap-3 md:items-center md:gap-6">
            <span
              class="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-200 md:h-10 md:w-10"
            >
              <Icon name="shop" size="20" class="text-gray-600" />
            </span>

            <div class="flex-1">
              <h3 class="mb-1 text-base font-semibold">Collect VAT (7.5%) on All Orders</h3>
              <p class="text-core-600 text-sm">
                Customers will be charged VAT at 7.5% on all orders created once enabled.
              </p>
            </div>
            <Switch
              :model-value="form.tax_collection_enabled"
              @update:model-value="form.tax_collection_enabled = $event"
            />
          </div>
        </div>

        <div class="border-core-100 flex justify-end gap-6 border-t px-6 py-4">
          <AppButton
            label="Save Changes"
            :disabled="!hasChanges"
            :loading="isUpdating"
            @click="handleSave"
          />
        </div>
      </div>
    </section>
  </div>
</template>
