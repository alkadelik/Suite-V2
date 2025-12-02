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
    text: "Absolutely love the quality and packaging. Heritage has become my go-to for all my self-care needs.",
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
    text: "Heritage has transformed my self-care routine. Each product feels like a spa experience at home.",
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
  <div class="min-h-[dvh] bg-gray-50">
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
          <AppButton label="View Cart" icon="bag" class="!bg-primary-900 !hidden sm:!inline-flex" />
          <AppButton icon="bag" class="!bg-primary-900 sm:!hidden" size="sm" />
        </div>
      </AppSection>
    </header>

    <!-- Main content -->
    <main>
      <div>
        <!-- Find your Beauty -->
        <AppSection
          background="bg-primary-50 bg-[url('/images/themes/heritage/bg-pattern-1.svg')] bg-cover bg-bottom bg-no-repeat"
          class="py-12 md:py-16"
          data-aos="fade-up"
        >
          <div class="flex flex-col items-center gap-8 text-center md:gap-16">
            <div class="max-w-2xl" data-aos="fade-up" data-aos-delay="200">
              <h2 class="text-3xl font-bold md:text-5xl">Find your Beauty</h2>
              <p class="text-primary-700 mt-4 text-base md:text-lg">
                Colorful, calming essentials for skin, space, and self. Colorful, calming essentials
                for skin, space, and self.Colorful, calming essentials for skin, space, and self.
              </p>
              <AppButton label="Shop Now" class="!bg-primary-900 mt-6 w-40 !rounded-none" />
            </div>
            <img
              src="/images/themes/heritage/hero.png"
              class="h-[250px] w-full rounded-xl object-cover md:h-[400px]"
              data-aos="fade-up"
              data-aos-delay="400"
            />
          </div>
        </AppSection>

        <!-- Featured Products -->
        <AppSection background="bg-white" class="py-8 md:py-16" data-aos="fade-up">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900 md:mb-12 md:text-3xl">
            Featured Products
          </h2>

          <div class="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            <!-- Product Card -->
            <div
              v-for="v in 4"
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

          <div class="mt-8 flex justify-center md:mt-12" data-aos="fade-up" data-aos-delay="500">
            <AppButton
              label="View All Products"
              color="alt"
              icon="arrow-right"
              class="!flex-row-reverse !rounded-none"
            />
          </div>
        </AppSection>

        <!-- Made with Kindess -->
        <AppSection
          background="bg-primary-50 bg-[url('/images/themes/heritage/bg-pattern-2.svg')] bg-cover bg-bottom bg-no-repeat"
          class="py-8 md:py-16"
          data-aos="fade-up"
        >
          <div class="flex flex-col items-center gap-6 md:flex-row md:gap-10">
            <img
              src="/images/themes/shared/kindness.png"
              class="h-[250px] w-full rounded-xl object-cover md:h-[448px] md:w-1/2"
              data-aos="fade-right"
              data-aos-delay="200"
            />
            <div
              class="text-center md:w-1/2 md:text-left"
              data-aos="fade-left"
              data-aos-delay="400"
            >
              <h2 class="text-3xl font-bold md:text-5xl">Made with Kindess</h2>
              <p class="text-primary-700 mt-4 text-base md:text-lg">
                At Bloom & Co., we believe self-care should feel joyful — not routine. Every product
                is made from gentle ingredients and designed to brighten your day inside and out.
              </p>
            </div>
          </div>
        </AppSection>

        <div class="py-6" />

        <!-- Give the Gift of Calm -->
        <AppSection
          background="bg-primary-50 bg-[url('/images/themes/heritage/bg-pattern-1.svg')] bg-cover bg-bottom bg-no-repeat"
          class="py-8 md:py-16"
          data-aos="fade-up"
        >
          <div class="flex w-full flex-col items-center gap-6 md:flex-row md:gap-10">
            <div
              class="text-center md:w-1/2 md:text-left"
              data-aos="fade-right"
              data-aos-delay="200"
            >
              <h2 class="text-3xl font-bold md:text-5xl">Give the Gift of Calm</h2>
              <p class="text-primary-700 mt-4 text-base md:text-lg">
                Curated self-care sets, perfect for loved ones — or yourself.
              </p>
              <AppButton label="Shop Gift Sets" class="!bg-primary-900 mt-6 !rounded-none" />
            </div>
            <img
              src="/images/themes/shared/gift.png"
              class="h-[250px] w-[250px] rounded-full object-cover md:h-[448px] md:w-[448px]"
              data-aos="fade-left"
              data-aos-delay="400"
            />
          </div>
        </AppSection>

        <!-- What our Customers are Saying -->
        <AppSection background="bg-white" class="py-8 md:py-10">
          <h2 className="mb-8 text-center text-3xl font-bold text-primary-900 md:mb-12 md:text-5xl">
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

                <div
                  className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary-900 p-1 text-center text-4xl text-white mx-auto"
                >
                  "
                </div>
                <p className="mb-6 text-center text-lg text-primary-800">
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

            <template #addons>
              <Navigation />
              <Pagination />
            </template>
          </Carousel>
        </AppSection>

        <!-- Join the Dawn Circle -->
        <AppSection
          background="bg-primary-50 bg-[url('/images/themes/heritage/bg-pattern-3.svg')] bg-cover bg-bottom bg-no-repeat"
          class="py-8 md:py-16"
        >
          <div
            class="mx-auto max-w-4xl rounded-xl bg-white p-6 md:p-10"
            data-aos="zoom-in"
            data-aos-delay="200"
          >
            <div class="flex flex-col items-center gap-6 md:gap-10">
              <img
                src="/images/themes/shared/subscribe.png"
                class="h-[150px] w-[150px] rounded-full md:h-[224px] md:w-[224px]"
                data-aos="fade-down"
                data-aos-delay="400"
              />
              <div class="text-center" data-aos="fade-up" data-aos-delay="600">
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

    <footer class="bg-primary-900 py-8 text-white md:py-16" data-aos="fade-up">
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
  background: #7c3aed;
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
