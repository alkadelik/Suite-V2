<template>
  <div>
    <label v-if="label" class="text-brand-400 mb-1 block" :class="dense ? 'text-xs' : 'text-sm'">
      {{ label }}<span v-if="required" class="text-red-500">*</span>
    </label>

    <div class="relative">
      <input
        :id="name"
        v-model="searchInput"
        type="text"
        :placeholder="placeholder"
        :class="[
          'bg-brand-50 w-full rounded-lg border border-[#D7D5D5]',
          dense ? 'h-10 px-3 py-1.5' : 'h-12 px-4 py-2.5',
          'text-brand-600 placeholder:text-brand-300 text-sm placeholder:font-light',
          'focus:border-brand-500 focus:ring-brand-500/10 focus:ring focus:outline-none disabled:bg-gray-200 disabled:opacity-80',
          error ? 'border-red-500' : '',
        ]"
        :required="required"
        :name="name"
        :disabled="disabled"
      />

      <!-- Dropdown -->
      <div
        v-if="suggestions.length && !hasSelectedSuggestion"
        :class="[
          'absolute z-[1000] max-h-56 w-full overflow-auto rounded-lg bg-white py-1 shadow-md ring-1 ring-black/10 focus:outline-none',
          dense ? 'text-xs' : 'text-sm',
          props.direction === 'up' ? 'bottom-full mb-1' : 'top-full mt-1',
        ]"
      >
        <div
          v-for="(item, index) in suggestions"
          :key="index"
          class="hover:bg-brand-100 hover:text-brand-500 text-brand-600 cursor-pointer px-4 py-2 select-none"
          @click="selectSuggestion(item)"
        >
          {{ item.description }}
        </div>
      </div>
    </div>

    <p v-if="error || hint" :class="[error ? 'text-red-500' : 'text-brand-300', 'mt-1 text-xs']">
      {{ error || hint }}
    </p>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from "vue"

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyB-fzYq9w6782YOSnXXktPUJSLbnNSc5Fg"

const props = defineProps({
  modelValue: { type: String, default: "" },
  label: { type: String, default: "" },
  placeholder: { type: String, default: "Type for suggestions..." },
  required: { type: Boolean, default: false },
  dense: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  error: String,
  hint: String,
  name: String,
  countryRestriction: { type: String, default: "ng" },
  direction: { type: String, default: "down", validator: (v) => ["up", "down"].includes(v) },
})

const emit = defineEmits(["update:modelValue", "selected"])

const searchInput = ref(props.modelValue)
const suggestions = ref([])
const autocompleteService = ref(null)

const hasSelectedSuggestion = computed(() => {
  return suggestions.value.some((item) => item.description === searchInput.value)
})

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newVal) => {
    searchInput.value = newVal
  },
)

// Watch searchInput for autocomplete
watch(searchInput, (val) => {
  emit("update:modelValue", val)
  if (val && autocompleteService.value && !hasSelectedSuggestion.value) {
    autocompleteService.value.getPlacePredictions(
      {
        input: val,
        componentRestrictions: { country: props.countryRestriction },
      },
      (predictions) => {
        suggestions.value = predictions || []
      },
    )
  } else {
    suggestions.value = []
  }
})

onMounted(() => {
  if (!window.google || !window.google.maps) {
    const script = document.createElement("script")
    script.async = true
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.onload = () => {
      autocompleteService.value = new window.google.maps.places.AutocompleteService()
    }
    document.head.appendChild(script)
  } else {
    autocompleteService.value = new window.google.maps.places.AutocompleteService()
  }
})

const selectSuggestion = (item) => {
  searchInput.value = item.description
  suggestions.value = []
  // if you need the full place object
  emit("selected", item)
}
</script>
