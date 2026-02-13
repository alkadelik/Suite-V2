<template>
  <div class="rounded-lg bg-white md:block md:border md:border-gray-200">
    <div class="hidden border-b border-gray-200 p-4 md:block">
      <h4 class="text-lg font-semibold text-gray-900">Links</h4>
    </div>
    <div class="p-0 md:p-6">
      <div class="space-y-6">
        <FormField
          v-model="termsLinkModel"
          type="url"
          name="terms_conditions_link"
          label="Return Policy"
          placeholder="https://example.com/return-policy"
        />

        <FormField
          v-model="sizeChartModel"
          type="file"
          name="size_chart"
          accept="image/*"
          :show-preview="true"
          label="Size Chart Image (if applicable)"
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
                    v-model="instagramLinkModel"
                    type="url"
                    name="instagram_link"
                    label="Instagram"
                    placeholder="E.g https://instagram.com/mybusiness"
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
                    v-model="facebookLinkModel"
                    type="url"
                    name="facebook_link"
                    label="Facebook"
                    placeholder="E.g https://facebook.com/mybusiness"
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
                    v-model="twitterLinkModel"
                    type="url"
                    name="twitter_link"
                    label="Twitter"
                    placeholder="E.g https://twitter.com/mybusiness"
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
                    v-model="tiktokLinkModel"
                    type="url"
                    name="tiktok_link"
                    label="Tiktok"
                    placeholder="E.g https://tiktok.com/@mybusiness"
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
import { computed } from "vue"
import FormField from "@components/form/FormField.vue"

const props = defineProps<{
  termsLink: string
  instagramLink: string
  facebookLink: string
  twitterLink: string
  tiktokLink: string
  sizeChart: File | string | null
}>()

const emit = defineEmits<{
  "update:termsLink": [value: string]
  "update:instagramLink": [value: string]
  "update:facebookLink": [value: string]
  "update:twitterLink": [value: string]
  "update:tiktokLink": [value: string]
  "update:sizeChart": [value: File | string | null]
}>()

const termsLinkModel = computed({
  get: () => props.termsLink,
  set: (value) => emit("update:termsLink", value),
})

const sizeChartModel = computed({
  get: () => props.sizeChart,
  set: (value) => emit("update:sizeChart", value),
})

const instagramLinkModel = computed({
  get: () => props.instagramLink,
  set: (value) => emit("update:instagramLink", value),
})

const facebookLinkModel = computed({
  get: () => props.facebookLink,
  set: (value) => emit("update:facebookLink", value),
})

const twitterLinkModel = computed({
  get: () => props.twitterLink,
  set: (value) => emit("update:twitterLink", value),
})

const tiktokLinkModel = computed({
  get: () => props.tiktokLink,
  set: (value) => emit("update:tiktokLink", value),
})
</script>
