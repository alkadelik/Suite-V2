<script setup lang="ts">
import { formatCurrency } from "@/utils/format-currency"
import AppButton from "@components/AppButton.vue"
import AppSection from "@components/AppSection.vue"
import Chip from "@components/Chip.vue"
import TextField from "@components/form/TextField.vue"
import Icon from "@components/Icon.vue"
import "vue3-carousel/carousel.css"
import { Carousel, Slide } from "vue3-carousel"
import { computed, ref, onMounted } from "vue"
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

const activeSlide = ref(0)
const carouselRef = ref()

const testimonials = computed(() => [
  {
    id: 1,
    text: "The scents are divine — my mornings feel brand new!",
    author: "Ada E.",
    role: "Lifestyle Blogger",
    initials: "AE",
  },
  {
    id: 2,
    text: "Amazing quality products that have transformed my self-care routine. Highly recommend!",
    author: "Michael R.",
    role: "Wellness Coach",
    initials: "MR",
  },
  {
    id: 3,
    text: "Love the natural ingredients and the beautiful packaging. These products are a treat!",
    author: "Sarah K.",
    role: "Beauty Enthusiast",
    initials: "SK",
  },
  {
    id: 4,
    text: "The customer service is exceptional and the products exceed expectations every time.",
    author: "James D.",
    role: "Repeat Customer",
    initials: "JD",
  },
  {
    id: 5,
    text: "Gentle on my sensitive skin but still effective. Perfect for my daily routine.",
    author: "Emily Chen",
    role: "Skincare Lover",
    initials: "EC",
  },
  {
    id: 6,
    text: "The fragrance collection is absolutely stunning. Each scent tells a story.",
    author: "David M.",
    role: "Fragrance Collector",
    initials: "DM",
  },
  {
    id: 7,
    text: "Fast shipping and eco-friendly packaging. A brand that truly cares about the environment.",
    author: "Lisa P.",
    role: "Environmental Advocate",
    initials: "LP",
  },
  {
    id: 8,
    text: "These products make perfect gifts. My friends always ask where I got them!",
    author: "Rachel T.",
    role: "Gift Giver",
    initials: "RT",
  },
])

const nextSlide = () => {
  if (carouselRef.value) {
    carouselRef.value.next()
  }
}

const prevSlide = () => {
  if (carouselRef.value) {
    carouselRef.value.prev()
  }
}

onMounted(() => {
  AOS.init({
    duration: 800,
    once: true,
    offset: 100,
  })
})
</script>

<template>
  <div class="min-h-[100dvh] bg-[#1a1a1a] text-white">
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
          <AppButton label="View Cart" icon="bag" class="!hidden sm:!inline-flex" />
          <AppButton icon="bag" class="sm:!hidden" size="sm" />
        </div>
      </AppSection>
    </header>

    <!-- Main content -->
    <main>
      <div>
        <!-- Find your Beauty -->
        <AppSection background="bg-black" class="py-8 md:py-16">
          <div class="flex flex-col gap-8 md:gap-16">
            <div class="max-w-2xl" data-aos="fade-up">
              <h1 class="text-4xl font-bold md:text-5xl">Find your Beauty</h1>
              <p class="mt-4 text-lg text-gray-200 md:text-lg">
                Colorful, calming essentials for skin, space, and self. Colorful, calming essentials
                for skin, space, and self.Colorful, calming essentials for skin, space, and self.
              </p>
              <AppButton label="Shop Now" class="mt-6 w-32 md:w-40" />
            </div>
            <!-- <img class="h-[250px] w-full rounded-xl bg-pink-200 md:h-[400px]" /> -->

            <!-- <div class="clip-path-cutout h-[400px] overflow-hidden rounded-2xl"> -->
            <img
              src="https://www.w3schools.com/css/img_5terre.jpg"
              alt="Spa products"
              class="mask1 h-full w-full"
              data-aos="fade-up"
              data-aos-delay="200"
            />
            <!-- </div> -->
          </div>

          <!-- <div class="mt-20">
            <div class="clip-path-cutout h-[400px] overflow-hidden rounded-2xl">
              <img
                src="/images/themes/shared/product-1.png"
                alt="Spa products"
                class="h-full w-full object-cover"
              />
            </div>
          </div> -->
        </AppSection>

        <!-- Featured Products -->
        <AppSection background="" class="py-8 md:py-16">
          <div
            class="mb-8 flex flex-col gap-4 md:mb-12 md:flex-row md:justify-between"
            data-aos="fade-up"
          >
            <h2 className="text-2xl font-bold md:text-3xl">Featured Products</h2>
            <AppButton
              label="View All Products"
              color="alt"
              icon="arrow-right"
              class="w-max !flex-row-reverse md:self-auto"
            />
          </div>

          <div class="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-6">
            <!-- Product Card -->
            <div
              v-for="v in 5"
              :key="v"
              class="flex flex-col gap-4"
              :class="{ 'col-span-2 sm:row-span-2': v === 1, 'col-span-1': v > 1 }"
              data-aos="fade-up"
              :data-aos-delay="v * 100"
            >
              <div
                class="rounded-xl] relative"
                :class="{
                  'h-[200px] sm:h-[320px] md:h-[600px]': v === 1,
                  'h-[180px] sm:h-[255px]': v > 1,
                }"
              >
                <img
                  :src="`/images/themes/shared/product-${v % 2 ? 1 : 2}.png`"
                  class="relative mb-4 h-full w-full rounded-xl"
                />
                <button
                  class="absolute right-4 bottom-4 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-gray-700 shadow-md md:h-10 md:w-10"
                >
                  <Icon name="shop" />
                </button>
              </div>
              <div>
                <Chip color="purple" icon="tag" label="Home fragrance" />
                <h4
                  class="mb-2 font-semibold"
                  :class="{ 'md:text-xl': v === 1, 'text-sm md:text-base': v > 1 }"
                >
                  Amber Wood Diffuser
                </h4>
                <p class="text-sm md:text-base">{{ formatCurrency(11400) }}</p>
              </div>
            </div>
          </div>
        </AppSection>

        <!-- Made with Kindess -->
        <AppSection background="bg-black" class="py-8 md:py-16">
          <div class="flex flex-col gap-8 md:gap-16">
            <div class="max-w-2xl" data-aos="fade-up">
              <h2 class="text-3xl font-bold md:text-5xl">Made with Kindess & Color</h2>
              <p class="mt-4 text-base text-gray-200 md:text-lg">
                At Bloom & Co., we believe self-care should feel joyful — not routine. Every product
                is made from gentle ingredients and designed to brighten your day inside and out.
              </p>
            </div>
            <img
              src="https://www.w3schools.com/css/img_5terre.jpg"
              class="mask1 h-[250px] w-full rounded-xl object-cover md:h-[617px]"
              data-aos="fade-up"
              data-aos-delay="200"
            />
          </div>
        </AppSection>

        <!-- Give the Gift of Calm -->
        <AppSection background="" class="py-8 md:py-16">
          <div class="flex w-full flex-col-reverse items-center gap-6 md:flex-row md:gap-10">
            <img
              src="/images/themes/ember/gift.png"
              class="h-[250px] w-full rounded-2xl md:h-[448px] md:w-[448px]"
              data-aos="fade-right"
            />
            <div class="w-full md:w-1/2" data-aos="fade-left">
              <h2 class="text-3xl font-bold md:text-5xl">Give the Gift of Calm</h2>
              <p class="mt-4 text-base text-gray-300 md:text-lg">
                Curated self-care sets, perfect for loved ones — or yourself.
              </p>
              <AppButton label="Shop Gift Sets" class="mt-6 md:w-40" />
            </div>
          </div>
        </AppSection>

        <!-- What our Customers are Saying -->
        <AppSection
          background="bg-black"
          class="flex flex-col items-center justify-between gap-6 py-12 md:flex-row md:py-20"
        >
          <div class="w-full md:w-1/5" data-aos="fade-right">
            <h2 className="text-2xl font-bold text-white mb-8 md:text-3xl md:mb-12">
              What Our <br />Customers Say
            </h2>

            <div class="mt-8 flex gap-2 text-gray-700">
              <button
                @click="prevSlide"
                className="w-10 h-10 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <Icon name="arrow-left" className="w-5 h-5 text-gray-600" />
              </button>
              <button
                @click="nextSlide"
                className="w-10 h-10 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <Icon name="arrow-right" className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div class="w-full md:w-3/5" data-aos="fade-left">
            <Carousel
              ref="carouselRef"
              v-model="activeSlide"
              v-bind="{
                itemsToShow: 1,
                autoplay: 3000,
                wrapAround: true,
                gap: 16,
                breakpoints: {
                  640: {
                    itemsToShow: 3,
                  },
                },
              }"
            >
              <Slide v-for="testimonial in testimonials" :key="testimonial.id">
                <div className="bg-primary-600/80 text-white rounded-lg p-4">
                  <p className="text-base md:text-lg mb-4 md:mb-6">
                    {{ testimonial.text }}
                  </p>
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 md:w-12 md:h-12 bg-gray-300 rounded-full flex items-center justify-center"
                    >
                      <span className="text-gray-600 font-semibold text-sm md:text-base">
                        {{ testimonial.initials }}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm md:text-base">{{ testimonial.author }}</p>
                      <p className="text-xs md:text-sm">{{ testimonial.role }}</p>
                    </div>
                  </div>
                </div>
              </Slide>
            </Carousel>
          </div>
        </AppSection>

        <!-- Join the Ember Circle -->
        <AppSection background="bg-black" class="py-8 md:py-16">
          <div class="w-full rounded-xl bg-[#1a1a1a] p-6 md:p-10" data-aos="fade-up">
            <img
              src="/images/themes/ember/subscribe.png"
              class="h-[150px] w-[150px] rounded-2xl md:h-[200px] md:w-[200px]"
              data-aos="zoom-in"
              data-aos-delay="200"
            />
            <div class="mt-6 flex w-full flex-col items-start gap-6 md:flex-row md:gap-10">
              <div class="w-full md:w-1/2" data-aos="fade-right" data-aos-delay="300">
                <h2 class="text-2xl font-semibold md:text-3xl">Join the Ember Circle</h2>
                <p class="mt-2 text-sm text-gray-300 md:text-base">
                  Get 10% off your first order and updates on new launches.
                </p>
              </div>

              <div
                class="flex w-full flex-col items-center gap-4 md:w-1/2 md:flex-row"
                data-aos="fade-left"
                data-aos-delay="400"
              >
                <TextField
                  type="email"
                  placeholder="e.g. adebola99@gmail.com"
                  class="w-full"
                  containerClass="!bg-white"
                />
                <AppButton label="Subscribe Now" class="w-full flex-shrink-0 md:w-max" />
              </div>
            </div>
          </div>
        </AppSection>
      </div>
    </main>

    <footer class="border-t border-gray-900 bg-black py-8 text-white md:py-16">
      <AppSection class="grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-2" data-aos="fade-up">
        <div class="flex flex-col gap-3" data-aos="fade-right">
          <router-link to="/">
            <img src="/company-logo.svg?url" class="h-6 md:h-8" alt="leyyow logo" />
          </router-link>

          <p class="my-4 md:my-6">Timeless essentials, designed for everyday life.</p>

          <p class="inline-flex items-center gap-2 text-sm md:text-base">
            <Icon name="sms" />
            <a href="mailto:hello@dawnboutique.com">hello@dawnboutique.com</a>
          </p>
          <p class="inline-flex items-center gap-2 text-sm md:text-base">
            <Icon name="call" />
            <a href="tel:+1234567890">+1 (234) 567-890</a>
          </p>
        </div>

        <div class="col-span-1 grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-8" data-aos="fade-left">
          <div class="border-l border-gray-300 pl-4">
            <h3 class="mb-4 text-sm font-semibold text-gray-500">Shop</h3>
            <div class="flex flex-col gap-3">
              <a
                v-for="link in shopLinks"
                :key="link.name"
                :href="link.href"
                :target="link.href.startsWith('http') ? '_blank' : undefined"
                class="hover:text-brand-500 text-sm font-medium text-gray-200 hover:underline md:text-base"
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

<style>
.clip-path-cutout {
  clip-path: polygon(
    0% 15%,
    0 0,
    15% 0%,
    85% 0%,
    85% 15%,
    100% 15%,
    100% 85%,
    100% 100%,
    85% 100%,
    15% 100%,
    15% 85%,
    0% 85%
  );
}

.mask1 {
  -webkit-mask-image: url(/images/themes/ember/hero.png);
  mask-image: url(/images/themes/ember/hero.png);
  mask-repeat: no-repeat;
  mask-size: 100% auto;
}
</style>
