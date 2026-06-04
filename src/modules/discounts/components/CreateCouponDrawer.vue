<template>
  <Drawer :open="open" position="right" max-width="2xl" :show-header="false" @close="emit('close')">
    <!-- Custom header (title + step indicator + close) -->
    <div class="border-core-100 -mx-5 -mt-5 mb-5 flex items-center gap-3 border-b px-5 py-4">
      <h2 class="text-core-800 m-0 text-lg font-semibold">{{ title }}</h2>

      <!-- Step indicator -->
      <div class="ml-auto flex items-center">
        <template v-for="(_, index) in steps" :key="index">
          <!-- Connector line (between circles) -->
          <span
            v-if="index > 0"
            :class="[
              'h-0.5 w-5 transition-colors',
              index <= activeStep ? 'bg-primary-500' : 'bg-core-100',
            ]"
          />
          <!-- Step circle -->
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
        class="text-core-500 hover:text-core-700 ml-3 cursor-pointer p-0 transition-colors"
        aria-label="Close"
        @click="emit('close')"
      >
        <Icon name="close-circle" size="20" />
      </button>
    </div>

    <!-- Body: current step content only (navigation lives in #footer) -->
    <!-- Step 0: Details -->
    <CouponDetailsStep v-if="activeStep === 0" v-model="model" />

    <!-- Products scope: 3-step flow -->
    <template v-else-if="model.scope === 'products'">
      <!-- Middle step: applies-to -->
      <div v-if="activeStep === 1" class="space-y-4">
        <!-- Sub-header (matches the other steps) -->
        <IconHeader
          icon-name="shop-add"
          subtext="Add the details of the coupon you want to create."
        />

        <!-- TargetSelector owns its own "Discount Applies to" label -->
        <TargetSelector :model-value="targetModel" @update:model-value="setTarget" />
      </div>

      <!-- Last step: usage limits -->
      <CouponUsageLimitsStep v-else-if="activeStep === 2" v-model="model" />
    </template>

    <!-- Order scope: 2-step flow → last step is usage limits -->
    <template v-else>
      <CouponUsageLimitsStep v-if="activeStep === 1" v-model="model" />
    </template>

    <!-- Footer: pinned step navigation -->
    <template #footer>
      <!-- Step 0: Details -->
      <AppButton
        v-if="activeStep === 0"
        label="Continue"
        class="w-full"
        :disabled="!detailsValid"
        @click="goNext"
      />

      <!-- Middle applies-to step (products scope, step 1) -->
      <div v-else-if="model.scope === 'products' && activeStep === 1" class="flex gap-3">
        <AppButton
          label="Back"
          color="alt"
          variant="outlined"
          icon="arrow-left"
          class="flex-1"
          @click="goPrev"
        />
        <AppButton label="Continue" class="flex-1" :disabled="!middleStepValid" @click="goNext" />
      </div>

      <!-- Last step: usage limits -->
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
          :loading="saving"
          :disabled="!detailsValid"
          @click="onSubmit"
        />
      </div>
    </template>
  </Drawer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import Drawer from "@components/Drawer.vue"
import Icon from "@components/Icon.vue"
import IconHeader from "@components/IconHeader.vue"
import AppButton from "@components/AppButton.vue"
import CouponDetailsStep from "./coupon/CouponDetailsStep.vue"
import CouponUsageLimitsStep from "./coupon/CouponUsageLimitsStep.vue"
import TargetSelector from "./TargetSelector.vue"
import type { ITargetSelectorModel } from "./TargetSelector.vue"
import { buildCouponPayload, couponToFormModel, generateCouponCode } from "../utils"
import { useCreateCoupon, useUpdateCoupon } from "../api"
import type { ICouponFormModel, TCoupon } from "../types"

const props = defineProps<{
  open: boolean
  mode: "create" | "edit" | "duplicate"
  coupon?: TCoupon | null
}>()

const emit = defineEmits<{ close: []; saved: [] }>()

/** All-empty wizard defaults. */
function blankModel(): ICouponFormModel {
  return {
    scope: "order",
    name: "",
    code: "",
    discountKind: "percentage",
    percentage_off: "",
    max_discount_amount: "",
    flat_amount: "",
    valid_from: "",
    valid_until: "",
    targetMode: "all",
    productUids: [],
    variantSelections: {},
    categoryUids: [],
    max_usage: "",
    max_usage_per_customer: "",
    enable_min_amount: false,
    min_order_amount: "",
    enable_min_items: false,
    min_cart_items: "",
  }
}

const model = ref<ICouponFormModel>(blankModel())
const activeStep = ref(0)

// (Re)hydrate whenever the drawer opens.
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    activeStep.value = 0
    if (props.coupon && (props.mode === "edit" || props.mode === "duplicate")) {
      // NOTE (best-effort hydration): couponToFormModel restores productUids /
      // categoryUids but not variantSelections; TargetSelector fills product
      // names as the user searches (it caches search results). Full name
      // hydration would require fetching the selected products by uid — deferred
      // since the update endpoint itself is an assumed/not-yet-live backend feature.
      model.value = couponToFormModel(props.coupon)
      if (props.mode === "duplicate") {
        model.value = {
          ...model.value,
          name: `${model.value.name} (Copy)`,
          code: generateCouponCode(),
        }
      }
    } else {
      model.value = blankModel()
    }
  },
)

const steps = computed(() =>
  model.value.scope === "products" ? ["Details", "Products", "Limits"] : ["Details", "Limits"],
)

const title = computed(() =>
  props.mode === "edit"
    ? "Edit Coupon"
    : props.mode === "duplicate"
      ? "Duplicate Coupon"
      : "Create Coupon",
)

const submitLabel = computed(() => (props.mode === "edit" ? "Save Changes" : "Create Coupon"))

// ---------------------------------------------------------------------------
// Step navigation (host owns it now that buttons live in the Drawer footer)
// ---------------------------------------------------------------------------
const goNext = (): void => {
  if (activeStep.value < steps.value.length - 1) activeStep.value++
}
const goPrev = (): void => {
  if (activeStep.value > 0) activeStep.value--
}

// Validity that previously gated step 0's Continue (moved from CouponDetailsStep).
const detailsValid = computed(() => {
  const m = model.value
  if (!m.name.trim()) return false
  if (!/^[A-Z0-9]+$/.test(m.code.trim())) return false
  if (m.discountKind === "percentage") {
    const p = Number(m.percentage_off)
    if (!(p >= 1 && p <= 100)) return false
  } else if (!(Number(m.flat_amount) > 0)) return false
  if (!m.valid_from) return false
  if (m.valid_until && new Date(m.valid_until) < new Date(m.valid_from)) return false
  return true
})

// ---------------------------------------------------------------------------
// Middle step (TargetSelector) <-> model bridge
// ---------------------------------------------------------------------------
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

const middleStepValid = computed(() => {
  const m = model.value
  return (
    m.targetMode === "all" ||
    (m.targetMode === "products" && m.productUids.length > 0) ||
    (m.targetMode === "categories" && m.categoryUids.length > 0)
  )
})

// ---------------------------------------------------------------------------
// Submit
// ---------------------------------------------------------------------------
const { mutate: create, isPending: creating } = useCreateCoupon()
const { mutate: update, isPending: updating } = useUpdateCoupon()
const saving = computed(() => creating.value || updating.value)

function onSubmit(): void {
  const payload = buildCouponPayload(model.value)
  const opts = {
    onSuccess: () => emit("saved"),
    // The parent (index.vue) shows the success toast + refetch on @saved.
  }
  if (props.mode === "edit" && props.coupon) {
    update({ uid: props.coupon.uid, ...payload }, opts)
  } else {
    create(payload, opts)
  }
}
</script>
