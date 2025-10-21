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
  <div class="min-h-screen bg-white">
    <!-- Navigation -->
    <header
      class="sticky top-0 z-50 flex h-16 items-center border-b border-gray-200 bg-white md:h-20"
    >
      <AppSection class="flex items-center justify-between gap-3 !py-0">
        <router-link to="/">
          <img src="/company-logo.svg?url" class="h-6 md:h-8" alt="leyyow logo" />
        </router-link>

        <div class="flex flex-col items-end gap-2 md:flex-row md:gap-4">
          <div class="hidden items-center gap-2 text-gray-600 md:flex">
            Powered by <img src="/LYW.svg?url" alt="Leyyow Logo" class="h-5" />
          </div>
          <AppButton
            label="View Cart"
            icon="shop"
            class="!rounded-full !bg-gray-700 text-sm md:text-base"
          />
        </div>
      </AppSection>
    </header>

    <!-- Main content -->
    <main>
      <div class="px-4 py-4 md:px-12">
        <!-- Find your Beauty -->
        <AppSection background="bg-pink-200 rounded-2xl" class="py-8 md:py-16">
          <div
            class="flex min-h-[400px] items-center gap-8 rounded-2xl bg-pink-200 p-4 md:h-[600px] md:gap-16 md:p-0"
          >
            <div class="w-full max-w-xl rounded-2xl bg-white p-4 md:p-6">
              <h2 class="text-2xl font-bold md:text-4xl">Find your Beauty</h2>
              <p class="mt-4 text-base text-gray-700 md:text-lg">
                Colorful, calming essentials for skin, space, and self. Colorful, calming essentials
                for skin, space, and self.Colorful, calming essentials for skin, space, and self.
              </p>
              <AppButton label="Shop Now" class="mt-6 w-32 !rounded-full !bg-gray-700 md:w-40" />
            </div>
          </div>
        </AppSection>

        <!-- Featured Products -->
        <AppSection background="bg-white" class="flex flex-col py-8 md:flex-row md:py-16">
          <div class="mb-8 text-center md:mb-0 md:w-1/4 md:text-left">
            <h2 className="mb-6 text-2xl font-bold text-gray-900 md:mb-12 md:text-3xl">
              Featured <br class="hidden md:block" />
              Products
            </h2>

            <AppButton
              label="View All Products"
              color="alt"
              icon="arrow-right"
              class="!flex-row-reverse !rounded-full"
            />

            <div class="mt-6 flex justify-center gap-2 md:mt-8 md:justify-start">
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-200 bg-white hover:bg-gray-50"
              >
                <Icon name="arrow-left" className="h-5 w-5 text-gray-600" />
              </button>
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-200 bg-white hover:bg-gray-50"
              >
                <Icon name="arrow-right" className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div class="grid w-full grid-cols-1 gap-6 md:w-3/4 md:grid-cols-3">
            <!-- Product Card -->
            <div v-for="v in 3" :key="v" class="flex flex-col gap-4">
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
        <AppSection background="bg-pink-200 rounded-2xl" class="py-8 md:py-16">
          <div
            class="flex min-h-[300px] items-center justify-center gap-8 rounded-2xl bg-pink-200 p-4 md:h-[448px] md:justify-end md:gap-16 md:p-0"
          >
            <div class="w-full max-w-xl rounded-2xl bg-white p-6 md:p-10">
              <h2 class="text-2xl font-bold md:text-4xl">Made with Kindess</h2>
              <p class="mt-4 text-base text-gray-700 md:text-lg">
                At Bloom & Co., we believe self-care should feel joyful — not routine. Every product
                is made from gentle ingredients and designed to brighten your day inside and out.
              </p>
            </div>
          </div>
        </AppSection>

        <!-- Give the Gift of Calm -->
        <AppSection background="bg-pink-200 rounded-2xl mt-8" class="py-8 md:py-16">
          <div
            class="flex min-h-[300px] items-center justify-center gap-8 rounded-2xl bg-pink-200 p-4 md:h-[448px] md:gap-16 md:p-0"
          >
            <div class="w-full max-w-xl rounded-2xl bg-white p-6 md:p-10">
              <h2 class="text-2xl font-bold md:text-4xl">Give the Gift of Calm</h2>
              <p class="mt-4 text-base text-gray-700 md:text-lg">
                Curated self-care sets, perfect for loved ones — or yourself.
              </p>
              <AppButton label="Shop Now" class="mt-6 w-32 !rounded-full !bg-gray-700 md:w-40" />
            </div>
          </div>
        </AppSection>

        <!-- What our Customers are Saying -->
        <AppSection background="bg-white" class="py-8 md:py-10">
          <h2 className="mb-8 text-center text-2xl font-bold text-primary-900 md:mb-12 md:text-4xl">
            What Our Customers Say
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div v-for="n in 6" :key="n" className="rounded-lg bg-primary-50 p-4">
              <p className="mb-6 text-base text-primary-800 md:text-lg">
                The scents are divine — my mornings feel brand new!
              </p>
              <div className="flex items-center space-x-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-300"
                >
                  <span className="font-semibold text-gray-600">AE</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Ada E.</p>
                  <p className="text-sm text-gray-500">Lifestyle Blogger</p>
                </div>
              </div>
            </div>
          </div>
        </AppSection>

        <AppSection
          background="bg-[#85684E] !rounded-2xl"
          class="flex flex-col items-center gap-4 py-4 text-white md:flex-row md:gap-6"
        >
          <p class="text-center text-sm md:text-left md:text-base">
            Free Shipping on Orders Over ₦30,000:
          </p>
          <p class="text-center text-sm md:text-left md:text-base">
            Enjoy fast delivery and free returns within 7 days.
          </p>
          <AppButton label="Shop Now" icon="arrow-right" variant="text" class="!text-white" />
        </AppSection>

        <!-- Join the Grace Circle -->
        <AppSection
          background="bg-gradient-to-r from-pink-400 via-white to-white rounded-2xl mt-8"
          class="py-8 md:py-16"
        >
          <div
            class="flex min-h-[300px] items-center justify-center gap-8 rounded-2xl p-4 md:h-[448px] md:justify-end md:gap-16 md:p-0"
          >
            <div class="w-full max-w-xl rounded-2xl bg-white p-6 md:p-10">
              <h2 class="text-2xl font-bold md:text-4xl">Join the Grace Circle</h2>
              <p class="mt-4 text-base text-gray-700 md:text-lg">
                Curated self-care sets, perfect for loved ones — or yourself.
              </p>
              <div class="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:gap-4">
                <TextField
                  type="email"
                  placeholder="e.g. adebola99@gmail.com"
                  class="w-full"
                  containerClass="!rounded-full"
                />
                <AppButton
                  label="Subscribe Now"
                  class="w-full flex-shrink-0 !rounded-full !bg-gray-700 md:w-max"
                />
              </div>
            </div>
          </div>
        </AppSection>
      </div>
    </main>

    <footer class="bg-primary-50 py-8 md:py-16">
      <AppSection class="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <div class="flex flex-col gap-3">
          <router-link to="/">
            <img src="/company-logo.svg?url" class="h-6 md:h-8" alt="leyyow logo" />
          </router-link>

          <p class="my-6">Timeless essentials, designed for everyday life.</p>

          <p class="inline-flex items-center gap-2">
            <Icon name="sms" />
            <a href="mailto:hello@dawnboutique.com">hello@dawnboutique.com</a>
          </p>
          <p class="inline-flex items-center gap-2">
            <Icon name="call" />
            <a href="tel:+1234567890">+1 (234) 567-890</a>
          </p>
        </div>

        <div class="col-span-1 grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div class="border-l border-gray-300 pl-4">
            <h3 class="mb-4 text-sm font-semibold text-gray-500">Shop</h3>
            <div class="flex flex-col gap-3">
              <a
                v-for="link in shopLinks"
                :key="link.name"
                :href="link.href"
                :target="link.href.startsWith('http') ? '_blank' : undefined"
                class="hover:text-brand-500 font-medium hover:underline"
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
