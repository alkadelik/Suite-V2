<template>
  <div class="min-w-0 space-y-6 overflow-x-hidden pb-6 md:pb-0">
    <ApiKeySkeleton v-if="isPending" />

    <template v-else>
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
            :loading="isCreating"
            @click="handleGenerate"
          />
        </template>
      </EmptyState>

      <template v-else-if="apiKey">
        <ApiKeyCard
          :api-key="apiKey"
          :revealed-key="revealedKey"
          :loading="isMutating"
          @regenerate="regenerateOpen = true"
          @revoke="revokeOpen = true"
        />

        <WarningBox header="Need test API keys?">
          <p class="mt-1">
            If you would like to get access to the test sandbox environment where you can try out
            test API keys, contact us:
            <a :href="`mailto:${SUPPORT_EMAIL}`" class="underline">{{ SUPPORT_EMAIL }}</a>
          </p>
        </WarningBox>
      </template>
    </template>

    <ConfirmationModal
      v-model="regenerateOpen"
      header="Regenerate API key?"
      paragraph="We'll issue a new key and retire the current one."
      header-icon="refresh-2"
      action-label="Regenerate"
      info-message="Any storefront still using the old key will stop working until you update it."
      :loading="isRotating"
      @confirm="handleRegenerate"
    />

    <DeleteConfirmationModal
      v-model="revokeOpen"
      header="Delete API key?"
      paragraph="Any storefront using this key will stop working immediately."
      action-label="Delete"
      :loading="isRevoking"
      @delete="handleRevoke"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import AppButton from "@components/AppButton.vue"
import ConfirmationModal from "@components/ConfirmationModal.vue"
import DeleteConfirmationModal from "@components/DeleteConfirmationModal.vue"
import EmptyState from "@components/EmptyState.vue"
import SectionHeader from "@components/SectionHeader.vue"
import WarningBox from "@components/WarningBox.vue"
import ApiKeyCard from "../components/api-key/ApiKeyCard.vue"
import ApiKeySkeleton from "../components/api-key/ApiKeySkeleton.vue"
import { useGetApiKeys, useCreateApiKey, useRotateApiKey, useRevokeApiKey } from "../api"
import { DEFAULT_API_KEY_NAME, SUPPORT_EMAIL } from "../constants"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"

const { data: apiKeys, isPending, error, refetch } = useGetApiKeys()
watch(error, displayError)

/**
 * The list keeps revoked keys as tombstones, so the first entry is not
 * necessarily the live one — always select on status.
 */
const apiKey = computed(() => apiKeys.value?.find((key) => key.status === "active") ?? null)
const hasApiKey = computed(() => Boolean(apiKey.value))

const { mutate: createKey, isPending: isCreating } = useCreateApiKey()
const { mutate: rotateKey, isPending: isRotating } = useRotateApiKey()
const { mutate: revokeKey, isPending: isRevoking } = useRevokeApiKey()
const isMutating = computed(() => isCreating.value || isRotating.value)

const regenerateOpen = ref(false)
const revokeOpen = ref(false)

/**
 * Raw secret from the last create/rotate in this session. Component state on
 * purpose: navigating away or reloading drops it, which is what makes the
 * reveal one-time.
 */
const revealedKey = ref<string | null>(null)

function handleGenerate() {
  createKey(
    { name: DEFAULT_API_KEY_NAME },
    {
      onSuccess: (response) => {
        revealedKey.value = response.data.data.key
        toast.success("API key generated")
        refetch()
      },
      onError: displayError,
    },
  )
}

function handleRegenerate() {
  if (!apiKey.value) return
  rotateKey(apiKey.value.uid, {
    onSuccess: (response) => {
      revealedKey.value = response.data.data.key
      regenerateOpen.value = false
      toast.success("API key regenerated")
      refetch()
    },
    onError: displayError,
  })
}

/** Revoking leaves no active key, so the page falls back to the empty state. */
function handleRevoke() {
  if (!apiKey.value) return
  revokeKey(apiKey.value.uid, {
    onSuccess: () => {
      revealedKey.value = null
      revokeOpen.value = false
      toast.success("API key deleted")
      refetch()
    },
    onError: displayError,
  })
}
</script>
