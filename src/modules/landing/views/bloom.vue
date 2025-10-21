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
  <div class="min-h-screen bg-gray-50 text-gray-950">
    <!-- Navigation -->
    <header
      class="sticky top-0 z-50 flex items-center border-b border-gray-200 bg-white py-4 md:h-20"
    >
      <AppSection class="flex items-center justify-between gap-3 !py-0">
        <router-link to="/">
          <img src="/company-logo.svg?url" class="h-8" alt="store logo" />
        </router-link>

        <div class="flex gap-4">
          <div
            class="flex flex-col text-sm text-gray-600 sm:flex-row sm:items-center sm:gap-2 sm:text-base"
          >
            <span> Powered by </span>
            <img src="/LYW.svg?url" alt="Leyyow Logo" class="h-5" />
          </div>
          <AppButton label="View Cart" icon="shop" class="!hidden !bg-pink-600 sm:!inline-flex" />
          <AppButton icon="shop" class="!bg-pink-600 sm:!hidden" size="sm" />
        </div>
      </AppSection>
    </header>

    <!-- Main content -->
    <main>
      <div>
        <!-- Find your Beauty -->
        <AppSection background="bg-[#FFF9FB]" class="py-16 md:py-16">
          <div class="flex flex-col items-center gap-16 md:flex-row md:justify-between md:gap-16">
            <div class="w-full md:w-1/2 md:text-left">
              <h2 class="text-4xl font-bold md:text-5xl">Find your Beauty</h2>
              <p class="mt-4 text-base text-gray-600 md:text-lg">
                Colorful, calming essentials for skin, space, and self. Colorful, calming essentials
                for skin, space, and self.Colorful, calming essentials for skin, space, and
                self.Colorful,
              </p>
              <AppButton label="Shop Now" class="mt-6 w-full !bg-pink-600 md:w-40" />
            </div>
            <div class="flex w-full justify-center md:w-1/2">
              <img
                class="h-[600px] w-full rounded-[200px] bg-pink-200 md:h-[618px] md:w-[418px] md:rounded-[400px]"
              />
            </div>
          </div>
        </AppSection>

        <!-- Featured Products -->
        <AppSection background="bg-white border-t border-gray-200" class="py-8 md:py-16">
          <div class="mb-8 flex flex-col gap-4 md:mb-12 md:flex-row md:justify-between">
            <h2 className="text-3xl font-bold text-center text-gray-900 md:text-4xl md:text-left">
              Featured Products
            </h2>

            <AppButton
              label="View All Products"
              color="alt"
              icon="arrow-right"
              class="mx-auto w-max !flex-row-reverse md:mx-0"
            />
          </div>

          <div class="grid grid-cols-2 gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-10">
            <!-- Product Card -->
            <div
              v-for="v in 6"
              :key="v"
              class="flex flex-col gap-4"
              :class="v < 3 ? 'md:col-span-2 lg:col-span-2' : 'md:col-span-1 lg:col-span-1'"
            >
              <div
                class="relative rounded-xl"
                :class="v < 3 ? 'h-[180px] md:h-[400px]' : 'h-[180px] md:h-[255px]'"
              >
                <img class="relative mb-4 h-full w-full rounded-xl bg-gray-400" />
                <button
                  class="absolute right-4 bottom-4 flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-md md:h-10 md:w-10"
                >
                  <Icon name="shop" />
                </button>
              </div>
              <div>
                <Chip color="purple" icon="tag" label="Home fragrance" />
                <h4 class="mt-2 mb-2 text-sm font-semibold md:text-base">Amber Wood Diffuser</h4>
                <p class="text-sm md:text-base">{{ formatCurrency(11400) }}</p>
              </div>
            </div>
          </div>
        </AppSection>

        <!-- Made with Kindess -->
        <AppSection background="bg-[#E8FFF3]" class="py-8 md:py-16">
          <div class="flex flex-col-reverse items-center gap-8 md:flex-row md:gap-10">
            <div class="w-full md:w-1/2">
              <img class="h-[560px] w-full rounded-full bg-pink-200 md:h-[618px] md:w-[568px]" />
            </div>
            <div class="w-full md:w-1/2 md:text-left">
              <h2 class="text-3xl font-bold md:text-4xl">Made with Kindess</h2>
              <p class="mt-4 text-base text-gray-600 md:text-lg">
                At Bloom & Co., we believe self-care should feel joyful — not routine. Every product
                is made from gentle ingredients and designed to brighten your day inside and out.
              </p>
            </div>
          </div>
        </AppSection>

        <!-- Give the Gift of Calm -->
        <AppSection background="bg-white" class="py-8 md:py-16">
          <div class="flex w-full flex-col items-center gap-8 md:flex-row md:gap-10">
            <div class="w-full md:w-3/5 md:text-left">
              <h2 class="text-3xl font-bold md:text-4xl">Give the Gift of Calm</h2>
              <p class="mt-4 text-base text-gray-600 md:text-lg">
                Curated self-care sets, perfect for loved ones — or yourself.
              </p>
              <AppButton label="Shop Collection" class="mt-6 w-full !bg-pink-600 md:w-40" />
            </div>
            <div class="w-full md:w-2/5">
              <img class="h-[500px] w-full rounded-t-xl rounded-b-full bg-pink-200 md:h-[618px]" />
            </div>
          </div>
        </AppSection>

        <!-- What our Customers are Saying -->
        <AppSection background="bg-white border-t border-gray-200" class="py-12 md:py-20">
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-800 md:mb-12 md:text-5xl">
            What Our Customers Say
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="n in 3"
              :key="n"
              className="flex flex-col items-center rounded-lg border border-gray-200 bg-white p-4 text-center"
            >
              <div
                className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-pink-600 p-1 text-center text-4xl text-white"
              >
                "
              </div>
              <p className="mb-6 text-base text-gray-800 md:text-lg">
                The scents are divine — my mornings feel brand new!
              </p>
              <div className="flex flex-col items-center space-y-2">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-300"
                >
                  <span className="font-semibold text-gray-600">AE</span>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900">Ada E.</p>
                  <p className="text-sm text-gray-500">Lifestyle Blogger</p>
                </div>
              </div>
            </div>
          </div>
        </AppSection>

        <AppSection
          background="bg-[#D86A00]"
          class="flex flex-col items-center gap-4 py-6 text-center text-white md:flex-row md:gap-6 md:py-8 md:text-left"
        >
          <p class="text-sm md:text-base">Free Shipping on Orders Over ₦30,000:</p>
          <p class="text-sm md:text-base">Enjoy fast delivery and free returns within 7 days.</p>
          <AppButton label="Shop Now" icon="arrow-right" variant="text" class="!text-white" />
        </AppSection>

        <!-- Join the Dawn Circle -->
        <AppSection background="bg-white" class="py-8 md:py-16">
          <div class="flex w-full flex-col items-center justify-center gap-8 md:flex-row md:gap-10">
            <div class="w-full md:w-auto">
              <img
                class="mx-auto h-[250px] w-[150px] rounded-t-full rounded-b-full bg-pink-200 md:h-[360px] md:w-[224px]"
              />
            </div>
            <div class="w-full text-center md:text-left">
              <h2 class="text-2xl font-bold md:text-4xl">Join the Dawn Circle</h2>
              <p class="mt-4 text-sm md:text-base">
                Get 10% off your first order and updates on new launches.
              </p>
              <div class="mt-6 flex flex-col items-center gap-4 md:flex-row">
                <TextField type="email" placeholder="e.g. adebola99@gmail.com" class="w-full" />
                <AppButton
                  label="Subscribe Now"
                  class="w-full flex-shrink-0 !bg-pink-600 md:w-max"
                />
              </div>
            </div>
          </div>
        </AppSection>
      </div>
    </main>

    <footer class="bg-gray-800 py-8 text-white md:py-16">
      <AppSection class="grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-2">
        <div class="flex flex-col gap-3">
          <router-link to="/" class="flex justify-center lg:justify-start">
            <img src="/company-logo.svg?url" class="h-6 md:h-8" alt="leyyow logo" />
          </router-link>

          <p class="my-4 text-sm md:my-6 md:text-base">
            Timeless essentials, designed for everyday life.
          </p>

          <p class="inline-flex items-center gap-2 text-sm md:text-base lg:justify-start">
            <Icon name="sms" />
            <a href="mailto:hello@dawnboutique.com">hello@dawnboutique.com</a>
          </p>
          <p class="inline-flex items-center gap-2 text-sm md:text-base lg:justify-start">
            <Icon name="call" />
            <a href="tel:+1234567890">+1 (234) 567-890</a>
          </p>
        </div>

        <div class="col-span-1 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
          <div class="border-l border-gray-300 pl-4 md:text-left">
            <h3 class="mb-4 text-sm font-semibold text-gray-500">Shop</h3>
            <div class="flex flex-col gap-3">
              <a
                v-for="link in shopLinks"
                :key="link.name"
                :href="link.href"
                :target="link.href.startsWith('http') ? '_blank' : undefined"
                class="hover:text-brand-500 font-medium text-gray-200 hover:underline"
              >
                {{ link.name }}
              </a>
            </div>
          </div>

          <div class="hidden md:block" />

          <div class="border-l border-gray-300 pl-4">
            <h3 class="mb-4 text-sm font-semibold text-gray-500">Follow Us</h3>
            <div class="flex gap-4 md:justify-start">
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
