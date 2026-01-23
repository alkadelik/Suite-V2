<script setup lang="ts">
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import ConfirmationModal from "@components/ConfirmationModal.vue"
import Icon from "@components/Icon.vue"
import SectionHeader from "@components/SectionHeader.vue"
import { useGetStoreThemes, useUpdateActiveTheme } from "@modules/settings/api"
import { IStoreTheme } from "@modules/settings/types"
import { ref, inject } from "vue"

const { data: themes, isPending: isThemesLoading, refetch } = useGetStoreThemes()
const { mutate: updateActiveTheme, isPending } = useUpdateActiveTheme()

const openPreview = (themeName: string) => {
  window.open(`/${themeName.toLowerCase()}`, "_blank")
}

const selectedTheme = ref<IStoreTheme | null>(null)

const openConfirm = ref(false)
const openVersionHistory = inject<() => void>("openVersionHistory")

const openApply = (theme: IStoreTheme) => {
  selectedTheme.value = theme
  openConfirm.value = true
}

const onUpdateTheme = () => {
  if (!selectedTheme.value) return
  updateActiveTheme(selectedTheme.value.uid, {
    onSuccess: () => {
      toast.success(`${selectedTheme.value?.name} theme applied successfully.`)
      refetch()
      openConfirm.value = false
    },
    onError: displayError,
  })
}
</script>

<template>
  <section>
    <div class="mb-4 flex items-center gap-6 border-b border-gray-200 pb-4">
      <SectionHeader
        class="flex-1"
        title="Themes"
        size="sm"
        subtitle="Pick a theme that reflects your brand. You can always change it later."
      />
      <div class="flex items-center gap-4">
        <AppButton icon="clock-rewind" color="alt" size="sm" @click="openVersionHistory?.()" />
      </div>
    </div>

    <!-- Skeleton Loader -->
    <div v-if="isThemesLoading" class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      <div v-for="i in 5" :key="i" class="rounded-xl border border-gray-200">
        <div class="h-60 animate-pulse rounded-t-xl bg-gray-200"></div>
        <div class="space-y-3 rounded-b-xl p-4">
          <div class="h-6 w-3/4 animate-pulse rounded bg-gray-200"></div>
          <div class="h-4 w-full animate-pulse rounded bg-gray-200"></div>
          <div class="h-4 w-5/6 animate-pulse rounded bg-gray-200"></div>
          <div class="mt-4 flex justify-end gap-3">
            <div class="h-10 w-24 animate-pulse rounded bg-gray-200"></div>
            <div class="h-10 w-24 animate-pulse rounded bg-gray-200"></div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="theme in themes?.results"
        :key="theme.name"
        class="cursor-pointer rounded-xl"
        :class="theme.in_use ? 'border-primary-600 border-2' : 'border border-gray-200'"
      >
        <div class="relative h-60 rounded-xl">
          <img
            :src="theme.preview_image"
            class="h-full w-full rounded-t-xl bg-gray-100 object-cover"
          />
          <Icon
            v-if="theme.in_use"
            name="check-filled"
            size="20"
            class="text-primary-600 absolute top-4 right-4"
          />
        </div>
        <div class="rounded-b-xl p-4" :class="theme.in_use ? 'bg-primary-50' : ''">
          <div class="flex items-center gap-1">
            <h4 class="mb-1 text-lg font-semibold capitalize">{{ theme.name }}</h4>
            <Chip v-if="theme.in_use" show-dot label="Default" size="sm" variant="outlined" />
          </div>
          <p class="text-sm text-gray-600">
            {{ theme.description }}
          </p>

          <div class="mt-4 flex justify-end gap-3">
            <AppButton color="alt" label="Preview" @click="openPreview(theme.name)" />
            <AppButton label="Apply" :disabled="theme.in_use" @click="openApply(theme)" />
          </div>
        </div>
      </div>

      <ConfirmationModal
        v-model="openConfirm"
        :header="`Apply Theme: ${selectedTheme?.name?.toUpperCase()}`"
        :paragraph="`Are you sure you want to apply this theme on your storefront website?`"
        info-message="You can change your theme anytime from the themes settings."
        variant="warning"
        action-label="Apply Theme"
        :loading="isPending"
        @confirm="onUpdateTheme"
        @close="openConfirm = false"
      />
    </div>
  </section>
</template>
