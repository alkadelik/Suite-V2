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
      class="sticky top-0 z-50 flex h-16 items-center border-b border-gray-200 bg-white md:h-20"
    >
      <AppSection class="flex items-center justify-between gap-3 !py-0">
        <router-link to="/">
          <img src="/company-logo.svg?url" class="h-6 md:h-8" alt="leyyow logo" />
        </router-link>

        <div class="flex gap-4">
          <div class="flex items-center gap-2 text-gray-600">
            Powered by <img src="/LYW.svg?url" alt="Leyyow Logo" class="h-5" />
          </div>
          <AppButton label="View Cart" icon="shop" class="!bg-primary-900 !rounded-none" />
        </div>
      </AppSection>
    </header>

    <!-- Main content -->
    <main>
      <div>
        <!-- Find your Beauty -->
        <AppSection background="bg-primary-50" class="py-16">
          <div class="flex flex-col items-center gap-16 text-center">
            <div class="max-w-2xl">
              <h2 class="text-5xl font-bold">Find your Beauty</h2>
              <p class="text-primary-700 mt-4 text-lg">
                Colorful, calming essentials for skin, space, and self. Colorful, calming essentials
                for skin, space, and self.Colorful, calming essentials for skin, space, and self.
              </p>
              <AppButton label="Shop Now" class="!bg-primary-900 mt-6 w-40 !rounded-none" />
            </div>
            <img class="h-[400px] w-full rounded-xl bg-pink-200" />
          </div>
        </AppSection>

        <!-- Featured Products -->
        <AppSection background="bg-white" class="py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Featured Products</h2>

          <div class="grid grid-cols-4 gap-6">
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

          <div class="mt-12 flex justify-center">
            <AppButton
              label="View All Products"
              color="alt"
              icon="arrow-right"
              class="!flex-row-reverse !rounded-none"
            />
          </div>
        </AppSection>

        <!-- Made with Kindess -->
        <AppSection background="bg-primary-50" class="py-16">
          <div class="flex items-center gap-10">
            <img class="h-[448px] w-1/2 rounded-xl bg-pink-200" />
            <div class="w-1/2">
              <h2 class="text-5xl font-bold">Made with Kindess</h2>
              <p class="text-primary-700 mt-4 text-lg">
                At Bloom & Co., we believe self-care should feel joyful — not routine. Every product
                is made from gentle ingredients and designed to brighten your day inside and out.
              </p>
            </div>
          </div>
        </AppSection>

        <!-- Give the Gift of Calm -->
        <AppSection background="bg-primary-50" class="py-16">
          <div class="flex w-full items-center gap-10">
            <div class="w-1/2">
              <h2 class="text-5xl font-bold">Give the Gift of Calm</h2>
              <p class="text-primary-700 mt-4 text-lg">
                Curated self-care sets, perfect for loved ones — or yourself.
              </p>
              <AppButton label="Shop Gift Sets" class="!bg-primary-900 mt-6 !rounded-none" />
            </div>
            <img class="h-[448px] w-[448px] rounded-full bg-pink-200" />
          </div>
        </AppSection>

        <!-- What our Customers are Saying -->
        <AppSection background="bg-white" class="py-10">
          <h2 className="text-5xl font-bold text-center text-primary-900 mb-12">
            What Our Customers Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div v-for="n in 3" :key="n" className="bg-primary-50 rounded-lg  p-4">
              <div
                className="text-4xl h-11 w-11 flex items-center justify-center rounded-full text-white mb-4 text-center p-1 bg-primary-900"
              >
                "
              </div>
              <p className="text-primary-800 text-lg mb-6">
                The scents are divine — my mornings feel brand new!
              </p>
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center"
                >
                  <span className="text-gray-600 font-semibold">AE</span>
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
              className="w-10 h-10 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50"
            >
              <Icon name="arrow-left" className="w-5 h-5 text-gray-600" />
            </button>
            <button
              className="w-10 h-10 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50"
            >
              <Icon name="arrow-right" className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </AppSection>

        <AppSection
          background="bg-[#85684E] !rounded-none"
          class="flex items-center gap-6 py-4 text-white"
        >
          <p>Free Shipping on Orders Over ₦30,000:</p>
          <p>Enjoy fast delivery and free returns within 7 days.</p>
          <AppButton label="Shop Now" icon="arrow-right" variant="text" class="!text-white" />
        </AppSection>

        <!-- Join the Dawn Circle -->
        <AppSection background="bg-primary-50" class="py-16">
          <div class="mx-auto max-w-4xl rounded-xl bg-white p-10">
            <div class="flex flex-col items-center gap-10">
              <img class="h-[224px] w-[224px] rounded-full bg-pink-200" />
              <div class="text-center">
                <h2 class="text-5xl font-bold">Join the Heritage Circle</h2>
                <p class="text-primary-700 mt-4 text-lg">
                  Get 10% off your first order and updates on new launches.
                </p>
              </div>
            </div>

            <div class="mt-6 flex items-center gap-4">
              <TextField
                type="email"
                placeholder="e.g. adebola99@gmail.com"
                class="w-full"
                containerClass="!rounded-none"
              />
              <AppButton
                label="Subscribe Now"
                class="!bg-primary-900 w-max flex-shrink-0 !rounded-none"
              />
            </div>
          </div>
        </AppSection>
      </div>
    </main>

    <footer class="bg-primary-900 py-16 text-white">
      <AppSection class="grid grid-cols-1 gap-12 lg:grid-cols-2">
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
