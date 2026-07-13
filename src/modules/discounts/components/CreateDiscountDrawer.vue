<template>
  <Drawer :open="open" position="right" max-width="2xl" :show-header="false" @close="emit('close')">
    <!-- Custom header (title + step indicator + close) -->
    <div class="border-core-100 -mx-5 -mt-5 mb-5 flex items-center gap-3 border-b px-5 py-4">
      <h2 class="text-core-800 m-0 text-lg font-semibold">{{ title }}</h2>

      <!-- Step indicator + close, pinned top-right -->
      <div class="ml-auto flex items-center gap-3">
        <div v-if="steps.length > 1" class="flex items-center">
          <template v-for="(_, index) in steps" :key="index">
            <span
              v-if="index > 0"
              :class="[
                'h-0.5 w-5 transition-colors',
                index <= activeStep ? 'bg-primary-500' : 'bg-core-100',
              ]"
            />
            <span
              :class="[
                'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                index < activeStep
                  ? 'bg-primary-500 text-white'
                  : index === activeStep
                    ? 'bg-primary-50 border-primary-500 text-primary-500 border'
                    : 'bg-core-25 border-core-200 text-core-400 border',
              ]"
            >
              <Icon v-if="index < activeStep" name="check" class="h-3.5 w-3.5" />
              <template v-else>{{ index + 1 }}</template>
            </span>
          </template>
        </div>

        <button
          type="button"
          class="text-core-500 hover:text-core-700 cursor-pointer p-0 transition-colors"
          aria-label="Close"
          @click="emit('close')"
        >
          <Icon name="close-circle" size="20" />
        </button>
      </div>
    </div>

    <!-- Step 0: Details (type/value/start locked in edit) -->
    <DiscountDetailsStep v-if="activeStep === 0" v-model="model" :lock-fields="mode === 'edit'" />

    <!-- Step 1: Applies-to (target) — create/duplicate only -->
    <div v-else class="space-y-4">
      <IconHeader icon-name="tag-2" subtext="Choose where this discount applies." />
      <TargetSelector
        ref="targetSelectorRef"
        :model-value="targetModel"
        :applies-to-options="DISCOUNT_APPLIES_TO_OPTIONS"
        all-help-text="This discount applies to your entire storefront."
        @update:model-value="setTarget"
      />
    </div>

    <!-- Footer: pinned step navigation -->
    <template #footer>
      <!-- single-step (edit): submit only -->
      <AppButton
        v-if="steps.length === 1"
        :label="submitLabel"
        class="w-full"
        :loading="busy"
        :disabled="!detailsValid"
        @click="onSubmit"
      />
      <!-- multi-step, details: Continue -->
      <AppButton
        v-else-if="activeStep === 0"
        label="Continue"
        class="w-full"
        :disabled="!detailsValid"
        @click="goNext"
      />
      <!-- multi-step, last step: Back + submit -->
      <div v-else class="flex gap-3">
        <AppButton
          label="Back"
          color="alt"
          variant="outlined"
          icon="arrow-left"
          class="flex-1"
          @click="goPrev"
        />
        <AppButton
          :label="submitLabel"
          class="flex-1"
          :loading="busy"
          :disabled="!appliesToValid"
          @click="onSubmit"
        />
      </div>
    </template>
  </Drawer>

  <!-- Conflict → Overwrite confirmation flow -->
  <DiscountConflictModal
    :open="showConflict"
    :conflicts="conflicts"
    :message="conflictMessage"
    @close="showConflict = false"
    @overwrite="onOverwrite"
  />
  <OverwriteProductsModal
    :open="showOverwrite"
    :loading="saving"
    @close="showOverwrite = false"
    @complete="onComplete"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import Drawer from "@components/Drawer.vue"
import Icon from "@components/Icon.vue"
import IconHeader from "@components/IconHeader.vue"
import AppButton from "@components/AppButton.vue"
import DiscountDetailsStep from "./discount/DiscountDetailsStep.vue"
import TargetSelector from "./TargetSelector.vue"
import type { ITargetSelectorModel } from "./TargetSelector.vue"
import DiscountConflictModal from "./discount/DiscountConflictModal.vue"
import type { TDiscountConflict } from "./discount/DiscountConflictModal.vue"
import OverwriteProductsModal from "./discount/OverwriteProductsModal.vue"
import { buildDiscountPayload, discountToFormModel } from "../utils"
import { DISCOUNT_APPLIES_TO_OPTIONS } from "../constants"
import { useCreateDiscount, useUpdateDiscount } from "../api"
import { toast } from "@/composables/useToast"
import type { IDiscountFormModel, TDiscount } from "../types"

const props = defineProps<{
  open: boolean
  mode: "create" | "edit" | "duplicate"
  discount?: TDiscount | null
}>()

const emit = defineEmits<{ close: []; saved: [] }>()

function blankModel(): IDiscountFormModel {
  return {
    name: "",
    discountKind: "percentage",
    value: "",
    max_discount_amount: "",
    start_at: "",
    end_at: "",
    targetMode: "all",
    productUids: [],
    variantSelections: {},
    categoryUids: [],
  }
}

const model = ref<IDiscountFormModel>(blankModel())
const activeStep = ref(0)
const targetSelectorRef = ref<InstanceType<typeof TargetSelector> | null>(null)

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    activeStep.value = 0
    showConflict.value = false
    showOverwrite.value = false
    pendingVariants.value = []
    if (props.discount && (props.mode === "edit" || props.mode === "duplicate")) {
      model.value = discountToFormModel(props.discount)
      if (props.mode === "duplicate") {
        model.value = { ...model.value, name: `${model.value.name} (Copy)` }
      }
    } else {
      model.value = blankModel()
    }
  },
)

// Edit is limited (PATCH only name/end_at) → single step, no targeting.
const steps = computed(() => (props.mode === "edit" ? ["Details"] : ["Details", "Applies to"]))

const title = computed(() =>
  props.mode === "edit"
    ? "Edit Discount"
    : props.mode === "duplicate"
      ? "Duplicate Discount"
      : "Create Discount",
)

const submitLabel = computed(() => (props.mode === "edit" ? "Save Changes" : "Create Discount"))

const goNext = (): void => {
  if (activeStep.value < steps.value.length - 1) activeStep.value++
}
const goPrev = (): void => {
  if (activeStep.value > 0) activeStep.value--
}

const detailsValid = computed(() => {
  const m = model.value
  if (!m.name.trim()) return false
  if (m.discountKind === "percentage") {
    const p = Number(m.value)
    if (!(p >= 1 && p <= 100)) return false
  } else if (!(Number(m.value) > 0)) return false
  if (!m.start_at) return false
  if (m.end_at && new Date(m.end_at) < new Date(m.start_at)) return false
  return true
})

const appliesToValid = computed(() => {
  const m = model.value
  return (
    m.targetMode === "all" ||
    (m.targetMode === "products" && m.productUids.length > 0) ||
    (m.targetMode === "categories" && m.categoryUids.length > 0)
  )
})

// TargetSelector bridge
const targetModel = computed<ITargetSelectorModel>(() => ({
  mode: model.value.targetMode,
  productUids: model.value.productUids,
  variantSelections: model.value.variantSelections,
  categoryUids: model.value.categoryUids,
}))
function setTarget(v: ITargetSelectorModel): void {
  model.value = {
    ...model.value,
    targetMode: v.mode,
    productUids: v.productUids,
    variantSelections: v.variantSelections,
    categoryUids: v.categoryUids,
  }
}

// ---------------------------------------------------------------------------
// Submit + Conflict → Overwrite flow (force_overwrite).
// On a DISCOUNT_CONFLICT response the backend returns the conflicting variants +
// the discount they're already on; we surface those in the modal and re-POST
// with force_overwrite once the user confirms.
// ---------------------------------------------------------------------------
const showConflict = ref(false)
const showOverwrite = ref(false)
const conflicts = ref<TDiscountConflict[]>([])
const conflictMessage = ref("")
const pendingVariants = ref<string[]>([])

const { mutate: create, isPending: creating } = useCreateDiscount()
const { mutate: update, isPending: updating } = useUpdateDiscount()
const saving = computed(() => creating.value || updating.value)
const busy = saving

/** Parse a DISCOUNT_CONFLICT response; returns null when it isn't a conflict. */
function parseConflict(err: unknown): { conflicts: TDiscountConflict[]; message: string } | null {
  const e = err as {
    response?: { status?: number; data?: { error?: string; message?: string; conflicts?: unknown } }
  }
  const data = e?.response?.data
  const isConflict =
    data?.error === "DISCOUNT_CONFLICT" ||
    e?.response?.status === 429 ||
    e?.response?.status === 409
  if (!isConflict) return null
  return {
    conflicts: Array.isArray(data?.conflicts) ? (data.conflicts as TDiscountConflict[]) : [],
    message: typeof data?.message === "string" ? data.message : "",
  }
}

function onSubmit(): void {
  // Edit: limited PATCH (name + end date only).
  if (props.mode === "edit" && props.discount) {
    update(
      {
        uid: props.discount.uid,
        name: model.value.name.trim(),
        end_at: model.value.end_at || null,
      },
      {
        onSuccess: () => emit("saved"),
        onError: () => toast.error("Could not update the discount."),
      },
    )
    return
  }

  // Products mode targets specific ProductVariant UIDs (resolved from the
  // selector). Categories + Storefront are resolved server-side, so no variants
  // are sent — buildDiscountPayload sends category UIDs / a storefront target.
  let variants: string[] = []
  if (model.value.targetMode === "products") {
    variants = targetSelectorRef.value?.getResolvedVariantUids() ?? []
    if (variants.length === 0) {
      toast.error("No matching product variants found for this selection.")
      return
    }
  }
  pendingVariants.value = variants
  doCreate(false)
}

function doCreate(force: boolean): void {
  const payload = buildDiscountPayload(model.value, pendingVariants.value, force)
  create(payload, {
    onSuccess: () => {
      showConflict.value = false
      showOverwrite.value = false
      emit("saved")
    },
    onError: (err) => {
      const conflict = parseConflict(err)
      if (!force && conflict) {
        conflicts.value = conflict.conflicts
        conflictMessage.value = conflict.message
        showConflict.value = true
      } else {
        toast.error("Could not create the discount. Please try again.")
      }
    },
  })
}

function onOverwrite(): void {
  showConflict.value = false
  showOverwrite.value = true
}

function onComplete(): void {
  doCreate(true)
}
</script>
