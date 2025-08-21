<script setup>
import { computed, defineProps } from "vue"
import Icon from "@components/common/icon.vue"

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
})

// Password validation logic
const hasMinLength = computed(() => props.modelValue.length >= 8)
const hasUppercase = computed(() => /[A-Z]/.test(props.modelValue))
const hasLowercase = computed(() => /[a-z]/.test(props.modelValue))
const hasSpecialChar = computed(() => /[^A-Za-z0-9]/.test(props.modelValue))

const satisfiedCriteria = computed(
  () =>
    [hasMinLength.value, hasUppercase.value, hasLowercase.value, hasSpecialChar.value].filter(
      Boolean,
    ).length,
)

const passwordStrength = computed(() => {
  if (satisfiedCriteria.value === 4) return "strong"
  if (satisfiedCriteria.value >= 2) return "medium"
  return "weak"
})
</script>

<template>
  <div class="mt-2">
    <!-- Strength Bars -->
    <div class="mb-2 flex items-center gap-3">
      <div class="flex flex-1 gap-1">
        <div
          class="h-1 flex-1 rounded-sm"
          :class="[
            'bg-gray-300',
            passwordStrength === 'weak' && 'bg-red-500',
            passwordStrength === 'medium' && 'bg-orange-400',
            passwordStrength === 'strong' && 'bg-green-500',
          ]"
        />
        <div
          class="h-1 flex-1 rounded-sm"
          :class="[
            'bg-gray-300',
            passwordStrength === 'medium' && 'bg-orange-400',
            passwordStrength === 'strong' && 'bg-green-500',
          ]"
        />
        <div
          class="h-1 flex-1 rounded-sm"
          :class="['bg-gray-300', passwordStrength === 'strong' && 'bg-green-500']"
        />
      </div>
      <span class="text-xs font-medium text-gray-600">
        {{
          passwordStrength === "strong"
            ? "Strong Password"
            : passwordStrength === "medium"
              ? "Could be better"
              : "Too weak"
        }}
      </span>
    </div>

    <!-- Criteria -->
    <ul class="space-y-1 text-sm text-gray-600">
      <li class="flex items-center gap-2">
        <div v-if="!hasMinLength" class="h-2.5 w-2.5 rounded-full bg-gray-300"></div>
        <Icon name="check-circle" v-else />
        Minimum 8 characters
      </li>
      <li class="flex items-center gap-2">
        <div v-if="!hasUppercase" class="h-2.5 w-2.5 rounded-full bg-gray-300"></div>
        <Icon name="check-circle" v-else />
        At least one uppercase letter
      </li>
      <li class="flex items-center gap-2">
        <div v-if="!hasLowercase" class="h-2.5 w-2.5 rounded-full bg-gray-300"></div>
        <Icon name="check-circle" v-else />
        At least one lowercase letter
      </li>
      <li class="flex items-center gap-2">
        <div v-if="!hasSpecialChar" class="h-2.5 w-2.5 rounded-full bg-gray-300"></div>
        <Icon name="check-circle" v-else />
        At least one special character (@#$%)
      </li>
    </ul>
  </div>
</template>
