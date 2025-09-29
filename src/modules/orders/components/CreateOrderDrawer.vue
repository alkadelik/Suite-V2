<script setup lang="ts">
import Drawer from "@components/Drawer.vue"
import StepperWizard from "@components/StepperWizard.vue"
import { ref } from "vue"
import OrderSelectCustomer from "./create-order-form/OrderSelectCustomer.vue"
import OrderSelectProduct from "./create-order-form/OrderSelectProduct.vue"
import OrderProductQtyVariant from "./create-order-form/OrderProductQtyVariant.vue"

defineProps({
  open: { type: Boolean, required: true },
})
const emit = defineEmits(["close"])

const steps = ["Add Products", "Customer Details", "Order Items", "Payment", "Review & Confirm"]
const activeStep = ref(0)
</script>

<template>
  <Drawer :open="open" title="Create Order" max-width="2xl" @close="emit('close')">
    <StepperWizard v-model="activeStep" :steps="steps" :showIndicators="false">
      <template #default="{ step, onPrev, onNext }">
        <OrderSelectProduct v-if="step === 0" @next="onNext" />
        <OrderProductQtyVariant v-if="step === 1" @next="onNext" @prev="onPrev" />
        <OrderSelectCustomer v-if="step === 2" @next="onNext" @prev="onPrev" />
      </template>
    </StepperWizard>
  </Drawer>
</template>
