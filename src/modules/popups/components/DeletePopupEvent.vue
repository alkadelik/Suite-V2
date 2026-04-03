<script setup lang="ts">
import DeleteConfirmationModal from "@components/DeleteConfirmationModal.vue"
import PopupEventCard from "./PopupEventCard.vue"
import { PopupEvent } from "../types"
import { useDeletePopupEvent } from "../api"
import { displayError } from "@/utils/error-handler"

const props = defineProps<{ open: boolean; event: PopupEvent }>()

const emit = defineEmits(["close", "refresh"])

const { mutate: deletePopupEvent, isPending } = useDeletePopupEvent()

const handleDelete = () => {
  deletePopupEvent(props.event.uid, {
    onSuccess: () => {
      emit("refresh")
      emit("close")
    },
    onError: displayError,
  })
}
</script>

<template>
  <DeleteConfirmationModal
    :model-value="open"
    @update:model-value="() => emit('close')"
    :loading="isPending"
    header="Delete Popup Event"
    @delete="handleDelete"
    action-label="Delete Popup Event"
  >
    <template #paragraph>
      <div class="space-y-4">
        <p class="text-sm">This will completely remove all records of this popup.</p>
        <PopupEventCard :event="event" :show-actions="false" />
      </div>
    </template>
  </DeleteConfirmationModal>
</template>
