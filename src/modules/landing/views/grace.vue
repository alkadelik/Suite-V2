<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { formatCurrency } from "@/utils/format-currency"
import AppButton from "@components/AppButton.vue"
import AppSection from "@components/AppSection.vue"
import Chip from "@components/Chip.vue"
import TextField from "@components/form/TextField.vue"
import Icon from "@components/Icon.vue"
import { Carousel, Slide, Pagination, Navigation } from "vue3-carousel"
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
    text: "Absolutely love the quality and packaging. Grace has become my go-to for all my self-care needs.",
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
    text: "Grace has transformed my self-care routine. Each product feels like a spa experience at home.",
    author: "Olivia H.",
    role: "Yoga Instructor",
    avatar: "OH",
    rating: 5,
  },
]

const testimonials = computed(() => staticTestimonials)

// Carousel settings
const carouselSettings = ref({
  itemsToShow: 1,
  snapAlign: "center" as const,
  wrapAround: true,
  autoplay: 3000,
  transition: 500,
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
  AOS.init({
    duration: 800,
    easing: "ease-in-out",
    once: true,
  })
})
</script>

<template>
  <div class="min-h-screen bg-white">
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
          <AppButton label="View Cart" icon="bag" class="!hidden !bg-gray-700 sm:!inline-flex" />
          <AppButton icon="bag" class="!bg-gray-700 sm:!hidden" size="sm" />
        </div>
      </AppSection>
    </header>

    <!-- Main content -->
    <main>
      <div class="px-4 py-4 md:px-12">
        <!-- Find your Beauty -->
        <AppSection
          background="bg-[url('/images/themes/grace/hero.png')] bg-no-repeat bg-cover rounded-2xl"
          class="py-8 md:py-16"
          data-aos="fade-up"
        >
          <div
            class="flex min-h-[400px] items-center gap-8 rounded-2xl p-4 md:h-[600px] md:gap-16 md:p-0"
          >
            <div
              class="w-full max-w-xl rounded-2xl bg-white p-4 md:p-6"
              data-aos="fade-right"
              data-aos-delay="200"
            >
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
        <AppSection
          background="bg-white"
          class="flex flex-col py-8 md:flex-row md:py-16"
          data-aos="fade-up"
        >
          <div class="mb-8 text-center md:mb-0 md:w-1/4 md:text-left" data-aos="fade-right">
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
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-200 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                <Icon name="arrow-left" className="h-5 w-5 text-gray-600" />
              </button>
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-200 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                <Icon name="arrow-right" className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div class="grid w-full grid-cols-1 gap-6 md:w-3/4 md:grid-cols-3">
            <!-- Product Card -->
            <div
              v-for="v in 3"
              :key="v"
              class="flex flex-col gap-4"
              data-aos="fade-up"
              :data-aos-delay="v * 100"
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
                <h4 class="mb-2 font-semibold">Amber Wood Diffuser</h4>
                <p>{{ formatCurrency(11400) }}</p>
              </div>
            </div>
          </div>
        </AppSection>

        <!-- Made with Kindess -->
        <AppSection
          background="bg-[url('/images/themes/shared/kindness.png')] bg-no-repeat bg-cover rounded-2xl"
          class="py-8 md:py-16"
          data-aos="fade-up"
        >
          <div
            class="flex min-h-[300px] items-center justify-center gap-8 rounded-2xl p-4 md:h-[448px] md:justify-end md:gap-16 md:p-0"
          >
            <div
              class="w-full max-w-xl rounded-2xl bg-white p-6 md:p-10"
              data-aos="fade-left"
              data-aos-delay="200"
            >
              <h2 class="text-2xl font-bold md:text-4xl">Made with Kindess</h2>
              <p class="mt-4 text-base text-gray-700 md:text-lg">
                At Bloom & Co., we believe self-care should feel joyful — not routine. Every product
                is made from gentle ingredients and designed to brighten your day inside and out.
              </p>
            </div>
          </div>
        </AppSection>

        <!-- Give the Gift of Calm -->
        <AppSection
          background="bg-[url('/images/themes/shared/gift.png')] bg-no-repeat bg-cover rounded-2xl mt-8"
          class="py-8 md:py-16"
          data-aos="fade-up"
        >
          <div
            class="flex min-h-[300px] items-center gap-8 rounded-2xl p-4 md:h-[448px] md:gap-16 md:p-0"
          >
            <div
              class="w-full max-w-xl rounded-2xl bg-white p-6 md:p-10"
              data-aos="fade-right"
              data-aos-delay="200"
            >
              <h2 class="text-2xl font-bold md:text-4xl">Give the Gift of Calm</h2>
              <p class="mt-4 text-base text-gray-700 md:text-lg">
                Curated self-care sets, perfect for loved ones — or yourself.
              </p>
              <AppButton label="Shop Now" class="mt-6 w-32 !rounded-full !bg-gray-700 md:w-40" />
            </div>
          </div>
        </AppSection>

        <!-- What our Customers are Saying -->
        <AppSection background="bg-white" class="py-8 md:py-10" data-aos="fade-up">
          <h2 className="mb-8 text-center text-2xl font-bold text-primary-900 md:mb-12 md:text-4xl">
            What Our Customers Say
          </h2>

          <Carousel v-bind="carouselSettings" class="testimonials-carousel">
            <Slide
              v-for="testimonial in testimonials"
              :key="testimonial.id"
              class="carousel__slide"
            >
              <div className="mx-2 rounded-lg bg-primary-50 p-6 h-full">
                <!-- Star Rating -->
                <div className="mb-4 flex items-center justify-center">
                  <div className="flex space-x-1">
                    <Icon
                      v-for="star in testimonial.rating"
                      :key="star"
                      name="star"
                      className="h-5 w-5 text-yellow-400 fill-current"
                    />
                  </div>
                </div>

                <p className="mb-6 text-center text-base text-primary-800 md:text-lg">
                  "{{ testimonial.text }}"
                </p>

                <div className="flex items-center justify-center space-x-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-200"
                  >
                    <span className="font-semibold text-primary-800">{{ testimonial.avatar }}</span>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">{{ testimonial.author }}</p>
                    <p className="text-sm text-gray-500">{{ testimonial.role }}</p>
                  </div>
                </div>
              </div>
            </Slide>

            <template #addons>
              <Navigation />
              <Pagination />
            </template>
          </Carousel>
        </AppSection>

        <!-- Join the Grace Circle -->
        <AppSection
          background="bg-gradient-to-r from-pink-400 via-white to-white rounded-2xl mt-8"
          class="py-8 md:py-16"
          data-aos="fade-up"
        >
          <div
            class="flex min-h-[300px] items-center justify-center gap-8 rounded-2xl p-4 md:h-[448px] md:justify-end md:gap-16 md:p-0"
          >
            <div
              class="w-full max-w-xl rounded-2xl bg-white p-6 md:p-10"
              data-aos="fade-left"
              data-aos-delay="200"
            >
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

    <footer class="bg-primary-50 py-8 md:py-16" data-aos="fade-up">
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

<style scoped>
/* Testimonials Carousel Styling */
.testimonials-carousel {
  padding: 0 20px;
}

.carousel__slide {
  padding: 0 10px;
  height: 100%;
}

.carousel__slide > div {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* Carousel Navigation */
:deep(.carousel__prev),
:deep(.carousel__next) {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  border: 2px solid #e5e7eb;
  color: #6b7280;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

:deep(.carousel__prev:hover),
:deep(.carousel__next:hover) {
  background: #f9fafb;
  border-color: #d1d5db;
  transform: scale(1.05);
}

/* Carousel Pagination */
:deep(.carousel__pagination) {
  margin-top: 20px;
}

:deep(.carousel__pagination-button) {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #d1d5db;
  border: none;
  margin: 0 4px;
  transition: all 0.2s ease;
}

:deep(.carousel__pagination-button--active) {
  background: #6366f1;
  transform: scale(1.2);
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .testimonials-carousel {
    padding: 0 10px;
  }

  .carousel__slide {
    padding: 0 5px;
  }
}
</style>
