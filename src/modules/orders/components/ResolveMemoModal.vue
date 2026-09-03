<script setup lang="ts">
import { ref, watch } from "vue"
import Modal from "@components/Modal.vue"
import AppButton from "@components/AppButton.vue"
import SelectField from "@components/form/SelectField.vue"
import TextAreaField from "@components/form/TextAreaField.vue"
import { useResolveOrderMemo } from "../api"
import { MEMO_PARTY_OPTIONS, TMemoPartyOption } from "../constants"
import { TOrderMemo } from "../types"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"

const props = defineProps<{ open: boolean; orderId: string; memo: TOrderMemo | null }>()

const emit = defineEmits<{ close: []; refresh: [] }>()

const resolvedBy = ref<TMemoPartyOption>(MEMO_PARTY_OPTIONS[0])
const note = ref("")

/** Prefill from the party the memo is awaiting; "nobody" falls back to Merchant */
watch(
  () => [props.open, props.memo?.uid],
  () => {
    if (!props.open) return
    resolvedBy.value =
      MEMO_PARTY_OPTIONS.find((option) => option.value === props.memo?.awaiting) ??
      MEMO_PARTY_OPTIONS[0]
    note.value = ""
  },
  { immediate: true },
)

const { mutate: resolveMemo, isPending } = useResolveOrderMemo()

const onSubmit = () => {
  if (!props.memo) return

  resolveMemo(
    {
      id: props.orderId,
      memoId: props.memo.uid,
      body: {
        resolved_by: resolvedBy.value.value,
        ...(note.value ? { resolution_note: note.value } : {}),
      },
    },
    {
      onSuccess: () => {
        toast.success("Memo resolved")
        emit("refresh")
        emit("close")
      },
      onError: displayError,
    },
  )
}
</script>

<template>
  <Modal
    :open="open"
    title="Resolve Memo"
    variant="bottom-nav"
    max-width="md"
    @close="emit('close')"
  >
    <div class="space-y-5">
      <SelectField v-model="resolvedBy" label="Resolution by" :options="MEMO_PARTY_OPTIONS" />

      <TextAreaField
        v-model="note"
        label="How was this resolved? (Optional)"
        placeholder="Leave blank if there's nothing to add"
        :rows="3"
      />
    </div>

    <template #footer>
      <AppButton label="Confirm Resolve" class="w-full" :loading="isPending" @click="onSubmit" />
    </template>
  </Modal>
</template>
