<template>
  <section class="rounded-2xl bg-gray-50 p-4 md:p-8">
    <div class="flex items-start justify-between gap-3">
      <h4 class="text-core-800 text-base font-bold md:text-lg">Your API Key</h4>

      <DropdownMenu
        :items="actions"
        placement="bottom-end"
        :show-chevron="false"
        size="sm"
        trigger-class="!bg-transparent !p-2 hover:!bg-gray-200 !border-0 !rounded-lg"
      >
        <template #trigger>
          <Icon name="dots-vertical" />
        </template>
      </DropdownMenu>
    </div>

    <p class="text-core-700 mt-2 text-sm">
      This key gives full access to your store's Public API. Keep it secret — anyone with it can
      read your catalogue and create orders.
    </p>

    <div class="mt-5 flex items-start gap-3">
      <div class="min-w-0 flex-1">
        <TextField
          :model-value="displayKey"
          readonly
          size="lg"
          container-class="!bg-white"
          input-class="font-mono"
        />
        <p class="text-core-500 mt-1.5 flex items-start gap-1.5 text-sm">
          <Icon name="info-circle" size="16" class="mt-0.5 shrink-0" />
          <span v-if="isRevealed">
            Save this key somewhere safe. Anyone with this key can access your store's public API.
          </span>
          <span v-else>
            For your security the full key is only shown once, when it is created. Regenerate it if
            you no longer have a copy.
          </span>
        </p>
      </div>

      <AppButton
        icon="copy"
        :icon-size="20"
        variant="outlined"
        color="alt"
        size="lg"
        aria-label="Copy API key"
        :disabled="!isRevealed"
        class="!bg-white"
        @click="clipboardCopy(displayKey)"
      />
    </div>

    <AppButton
      label="Regenerate API key"
      icon="refresh-2"
      :icon-size="18"
      class="mt-6 w-full md:w-auto"
      :loading="loading"
      @click="emit('regenerate')"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue"
import AppButton from "@components/AppButton.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import Icon from "@components/Icon.vue"
import TextField from "@components/form/TextField.vue"
import { clipboardCopy } from "@/utils/others"
import type { TApiKey } from "../../types"

const props = defineProps<{
  apiKey: TApiKey
  /** Raw secret, present only for a key minted in this session. */
  revealedKey?: string | null
  loading?: boolean
}>()

/**
 * The secret is shown once, right after it is minted. On every later visit the
 * list returns it masked (prefix + bullets) and there is no way to recover it —
 * the merchant must regenerate.
 */
const isRevealed = computed(() => Boolean(props.revealedKey))
const displayKey = computed(() => props.revealedKey || props.apiKey.key)

const emit = defineEmits<{ regenerate: []; revoke: [] }>()

/** Destructive actions live behind the menu rather than sitting out in the open. */
type TApiKeyAction = { label: string; icon: string; action: () => void; class?: string }
const actions = computed<TApiKeyAction[]>(() => [
  {
    label: "Delete key",
    icon: "trash-01",
    action: () => emit("revoke"),
    class: "!text-error-600",
  },
])
</script>
