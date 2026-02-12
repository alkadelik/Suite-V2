<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { formatCurrency } from "@/utils/format-currency"
import AppButton from "@components/AppButton.vue"
import AppSection from "@components/AppSection.vue"
import Chip from "@components/Chip.vue"
import TextField from "@components/form/TextField.vue"
import Icon from "@components/Icon.vue"
import { Carousel, Slide } from "vue3-carousel"
import "vue3-carousel/dist/carousel.css"
import AOS from "aos"
import "aos/dist/aos.css"

const shopLinks = [
  { name: "Home", href: "/" },
  { name: "Storefront", href: "/storefront" },
  {
    name: "Privacy Policy",
    href: "https://leyyow.notion.site/Refund-policy-162f3934f3148085a337fc0d3cbffb99?pvs=4",
  },
]

// Testimonials data
const staticTestimonials = [
  {
    id: 1,
    text: "The scents are divine — my mornings feel brand new! Every product feels like a little luxury in my daily routine.",
    author: "Ada E.",
    role: "Lifestyle Blogger",
    avatar: "AE",
    rating: 5,
  },
  {
    id: 2,
    text: "Absolutely love the quality and packaging. Dawn has become my go-to for all my self-care needs.",
    author: "Sarah M.",
    role: "Wellness Coach",
    avatar: "SM",
    rating: 5,
  },
  {
    id: 3,
    text: "The kindness and care that goes into each product is evident. My skin has never felt better!",
    author: "Jennifer L.",
    role: "Beauty Enthusiast",
    avatar: "JL",
    rating: 5,
  },
  {
    id: 4,
    text: "Finally found products that align with my values. Sustainable, beautiful, and effective!",
    author: "Maya K.",
    role: "Environmental Advocate",
    avatar: "MK",
    rating: 5,
  },
  {
    id: 5,
    text: "The gift sets are perfect! I've given them to all my friends and they absolutely love them.",
    author: "Rachel T.",
    role: "Marketing Manager",
    avatar: "RT",
    rating: 5,
  },
  {
    id: 6,
    text: "Dawn has transformed my self-care routine. Each product feels like a spa experience at home.",
    author: "Olivia H.",
    role: "Yoga Instructor",
    avatar: "OH",
    rating: 5,
  },
]

const testimonials = computed(() => staticTestimonials)

const carouselSettings = ref({
  itemsToShow: 1,
  wrapAround: true,
  autoplay: 3000,
  transition: 500,
  gap: 16,
  breakpoints: {
    768: {
      itemsToShow: 2,
      itemsToScroll: 1,
    },
    1024: {
      itemsToShow: 3,
      itemsToScroll: 1,
    },
  },
})

onMounted(() => {
  AOS.init({ duration: 800, easing: "ease-in-out", once: true })
})
</script>

<template>
  <div class="min-h-[100dvh] text-gray-950">
    <!-- Navigation -->
    <header
      class="sticky top-0 z-50 flex items-center border-b border-gray-200 bg-white py-4 md:h-20"
      data-aos="fade-down"
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
          <AppButton label="View Cart" icon="bag" class="!hidden !bg-[#1a2a3a] sm:!inline-flex" />
          <AppButton icon="bag" class="!bg-[#1a2a3a] sm:!hidden" size="sm" />
        </div>
      </AppSection>
    </header>

    <!-- Main content -->
    <main>
      <div>
        <!-- Find your Beauty -->
        <AppSection
          background="bg-[url('/images/themes/dawn/wave-line-1.svg')] bg-no-repeat bg-cover"
          class="py-8 md:py-16"
          data-aos="fade-up"
        >
          <div class="flex flex-col items-center gap-16 md:flex-row md:gap-16">
            <div class="md:w-1/2 md:text-left" data-aos="fade-right" data-aos-delay="200">
              <h2 class="text-3xl font-bold md:text-4xl">Find your Beauty</h2>
              <p class="mt-4 text-lg text-gray-600">
                Colorful, calming essentials for skin, space, and self. Colorful, calming essentials
                for skin, space, and self.Colorful, calming essentials for skin, space, and
                self.Colorful,
              </p>
              <AppButton label="Shop Now" class="md:-w-[200px] mt-6 w-full !bg-[#1a2a3a]" />
            </div>
            <img
              src="/images/themes/grace/hero.png"
              class="h-[450px] w-full rounded-t-full rounded-b-xl object-cover object-bottom-right md:h-[618px] md:w-1/2"
              data-aos="fade-left"
              data-aos-delay="400"
            />
          </div>
        </AppSection>

        <!-- Featured Products -->
        <AppSection background="bg-[#FAFAFA]" class="py-8 md:py-16" data-aos="fade-up">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900 md:mb-12 md:text-3xl">
            Featured Products
          </h2>

          <div class="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-10">
            <!-- Product Card -->
            <div
              v-for="v in 8"
              :key="v"
              class="flex flex-col gap-4"
              data-aos="fade-up"
              :data-aos-delay="v * 50"
            >
              <div class="relative h-[180px] rounded-xl sm:h-[255px]">
                <img
                  :src="`/images/themes/shared/product-${v % 2 ? 1 : 2}.png`"
                  class="relative mb-4 h-full w-full rounded-xl"
                />
                <button
                  class="absolute right-4 bottom-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-md transition-shadow duration-200 hover:shadow-lg"
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
        <AppSection
          background="bg-[#F7F3EE] bg-[url('/images/themes/dawn/wave-line-1.svg')] bg-cover bg-no-repeat"
          class="py-8 md:py-16"
          data-aos="fade-up"
        >
          <div class="flex flex-col-reverse items-center gap-8 md:flex-row md:gap-10">
            <img
              src="/images/themes/shared/kindness.png"
              class="h-[450px] w-full rounded-t-xl rounded-b-full object-cover md:h-[618px] md:w-[568px]"
              data-aos="fade-right"
              data-aos-delay="200"
            />
            <div class="md:text-left" data-aos="fade-left" data-aos-delay="400">
              <h2 class="text-3xl font-bold md:text-4xl">Made with Kindess</h2>
              <p class="mt-4 text-gray-600">
                At Bloom & Co., we believe self-care should feel joyful — not routine. Every product
                is made from gentle ingredients and designed to brighten your day inside and out.
              </p>
            </div>
          </div>
        </AppSection>

        <!-- Give the Gift of Calm -->
        <AppSection background="bg-white" class="py-8 md:py-16" data-aos="fade-up">
          <div class="flex w-full flex-col items-center gap-6 md:flex-row md:gap-10">
            <div class="md:w-3/5 md:text-left" data-aos="fade-right" data-aos-delay="200">
              <h2 class="text-3xl font-bold md:text-4xl">Give the Gift of Calm</h2>
              <p class="mt-4 text-gray-600">
                Curated self-care sets, perfect for loved ones — or yourself.
              </p>
              <AppButton label="Shop Gift Sets" class="mt-6 !bg-[#1a2a3a]" />
            </div>
            <img
              src="/images/themes/shared/gift.png"
              class="h-[450px] w-full rounded-t-full rounded-b-xl object-cover md:h-[618px] md:w-2/5"
              data-aos="fade-left"
              data-aos-delay="400"
            />
          </div>
        </AppSection>

        <!-- What our Customers are Saying -->
        <AppSection background="bg-[#FAFAFA]" class="py-8 md:py-16" data-aos="fade-up">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900 md:mb-12 md:text-3xl">
            What Our Customers Say
          </h2>

          <Carousel ref="carouselRef" v-bind="carouselSettings">
            <Slide v-for="testimonial in testimonials" :key="testimonial.id">
              <div className="rounded-lg bg-white p-6 shadow-sm h-full">
                <div className="mb-4 text-center text-2xl text-gray-900 md:text-4xl">"</div>
                <p className="mb-6 text-center text-base text-gray-700 md:text-lg">
                  {{ testimonial.text }}
                </p>

                <div className="flex items-center justify-center space-x-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-300"
                  >
                    <span className="font-semibold text-gray-600">{{ testimonial.avatar }}</span>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">{{ testimonial.author }}</p>
                    <p className="text-sm text-gray-500">{{ testimonial.role }}</p>
                  </div>
                </div>
              </div>
            </Slide>
          </Carousel>
        </AppSection>

        <!-- Join the Dawn Circle -->
        <AppSection
          background="bg-[#F7F3EE] bg-[url('/images/themes/dawn/wave-line-2.svg')] bg-cover bg-no-repeat"
          class="py-8 md:py-16"
          data-aos="fade-up"
        >
          <div
            class="mx-auto max-w-4xl rounded-xl bg-white p-6 md:p-10"
            data-aos="zoom-in"
            data-aos-delay="200"
          >
            <div class="flex flex-col items-center gap-6 md:flex-row md:gap-10">
              <img
                src="/images/themes/shared/subscribe.png"
                class="h-[250px] w-[2000px] rounded-t-full rounded-b-xl md:h-[224px] md:w-[224px]"
                data-aos="fade-right"
                data-aos-delay="400"
              />
              <div class="text-center md:text-left" data-aos="fade-left" data-aos-delay="600">
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

    <footer class="bg-gray-700 py-8 text-white md:py-16" data-aos="fade-up">
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
            <h3 class="mb-4 text-sm font-semibold text-white">Shop</h3>
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
            <h3 class="mb-4 text-sm font-semibold text-white">Follow Us</h3>
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
