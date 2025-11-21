<script setup lang="ts">
import { formatCurrency } from "@/utils/format-currency"
import { startCase } from "@/utils/format-strings"
import { formatDate } from "@/utils/formatDate"
import AppButton from "@components/AppButton.vue"
import BackButton from "@components/BackButton.vue"
import EmptyState from "@components/EmptyState.vue"
import Icon from "@components/Icon.vue"
import { useGetEventfulPopupById, useRegisterForEventful } from "@modules/popups/api"
import RegisterForEventfulModal from "@modules/popups/components/RegisterForEventfulModal.vue"
import { computed, ref } from "vue"
import { useRoute } from "vue-router"
import fallbackImg from "@/assets/images/eventful-noise-grid.svg?url"
import Avatar from "@components/Avatar.vue"
import AppSection from "@components/AppSection.vue"
import ConfirmationModal from "@components/ConfirmationModal.vue"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"

const route = useRoute()

const openRegister = ref(false)
const openConfirmation = ref(false)
const { data: popupEvt, isLoading } = useGetEventfulPopupById(route.params.id as string)

const overviewInfo = computed(() => {
  return {
    Description: popupEvt.value?.description || "N/A",
    eventInstructions: popupEvt.value?.event_instructions || "N/A",
    "Terms & Conditions": popupEvt.value?.terms_and_conditions || "N/A",
  }
})

const handleRegister = () => {
  if (Number(popupEvt.value?.participant_fee) === 0) {
    openConfirmation.value = true
  } else {
    openRegister.value = true
  }
}

const { mutate: registerForEventful, isPending } = useRegisterForEventful()

const handleConfirmFreeRegistration = () => {
  registerForEventful(
    { event: popupEvt.value?.uid || "", discount_code: "" },
    {
      onSuccess: (res) => {
        toast.success("You have successfully registered for the event.")
        openConfirmation.value = false
        console.log("Registration Response:", res)
      },
      onError: displayError,
    },
  )
}
</script>

<template>
  <EmptyState
    v-if="isLoading || !popupEvt"
    title="Event Details"
    description="Details for this event is currently not available."
    :loading="isLoading"
  />

  <AppSection v-else class="flex min-h-[80vh] flex-col px-8 py-4 md:py-8">
    <BackButton label="Go Back" class="mb-6" />

    <div class="space-y-6">
      <div class="relative z-[1] rounded-xl">
        <img
          :src="popupEvt?.image || fallbackImg"
          :alt="popupEvt?.name"
          class="h-60 w-full rounded-xl bg-amber-600 object-cover"
        />
      </div>

      <section class="md:hidden">
        <h3 class="truncate text-xl font-semibold capitalize">{{ popupEvt?.name }}</h3>
        <div class="mt-2 space-y-3">
          <p class="flex items-center gap-2 text-sm">
            <Icon name="calendar" size="20" />
            {{ formatDate(popupEvt?.start_date || "") }} -
            {{ formatDate(popupEvt?.end_date || "") }}
          </p>
          <p class="flex items-center gap-2 text-sm capitalize">
            <Icon name="location" size="20" />
            {{ popupEvt?.location || "N/A" }}
          </p>
        </div>
      </section>

      <section class="flex flex-col-reverse gap-8 md:flex-row">
        <div class="w-full md:w-2/3">
          <div class="rounded-2xl bg-white py-6 shadow-sm">
            <div class="divide-core-100 divide-y px-6">
              <section class="hidden pb-4 md:block">
                <h3 class="truncate text-xl font-semibold capitalize">{{ popupEvt?.name }}</h3>
                <div class="mt-2 space-y-3">
                  <p class="flex items-center gap-2 text-sm">
                    <Icon name="calendar" size="20" />
                    {{ formatDate(popupEvt?.start_date || "") }} -
                    {{ formatDate(popupEvt?.end_date || "") }}
                  </p>
                  <p class="flex items-center gap-2 text-sm capitalize">
                    <Icon name="location" size="20" />
                    {{ popupEvt?.location || "N/A" }}
                  </p>
                </div>
              </section>
              <div
                v-for="(value, key) in overviewInfo"
                :key="key"
                class="flex flex-col gap-1 py-3 text-sm"
              >
                <p class="text-core-600 flex-1 font-semibold">{{ startCase(key) }}</p>

                <p v-if="key === 'Terms & Conditions'" class="flex-2 font-medium">
                  <a
                    :href="value"
                    target="_blank"
                    class="text-primary-600 hover:text-primary-800 underline"
                    >View Document</a
                  >
                </p>
                <p v-else class="flex-2 font-medium">{{ value }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="w-full md:w-1/3 md:space-y-8">
          <!-- cost card -->
          <div
            class="bg-primary-25 flex flex-col items-center justify-center rounded-xl border border-gray-200 p-8 md:bg-white!"
          >
            <span class="text-core-700 text-sm">Cost: </span>
            <div class="mb-4 flex items-center gap-3">
              <Icon name="tag" size="20" />
              <h2 class="text-2xl font-bold">
                {{
                  Number(popupEvt?.participant_fee)
                    ? formatCurrency(Number(popupEvt?.participant_fee), { kobo: true })
                    : "Free"
                }}
              </h2>
            </div>

            <AppButton label="Register Now" class="w-full" @click="handleRegister" />
          </div>

          <!-- organizer card -->
          <div
            class="bg-primary-25 hidden flex-col items-center justify-center rounded-xl border border-gray-200 p-8 md:flex"
          >
            <span class="text-core-600 mb-2 text-sm">Organized by: </span>

            <Avatar :name="popupEvt?.company_name" />

            <h2 class="mt-1 text-xl font-semibold capitalize">
              {{ popupEvt?.company_name || "N/A" }}
            </h2>
            <div class="mt-2 flex items-center gap-2 text-sm">
              <Icon name="sms" size="20" />
              {{ popupEvt?.company_email || "N/A" }}
            </div>
            <a :href="`mailto:${popupEvt?.company_email}`" class="w-full">
              <AppButton
                variant="outlined"
                :label="`Contact ${popupEvt?.company_name?.split(' ')[0]}`"
                class="mt-4 w-full capitalize"
              />
            </a>
          </div>
        </div>
      </section>
    </div>

    <!-- organizer card -->
    <div
      class="bg-primary-25 my-8 flex flex-col items-center justify-center rounded-xl border border-gray-200 p-8 md:hidden"
    >
      <span class="text-core-600 mb-2 text-sm">Organized by: </span>

      <Avatar :name="popupEvt?.company_name" />

      <h2 class="mt-1 text-xl font-semibold capitalize">
        {{ popupEvt?.company_name || "N/A" }}
      </h2>
      <div class="mt-2 flex items-center gap-2 text-sm">
        <Icon name="sms" size="20" />
        {{ popupEvt?.company_email || "N/A" }}
      </div>
      <a :href="`mailto:${popupEvt?.company_email}`" class="w-full">
        <AppButton
          variant="outlined"
          :label="`Contact ${popupEvt?.company_name?.split(' ')[0]}`"
          class="mt-4 w-full capitalize"
        />
      </a>
    </div>

    <!--  -->
    <RegisterForEventfulModal
      :event="popupEvt"
      :open="openRegister"
      @close="openRegister = false"
    />

    <ConfirmationModal
      v-model="openConfirmation"
      header="Register for Free Event"
      paragraph="This is a free event. Would you like to proceed with registration?"
      variant="success"
      header-icon="check-circle"
      action-label="Proceed to Register"
      :loading="isPending"
      @update:model-value="openConfirmation = $event"
      @confirm="handleConfirmFreeRegistration"
    />
  </AppSection>
</template>
