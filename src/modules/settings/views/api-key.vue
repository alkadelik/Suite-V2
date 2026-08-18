<template>
  <div class="min-w-0 space-y-6 overflow-x-hidden pb-6 md:pb-0">
    <div>
      <SectionHeader
        title="API Key"
        size="md"
        subtitle="Manage the API keys used by your custom storefronts to access Leyyow's Public API"
      >
        <template #action>
          <!-- Docs have no destination yet — the button is intentionally inert. -->
          <AppButton
            v-if="hasApiKey"
            label="View API documentation"
            icon="export"
            icon-placement="right"
            :icon-size="18"
            variant="outlined"
            color="alt"
            size="sm"
            class="!hidden md:!inline-flex [&_path]:stroke-current"
          />
        </template>
      </SectionHeader>

      <!-- Mobile renders the same action as a text link under the subtitle. -->
      <AppButton
        v-if="hasApiKey"
        label="View API documentation"
        icon="export"
        icon-placement="right"
        :icon-size="18"
        variant="text"
        size="sm"
        class="mt-1 !px-0 md:!hidden [&_path]:stroke-current"
      />

      <hr class="border-core-100 mt-4 hidden md:block" />
    </div>

    <!-- Top-aligned rather than the component's default vertical centring. -->
    <EmptyState
      v-if="!hasApiKey"
      title="No API keys yet"
      description="Generate a key to let your storefront connect to your catalogue, delivery options, and checkout."
      class="!min-h-0 !justify-start pt-8"
    >
      <template #action>
        <AppButton
          label="Generate your API key"
          icon="add"
          :loading="isGenerating"
          @click="handleGenerate"
        />
      </template>
    </EmptyState>

    <template v-else-if="apiKey">
      <ApiKeyCard :api-key="apiKey" :loading="isGenerating" @regenerate="regenerateOpen = true" />

      <WarningBox header="Need test API keys?">
        <p class="mt-1">
          If you would like to get access to the test sandbox environment where you can try out test
          API keys, contact us:
          <a :href="`mailto:${SUPPORT_EMAIL}`" class="underline">{{ SUPPORT_EMAIL }}</a>
        </p>
      </WarningBox>
    </template>

    <ConfirmationModal
      v-model="regenerateOpen"
      header="Regenerate API key?"
      paragraph="We'll issue a new key and retire the current one."
      header-icon="refresh-2"
      action-label="Regenerate"
      info-message="Any storefront still using the old key will stop working until you update it."
      :loading="isGenerating"
      @confirm="handleRegenerate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import AppButton from "@components/AppButton.vue"
import ConfirmationModal from "@components/ConfirmationModal.vue"
import EmptyState from "@components/EmptyState.vue"
import SectionHeader from "@components/SectionHeader.vue"
import WarningBox from "@components/WarningBox.vue"
import ApiKeyCard from "../components/api-key/ApiKeyCard.vue"
import { useApiKey } from "../composables/useApiKey"
import { SUPPORT_EMAIL } from "../constants"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"

const { apiKey, hasApiKey, isGenerating, generate, regenerate } = useApiKey()

const regenerateOpen = ref(false)

async function handleGenerate() {
  try {
    await generate()
    toast.success("API key generated")
  } catch (error) {
    displayError(error)
  }
}

async function handleRegenerate() {
  try {
    await regenerate()
    regenerateOpen.value = false
    toast.success("API key regenerated")
  } catch (error) {
    displayError(error)
  }
}
</script>
