<script setup>
import { onMounted } from "vue"
import { useRouter } from "vue-router"
import Icon from "@components/Icon.vue"
import BackButton from "@components/BackButton.vue"

const router = useRouter()

onMounted(() => {
  const isMobile = window.innerWidth < 768

  if (isMobile) {
    // On mobile: stay here and show links
    // do nothing
  } else {
    // On desktop: redirect to first settings page
    router.replace({ name: "Profile" })
  }
})

const settingsLinks = [
  { label: "Profile", path: "/settings/profile", icon: "profile-circle" },
  { label: "Store Details", path: "/settings/store-details", icon: "shop-outline" },
  { label: "Password", path: "/settings/password", icon: "key" },
  { label: "Teams", path: "/settings/teams", icon: "people" },
  { label: "Plans & Billing", path: "/settings/billing", icon: "star-fast" },
  { label: "Locations", path: "/settings/locations", icon: "map" },
  { label: "Design", path: "/settings/design", icon: "designtools" },
  { label: "Delivery Options", path: "/settings/delivery-options", icon: "truck-fast-outline" },
]
</script>

<template>
  <!-- Only rendered on mobile -->
  <div>
    <header
      class="flex flex-col justify-center border-b border-gray-200 pb-4 text-center md:block md:text-left"
    >
      <BackButton to="/dashboard" :center-on-mobile="true" />
      <h2 class="mt-3 text-2xl font-bold">Settings</h2>
      <p>shop.leyyow.com</p>
    </header>
    <div class="flex flex-col">
      <router-link
        v-for="link in settingsLinks"
        :key="link.path"
        :to="link.path"
        class="hover:bg-primary-100 flex items-center justify-between gap-2 border-b border-gray-200 py-5 text-sm font-medium"
      >
        <div class="flex items-center gap-2">
          <Icon :name="link.icon" size="20" />
          <p>{{ link.label }}</p>
        </div>
        <Icon name="chevron-right" size="18" />
      </router-link>
    </div>
  </div>
</template>
