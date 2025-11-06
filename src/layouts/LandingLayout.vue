<script setup>
import AppButton from "@components/AppButton.vue"
import ConsentBanner from "@modules/shared/components/ConsentBanner.vue"
import { useRouter } from "vue-router"

const router = useRouter()

const footerLinks = {
  Contact: [
    { name: "hello@leyyow.com", href: "mailto:hello@leyyow.com" },
    { name: "Instagram", href: "https://www.instagram.com/leyyow_app" },
    { name: "LinkedIn", href: "https://www.linkedin.com/company/leyyow" },
    { name: "WhatsApp", href: "https://wa.me/1234567890" },
  ],
  Products: [
    { name: "Leyyow Sales", href: "/orders" },
    { name: "Eventful", href: "https://eventful.leyyow.com", new: true },
  ],
  Resources: [
    {
      name: "Terms",
      href: "https://leyyow.notion.site/Refund-policy-162f3934f3148085a337fc0d3cbffb99?pvs=4",
    },
    {
      name: "Privacy",
      href: "https://leyyow.notion.site/Refund-policy-162f3934f3148085a337fc0d3cbffb99?pvs=4",
    },
    { name: "Help & Support", href: "https://leyyow.notion.site/faq?pvs=4" },
    { name: "FAQs", href: "/#faqs" },
  ],
}
</script>

<template>
  <div>
    <header class="font-outfit bg-white shadow-sm">
      <nav class="mx-auto flex max-w-[1440px] items-center gap-6 px-4 py-4 md:px-2">
        <RouterLink to="/" class="mr-6">
          <img src="/LYW.svg" alt="Leyyow Logo" class="h-8" />
        </RouterLink>
        <div class="ml-4 hidden items-center gap-8 md:inline-flex">
          <RouterLink to="/" class="text-core-600 font-semibold"> Home </RouterLink>
          <a href="#features" class="text-core-600 font-semibold"> Features </a>
          <a href="#faqs" class="text-core-600 font-semibold"> FAQs </a>
          <a href="#pricing" class="text-core-600 font-semibold"> Pricing </a>
          <a href="https://eventful.leyyow.com" target="_blank" class="text-core-600 font-semibold">
            Eventful
          </a>
        </div>
        <span class="flex-1" />

        <div class="inline-flex items-center gap-2 sm:gap-6">
          <RouterLink
            to="/login"
            class="hover:text-brand-500 text-core-600 text-base font-semibold"
          >
            Log in
          </RouterLink>
          <AppButton
            class="hidden px-3 py-2 sm:inline-flex md:px-4 md:text-base"
            label="Signup"
            @click="router.push('/signup')"
          />
        </div>
      </nav>
    </header>

    <main>
      <RouterView />
    </main>

    <footer class="font-outfit border-t border-gray-200 pt-16 pb-4">
      <div class="mx-auto grid max-w-[1440px] grid-cols-1 gap-8 px-4 lg:grid-cols-2">
        <div>
          <img src="/LYW.svg" alt="Leyyow Logo" class="mb-4 h-8" />
        </div>
        <div class="col-span-1 grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div v-for="key in Object.keys(footerLinks)" :key="key">
            <h3 class="text-core-900 mb-4 text-sm font-semibold">{{ key }}</h3>
            <div class="flex flex-col gap-3">
              <a
                v-for="link in footerLinks[key]"
                :key="link.name"
                :href="link.href"
                :target="link.href.startsWith('http') ? '_blank' : undefined"
                class="hover:text-brand-500 text-core-600 hover:text-primary font-medium hover:underline"
              >
                {{ link.name }}
                <span
                  v-if="link.new"
                  :class="[
                    'text-brand-500 border border-green-400 bg-green-100 text-xs',
                    'ml-2 inline-flex items-center rounded-full px-2 py-0.5 font-medium',
                  ]"
                >
                  New
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div class="border-core-200 mt-16 border-t" />
      <div
        class="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-4 px-4 py-8 md:flex-row md:items-end"
      >
        <div>
          <h3 class="text-core-900 mb-2 text-lg font-medium md:text-xl">
            Sell smarter with Leyyow
          </h3>
          <p class="text-core-600 text-sm md:text-base">
            Start free, cancel anytime, and only pay when you're ready to scale.
          </p>
        </div>
        <p class="text-core-600 mt-4 text-sm md:mt-0 md:text-base">
          &copy; {{ new Date().getFullYear() }} Leyyow. All rights reserved.
        </p>
      </div>
    </footer>

    <!-- Consent Banner -->
    <ConsentBanner />
  </div>
</template>
