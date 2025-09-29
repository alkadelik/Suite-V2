<template>
  <Modal
    :open="open"
    max-width="xl"
    :variant="isMobile ? 'bottom-nav' : 'centered'"
    :title="title"
    @close="emit('close')"
  >
    <div class="space-y-4">
      <FormField name="name" label="Location Name" required :disabled="location?.is_hq" />

      <FormField name="address" type="text" required label="Location Address" />
    </div>

    <template #footer>
      <AppButton
        :label="title"
        :loading="isPending || isUpdating"
        class="w-full"
        @click="onSubmit"
        :disabled="!meta.valid"
      />
    </template>
  </Modal>
</template>

<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import FormField from "@components/form/FormField.vue"
import Modal from "@components/Modal.vue"
import { useForm } from "vee-validate"
import * as yup from "yup"
import { useCreateLocation, useUpdateLocation } from "../api"
import { displayError } from "@/utils/error-handler"
import { toast } from "@/composables/useToast"
import { TLocation, TLocationFormData } from "../types"
import { computed, watch } from "vue"
import { useMediaQuery } from "@vueuse/core"

type Props = {
  open: boolean
  location?: TLocation | null
}

const props = defineProps<Props>()
const emit = defineEmits(["close", "refresh"])
const title = computed(() => (props.location ? "Update Location" : "Add Location"))
const isMobile = useMediaQuery("(max-width: 768px)")

const { mutate: createFn, isPending } = useCreateLocation()
const { mutate: updateFn, isPending: isUpdating } = useUpdateLocation()

const { handleSubmit, meta, setValues } = useForm<TLocationFormData>({
  validationSchema: yup.object({
    name: yup.string().required(),
    address: yup.string().required(),
  }),
})

watch(
  () => props.location,
  (newLocation) => {
    if (newLocation) {
      setValues({ name: newLocation.name, address: newLocation.address })
    }
  },
)

const onSubmit = handleSubmit((values) => {
  const onSuccess = () => {
    toast.success(`Location ${props.location ? "updated" : "created"} successfully`)
    emit("refresh")
    emit("close")
  }
  if (props.location) {
    updateFn({ id: props.location.uid, body: values }, { onSuccess, onError: displayError })
  } else {
    createFn(values, { onSuccess, onError: displayError })
  }
})
</script>
