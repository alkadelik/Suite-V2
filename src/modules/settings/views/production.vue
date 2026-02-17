<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import SectionHeader from "@components/SectionHeader.vue"
import { componentOptions, recipeNameOptions } from "@modules/production/constants"
import { computed, ref, watch } from "vue"
import { useSettingsStore } from "../store"
import { useGetStoreDetails, useUpdateStoreDetails } from "../api"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"
import { useAuthStore } from "@modules/auth/store"

const selectedRawMaterial = ref<string>("")
const selectedRecipeName = ref<string>("")

const { mutate: updateStore, isPending } = useUpdateStoreDetails()
const storeId = computed(() => useSettingsStore().storeDetails?.uid || "")
const {
  data: storeDetails,
  isPending: isLoading,
  refetch,
} = useGetStoreDetails(useAuthStore().user?.store_uid || "")

const hasChanges = computed(() => {
  if (!storeDetails.value) return false
  return (
    selectedRawMaterial.value !== (storeDetails.value.material_type || "") ||
    selectedRecipeName.value !== (storeDetails.value.recipe_name || "")
  )
})

watch(
  () => storeDetails.value,
  (details) => {
    if (details) {
      selectedRawMaterial.value = details.material_type || ""
      selectedRecipeName.value = details.recipe_name || ""
      // Update store details in the settings store
      useSettingsStore().setStoreDetails(details)
    }
  },
  { immediate: true },
)

const handleSubmit = () => {
  const body = {
    material_type: selectedRawMaterial.value,
    recipe_name: selectedRecipeName.value,
  }
  updateStore(
    { id: storeId.value, body },
    {
      onSuccess: () => {
        toast.success("Names saved successfully")
        refetch()
      },
      onError: displayError,
    },
  )
}
</script>

<template>
  <div>
    <SectionHeader
      title="Production"
      size="sm"
      subtitle="Choose what you call the items you use in production."
    />

    <!-- Loading Skeleton -->
    <div v-if="isLoading" class="mt-8 rounded-xl border border-gray-200">
      <section v-for="n in 2" :key="n" class="p-4 md:px-6">
        <div class="mb-4 h-6 w-32 animate-pulse rounded bg-gray-200"></div>
        <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div v-for="i in 3" :key="i" class="rounded-xl border border-gray-200 p-4">
            <div class="flex justify-end">
              <div class="h-4 w-4 animate-pulse rounded-full bg-gray-200"></div>
            </div>
            <div class="flex flex-row-reverse items-center gap-4">
              <div class="mx-auto h-14 w-14 animate-pulse rounded bg-gray-200"></div>
              <div class="flex-1 text-left">
                <div class="h-5 w-24 animate-pulse rounded bg-gray-200"></div>
                <div class="mt-2 h-4 w-full animate-pulse rounded bg-gray-200"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div v-else class="mt-8 rounded-xl border border-gray-200">
      <!-- Raw Materials -->
      <section class="p-4 md:px-6">
        <h3 class="!font-outfit mb-4 text-base font-semibold md:text-lg">Raw Materials</h3>
        <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div
            v-for="option in componentOptions"
            :key="option.value"
            @click="selectedRawMaterial = option.value"
            :class="[
              'cursor-pointer rounded-xl border p-4 text-center',
              selectedRawMaterial === option.value
                ? 'bg-primary-100 border-primary-600 ring-primary-600 ring-2'
                : option.class,
            ]"
          >
            <div class="flex justify-end">
              <input
                type="radio"
                name="component-name"
                :value="option.value"
                v-model="selectedRawMaterial"
                class="accent-primary-700"
              />
            </div>
            <div class="flex flex-row-reverse items-center gap-4">
              <img :src="option.image" class="mx-auto h-14 object-contain" />
              <div class="text-left">
                <h3 class="text-core-950 text-lg font-semibold">{{ option.label }}</h3>
                <p class="mt-2 text-xs text-gray-700 md:text-sm">{{ option.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="mt-2 w-full border-t border-gray-200" />

      <!-- Recipes -->
      <section v-if="false" class="p-4 md:px-6">
        <h3 class="!font-outfit mb-4 text-base font-semibold md:text-lg">Recipes</h3>
        <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div
            v-for="option in recipeNameOptions"
            :key="option.value"
            @click="selectedRecipeName = option.value"
            :class="[
              'cursor-pointer rounded-xl border p-4 text-center',
              selectedRecipeName === option.value
                ? 'bg-primary-100 border-primary-600 ring-primary-600 ring-2'
                : option.class,
            ]"
          >
            <div class="flex justify-end">
              <input
                type="radio"
                name="component-name"
                :value="option.value"
                v-model="selectedRecipeName"
                class="accent-primary-700"
              />
            </div>
            <div class="flex flex-row-reverse items-center gap-4">
              <img :src="option.image" class="mx-auto h-14 object-contain" />
              <div class="text-left">
                <h3 class="text-core-950 text-lg font-semibold">{{ option.label }}</h3>
                <p class="mt-2 text-xs text-gray-700 md:text-sm">{{ option.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="flex justify-end border-t border-gray-200 p-4 md:px-6">
        <AppButton
          :loading="isPending"
          :disabled="!hasChanges"
          label="Save Changes"
          @click="handleSubmit"
        />
      </div>
    </div>
  </div>
</template>
