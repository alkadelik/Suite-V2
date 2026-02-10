<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import Icon from "@components/Icon.vue"
import { computed, ref } from "vue"
import componentPng from "@/assets/images/components.png"
import ingredientPng from "@/assets/images/ingredients.png"
import materialPng from "@/assets/images/materials.png"
import { useUpdateStoreDetails } from "@modules/settings/api"
import { displayError } from "@/utils/error-handler"
import { useSettingsStore } from "@modules/settings/store"
import { toast } from "@/composables/useToast"

const emit = defineEmits(["select"])

const selectedOption = ref<string | null>(null)
const selectedOptionLabel = computed(() => {
  const selected = componentOptions.find((option) => option.value === selectedOption.value)
  return selected ? selected.label : ""
})

const componentOptions = [
  {
    label: "Ingredients",
    value: "ingredients",
    desc: "Common for food, beverages & cosmetics",
    examples: "e.g., flour, sugar, cooking oil",
    class: "border-warning-200 bg-warning-50",
    image: ingredientPng,
  },
  {
    label: "Raw Materials",
    value: "raw-materials",
    desc: "Common for manufacturing & retail",
    examples: "e.g. fabric, plastic bottles, packaging",
    class: "border-blue-200 bg-blue-50",
    image: materialPng,
  },
  {
    label: "Components",
    value: "components",
    desc: "Common for assembly & electronics",
    examples: "e.g., screws, circuit boards, casings",
    class: "border-purple-200 bg-purple-50",
    image: componentPng,
  },
]

const { mutate: updateStore, isPending } = useUpdateStoreDetails()
const storeId = computed(() => useSettingsStore().storeDetails?.uid || "")

const handleSelect = () => {
  const selected = { label: selectedOptionLabel.value, value: selectedOption.value! }
  updateStore(
    { id: storeId.value, body: { raw_materials: selected.value } },
    {
      onSuccess: (res) => {
        toast.success("Name saved successfully")
        console.log("res", res)
        emit("select", selected)
      },
      onError: displayError,
    },
  )
}
</script>

<template>
  <div
    class="flex min-h-[80vh] flex-col items-center justify-center pb-6 md:rounded-3xl md:bg-white md:pb-0 md:shadow-xs"
  >
    <div class="mx-auto max-w-2xl text-center">
      <h2 class="text-core-900 mb-3 text-xl font-semibold md:text-2xl">
        What should we call the items you use?
      </h2>
      <p class="text-core-700 text-sm md:text-base">
        Here’s where you’ll manage everything you use to make your products. Some call them
        ingredients, others call them materials.
      </p>

      <p class="text-core-700 mt-4 text-sm md:text-base">What works better for you?”</p>
    </div>

    <!-- option with radio -->
    <div class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
      <div
        v-for="option in componentOptions"
        :key="option.value"
        @click="selectedOption = option.value"
        :class="[
          'cursor-pointer rounded-xl border p-4 text-center',
          selectedOption === option.value
            ? 'bg-primary-100 border-primary-600 ring-primary-600 ring-2'
            : option.class,
        ]"
      >
        <div class="flex justify-end">
          <input
            type="radio"
            name="component-name"
            :value="option.value"
            v-model="selectedOption"
            class="accent-primary-700"
          />
        </div>
        <div class="flex flex-row-reverse items-center gap-4 md:flex-col">
          <img :src="option.image" class="mx-auto h-14 object-contain md:h-32" />
          <div class="text-left md:text-center">
            <h3 class="text-core-950 text-lg font-semibold md:text-xl">{{ option.label }}</h3>
            <p class="mt-2 text-xs font-medium text-gray-700 md:text-sm">{{ option.desc }}</p>
            <p class="mt-1 text-xs text-gray-600 md:text-sm">{{ option.examples }}</p>
          </div>
        </div>
      </div>
    </div>

    <div
      class="bg-primary-25 text-warning-700 border-warning-300 my-10 flex items-center gap-3 rounded-xl border px-3 py-3 md:px-6 lg:mb-20"
    >
      <span
        class="border-primary-200 ring-primary-100 flex size-8 flex-shrink-0 items-center justify-center rounded-full border-2 ring-2 ring-offset-2"
      >
        <Icon name="info-circle" size="20" />
      </span>
      <div class="text-sm font-medium md:text-base">
        This only changes the wording. You can update this later in Settings
      </div>
    </div>

    <AppButton
      :label="selectedOption ? 'Continue as ' + selectedOptionLabel : 'Continue'"
      :disabled="!selectedOption"
      class="w-full md:w-max md:min-w-80"
      size="lg"
      :loading="isPending"
      loading-text="Saving..."
      @click="handleSelect"
    />
  </div>
</template>
