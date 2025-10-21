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
  <div class="min-h-screen bg-gray-50">
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
          <AppButton
            label="View Cart"
            icon="shop"
            class="!bg-primary-900 !hidden sm:!inline-flex"
          />
          <AppButton icon="shop" class="!bg-primary-900 sm:!hidden" size="sm" />
        </div>
      </AppSection>
    </header>

    <!-- Main content -->
    <main>
      <div>
        <!-- Find your Beauty -->
        <AppSection background="bg-primary-50" class="py-8 md:py-16">
          <div class="flex flex-col items-center gap-8 text-center md:gap-16">
            <div class="max-w-2xl">
              <h2 class="text-3xl font-bold md:text-5xl">Find your Beauty</h2>
              <p class="text-primary-700 mt-4 text-base md:text-lg">
                Colorful, calming essentials for skin, space, and self. Colorful, calming essentials
                for skin, space, and self.Colorful, calming essentials for skin, space, and self.
              </p>
              <AppButton label="Shop Now" class="!bg-primary-900 mt-6 w-40 !rounded-none" />
            </div>
            <img class="h-[250px] w-full rounded-xl bg-pink-200 md:h-[400px]" />
          </div>
        </AppSection>

        <!-- Featured Products -->
        <AppSection background="bg-white" class="py-8 md:py-16">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900 md:mb-12 md:text-3xl">
            Featured Products
          </h2>

          <div class="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            <!-- Product Card -->
            <div v-for="v in 4" :key="v" class="flex flex-col gap-4">
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
        <AppSection background="bg-primary-50" class="py-8 md:py-16">
          <div class="flex flex-col items-center gap-6 md:flex-row md:gap-10">
            <img class="h-[250px] w-full rounded-xl bg-pink-200 md:h-[448px] md:w-1/2" />
            <div class="text-center md:w-1/2 md:text-left">
              <h2 class="text-3xl font-bold md:text-5xl">Made with Kindess</h2>
              <p class="text-primary-700 mt-4 text-base md:text-lg">
                At Bloom & Co., we believe self-care should feel joyful — not routine. Every product
                is made from gentle ingredients and designed to brighten your day inside and out.
              </p>
            </div>
          </div>
        </AppSection>

        <!-- Give the Gift of Calm -->
        <AppSection background="bg-primary-50" class="py-8 md:py-16">
          <div class="flex w-full flex-col items-center gap-6 md:flex-row md:gap-10">
            <div class="text-center md:w-1/2 md:text-left">
              <h2 class="text-3xl font-bold md:text-5xl">Give the Gift of Calm</h2>
              <p class="text-primary-700 mt-4 text-base md:text-lg">
                Curated self-care sets, perfect for loved ones — or yourself.
              </p>
              <AppButton label="Shop Gift Sets" class="!bg-primary-900 mt-6 !rounded-none" />
            </div>
            <img class="h-[250px] w-[250px] rounded-full bg-pink-200 md:h-[448px] md:w-[448px]" />
          </div>
        </AppSection>

        <!-- What our Customers are Saying -->
        <AppSection background="bg-white" class="py-8 md:py-10">
          <h2 className="mb-8 text-center text-3xl font-bold text-primary-900 md:mb-12 md:text-5xl">
            What Our Customers Say
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div v-for="n in 3" :key="n" className="rounded-lg bg-primary-50 p-4">
              <div
                className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary-900 p-1 text-center text-4xl text-white"
              >
                "
              </div>
              <p className="mb-6 text-lg text-primary-800">
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

          <div class="mt-8 flex justify-center gap-2">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-gray-200 bg-white hover:bg-gray-50"
            >
              <Icon name="arrow-left" className="h-5 w-5 text-gray-600" />
            </button>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-gray-200 bg-white hover:bg-gray-50"
            >
              <Icon name="arrow-right" className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </AppSection>

        <AppSection
          background="bg-[#85684E] !rounded-none"
          class="flex flex-col items-center gap-4 py-4 text-white md:flex-row md:gap-6"
        >
          <p class="text-center md:text-left">Free Shipping on Orders Over ₦30,000:</p>
          <p class="text-center md:text-left">
            Enjoy fast delivery and free returns within 7 days.
          </p>
          <AppButton label="Shop Now" icon="arrow-right" variant="text" class="!text-white" />
        </AppSection>

        <!-- Join the Dawn Circle -->
        <AppSection background="bg-primary-50" class="py-8 md:py-16">
          <div class="mx-auto max-w-4xl rounded-xl bg-white p-6 md:p-10">
            <div class="flex flex-col items-center gap-6 md:gap-10">
              <img class="h-[150px] w-[150px] rounded-full bg-pink-200 md:h-[224px] md:w-[224px]" />
              <div class="text-center">
                <h2 class="text-3xl font-bold md:text-5xl">Join the Heritage Circle</h2>
                <p class="text-primary-700 mt-4 text-base md:text-lg">
                  Get 10% off your first order and updates on new launches.
                </p>
              </div>
            </div>

            <div class="mt-6 flex flex-col items-center gap-4 md:flex-row">
              <TextField
                type="email"
                placeholder="e.g. adebola99@gmail.com"
                class="w-full"
                containerClass="!rounded-none"
              />
              <AppButton
                label="Subscribe Now"
                class="!bg-primary-900 w-full flex-shrink-0 !rounded-none md:w-max"
              />
            </div>
          </div>
        </AppSection>
      </div>
    </main>

    <footer class="bg-primary-900 py-8 text-white md:py-16">
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
                class="hover:text-brand-500 font-medium text-gray-200 hover:underline"
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
