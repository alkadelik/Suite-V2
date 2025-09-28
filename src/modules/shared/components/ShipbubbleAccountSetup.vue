<template>
  <div
    class="!font-manrope fixed top-0 left-0 flex h-screen w-full flex-col items-center py-0 md:justify-around md:bg-gray-50 md:py-16"
    :class="currentStep === 3 ? 'justify-center bg-white' : 'justify-start bg-white'"
  >
    <button
      class="bg-primary-25 border-primary-300 absolute top-0 left-0 flex w-full items-center justify-center border-b py-2 text-white"
      @click="backToLeyyow"
    >
      <div class="flex items-center gap-2">
        <Icon name="arrow-narrow-left" size="20" class="text-primary-700" />
        <p class="text-primary-700 !font-sans text-sm md:text-sm">Return to Leyyow</p>
      </div>
    </button>

    <img
      v-if="currentStep === 1 || currentStep === 2"
      src="/images/shipbubble-logo-big.png"
      alt="shipbubble logo"
      class="hidden h-16 py-4 md:block"
    />

    <div
      :class="[
        'w-full max-w-2xl rounded-xl bg-white md:px-6 md:py-10 md:shadow-lg',
        currentStep === 3 ? 'h-auto' : 'max-h-2xl h-auto flex-1 md:flex-auto',
      ]"
    >
      <div
        v-if="currentStep === 1 || currentStep === 2"
        class="z-50 flex h-full w-full flex-col overflow-y-auto rounded-xl text-black"
      >
        <div class="mt-10 flex min-h-0 flex-1 flex-col py-3 md:mt-0">
          <div class="flex flex-col items-center justify-center gap-3 px-5 pt-3 text-center">
            <img
              src="/images/shipbubble-logo-big.png"
              alt="shipbubble logo"
              class="mb-2 block h-8 md:hidden"
            />

            <div class="mb-2 rounded-full bg-black/10 p-2 text-sm font-semibold">
              Step {{ currentStep }} / 2
            </div>

            <h3 v-if="currentStep === 1" class="text-2xl font-bold">Create Shipping Account</h3>
            <h3 v-else class="text-2xl font-bold">Select Preferred Couriers</h3>
            <p class="text-sm">Please Select your preferred delivery provider.</p>
          </div>

          <!-- step 1 -->
          <form
            v-show="currentStep === 1"
            class="mt-4 flex flex-1 flex-col gap-4 px-5"
            @submit.prevent="handleAuthSubmit"
          >
            <div>
              <label for="business_name" class="text-sm font-semibold">Business Name</label
              ><span class="text-red-500">*</span>
              <input
                v-model="authForm.business_name"
                type="text"
                name="business_name"
                placeholder="e.g solesnshades, smile socks"
                class="w-full rounded-md border border-[#D7D5D5] px-2 py-3 text-sm placeholder:text-sm placeholder:text-black/60 focus:border-black/60 focus:outline-none"
              />
            </div>

            <div>
              <label for="email" class="text-sm font-semibold">Business Email</label
              ><span class="text-red-500">*</span>
              <input
                v-model="authForm.email"
                type="text"
                name="email"
                placeholder="e.g solesnshades, smile socks"
                class="w-full rounded-md border border-[#D7D5D5] px-2 py-3 text-sm placeholder:text-sm placeholder:text-black/60 focus:border-black/60 focus:outline-none"
              />
            </div>

            <div>
              <label for="phone" class="text-sm font-semibold">Phone Number</label
              ><span class="text-red-500">*</span>
              <input
                v-model="authForm.phone"
                type="text"
                name="phone"
                placeholder="e.g 09039336005"
                class="w-full rounded-md border border-[#D7D5D5] px-2 py-3 text-sm placeholder:text-sm placeholder:text-black/60 focus:border-black/60 focus:outline-none"
              />
            </div>

            <div>
              <label for="password" class="text-sm font-semibold">Password</label
              ><span class="text-red-500">*</span>
              <input
                v-model="authForm.password"
                type="password"
                name="password"
                placeholder="e.g solesnshades, smile socks"
                class="w-full rounded-md border border-[#D7D5D5] px-2 py-3 text-sm placeholder:text-sm placeholder:text-black/60 focus:border-black/60 focus:outline-none"
              />
            </div>

            <div>
              <label for="address" class="text-sm font-semibold">Store Address</label
              ><span class="text-red-500">*</span>
              <GooglePlacesAutoComplete
                v-model="authForm.address"
                direction="up"
                class="!bg-white"
              />
            </div>

            <AppButton
              label="Next"
              type="submit"
              :disabled="!authFormIsValid"
              :loading="loading"
              class="mt-4 !bg-[#D93855]"
            />
          </form>

          <!-- step 2 -->
          <div v-show="currentStep === 2" class="flex min-h-0 flex-1 flex-col">
            <!-- middle section -->
            <div class="mt-3 flex min-h-0 flex-1 flex-col bg-[#FAFAFA] px-5 py-3 md:bg-white">
              <div class="flex justify-end">
                <div
                  class="inline-flex items-center rounded-full px-2 py-1 text-[12.5px] font-semibold"
                  :class="
                    selectedOptions?.length
                      ? 'bg-black/20 text-black'
                      : 'bg-[#F44336]/20 text-[#F44336]'
                  "
                >
                  <p>{{ selectedOptions?.length }} Selected</p>
                </div>
              </div>

              <div class="mt-3">
                <input
                  v-model="searchQuery"
                  type="text"
                  name="search"
                  placeholder="Search couriers"
                  class="w-full rounded-md border-2 border-gray-200 px-2 py-3 text-sm placeholder:text-sm placeholder:text-black/60 focus:border-black/60 focus:outline-none"
                />
              </div>

              <!-- scrollable list -->
              <div class="no-scrollbar mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto">
                <div v-if="isGettingCouriers" class="flex items-center justify-center">
                  <LoadingIcon icon-class="text-black h-6 w-6" />
                </div>
                <div
                  v-for="option in filteredOptions"
                  v-else
                  :key="option.id"
                  class="overflow-hidden rounded-lg border border-gray-200 transition-all"
                >
                  <div
                    class="cursor-pointer p-4"
                    :class="isSelected(option.id) ? 'bg-tigersEye/5 rounded-t-md' : 'rounded-md'"
                  >
                    <Checkbox
                      :model-value="isSelected(option.id)"
                      class="flex justify-between space-x-3"
                      check-position="right"
                      check-color="#000"
                      size="14"
                      @update:model-value="(val: boolean) => toggleOption(option.id, val)"
                    >
                      <template #default>
                        <div class="flex">
                          <img
                            :src="option.pin_image"
                            alt="courier logo"
                            class="h-11 w-10 rounded-md border border-gray-200 object-cover"
                          />

                          <div class="ms-2 flex flex-1 flex-col justify-between">
                            <p class="text-sm font-bold text-black">{{ option.name }}</p>
                            <div class="relative flex items-center text-[#838383]">
                              <Icon name="star-outline" class="relative bottom-0.5" />
                              <p class="ms-0.5 text-[12.5px]">4.3</p>
                              <p class="ms-1 text-[12.5px]">(100 reviews)</p>
                              <Icon name="courier-motorcycle" class="ms-10" />
                              <p class="ms-1.5 text-[12.5px]">Good</p>
                            </div>
                          </div>
                        </div>
                      </template>
                    </Checkbox>
                  </div>
                </div>
              </div>
            </div>

            <!-- footer pinned -->
            <div class="px-5 py-3">
              <AppButton
                label="Complete Setup"
                type="button"
                :disabled="!selectedOptions?.length"
                :loading="loading"
                class="mt-4 w-full !bg-[#D93855]"
                @click="handleCouriersSubmit"
              />
            </div>
          </div>
        </div>
      </div>
      <div
        v-else
        class="z-50 flex h-full w-full items-center justify-center overflow-y-auto bg-white px-10 text-black"
      >
        <div class="flex flex-col items-center justify-center gap-3 text-center">
          <img src="../../../assets/icons/confetti.svg" alt="confetti" />
          <div>
            <h2 class="mt-2 text-lg font-semibold">Setup Complete!</h2>
            <p class="text-sm">Returning to Leyyow...</p>
          </div>
          <div class="flex items-center gap-1">
            <div
              class="flex h-14 w-14 items-center justify-center rounded-3xl border-4 border-solid border-[#f7d7dd] bg-[#D93855] p-3.5"
            >
              <img
                src="/images/shipbubble-s.png"
                class="brightness-0 invert"
                alt="shipbubble logo"
              />
            </div>
            <img src="/images/shipbubble-arrow.png" alt="red arrow" />
            <div class="h-14 w-14 rounded-3xl border-4 border-solid border-[#FEAA0033]">
              <img
                :src="leyyowIcon"
                class="h-full w-full rounded-[1.25rem] object-cover"
                alt="leyyow icon"
              />
            </div>
          </div>
          <div class="flex items-center justify-center">
            <!-- <LoadingIcon icon-class="text-black h-6 w-6" /> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from "vue"
import AppButton from "@components/AppButton.vue"
import Checkbox from "@components/form/Checkbox.vue"
import Icon from "@components/Icon.vue"
import LoadingIcon from "@components/LoadingIcon.vue"
import GooglePlacesAutoComplete from "@/components/GooglePlacesAutocomplete.vue"
import leyyowIcon from "/images/logos/leyyow-icon.svg"
import { useGetCouriers } from "../api"

interface AuthForm {
  business_name: string
  email: string
  phone: string
  password: string
  address: string
}

interface Props {
  authForm?: AuthForm
  courierOptions?: number[]
  currentStep?: number
  loading?: boolean
  hasNoShippingProfile?: boolean
}

const emit = defineEmits([
  "close",
  "update:authForm",
  "update:courierOptions",
  "submitAuthForm",
  "submitCouriers",
])

const props = withDefaults(defineProps<Props>(), {
  authForm: () => ({
    business_name: "",
    email: "",
    phone: "",
    password: "",
    address: "",
  }),
  courierOptions: () => [],
  currentStep: 1,
  loading: false,
  hasNoShippingProfile: false,
})

const searchQuery = ref("")
const { data: shippingOptions, isPending: isGettingCouriers } = useGetCouriers()

const authForm = computed({
  get: () => props.authForm,
  set: (val) => emit("update:authForm", val),
})

const authFormIsValid = computed(
  () =>
    authForm.value.business_name !== "" &&
    authForm.value.email !== "" &&
    authForm.value.password !== "" &&
    authForm.value.address !== "" &&
    authForm.value.phone !== "",
)

const handleAuthSubmit = () => {
  emit("submitAuthForm")
}

const backToLeyyow = () => {
  emit("close")
}

const filteredOptions = computed(() => {
  const options = Array.isArray(shippingOptions.value) ? shippingOptions.value : []

  // Filter out null/undefined values and ensure required properties exist
  const validOptions = options.filter(
    (option) => option && option.id && option.name && option.pin_image,
  )

  if (searchQuery.value === "") return validOptions

  return validOptions.filter((v) => v.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

const selectedOptions = computed({
  get: () => props.courierOptions,
  set: (val) => emit("update:courierOptions", val),
})

const toggleOption = (value: string, checked: boolean) => {
  if (checked) {
    if (!selectedOptions.value.includes(+value)) {
      selectedOptions.value.push(+value)
    }
  } else {
    selectedOptions.value = selectedOptions.value.filter((v) => v !== +value)
  }
}

const isSelected = (value: string) => selectedOptions.value.includes(+value)

const handleCouriersSubmit = () => {
  emit("submitCouriers", selectedOptions.value)
}
</script>

<style scoped>
h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: var(--font-manrope) !important;
}
</style>
