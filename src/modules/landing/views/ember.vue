<script setup lang="ts">
import { formatCurrency } from "@/utils/format-currency"
import AppButton from "@components/AppButton.vue"
import AppSection from "@components/AppSection.vue"
import Chip from "@components/Chip.vue"
import TextField from "@components/form/TextField.vue"
import Icon from "@components/Icon.vue"

const shopLinks = [
  { name: "Home", href: "/" },
  { name: "Storefront", href: "/storefront" },
  {
    name: "Privacy Policy",
    href: "https://leyyow.notion.site/Refund-policy-162f3934f3148085a337fc0d3cbffb99?pvs=4",
  },
]
</script>

<template>
  <div class="min-h-screen bg-[#1a1a1a] text-white">
    <!-- Navigation -->
    <header
      class="sticky top-0 z-50 flex h-16 items-center border-b border-gray-200 bg-white md:h-20"
    >
      <AppSection class="flex items-center justify-between gap-3 !py-0">
        <router-link to="/">
          <img src="/company-logo.svg?url" class="h-6 md:h-8" alt="leyyow logo" />
        </router-link>

        <div class="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <div class="hidden items-center gap-2 text-gray-600 sm:flex">
            Powered by <img src="/LYW.svg?url" alt="Leyyow Logo" class="h-5" />
          </div>
          <AppButton label="View Cart" icon="shop" class="text-sm" />
        </div>
      </AppSection>
    </header>

    <!-- Main content -->
    <main>
      <div>
        <!-- Find your Beauty -->
        <AppSection background="bg-black" class="py-8 md:py-16">
          <div class="flex flex-col gap-8 md:gap-16">
            <div class="max-w-2xl">
              <h2 class="text-3xl font-bold md:text-5xl">Find your Beauty</h2>
              <p class="mt-4 text-base text-gray-200 md:text-lg">
                Colorful, calming essentials for skin, space, and self. Colorful, calming essentials
                for skin, space, and self.Colorful, calming essentials for skin, space, and self.
              </p>
              <AppButton label="Shop Now" class="mt-6 w-32 md:w-40" />
            </div>
            <img class="h-[250px] w-full rounded-xl bg-pink-200 md:h-[400px]" />
          </div>
        </AppSection>

        <!-- Featured Products -->
        <AppSection background="" class="py-8 md:py-16">
          <div class="mb-8 flex flex-col gap-4 md:mb-12 md:flex-row md:justify-between">
            <h2 className="text-2xl font-bold md:text-3xl">Featured Products</h2>
            <AppButton
              label="View All Products"
              color="alt"
              icon="arrow-right"
              class="w-max !flex-row-reverse md:self-auto"
            />
          </div>

          <div class="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-6">
            <!-- Product Card -->
            <div
              v-for="v in 5"
              :key="v"
              class="flex flex-col gap-4"
              :class="{ 'col-span-2 sm:row-span-2': v === 1, 'col-span-1': v > 1 }"
            >
              <div
                class="rounded-xl] relative"
                :class="{
                  'h-[200px] sm:h-[320px] md:h-[600px]': v === 1,
                  'h-[180px] sm:h-[255px]': v > 1,
                }"
              >
                <img class="relative mb-4 h-full w-full rounded-xl bg-gray-400" />
                <button
                  class="absolute right-4 bottom-4 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-gray-700 shadow-md md:h-10 md:w-10"
                >
                  <Icon name="shop" />
                </button>
              </div>
              <div>
                <Chip color="purple" icon="tag" label="Home fragrance" />
                <h4
                  class="mb-2 font-semibold"
                  :class="{ 'md:text-xl': v === 1, 'text-sm md:text-base': v > 1 }"
                >
                  Amber Wood Diffuser
                </h4>
                <p class="text-sm md:text-base">{{ formatCurrency(11400) }}</p>
              </div>
            </div>
          </div>

          <div class="mt-8 flex justify-center md:mt-12">
            <AppButton
              label="View All Products"
              color="alt"
              icon="arrow-right"
              class="!flex-row-reverse !rounded-none"
            />
          </div>
        </AppSection>

        <!-- Made with Kindess -->
        <AppSection background="bg-black" class="py-8 md:py-16">
          <div class="flex flex-col gap-8 md:gap-16">
            <div class="max-w-2xl">
              <h2 class="text-3xl font-bold md:text-5xl">Made with Kindess & Color</h2>
              <p class="mt-4 text-base text-gray-200 md:text-lg">
                At Bloom & Co., we believe self-care should feel joyful — not routine. Every product
                is made from gentle ingredients and designed to brighten your day inside and out.
              </p>
            </div>
            <img class="h-[250px] w-full rounded-xl bg-pink-200 md:h-[400px]" />
          </div>
        </AppSection>

        <!-- Give the Gift of Calm -->
        <AppSection background="" class="py-8 md:py-16">
          <div class="flex w-full flex-col-reverse items-center gap-6 md:flex-row md:gap-10">
            <img class="h-[250px] w-full rounded-2xl bg-pink-200 md:h-[448px] md:w-[448px]" />
            <div class="w-full md:w-1/2">
              <h2 class="text-3xl font-bold md:text-5xl">Give the Gift of Calm</h2>
              <p class="mt-4 text-base text-gray-300 md:text-lg">
                Curated self-care sets, perfect for loved ones — or yourself.
              </p>
              <AppButton label="Shop Gift Sets" class="mt-6 md:w-40" />
            </div>
          </div>
        </AppSection>

        <!-- What our Customers are Saying -->
        <AppSection
          background="bg-black"
          class="flex flex-col items-center justify-between py-12 md:flex-row md:py-20"
        >
          <div class="w-full md:w-1/4">
            <h2 className="text-2xl font-bold text-white mb-8 md:text-3xl md:mb-12">
              What Our <br />Customers Say
            </h2>

            <div class="mt-8 flex gap-2 text-gray-700">
              <button
                className="w-10 h-10 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50"
              >
                <Icon name="arrow-left" className="w-5 h-5 text-gray-600" />
              </button>
              <button
                className="w-10 h-10 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50"
              >
                <Icon name="arrow-right" className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div
            className="w-full mt-8 md:w-3/4 md:mt-0 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
          >
            <div v-for="n in 3" :key="n" className="bg-primary-600/80 text-white rounded-lg p-4">
              <p className="text-base md:text-lg mb-4 md:mb-6">
                The scents are divine — my mornings feel brand new!
              </p>
              <div className="flex items-center space-x-3">
                <div
                  className="w-10 h-10 md:w-12 md:h-12 bg-gray-300 rounded-full flex items-center justify-center"
                >
                  <span className="text-gray-600 font-semibold text-sm md:text-base">AE</span>
                </div>
                <div>
                  <p className="font-semibold text-sm md:text-base">Ada E.</p>
                  <p className="text-xs md:text-sm">Lifestyle Blogger</p>
                </div>
              </div>
            </div>
          </div>
        </AppSection>

        <AppSection
          background="bg-primary-500 !rounded-none"
          class="flex flex-col items-center gap-4 py-4 text-white md:flex-row md:gap-6"
        >
          <p class="text-sm md:text-base">Free Shipping on Orders Over ₦30,000:</p>
          <p class="text-sm md:text-base">Enjoy fast delivery and free returns within 7 days.</p>
          <AppButton label="Shop Now" icon="arrow-right" variant="text" class="!text-white" />
        </AppSection>

        <!-- Join the Ember Circle -->
        <AppSection background="bg-black" class="py-8 md:py-16">
          <div class="mx-auto max-w-4xl rounded-xl bg-[#1a1a1a] p-6 md:p-10">
            <img class="h-[150px] w-[150px] rounded-2xl bg-pink-200 md:h-[200px] md:w-[200px]" />
            <div class="mt-6 flex w-full flex-col items-start gap-6 md:flex-row md:gap-10">
              <div class="w-full md:w-1/2">
                <h2 class="text-2xl font-semibold md:text-3xl">Join the Ember Circle</h2>
                <p class="mt-2 text-sm text-gray-300 md:text-base">
                  Get 10% off your first order and updates on new launches.
                </p>
              </div>

              <div class="flex w-full flex-col items-center gap-4 md:flex-row">
                <TextField
                  type="email"
                  placeholder="e.g. adebola99@gmail.com"
                  class="w-full"
                  containerClass="!bg-white"
                />
                <AppButton label="Subscribe Now" class="w-full flex-shrink-0 md:w-max" />
              </div>
            </div>
          </div>
        </AppSection>
      </div>
    </main>

    <footer class="border-t border-gray-900 bg-black py-8 text-white md:py-16">
      <AppSection class="grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-2">
        <div class="flex flex-col gap-3">
          <router-link to="/">
            <img src="/company-logo.svg?url" class="h-6 md:h-8" alt="leyyow logo" />
          </router-link>

          <p class="my-4 md:my-6">Timeless essentials, designed for everyday life.</p>

          <p class="inline-flex items-center gap-2 text-sm md:text-base">
            <Icon name="sms" />
            <a href="mailto:hello@dawnboutique.com">hello@dawnboutique.com</a>
          </p>
          <p class="inline-flex items-center gap-2 text-sm md:text-base">
            <Icon name="call" />
            <a href="tel:+1234567890">+1 (234) 567-890</a>
          </p>
        </div>

        <div class="col-span-1 grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-8">
          <div class="border-l border-gray-300 pl-4">
            <h3 class="mb-4 text-sm font-semibold text-gray-500">Shop</h3>
            <div class="flex flex-col gap-3">
              <a
                v-for="link in shopLinks"
                :key="link.name"
                :href="link.href"
                :target="link.href.startsWith('http') ? '_blank' : undefined"
                class="hover:text-brand-500 text-sm font-medium text-gray-200 hover:underline md:text-base"
              >
                {{ link.name }}
              </a>
            </div>
          </div>

          <div />

          <div class="border-l border-gray-300 pl-4">
            <h3 class="mb-4 text-sm font-semibold text-gray-500">Follow Us</h3>
            <div class="flex gap-4">
              <a>
                <Icon name="global" class="inline-block h-5 w-5" />
              </a>
              <a>
                <Icon name="global" class="inline-block h-5 w-5" />
              </a>
              <a>
                <Icon name="global" class="inline-block h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </AppSection>
    </footer>
  </div>
</template>
