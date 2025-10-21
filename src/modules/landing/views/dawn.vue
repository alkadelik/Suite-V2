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
  <div class="min-h-screen text-gray-950">
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
          <AppButton label="View Cart" icon="shop" class="!hidden !bg-[#1a2a3a] sm:!inline-flex" />
          <AppButton icon="shop" class="!bg-[#1a2a3a] sm:!hidden" size="sm" />
        </div>
      </AppSection>
    </header>

    <!-- Main content -->
    <main>
      <div>
        <!-- Find your Beauty -->
        <AppSection background="bg-white" class="py-8 md:py-16">
          <div class="flex flex-col items-center gap-16 md:flex-row md:gap-16">
            <div class="md:w-1/2 md:text-left">
              <h2 class="text-3xl font-bold md:text-4xl">Find your Beauty</h2>
              <p class="mt-4 text-gray-600">
                Colorful, calming essentials for skin, space, and self. Colorful, calming essentials
                for skin, space, and self.Colorful, calming essentials for skin, space, and
                self.Colorful,
              </p>
              <AppButton label="Shop Now" class="md:-w-[200px] mt-6 w-full !bg-[#1a2a3a]" />
            </div>
            <img
              class="h-[450px] w-full rounded-t-full rounded-b-xl bg-pink-200 md:h-[618px] md:w-1/2"
            />
          </div>
        </AppSection>

        <!-- Featured Products -->
        <AppSection background="bg-[#FAFAFA]" class="py-8 md:py-16">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900 md:mb-12 md:text-3xl">
            Featured Products
          </h2>

          <div class="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-10">
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
                <h4 class="mb-2 text-sm font-semibold md:text-base">Amber Wood Diffuser</h4>
                <p>{{ formatCurrency(11400) }}</p>
              </div>
            </div>
          </div>
        </AppSection>

        <!-- Made with Kindess -->
        <AppSection background="bg-[#F7F3EE]" class="py-8 md:py-16">
          <div class="flex flex-col-reverse items-center gap-8 md:flex-row md:gap-10">
            <img
              class="h-[450px] w-full rounded-t-xl rounded-b-full bg-pink-200 md:h-[618px] md:w-[568px]"
            />
            <div class="md:text-left">
              <h2 class="text-3xl font-bold md:text-4xl">Made with Kindess</h2>
              <p class="mt-4 text-gray-600">
                At Bloom & Co., we believe self-care should feel joyful — not routine. Every product
                is made from gentle ingredients and designed to brighten your day inside and out.
              </p>
            </div>
          </div>
        </AppSection>

        <!-- Give the Gift of Calm -->
        <AppSection background="bg-white" class="py-8 md:py-16">
          <div class="flex w-full flex-col items-center gap-6 md:flex-row md:gap-10">
            <div class="md:w-3/5 md:text-left">
              <h2 class="text-3xl font-bold md:text-4xl">Give the Gift of Calm</h2>
              <p class="mt-4 text-gray-600">
                Curated self-care sets, perfect for loved ones — or yourself.
              </p>
              <AppButton label="Shop Gift Sets" class="mt-6 !bg-[#1a2a3a]" />
            </div>
            <img
              class="h-[450px] w-full rounded-t-full rounded-b-xl bg-pink-200 md:h-[618px] md:w-2/5"
            />
          </div>
        </AppSection>

        <!-- What our Customers are Saying -->
        <AppSection background="bg-[#FAFAFA]" class="py-8 md:py-16">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900 md:mb-12 md:text-3xl">
            What Our Customers Say
          </h2>
          <div className="mx-auto max-w-3xl">
            <div className="relative rounded-lg bg-white p-6 shadow-sm md:p-8">
              <div className="mb-4 text-center text-4xl text-gray-900 md:text-6xl">"</div>
              <p className="mb-6 text-center text-base text-gray-700 md:text-lg">
                The scents are divine — my mornings feel brand new!
              </p>
              <div className="flex items-center justify-center space-x-3">
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
              <button
                className="absolute left-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border-2 border-gray-200 bg-white hover:bg-gray-50 md:left-4 md:flex"
              >
                <Icon name="arrow-left" className="h-5 w-5 text-gray-600" />
              </button>
              <button
                className="absolute right-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border-2 border-gray-200 bg-white hover:bg-gray-50 md:right-4 md:flex"
              >
                <Icon name="arrow-right" className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </AppSection>

        <AppSection
          background="bg-gray-600"
          class="flex flex-col items-center gap-4 py-8 text-white md:flex-row md:gap-6"
        >
          <p class="text-center md:text-left">Free Shipping on Orders Over ₦30,000:</p>
          <p class="text-center md:text-left">
            Enjoy fast delivery and free returns within 7 days.
          </p>
          <AppButton label="Shop Now" icon="arrow-right" variant="text" class="!text-white" />
        </AppSection>

        <!-- Join the Dawn Circle -->
        <AppSection background="bg-[#F7F3EE]" class="py-8 md:py-16">
          <div class="mx-auto max-w-4xl rounded-xl bg-white p-6 md:p-10">
            <div class="flex flex-col items-center gap-6 md:flex-row md:gap-10">
              <img
                class="h-[250px] w-[2000px] rounded-t-full rounded-b-xl bg-pink-200 md:h-[224px] md:w-[224px]"
              />
              <div class="text-center md:text-left">
                <h2 class="text-3xl font-bold md:text-4xl">Join the Dawn Circle</h2>
                <p class="mt-4 text-gray-600">
                  Get 10% off your first order and updates on new launches.
                </p>
              </div>
            </div>

            <div class="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:gap-4">
              <TextField type="email" placeholder="e.g. adebola99@gmail.com" class="w-full" />
              <AppButton
                label="Subscribe Now"
                class="w-full flex-shrink-0 !bg-[#1a2a3a] md:w-max"
              />
            </div>
          </div>
        </AppSection>
      </div>
    </main>

    <footer class="bg-gray-700 py-8 text-white md:py-16">
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
