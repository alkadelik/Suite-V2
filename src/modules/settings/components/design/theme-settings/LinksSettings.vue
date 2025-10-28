<template>
  <div class="rounded-lg bg-white md:block md:border md:border-gray-200">
    <div class="hidden border-b border-gray-200 p-4 md:block">
      <h4 class="text-lg font-semibold text-gray-900">Links</h4>
    </div>
    <div class="p-0 md:p-6">
      <div class="space-y-6">
        <FormField
          v-model="termsLink"
          type="url"
          name="terms_conditions_link"
          label="Terms & Conditions"
          placeholder="https://example.com/terms"
        />

        <div>
          <h5 class="text-core-700 mb-4 text-sm font-semibold">Social Links</h5>
          <div class="space-y-4">
            <div class="flex flex-col gap-2">
              <p class="text-core-800 text-sm">Instagram</p>
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center">
                  <img
                    src="/images/footer-instagram.png"
                    alt="Instagram"
                    class="aspect-square h-full object-contain"
                  />
                </div>
                <div class="flex-1">
                  <FormField
                    v-model="instagramLink"
                    type="url"
                    name="instagram_link"
                    label="Instagram"
                    placeholder="E.g instagram.com/mybusiness"
                    :hide-label="true"
                  />
                </div>
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <p class="text-core-800 text-sm">Facebook</p>
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center">
                  <img
                    src="/images/footer-facebook.png"
                    alt="Facebook"
                    class="aspect-square h-full object-contain"
                  />
                </div>
                <div class="flex-1">
                  <FormField
                    v-model="facebookLink"
                    type="url"
                    name="facebook_link"
                    label="Facebook"
                    placeholder="E.g facebook.com/mybusiness"
                    :hide-label="true"
                  />
                </div>
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <p class="text-core-800 text-sm">Twitter</p>
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center">
                  <img
                    src="/images/footer-instagram.png"
                    alt="Twitter"
                    class="aspect-square h-full object-contain"
                  />
                </div>
                <div class="flex-1">
                  <FormField
                    v-model="twitterLink"
                    type="url"
                    name="twitter_link"
                    label="Twitter"
                    placeholder="E.g twitter.com/mybusiness"
                    :hide-label="true"
                  />
                </div>
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <p class="text-core-800 text-sm">Tiktok</p>
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center">
                  <img
                    src="/images/footer-instagram.png"
                    alt="Tiktok"
                    class="aspect-square h-full object-contain"
                  />
                </div>
                <div class="flex-1">
                  <FormField
                    v-model="tiktokLink"
                    type="url"
                    name="tiktok_link"
                    label="Tiktok"
                    placeholder="E.g tiktok.com/@mybusiness"
                    :hide-label="true"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import FormField from "@components/form/FormField.vue"

const termsLink = ref("")
const instagramLink = ref("")
const facebookLink = ref("")
const twitterLink = ref("")
const tiktokLink = ref("")

// Expose method to get values
const getValues = () => {
  return {
    termsLink: termsLink.value,
    instagramLink: instagramLink.value,
    facebookLink: facebookLink.value,
    twitterLink: twitterLink.value,
    tiktokLink: tiktokLink.value,
  }
}

defineExpose({
  getValues,
})
</script>
