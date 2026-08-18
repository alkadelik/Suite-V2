<template>
  <section class="rounded-2xl bg-gray-50 p-4 md:p-8">
    <h4 class="text-core-800 text-base font-bold md:text-lg">Your API Key</h4>
    <p class="text-core-700 mt-2 text-sm">
      This key gives full access to your store's Public API. Keep it secret — anyone with it can
      read your catalogue and create orders.
    </p>

    <div class="mt-5 flex items-start gap-3">
      <div class="min-w-0 flex-1">
        <TextField
          :model-value="apiKey.key"
          readonly
          size="lg"
          container-class="!bg-white"
          input-class="font-mono"
        />
        <p class="text-core-500 mt-1.5 flex items-start gap-1.5 text-sm">
          <Icon name="info-circle" size="16" class="mt-0.5 shrink-0" />
          Save this key somewhere safe. Anyone with this key can access your store's public API.
        </p>
      </div>

      <AppButton
        icon="copy"
        :icon-size="20"
        variant="outlined"
        color="alt"
        size="lg"
        aria-label="Copy API key"
        class="!bg-white"
        @click="clipboardCopy(apiKey.key)"
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
import AppButton from "@components/AppButton.vue"
import Icon from "@components/Icon.vue"
import TextField from "@components/form/TextField.vue"
import { clipboardCopy } from "@/utils/others"
import type { TApiKey } from "../../types"

defineProps<{ apiKey: TApiKey; loading?: boolean }>()

const emit = defineEmits<{ regenerate: [] }>()
</script>
