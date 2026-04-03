<script setup>
import "vue3-carousel/dist/carousel.css"
import { Carousel, Slide } from "vue3-carousel"
import { onMounted, ref } from "vue"
import AOS from "aos"
import "aos/dist/aos.css"
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"
import AppButton from "@components/AppButton.vue"
import ConsentBanner from "@modules/shared/components/ConsentBanner.vue"

const images = Array.from({ length: 5 }, (_, index) => ({
  id: index + 1,
  url: `/images/businesses/${index + 1}.png.jpeg`,
}))

const FAQS = [
  {
    question: "What is Leyyow?",
    answer:
      "Leyyow is an all-in-one business management platform designed to help small and medium-sized enterprises streamline their operations, manage sales, track expenses, and grow their customer base.",
  },
  {
    question: "How much does Leyyow cost?",
    answer:
      "Leyyow offers a variety of pricing plans to suit different business needs. Please visit our Pricing page for detailed information on our plans and pricing.",
  },
  {
    question: "Can I try Leyyow before committing to a plan?",
    answer:
      "Yes! We offer a free trial period for new users to explore our features and see how Leyyow can benefit their business.",
  },
  {
    question: "Is my data secure with Leyyow?",
    answer:
      "Absolutely. We take data security seriously and implement industry-standard security measures to protect your information.",
  },
  {
    question: "What kind of support does Leyyow offer?",
    answer:
      "We provide comprehensive support through various channels including email support, live chat, and a detailed knowledge base to help you get the most out of Leyyow.",
  },
]

const PRICINGS = [
  {
    name: "Bud",
    price: "2", // price in thousands
    features: [
      "Unlimited orders",
      "20 products",
      "Unlimited invoices & receipts",
      "Automated delivery",
      "Basic chat & email support",
      "Basic storefront",
      "Basic order management",
    ],
  },
  {
    name: "Bloom",
    price: "15", // price in thousands
    features: [
      "All basic features",
      "Unlimited products",
      "Unlimited popups",
      "Advanced reports",
      "Priority chat & email support",
      "Branded storefront",
      "Advanced order management",
    ],
  },
]

// Reactive state for FAQ accordion
const openFaq = ref(null)

const toggleFaq = (index) => {
  openFaq.value = openFaq.value === index ? null : index
}

const FEATURES = [
  {
    title: "Take more orders, faster",
    subtitle: "Keep track of every order; paid, unpaid, or pending - without losing your mind.",
    icon: "message-chat-circle",
  },
  {
    title: "Popups that work for you",
    subtitle: "Create popups, add inventory, and track every sale—both in person and online.",
    icon: "zap",
  },
  {
    title: "Know your customers",
    subtitle: "See who's buying, what they like, and keep them coming back.",
    icon: "chart-breakout-square",
  },
  {
    title: "Automated delivery service",
    subtitle:
      "Ship faster and keep customers happy. Connect to reliable delivery partners in one click.",
    icon: "message-smile-circle",
  },
  {
    title: "Partial & unpaid orders",
    subtitle: "Split payments? Pending payments? We handle it. Stay organized, always.",
    icon: "command",
  },
  {
    title: "Invoices & Receipts",
    subtitle:
      "Send professional invoices and receipts automatically and manually - your customers will thank you.",
    icon: "message-heart-circle",
  },
]

const openMail = () => {
  window.open("mailto:hello@leyyow.com")
}

onMounted(() => {
  AOS.init({ duration: 800, easing: "ease-in-out", once: true })
})
</script>

<template>
  <div class="font-outfit">
    <section class="py-8 md:py-16">
      <div
        class="relative mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-8 bg-cover bg-center bg-repeat px-4 md:flex-row md:bg-bottom lg:gap-12"
        :style="{ backgroundImage: 'url(/images/home/hero-pattern.svg)' }"
      >
        <div class="w-full max-w-screen-sm lg:w-3/5 lg:pr-20 xl:w-1/3 xl:pr-0">
          <a href="http://eventful.leyyow.com" target="_blank" rel="noopener noreferrer">
            <Chip size="md" class="!pl-1">
              <Chip size="sm" label="✨ Now live!!" variant="filled" />
              <span class="ml-2 hidden sm:inline lg:hidden xl:inline"
                >Eventful by Leyyow, for organisers</span
              >
              <span class="sm:hidden lg:inline xl:hidden">Eventful by Leyyow</span>
              <Icon icon="mdi:arrow-right" class="h-4 w-4" />
            </Chip>
          </a>
          <h2
            class="mt-6 mb-6 font-sans text-3xl leading-[1.25] font-bold sm:text-4xl md:mt-8 md:mb-8 md:text-5xl"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            Tools that help you sell smarter, not harder
          </h2>
          <p
            class="text-core-600 mb-8 text-lg md:mb-12 xl:leading-[1.65]"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            Running your business online shouldn't feel overwhelming. With Leyyow, you get
            everything you need in one place to take orders, get paid, and grow your business -
            without the stress.
          </p>
          <div class="flex gap-4" data-aos="fade-up" data-aos-delay="400">
            <AppButton
              label="Demo"
              variant="outlined"
              class="w-full border-gray-300 !bg-white text-gray-700 sm:w-auto xl:w-1/2"
              icon="play-circle"
              icon-class="h-6 w-6 text-gray-700"
            />
            <AppButton
              label="Get Started"
              class="w-full sm:w-auto xl:w-1/2"
              @click="$router.push(`/signup`)"
            />
          </div>
        </div>

        <div class="relative w-full lg:w-2/5">
          <img
            src="/images/home/hero-mockup-1.png"
            alt="Hero Mockup"
            class="hidden h-full w-auto lg:block"
            data-aos="fade-left"
            data-aos-delay="300"
          />
          <img
            src="/images/home/hero-section-mobile.svg"
            alt="Hero Mockup"
            class="mx-auto max-h-[600px] w-full object-contain lg:hidden"
            data-aos="fade-up"
            data-aos-delay="300"
          />

          <img
            src="/images/home/notification-queue-1.png"
            class="absolute -bottom-4 -left-1/4 hidden h-auto max-w-72 object-contain lg:-bottom-8 lg:block"
            alt="Notification Queue"
            data-aos="fade-right"
            data-aos-delay="600"
          />
        </div>
      </div>
      <div
        class="mx-auto mt-8 flex max-w-screen-xl flex-col items-center overflow-hidden rounded-xl bg-gray-50 px-8 py-8 md:mt-24 md:px-12 md:py-16 lg:px-16"
      >
        <p class="text-core-600 mb-10 text-center text-lg md:mb-16 md:text-xl">
          Trusted by businesses like yours
        </p>

        <div>
          <Carousel
            :items-to-show="2"
            :autoplay="3000"
            :wrap-around="true"
            :gap="12"
            :height="80"
            :breakpoints="{
              640: { itemsToShow: 3, gap: 32 },
              768: { itemsToShow: 4, gap: 48 },
              1024: { itemsToShow: 5, gap: 64 },
            }"
          >
            <Slide v-for="n in images" :key="n.id" class="h-[80px] overflow-hidden rounded-xl">
              <img :src="n.url" class="h-auto w-full rounded-xl" />
            </Slide>
          </Carousel>
        </div>
      </div>
    </section>

    <section id="features" class="bg-gray-50 py-12 md:py-16">
      <div class="mx-auto max-w-[1440px] px-4">
        <div class="mb-8 md:mb-12">
          <span class="text-primary-500 font-semibold">Features</span>
          <h3 class="text-core-900 mt-1 mb-4 font-sans text-2xl font-semibold md:text-3xl">
            Why Leyyow?
          </h3>
          <p class="text-core-600 max-w-screen-md text-lg">
            We built Leyyow for sellers like you - creators, hustlers, and business owners who want
            simple tools that just work. No fluff, no headaches.
          </p>
          <button
            type="button"
            class="text-primary-500 mt-4 flex items-center gap-2 font-semibold"
            @click="$router.push(`/signup`)"
          >
            Get Started <Icon name="arrow-right" class="h-5 w-5" />
          </button>
        </div>

        <div class="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="(feat, f) in FEATURES"
            :key="f"
            class="flex flex-col items-center text-center md:items-start md:text-left"
            :class="{
              'hidden md:flex': feat.title.includes('customers') || feat.title.includes('unpaid'),
            }"
            data-aos="fade-up"
            :data-aos-delay="f * 100"
          >
            <span
              class="bg-primary-500/10 border-primary-500/40 ring-primary-500/30 mb-3 flex h-12 w-12 items-center justify-center rounded-full border-4 ring-4"
            >
              <Icon :name="feat.icon" class="text-primary-500 h-6 w-6" />
            </span>
            <h4 class="mb-1 text-lg font-semibold">{{ feat.title }}</h4>
            <p class="text-core-600 text-base">
              {{ feat.subtitle }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="py-12 md:py-24">
      <div class="mx-auto mb-8 max-w-screen-md px-4 text-center md:mb-16">
        <Chip label="💰Know Your Numbers" data-aos="fade-up" />
        <h2
          class="mt-4 font-sans text-3xl font-semibold md:text-4xl"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          Stop losing money on the table
        </h2>
        <p class="text-core-600 mt-5 text-lg" data-aos="fade-up" data-aos-delay="200">
          Track your sales, see what's working, and spot hidden opportunities - all in real time.
          Leyyow keeps you in control so you can focus on selling, not spreadsheets.
        </p>
      </div>

      <div class="px-4 text-center">
        <img
          src="/images/home/dashboard-mockup-lg.png"
          class="mx-auto mb-8 hidden h-full w-auto sm:block md:mb-12"
          alt="Dashboard Mockup"
          data-aos="fade-up"
          data-aos-delay="200"
        />
        <img
          src="/images/home/dashboard-mockup-smm.png"
          class="mx-auto mb-8 h-full w-auto sm:hidden md:mb-12"
          alt="Dashboard Mockup"
          data-aos="fade-up"
          data-aos-delay="200"
        />
        <AppButton
          label="Let's Begin"
          class="mt-8 w-full max-w-80"
          data-aos="fade-up"
          data-aos-delay="400"
          @click="$router.push(`/signup`)"
        />
      </div>
    </section>

    <section id="pricing" class="relative bg-gray-50 py-12 md:py-16">
      <div class="mx-auto flex max-w-[1440px] flex-col justify-between gap-8 px-4 lg:flex-row">
        <div class="w-full space-y-3 lg:w-2/5">
          <span class="text-primary-500 font-semibold">Pricing</span>
          <h3 class="text-core-900 text-2xl font-semibold md:text-3xl">
            Simple, honest pricing 💚
          </h3>
          <p class="text-core-600 text-lg">
            No hidden fees. No surprises. Just straightforward plans designed to help you sell more
            and stress less.
          </p>
          <Chip label="Billed monthly" />
        </div>
        <div
          class="relative flex w-full flex-col-reverse gap-4 sm:flex-row md:gap-8 md:py-8 lg:w-3/5"
        >
          <div
            v-for="(pricing, p) in PRICINGS"
            :key="p"
            class="flex-1 rounded-xl bg-white py-4 shadow-xl"
            data-aos="fade-up"
            :data-aos-delay="p * 150"
          >
            <div class="p-4 text-center md:p-6">
              <h3 class="mb-3 text-3xl font-semibold md:text-4xl">
                ₦{{ pricing.price }}<span class="text-base md:text-lg">k/mth</span>
              </h3>
              <p class="text-base font-semibold md:text-lg">{{ pricing.name }}</p>
            </div>
            <ul
              class="border-core-300 space-y-3 border-t px-4 pt-6 pb-4 md:space-y-4 md:px-8 md:pt-8"
            >
              <li v-for="feat in pricing.features" :key="feat" class="flex items-start gap-2">
                <Icon
                  icon="lets-icons:check-ring-duotone"
                  class="mt-0.5 h-6 w-6 flex-shrink-0 text-green-600 md:h-7 md:w-7"
                />
                <span class="text-core-600 text-sm md:text-base">{{ feat }}</span>
              </li>
            </ul>

            <div class="px-4 py-4 md:px-8">
              <AppButton
                label="Get Started"
                class="w-full"
                @click="$router.push(`/signup?plan=${pricing.name}`)"
              />
            </div>
          </div>

          <img
            src="/images/home/most-popular.svg"
            class="absolute -top-1 right-1/3 hidden h-14 md:block"
            alt=""
          />
          <img
            src="/images/home/most-popular-sm.svg"
            class="absolute -top-8 right-4 h-14 md:hidden"
            alt=""
          />
        </div>
      </div>
    </section>

    <section id="faqs" class="px-4 py-12 md:py-16">
      <div class="mb-6 px-4 text-center md:mb-8">
        <h2 class="font-sans text-2xl font-semibold md:text-3xl lg:text-4xl" data-aos="fade-up">
          FAQs
        </h2>
        <p class="text-core-600 text-lg" data-aos="fade-up" data-aos-delay="100">
          Questions, We've got answers.
        </p>
      </div>
      <div class="mx-auto max-w-screen-lg px-4">
        <div class="mb-6 flex flex-col gap-4 md:mb-8 md:gap-6">
          <div
            v-for="(faq, index) in FAQS"
            :key="faq.question"
            class="border-core-200 border-b last:border-0"
            data-aos="fade-up"
            :data-aos-delay="index * 100"
          >
            <button
              type="button"
              class="flex w-full items-start justify-between gap-2 py-2 text-left md:gap-6"
              @click="toggleFaq(index)"
            >
              <div class="flex-1">
                <h3 class="text-core-700 text-lg font-medium">
                  {{ faq.question }}
                </h3>
              </div>
              <Icon
                :icon="openFaq === index ? 'solar:minus-circle-linear' : 'solar:add-circle-linear'"
                class="h-6 w-6 flex-shrink-0 text-gray-400 transition-transform duration-200"
                :class="{ 'rotate-180': openFaq === index }"
              />
            </button>
            <Transition
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 max-h-0"
              enter-to-class="opacity-100 max-h-96"
              leave-active-class="transition-all duration-300 ease-in"
              leave-from-class="opacity-100 max-h-96"
              leave-to-class="opacity-0 max-h-0"
            >
              <div v-if="openFaq === index" class="overflow-hidden">
                <p class="text-core-600 pr-8 pb-4 text-base md:pb-6">
                  {{ faq.answer }}
                </p>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <div
        class="mx-auto flex max-w-screen-xl flex-col items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-6 md:border-0 md:py-8"
        data-aos="fade-up"
      >
        <img
          src="/images/home/avatar-group.png"
          class="mb-4 h-12 w-auto md:mb-6 md:h-auto"
          alt="Avatar Group"
          data-aos="fade-up"
          data-aos-delay="100"
        />

        <p class="text-core-900 text-xl font-semibold" data-aos="fade-up" data-aos-delay="200">
          Still got questions?
        </p>
        <p class="text-core-600 my-2 text-center text-lg" data-aos="fade-up" data-aos-delay="300">
          Our team is always ready to help.
        </p>
        <AppButton
          label="Talk to us"
          class="w-full max-w-sm sm:w-auto"
          data-aos="fade-up"
          data-aos-delay="400"
          @click="openMail"
        />
      </div>
    </section>

    <section class="bg-gray-50 py-12 md:py-16">
      <div class="mx-auto max-w-[1440px]">
        <div
          class="mx-auto flex max-w-screen-lg flex-col items-center justify-center gap-4 px-4 text-center"
        >
          <h4 class="text-xl leading-[34px] font-medium md:text-2xl md:leading-[40px]">
            "Leyyow is an excellent tool. It saved me from an inventory nightmare, I can now track
            sales and stock effortlessly. I mostly use it for my pop-up shops, and it gives me
            real-time insights into which products are selling best and which aren’t. I also
            appreciate how responsive and supportive the team is."
          </h4>

          <div class="mt-6 space-y-2">
            <div
              class="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gray-200"
            >
              <img src="/images/businesses/1.png.jpeg" class="h-auto w-full" />
            </div>
            <p class="text-lg font-semibold">Lu Ekeruche</p>
            <p class="text-core-600 text-base">
              Founder, <span class="text-primary-500 font-medium">Dear Ketandu</span>
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Consent Banner -->
    <ConsentBanner />
  </div>
</template>
