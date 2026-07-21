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

    <div v-if="loadingDiscount" class="space-y-3 py-2">
      <div class="h-16 animate-pulse rounded-xl bg-gray-100" />
      <div class="h-16 animate-pulse rounded-xl bg-gray-100" />
      <div class="h-16 animate-pulse rounded-xl bg-gray-100" />
    </div>

    <div v-else-if="discountLoadFailed" class="flex flex-col items-center py-10 text-center">
      <Icon name="danger" class="text-error-500 h-8 w-8" />
      <p class="text-core-800 mt-3 text-sm font-medium">Could not load the discount targets.</p>
      <AppButton label="Retry" variant="outlined" class="mt-4" @click="refetchDiscount()" />
    </div>

    <template v-else>
      <!-- Step 0: Details (type/value/start locked in edit) -->
      <DiscountDetailsStep v-if="activeStep === 0" v-model="model" :lock-fields="mode === 'edit'" />

      <!-- Step 1: Applies-to target selections -->
      <div v-else class="space-y-4">
        <IconHeader icon-name="tag-2" subtext="Choose where this discount applies." />
        <TargetSelector
          ref="targetSelectorRef"
          :model-value="targetModel"
          :applies-to-options="DISCOUNT_APPLIES_TO_OPTIONS"
          :lock-mode="mode === 'edit'"
          :initial-products="initialTargetProducts"
          :initial-categories="initialTargetCategories"
          all-help-text="This discount applies to your entire storefront."
          @update:model-value="setTarget"
        />
      </div>
    </template>

    <!-- Footer: pinned step navigation -->
    <template #footer>
      <!-- single-step (edit): submit only -->
      <AppButton
        v-if="steps.length === 1"
        :label="submitLabel"
        class="w-full"
        :loading="busy"
        :disabled="loadingDiscount || discountLoadFailed || !detailsValid"
        @click="onSubmit"
      />
      <!-- multi-step, details: Continue -->
      <AppButton
        v-else-if="activeStep === 0"
        label="Continue"
        class="w-full"
        :disabled="loadingDiscount || discountLoadFailed || !detailsValid"
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
import type {
  ITargetCategorySummary,
  ITargetProductSummary,
  ITargetSelectorModel,
} from "./TargetSelector.vue"
import DiscountConflictModal from "./discount/DiscountConflictModal.vue"
import type { TDiscountConflict } from "./discount/DiscountConflictModal.vue"
import OverwriteProductsModal from "./discount/OverwriteProductsModal.vue"
import { buildDiscountPayload, buildDiscountUpdatePayload, discountToFormModel } from "../utils"
import { DISCOUNT_APPLIES_TO_OPTIONS } from "../constants"
import { useCreateDiscount, useGetDiscount, useUpdateDiscount } from "../api"
import { toast } from "@/composables/useToast"
import type { IDiscountFormModel, TDiscount, TDiscountDetail } from "../types"

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

const discountUid = computed(() => props.discount?.uid ?? "")
const shouldLoadDiscount = computed(
  () => props.open && props.mode !== "create" && Boolean(discountUid.value),
)
const {
  data: discountData,
  isPending: discountPending,
  isError: discountError,
  refetch: refetchDiscount,
} = useGetDiscount(discountUid, { enabled: shouldLoadDiscount })

function unwrapDiscountDetail(body: unknown): TDiscountDetail | null {
  const raw = body as { data?: TDiscountDetail } | TDiscountDetail | undefined
  if (!raw) return null
  const candidate = "uid" in raw ? raw : raw.data
  if (!candidate || candidate.uid !== discountUid.value) return null
  return Array.isArray(candidate.variants) && Array.isArray(candidate.categories) ? candidate : null
}

const propDiscountDetail = computed(() => unwrapDiscountDetail(props.discount))
const fetchedDiscountDetail = computed(() => unwrapDiscountDetail(discountData.value))
const editableDiscount = computed(() => fetchedDiscountDetail.value ?? propDiscountDetail.value)
const loadingDiscount = computed(
  () => shouldLoadDiscount.value && !editableDiscount.value && discountPending.value,
)
const discountLoadFailed = computed(
  () => shouldLoadDiscount.value && !editableDiscount.value && discountError.value,
)

const initialTargetProducts = computed<ITargetProductSummary[]>(() => {
  const products = new Map<string, ITargetProductSummary>()
  for (const variant of editableDiscount.value?.variants ?? []) {
    const current = products.get(variant.product_uid) ?? {
      uid: variant.product_uid,
      name: variant.product_name,
      image: variant.product_image ?? variant.image,
      variants: [],
    }
    current.variants.push({ uid: variant.uid, name: variant.name, price: variant.price })
    products.set(variant.product_uid, current)
  }
  return Array.from(products.values())
})

const initialTargetCategories = computed<ITargetCategorySummary[]>(() =>
  (editableDiscount.value?.categories ?? []).map((category) => ({
    uid: category.uid,
    name: category.name,
    product_count: category.product_count,
  })),
)

const hasInitializedDiscount = ref(false)

function resetTransientState(): void {
  activeStep.value = 0
  showConflict.value = false
  showOverwrite.value = false
  pendingVariants.value = []
  hasInitializedDiscount.value = false
}

function initializeFromDiscount(discount: TDiscountDetail): void {
  model.value = discountToFormModel(discount)
  if (props.mode === "duplicate") {
    model.value = { ...model.value, name: `${model.value.name} (Copy)` }
  }
  hasInitializedDiscount.value = true
}

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    resetTransientState()
    if (props.mode === "create") {
      model.value = blankModel()
    } else if (editableDiscount.value) {
      initializeFromDiscount(editableDiscount.value)
    }
  },
)

watch(editableDiscount, (discount) => {
  if (props.open && props.mode !== "create" && discount && !hasInitializedDiscount.value) {
    initializeFromDiscount(discount)
  }
})

// target_type stays immutable on PATCH. Existing product/category target sets can
// be replaced; storefront discounts have no individual target selection step.
const steps = computed(() =>
  props.mode === "edit" && props.discount?.target_type === "storefront"
    ? ["Details"]
    : ["Details", "Applies to"],
)

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
// with force_overwrite once the user confirms. This applies to both POST and
// target-replacement PATCH requests.
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
  // Products mode targets specific ProductVariant UIDs (resolved from the
  // selector). Categories + Storefront are resolved server-side, so no variants
  // are sent. The create/update payload builders send category UIDs directly.
  let variants: string[] = []
  if (model.value.targetMode === "products") {
    variants = targetSelectorRef.value?.getResolvedVariantUids() ?? []
    if (variants.length === 0) {
      toast.error("No matching product variants found for this selection.")
      return
    }
  }
  pendingVariants.value = variants
  doSave(false)
}

function saveOptions(force: boolean) {
  return {
    onSuccess: () => {
      showConflict.value = false
      showOverwrite.value = false
      emit("saved")
    },
    onError: (err: unknown) => {
      const conflict = parseConflict(err)
      if (!force && conflict) {
        conflicts.value = conflict.conflicts
        conflictMessage.value = conflict.message
        showConflict.value = true
      } else {
        toast.error(
          props.mode === "edit"
            ? "Could not update the discount. Please try again."
            : "Could not create the discount. Please try again.",
        )
      }
    },
  }
}

function doSave(force: boolean): void {
  if (props.mode === "edit" && props.discount) {
    update(
      {
        uid: props.discount.uid,
        ...buildDiscountUpdatePayload(model.value, pendingVariants.value, force),
      },
      saveOptions(force),
    )
    return
  }

  create(buildDiscountPayload(model.value, pendingVariants.value, force), saveOptions(force))
}

function onOverwrite(): void {
  showConflict.value = false
  showOverwrite.value = true
}

function onComplete(): void {
  doSave(true)
}
</script>
