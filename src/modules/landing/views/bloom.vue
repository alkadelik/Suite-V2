<script setup lang="ts">
import { formatCurrency } from "@/utils/format-currency"
import AppButton from "@components/AppButton.vue"
import AppSection from "@components/AppSection.vue"
import Chip from "@components/Chip.vue"
import TextField from "@components/form/TextField.vue"
import Icon from "@components/Icon.vue"
import "vue3-carousel/carousel.css"
import { Carousel, Slide, Navigation, Pagination } from "vue3-carousel"
import AOS from "aos"
import "aos/dist/aos.css"
import { computed, onMounted, ref } from "vue"

// Initialize AOS
onMounted(() => {
  AOS.init({
    duration: 800,
    easing: "ease-in-out-cubic",
    once: true,
    offset: 100,
  })
})

const shopLinks = [
  { name: "Home", href: "/" },
  { name: "Storefront", href: "/storefront" },
  {
    name: "Privacy Policy",
    href: "https://leyyow.notion.site/Refund-policy-162f3934f3148085a337fc0d3cbffb99?pvs=4",
  },
]

// Testimonials data
const currentTestimonialIndex = ref(0)

const testimonials = computed(() => [
  {
    id: 1,
    quote:
      "The scents are divine — my mornings feel brand new! I've been using Bloom & Co. products for months now and they never fail to brighten my day.",
    author: "Ada E.",
    role: "Lifestyle Blogger",
    initials: "AE",
    rating: 5,
  },
  {
    id: 2,
    quote:
      "Absolutely love the quality and the beautiful packaging. These products make perfect gifts and the self-care routine feels so luxurious.",
    author: "Sarah M.",
    role: "Interior Designer",
    initials: "SM",
    rating: 5,
  },
  {
    id: 3,
    quote:
      "The amber wood diffuser is my favorite! It creates such a calming atmosphere in my home office. Highly recommend to anyone looking for premium home fragrance.",
    author: "James K.",
    role: "Marketing Executive",
    initials: "JK",
    rating: 5,
  },
  {
    id: 4,
    quote:
      "Beautiful products that actually deliver on their promises. The kindness in every detail shows - from ingredients to packaging to customer service.",
    author: "Maria L.",
    role: "Wellness Coach",
    initials: "ML",
    rating: 5,
  },
  {
    id: 5,
    quote:
      "I've gifted these products to all my friends and family. Everyone absolutely loves them! The perfect blend of luxury and everyday practicality.",
    author: "David R.",
    role: "Entrepreneur",
    initials: "DR",
    rating: 5,
  },
  {
    id: 6,
    quote:
      "The subscription service is fantastic - I never run out of my favorites. Customer service is exceptional and shipping is always fast.",
    author: "Emily C.",
    role: "Yoga Instructor",
    initials: "EC",
    rating: 5,
  },
])

// Testimonial navigation functions
const nextTestimonial = () => {
  currentTestimonialIndex.value = (currentTestimonialIndex.value + 1) % testimonials.value.length
}

const prevTestimonial = () => {
  currentTestimonialIndex.value =
    currentTestimonialIndex.value === 0
      ? testimonials.value.length - 1
      : currentTestimonialIndex.value - 1
}

const goToTestimonial = (index: number) => {
  currentTestimonialIndex.value = index
}
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
          <AppButton label="View Cart" icon="bag" class="!hidden !bg-pink-600 sm:!inline-flex" />
          <AppButton icon="bag" class="!bg-pink-600 sm:!hidden" size="sm" />
        </div>
      </AppSection>
    </header>

    <!-- Main content -->
    <main>
      <div>
        <!-- Find your Beauty -->
        <AppSection class="bg-[url('/images/themes/bloom/bg-grid.svg')] py-16 md:py-16">
          <div class="flex flex-col items-center gap-16 md:flex-row md:justify-between md:gap-16">
            <div class="w-full md:w-1/2 md:text-left" data-aos="fade-right">
              <h2 class="text-4xl font-bold md:text-5xl">Find your Beauty</h2>
              <p class="mt-4 text-base text-gray-600 md:text-lg">
                Colorful, calming essentials for skin, space, and self. Colorful, calming essentials
                for skin, space, and self.Colorful, calming essentials for skin, space, and
                self.Colorful,
              </p>
              <AppButton label="Shop Now" class="mt-6 w-full !bg-pink-600 md:w-40" />
            </div>
            <div class="flex w-full justify-center md:w-1/2" data-aos="fade-left">
              <img
                src="/images/themes/bloom/hero.png"
                class="h-[600px] w-full rounded-[200px] object-cover md:h-[618px] md:w-[418px] md:rounded-[400px]"
              />
            </div>
          </div>
        </AppSection>

        <!-- Featured Products -->
        <AppSection background="bg-white" class="py-8 md:py-16">
          <div
            class="mb-8 flex flex-col gap-4 md:mb-12 md:flex-row md:justify-between"
            data-aos="fade-up"
          >
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
              data-aos="fade-up"
              :data-aos-delay="v * 100"
            >
              <div
                class="relative rounded-xl"
                :class="v < 3 ? 'h-[180px] md:h-[400px]' : 'h-[180px] md:h-[255px]'"
              >
                <img
                  :src="`/images/themes/shared/product-${v % 2 ? 1 : 2}.png`"
                  class="relative mb-4 h-full w-full rounded-xl"
                />
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
            <div class="w-full md:w-1/2" data-aos="fade-right">
              <img
                src="/images/themes/shared/kindness.png"
                class="h-[560px] w-full rounded-full object-cover md:h-[618px] md:w-[400px]"
              />
            </div>
            <div class="w-full md:w-1/2 md:text-left" data-aos="fade-left">
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
            <div class="w-full md:w-3/5 md:text-left" data-aos="fade-right">
              <h2 class="text-3xl font-bold md:text-4xl">Give the Gift of Calm</h2>
              <p class="mt-4 text-base text-gray-600 md:text-lg">
                Curated self-care sets, perfect for loved ones — or yourself.
              </p>
              <AppButton label="Shop Collection" class="mt-6 w-full !bg-pink-600 md:w-40" />
            </div>
            <div class="w-full md:w-2/5" data-aos="fade-left">
              <img
                src="/images/themes/shared/gift.png"
                class="h-[500px] w-full rounded-t-xl rounded-b-full object-cover md:h-[618px]"
              />
            </div>
          </div>
        </AppSection>

        <!-- What our Customers are Saying -->
        <AppSection background="bg-white border-t border-gray-200" class="py-12 md:py-20">
          <h2
            class="mb-8 text-center text-3xl font-bold text-gray-800 md:mb-12 md:text-5xl"
            data-aos="fade-up"
          >
            What Our Customers Say
          </h2>

          <!-- Testimonials Carousel -->
          <div class="relative" data-aos="fade-up" data-aos-delay="200">
            <Carousel
              :items-to-show="1"
              :wrap-around="true"
              :autoplay="5000"
              :pause-autoplay-on-hover="true"
              v-model="currentTestimonialIndex"
              class="testimonials-carousel"
            >
              <Slide v-for="testimonial in testimonials" :key="testimonial.id">
                <div class="mx-auto max-w-4xl px-4">
                  <div
                    class="flex flex-col items-center rounded-lg border border-gray-200 bg-white p-8 text-center shadow-lg"
                  >
                    <!-- Quote Icon -->
                    <div
                      class="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-pink-600 text-4xl font-bold text-white"
                    >
                      "
                    </div>

                    <!-- Rating Stars -->
                    <div class="mb-4 flex items-center gap-1">
                      <Icon
                        v-for="star in testimonial.rating"
                        :key="star"
                        name="star"
                        class="h-5 w-5 text-yellow-400"
                      />
                    </div>

                    <!-- Quote Text -->
                    <p class="mb-8 text-lg leading-relaxed text-gray-800 md:text-xl">
                      {{ testimonial.quote }}
                    </p>

                    <!-- Author Info -->
                    <div class="flex flex-col items-center space-y-3">
                      <div
                        class="flex h-16 w-16 items-center justify-center rounded-full bg-gray-300 text-lg font-semibold text-gray-600"
                      >
                        {{ testimonial.initials }}
                      </div>
                      <div class="text-center">
                        <p class="text-lg font-semibold text-gray-900">{{ testimonial.author }}</p>
                        <p class="text-sm text-gray-500">{{ testimonial.role }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Slide>

              <!-- Navigation -->
              <template #addons>
                <Navigation />
                <Pagination />
              </template>
            </Carousel>

            <!-- Custom Navigation Buttons -->
            <div class="mt-8 flex items-center justify-center gap-4">
              <button
                @click="prevTestimonial"
                class="flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-white shadow-md transition-all hover:border-pink-600 hover:bg-pink-600 hover:text-white"
                aria-label="Previous testimonial"
              >
                <Icon name="arrow-left" class="h-5 w-5" />
              </button>

              <!-- Dots Indicator -->
              <div class="flex gap-2">
                <button
                  v-for="(testimonial, index) in testimonials"
                  :key="testimonial.id"
                  @click="goToTestimonial(index)"
                  :class="[
                    'h-3 w-3 rounded-full transition-all',
                    currentTestimonialIndex === index
                      ? 'scale-125 bg-pink-600'
                      : 'bg-gray-300 hover:bg-gray-400',
                  ]"
                  :aria-label="`Go to testimonial ${index + 1}`"
                />
              </div>

              <button
                @click="nextTestimonial"
                class="flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-white shadow-md transition-all hover:border-pink-600 hover:bg-pink-600 hover:text-white"
                aria-label="Next testimonial"
              >
                <Icon name="arrow-right" class="h-5 w-5" />
              </button>
            </div>
          </div>
        </AppSection>

        <!-- Join the Dawn Circle -->
        <AppSection class="bg-[url('/images/themes/bloom/bg-grid.svg')] py-8 md:py-16">
          <div class="flex w-full flex-col items-center justify-center gap-8 md:flex-row md:gap-10">
            <div class="w-full md:w-auto" data-aos="fade-right">
              <img
                src="/images/themes/shared/subscribe.png"
                class="mx-auto h-[250px] w-[150px] rounded-t-full rounded-b-full object-cover md:h-[360px] md:w-[224px]"
              />
            </div>
            <div class="w-full text-center md:text-left" data-aos="fade-left">
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

<style scoped>
/* Custom carousel styling */
.testimonials-carousel :deep(.carousel__viewport) {
  perspective: 2000px;
}

.testimonials-carousel :deep(.carousel__slide) {
  padding: 0 1rem;
}

.testimonials-carousel :deep(.carousel__track) {
  transform-style: preserve-3d;
}

.testimonials-carousel :deep(.carousel__slide--sliding) {
  transition: 0.5s;
}

/* Custom navigation buttons */
.testimonials-carousel :deep(.carousel__prev),
.testimonials-carousel :deep(.carousel__next) {
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 9999px;
  width: 3rem;
  height: 3rem;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
}

.testimonials-carousel :deep(.carousel__prev:hover),
.testimonials-carousel :deep(.carousel__next:hover) {
  background: #ec4899;
  color: white;
  border-color: #ec4899;
}

.testimonials-carousel :deep(.carousel__icon) {
  width: 1.25rem;
  height: 1.25rem;
}

/* Custom pagination */
.testimonials-carousel :deep(.carousel__pagination) {
  margin-top: 1.5rem;
}

.testimonials-carousel :deep(.carousel__pagination-button) {
  margin: 0 0.25rem;
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 9999px;
  background-color: #d1d5db;
  transition: all 0.3s;
}

.testimonials-carousel :deep(.carousel__pagination-button:hover) {
  background-color: #9ca3af;
}

.testimonials-carousel :deep(.carousel__pagination-button--active) {
  background-color: #ec4899;
  transform: scale(1.25);
}

/* Star icon styling */
.testimonials-carousel :deep(.star-icon) {
  color: #fbbf24;
}
</style>
