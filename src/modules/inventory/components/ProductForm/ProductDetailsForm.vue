<template>
  <div class="space-y-6">
    <TextField
      v-model="productName"
      label="Product Name"
      placeholder="Enter product name"
      required
      @input="handleProductNameInput"
    />

    <SelectField
      v-model="form.category"
      :options="categoryOptions"
      label="Category"
      placeholder="Select category"
      searchable
      required
      @update:modelValue="handleCategorySelect"
    />

    <div>
      <SelectField
        v-model="form.unit"
        :options="unitOptions"
        label="Unit of Measurement"
        placeholder="Select unit"
        searchable
      >
        <template #prepend="{ close }">
          <div
            class="hover:bg-core-25 cursor-pointer border-b border-gray-200 px-4 py-2 text-sm transition-colors duration-150"
            @click="
              () => {
                close()
                showAddUnit = true
              }
            "
          >
            <div class="flex items-center justify-between">
              <span class="text-primary-600 font-semibold">Add New Unit</span>
              <Icon name="add" class="text-primary-600 h-4 w-4" />
            </div>
          </div>
        </template>
      </SelectField>
    </div>

    <RichTextEditor
      v-model="form.description"
      label="Description"
      placeholder="Enter product description"
      hint="Your customers will see this description when they view this product."
    />

    <div
      v-if="!props.disableVariantsToggle"
      class="flex items-center justify-between gap-3 rounded-2xl border border-gray-400 px-4 py-5"
    >
      <div class="flex flex-col gap-2">
        <p class="text-xs font-semibold text-gray-700 md:text-sm">
          Does this product have variants?
        </p>
        <p class="text-xs text-gray-500 md:text-sm">
          Eg. Different colours, sizes, fragrances etc.
        </p>
      </div>
      <Switch v-model="hasProductVariants" />
    </div>
  </div>

  <!-- Add New Unit Modal -->
  <Modal :open="showAddUnit" title="Add New Unit" max-width="md" @close="showAddUnit = false">
    <div class="space-y-4">
      <div class="bg-core-50 mb-2 flex size-10 items-center justify-center rounded-xl p-2">
        <Icon name="ruler" size="28" />
      </div>
      <p class="text-sm text-gray-600">Create a new unit of measurement for your products</p>
      <TextField v-model="newUnitName" label="Unit Name" placeholder="e.g. Carton" required />
    </div>
    <template #footer>
      <div class="flex gap-3">
        <AppButton label="Cancel" variant="outlined" class="flex-1" @click="showAddUnit = false" />
        <AppButton
          label="Add Unit"
          class="flex-1"
          :disabled="!newUnitName.trim()"
          @click="createNewUnit"
        />
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue"
import TextField from "@/components/form/TextField.vue"
import RichTextEditor from "@/components/form/RichTextEditor.vue"
import SelectField from "@/components/form/SelectField.vue"
import Switch from "@components/form/Switch.vue"
import Modal from "@components/Modal.vue"
import Icon from "@components/Icon.vue"
import AppButton from "@components/AppButton.vue"
import { useGetCategories } from "@modules/inventory/api"
import { useTextTransform } from "@/composables/useTextTransform"

interface ProductForm {
  name: string
  category: { label: string; value: string } | null
  unit: { label: string; value: string } | null
  description: string
}

interface Props {
  /** Product form data */
  modelValue: ProductForm
  /** Whether product has variants */
  hasVariants: boolean
  /** Whether to disable the variants toggle (e.g., when editing) */
  disableVariantsToggle?: boolean
}

interface Emits {
  /** Update form data */
  "update:modelValue": [value: ProductForm]
  /** Update has variants flag */
  "update:hasVariants": [value: boolean]
  /** Emit when Add New Category is clicked */
  "add-category": []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Composables
const { data: categoriesData } = useGetCategories()
const { handleCapitalizedInput } = useTextTransform()

// State
const productName = ref(props.modelValue.name)

// Unit of measurement
const showAddUnit = ref(false)
const newUnitName = ref("")
const unitOptions = ref([
  { label: "Kilograms (kg)", value: "kg" },
  { label: "Grams (g)", value: "g" },
  { label: "Liters (L)", value: "L" },
  { label: "Milliliters (ml)", value: "ml" },
  { label: "Pieces (pcs)", value: "pcs" },
  { label: "Meters (m)", value: "m" },
  { label: "Sheets", value: "sheets" },
  { label: "Bags", value: "bags" },
  { label: "Boxes", value: "boxes" },
])

const createNewUnit = () => {
  const unit = newUnitName.value.trim()
  const newUnit = { label: unit, value: unit.toLowerCase().replace(/\s+/g, "_") }
  unitOptions.value.push(newUnit)
  form.value.unit = newUnit
  showAddUnit.value = false
  newUnitName.value = ""
}

// Main form computed with v-model pattern
const form = computed({
  get: () => props.modelValue,
  set: (val: ProductForm) => emit("update:modelValue", val),
})

const hasProductVariants = computed({
  get: () => props.hasVariants,
  set: (value: boolean) => emit("update:hasVariants", value),
})

/**
 * Category options with "Add New Category" always at the top
 */
const categoryOptions = computed(() => {
  const addNewOption = {
    label: "Add New Category",
    value: "__add_new__",
    icon: "add",
    divider: true,
    alwaysVisible: true,
  }

  const categories =
    categoriesData.value?.data?.results?.map((category: { uid: string; name: string }) => ({
      label: category.name,
      value: category.uid,
    })) || []

  return [addNewOption, ...categories]
})

/**
 * Handle product name input with auto-capitalization
 */
const handleProductNameInput = (event: Event) => {
  handleCapitalizedInput(event, productName)
  form.value.name = productName.value
}

/**
 * Handle category selection
 * If "Add New Category" is selected, emit event to parent
 */
const handleCategorySelect = (
  value:
    | string
    | number
    | Record<string, unknown>
    | Array<string | number | Record<string, unknown>>
    | null,
) => {
  // Type guard to check if value is the expected category object
  if (value && typeof value === "object" && !Array.isArray(value) && "value" in value) {
    const categoryValue = value.value as string
    if (categoryValue === "__add_new__") {
      // Reset category selection and emit event to parent
      form.value.category = null
      emit("add-category")
    }
  }
}

// Watch for external changes to productName
watch(
  () => props.modelValue.name,
  (newName) => {
    productName.value = newName
  },
)

/**
 * Expose method to set category from parent (for when new category is created)
 */
const setCategory = (category: { label: string; value: string }) => {
  form.value.category = category
}

defineExpose({
  setCategory,
})
</script>
