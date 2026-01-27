<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import Switch from "@components/form/Switch.vue"
import RadioInputField from "@components/form/RadioInputField.vue"
import Icon from "@components/Icon.vue"
import SectionHeader from "@components/SectionHeader.vue"
import Chip from "@components/Chip.vue"
import TaxesSkeleton from "../components/skeletons/TaxesSkeleton.vue"
import { useAuthStore } from "@modules/auth/store"
import { useSettingsStore } from "@modules/settings/store"
import { useGetStoreDetails, useUpdateStoreDetails } from "@modules/settings/api"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"
import { computed, ref, watch } from "vue"

const authStore = useAuthStore()
const settingsStore = useSettingsStore()

const form = ref({
  tax_collection_enabled: false,
  add_tax_to_product_price: true,
})
const originalValues = ref({
  tax_collection_enabled: false,
  add_tax_to_product_price: true,
})

// Check if user has access to taxes feature (Bloom plan or higher)
const hasBloomAccess = computed(() => {
  const planName = authStore.user?.subscription?.plan_name?.toLowerCase()
  return planName === "bloom" || planName === "burst"
})

const handleUpgradeClick = () => {
  settingsStore.setPlanUpgradeModal(true)
}

const storeUid = computed(() => authStore.user?.store_uid || "")
const {
  data: storeDetails,
  refetch: refetchStoreDetails,
  isPending: isLoading,
} = useGetStoreDetails(storeUid.value)
const { mutate: updateStore, isPending: isUpdating } = useUpdateStoreDetails()

watch(
  storeDetails,
  (newVal) => {
    if (newVal) {
      // Tax collection enabled
      form.value.tax_collection_enabled = newVal.tax_collection_enabled || false
      originalValues.value.tax_collection_enabled = newVal.tax_collection_enabled || false

      // Add tax to product price (default to true if not set)
      form.value.add_tax_to_product_price = newVal.add_tax_to_product_price ?? true
      originalValues.value.add_tax_to_product_price = newVal.add_tax_to_product_price ?? true
    }
  },
  { immediate: true },
)

// VAT display options for RadioInputField
const vatDisplayOptions = [
  {
    label: "Include the VAT in product selling price",
    description:
      "The VAT fee will be added to the selling price(s) you have attached to your products.",
    value: true,
  },
  {
    label: "Show the VAT at the checkout point",
    description:
      "The VAT fee will be displayed to users at the point of checking out on the storefront.",
    value: false,
  },
]

// Check if form has changes
const hasChanges = computed(() => {
  return (
    form.value.tax_collection_enabled !== originalValues.value.tax_collection_enabled ||
    form.value.add_tax_to_product_price !== originalValues.value.add_tax_to_product_price
  )
})

// Handle save
const handleSave = () => {
  const payload: Record<string, unknown> = {}

  if (form.value.tax_collection_enabled !== originalValues.value.tax_collection_enabled) {
    payload.tax_collection_enabled = form.value.tax_collection_enabled
  }

  if (form.value.add_tax_to_product_price !== originalValues.value.add_tax_to_product_price) {
    payload.add_tax_to_product_price = form.value.add_tax_to_product_price
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
  <TaxesSkeleton v-if="isLoading" />
  <div v-else>
    <section>
      <SectionHeader title="Taxes" size="sm" subtitle="Enable/Disable taxes on all orders.">
        <template #action>
          <Chip v-if="!hasBloomAccess" icon="star" label="Bloom" color="blue" size="sm" />
        </template>
      </SectionHeader>

      <div
        class="border-core-100 relative mt-6 rounded-2xl border bg-white"
        :class="{ 'cursor-pointer': !hasBloomAccess }"
        @click="!hasBloomAccess && handleUpgradeClick()"
      >
        <!-- Overlay for non-Bloom users -->
        <div
          v-if="!hasBloomAccess"
          class="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/60 backdrop-blur-[1px]"
        >
          <div class="text-center">
            <Chip icon="star" label="Bloom" color="blue" size="md" class="mb-2" />
            <p class="text-sm text-gray-600">Upgrade to Bloom to access this feature</p>
          </div>
        </div>

        <div class="grid gap-10 p-4 md:p-6">
          <!-- VAT Collection -->
          <div>
            <h3 class="mb-3 text-base font-semibold">Disable/Enable VAT</h3>
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
                :disabled="!hasBloomAccess"
                @update:model-value="form.tax_collection_enabled = $event"
              />
            </div>
          </div>

          <!-- Manage how VAT is Shown -->
          <RadioInputField
            v-if="form.tax_collection_enabled"
            v-model="form.add_tax_to_product_price"
            label="Manage how VAT is Shown"
            :options="vatDisplayOptions"
            :disabled="!hasBloomAccess"
            orientation="horizontal"
            variant="white"
          />
        </div>

        <div class="border-core-100 flex justify-end gap-6 border-t px-6 py-4">
          <AppButton
            label="Save Changes"
            :disabled="!hasChanges || !hasBloomAccess"
            :loading="isUpdating"
            @click="handleSave"
          />
        </div>
      </div>
    </section>
  </div>
</template>
