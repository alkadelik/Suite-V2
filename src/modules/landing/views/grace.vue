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

        <div class="flex gap-4">
          <div class="flex items-center gap-2 text-gray-600">
            Powered by <img src="/LYW.svg?url" alt="Leyyow Logo" class="h-5" />
          </div>
          <AppButton label="View Cart" icon="shop" class="!rounded-full !bg-gray-700" />
        </div>
      </AppSection>
    </header>

    <!-- Main content -->
    <main>
      <div class="px-12 py-4">
        <!-- Find your Beauty -->
        <AppSection background="bg-pink-200 rounded-2xl" class="py-16">
          <div class="flex h-[600px] items-center gap-16 rounded-2xl bg-pink-200">
            <div class="max-w-xl rounded-2xl bg-white p-6">
              <h2 class="text-4xl font-bold">Find your Beauty</h2>
              <p class="mt-4 text-lg text-gray-700">
                Colorful, calming essentials for skin, space, and self. Colorful, calming essentials
                for skin, space, and self.Colorful, calming essentials for skin, space, and self.
              </p>
              <AppButton label="Shop Now" class="mt-6 w-40 !rounded-full !bg-gray-700" />
            </div>
          </div>
        </AppSection>

        <!-- Featured Products -->
        <AppSection background="bg-white" class="flex py-16">
          <div class="w-1/4">
            <h2 className="text-3xl font-bold  text-gray-900 mb-12">
              Featured <br />
              Products
            </h2>

            <AppButton
              label="View All Products"
              color="alt"
              icon="arrow-right"
              class="!flex-row-reverse !rounded-full"
            />

            <div class="mt-8 flex gap-2">
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

          <div class="grid w-3/4 grid-cols-3 gap-6">
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
        <AppSection background="bg-pink-200 rounded-2xl" class="py-16">
          <div class="flex h-[448px] items-center justify-end gap-16 rounded-2xl bg-pink-200">
            <div class="max-w-xl rounded-2xl bg-white p-10">
              <h2 class="text-4xl font-bold">Made with Kindess</h2>
              <p class="mt-4 text-lg text-gray-700">
                At Bloom & Co., we believe self-care should feel joyful — not routine. Every product
                is made from gentle ingredients and designed to brighten your day inside and out.
              </p>
            </div>
          </div>
        </AppSection>

        <!-- Give the Gift of Calm -->
        <AppSection background="bg-pink-200 rounded-2xl mt-8" class="py-16">
          <div class="flex h-[448px] items-center gap-16 rounded-2xl bg-pink-200">
            <div class="max-w-xl rounded-2xl bg-white p-10">
              <h2 class="text-4xl font-bold">Give the Gift of Calm</h2>
              <p class="mt-4 text-lg text-gray-700">
                Curated self-care sets, perfect for loved ones — or yourself.
              </p>
              <AppButton label="Shop Now" class="mt-6 w-40 !rounded-full !bg-gray-700" />
            </div>
          </div>
        </AppSection>

        <!-- What our Customers are Saying -->
        <AppSection background="bg-white" class="py-10">
          <h2 className="text-4xl font-bold text-center text-primary-900 mb-12">
            What Our Customers Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div v-for="n in 6" :key="n" className="bg-primary-50 rounded-lg  p-4">
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
        </AppSection>

        <AppSection
          background="bg-[#85684E] !rounded-2xl"
          class="flex items-center gap-6 py-4 text-white"
        >
          <p>Free Shipping on Orders Over ₦30,000:</p>
          <p>Enjoy fast delivery and free returns within 7 days.</p>
          <AppButton label="Shop Now" icon="arrow-right" variant="text" class="!text-white" />
        </AppSection>

        <!-- Join the Grace Circle -->
        <AppSection
          background="bg-gradient-to-r from-pink-400 via-white to-white rounded-2xl mt-8"
          class="py-16"
        >
          <div class="flex h-[448px] items-center justify-end gap-16 rounded-2xl">
            <div class="max-w-xl rounded-2xl bg-white p-10">
              <h2 class="text-4xl font-bold">Join the Grace Circle</h2>
              <p class="mt-4 text-lg text-gray-700">
                Curated self-care sets, perfect for loved ones — or yourself.
              </p>
              <div class="mt-6 flex items-center gap-4">
                <TextField
                  type="email"
                  placeholder="e.g. adebola99@gmail.com"
                  class="w-full"
                  containerClass="!rounded-full"
                />
                <AppButton
                  label="Subscribe Now"
                  class="w-max flex-shrink-0 !rounded-full !bg-gray-700"
                />
              </div>
            </div>
          </div>
        </AppSection>
      </div>
    </main>

    <footer class="bg-primary-50 py-16">
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
