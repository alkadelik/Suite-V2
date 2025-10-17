<script setup lang="ts">
import { formatCurrency } from "@/utils/format-currency"
import AppButton from "@components/AppButton.vue"
import AppSection from "@components/AppSection.vue"
import Chip from "@components/Chip.vue"
import TextField from "@components/form/TextField.vue"
import Icon from "@components/Icon.vue"
</script>

<template>
  <div>
    <!-- Find your Beauty -->
    <AppSection background="bg-white" class="py-16">
      <div class="flex items-center gap-16">
        <div class="w-1/2">
          <h2 class="text-4xl font-bold">Find your Beauty</h2>
          <p class="mt-4">
            Colorful, calming essentials for skin, space, and self. Colorful, calming essentials for
            skin, space, and self.Colorful, calming essentials for skin, space, and self.Colorful,
          </p>
          <AppButton label="Shop Now" class="mt-6 !bg-gray-600" />
        </div>
        <img class="h-[618px] w-1/2 rounded-t-full rounded-b-xl bg-pink-200" />
      </div>
    </AppSection>

    <!-- Featured Products -->
    <AppSection background="bg-gray-200" class="py-16">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Featured Products</h2>

      <div class="grid grid-cols-4 gap-6">
        <!-- Product Card -->
        <div v-for="v in 8" :key="v" class="flex flex-col gap-4">
          <div class="relative h-[180px] rounded-xl sm:h-[255px]">
            <img class="relative mb-4 h-full w-full rounded-xl bg-gray-400" />
            <button
              class="absolute right-4 bottom-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-md"
            >
              <Icon name="shop" />
            </button>
          </div>
          <div>
            <Chip color="purple" icon="tag" label="Home fragrance" />
            <h4 class="mb-2 font-semibold">Amber Wood Diffuser</h4>
            <p>{{ formatCurrency(11400) }}</p>
          </div>
        </div>
      </div>
    </AppSection>

    <!-- Made with Kindess -->
    <AppSection background="bg-[#F7F3EE]" class="py-16">
      <div class="flex items-center gap-10">
        <img class="h-[618px] w-[568px] rounded-t-xl rounded-b-full bg-pink-200" />
        <div>
          <h2 class="text-4xl font-bold">Made with Kindess</h2>
          <p class="mt-4">
            At Bloom & Co., we believe self-care should feel joyful — not routine. Every product is
            made from gentle ingredients and designed to brighten your day inside and out.
          </p>
        </div>
      </div>
    </AppSection>

    <!-- Give the Gift of Calm -->
    <AppSection background="bg-white" class="py-16">
      <div class="flex w-full items-center gap-10">
        <div class="w-3/5">
          <h2 class="text-4xl font-bold">Give the Gift of Calm</h2>
          <p class="mt-4">Get 10% off your first order and updates on new launches.</p>
          <AppButton label="Shop Gift Sets" class="mt-6 !bg-gray-600" />
        </div>
        <img class="h-[618px] w-2/5 rounded-t-full rounded-b-xl bg-pink-200" />
      </div>
    </AppSection>

    <!-- What our Customers are Saying -->
    <AppSection background="bg-gray-200" class="py-16">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">What Our Customers Say</h2>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8 relative">
          <div className="text-6xl text-gray-900 mb-4 text-center">"</div>
          <p className="text-center text-gray-700 text-lg mb-6">
            The scents are divine — my mornings feel brand new!
          </p>
          <div className="flex items-center justify-center space-x-3">
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-semibold">AE</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Ada E.</p>
              <p className="text-sm text-gray-500">Lifestyle Blogger</p>
            </div>
          </div>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50"
          >
            <Icon name="arrow-left" className="w-5 h-5 text-gray-600" />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50"
          >
            <Icon name="arrow-right" className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </AppSection>

    <AppSection background="bg-gray-600" class="flex items-center gap-6 py-8 text-white">
      <p>Free Shipping on Orders Over ₦30,000:</p>
      <p>Enjoy fast delivery and free returns within 7 days.</p>
      <AppButton label="Shop Now" icon="arrow-right" variant="text" class="!text-white" />
    </AppSection>

    <!-- Join the Dawn Circle -->
    <AppSection background="bg-[#F7F3EE]" class="py-16">
      <div class="mx-auto max-w-4xl rounded-xl bg-white p-10">
        <div class="flex items-center gap-10">
          <img class="h-[224px] w-[224px] rounded-t-full rounded-b-xl bg-pink-200" />
          <div>
            <h2 class="text-4xl font-bold">Join the Dawn Circle</h2>
            <p class="mt-4">Get 10% off your first order and updates on new launches.</p>
          </div>
        </div>

        <div class="mt-6 flex items-center gap-4">
          <TextField type="email" placeholder="e.g. adebola99@gmail.com" class="w-full" />
          <AppButton label="Subscribe Now" class="w-max flex-shrink-0 !bg-gray-600" />
        </div>
      </div>
    </AppSection>
  </div>
</template>
