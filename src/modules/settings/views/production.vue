<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import SectionHeader from "@components/SectionHeader.vue"
import { componentOptions, recipeNameOptions } from "@modules/production/constants"
import { computed, ref, watch } from "vue"
import { useSettingsStore } from "../store"
import { useUpdateStoreDetails } from "../api"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"
import RadioInputField from "@components/form/RadioInputField.vue"
import { IStoreDetails } from "../types"

const { mutate: updateStore, isPending } = useUpdateStoreDetails()

const selectedRawMaterial = ref<string>("")
const selectedRecipeName = ref<string>("")

const storeId = computed(() => useSettingsStore().storeDetails?.uid || "")
const storeDetails = computed(() => useSettingsStore().storeDetails)

const hasChanges = computed(() => {
  if (!storeDetails.value) return false
  return (
    selectedRawMaterial.value !== (storeDetails.value.material_type || "") ||
    selectedRecipeName.value !== (storeDetails.value.recipe_terminology || "")
  )
})

watch(
  () => storeDetails.value,
  (details) => {
    if (details) {
      selectedRawMaterial.value = details.material_type || ""
      selectedRecipeName.value = details.recipe_terminology || ""
      // Update store details in the settings store
      useSettingsStore().setStoreDetails(details)
    }
  },
  { immediate: true },
)

const handleSubmit = () => {
  const body = {
    material_type: selectedRawMaterial.value,
    recipe_terminology: selectedRecipeName.value,
  }
  updateStore(
    { id: storeId.value, body },
    {
      onSuccess: (res) => {
        toast.success("Names saved successfully")
        const details = res.data.data as IStoreDetails
        useSettingsStore().setStoreDetails({
          ...details,
          // API currently not saving it [DESMOND]
          recipe_terminology: body.recipe_terminology,
        })
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

    <div class="mt-8 rounded-xl border border-gray-200">
      <!-- Raw Materials -->
      <section class="p-4 md:px-6">
        <h3 class="!font-outfit mb-4 text-base font-semibold md:text-lg">Raw Materials</h3>
        <RadioInputField
          :options="componentOptions"
          v-model="selectedRawMaterial"
          name="raw-material"
        />
      </section>

      <div class="mt-2 w-full border-t border-gray-200" />

      <!-- Recipes -->
      <section class="p-4 md:px-6">
        <h3 class="!font-outfit mb-4 text-base font-semibold md:text-lg">Recipes</h3>

        <RadioInputField
          :options="recipeNameOptions"
          v-model="selectedRecipeName"
          name="recipe-name"
        />
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
