<script setup lang="ts">
import AppButton from "@components/AppButton.vue"

import Switch from "@components/form/Switch.vue"
import Icon from "@components/Icon.vue"
import SectionHeader from "@components/SectionHeader.vue"

import { ref } from "vue"
const form = ref({ allow_pickup: false, allow_delivery: true })
</script>

<template>
  <div>
    <section>
      <SectionHeader
        title="Delivery Options"
        size="sm"
        subtitle="Manage how your orders are fulfilled—pickup, delivery, or a mix of both."
      />

      <div class="border-core-100 mt-6 rounded-2xl border bg-white">
        <div class="grid gap-10 p-6">
          <!-- pickup -->
          <div class="flex items-center gap-6">
            <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-200">
              <Icon name="shop" size="24" class="text-gray-600" />
            </span>

            <div class="flex-1">
              <h3 class="mb-1 flex items-end gap-2 text-base font-semibold">
                Allow Pickup?
                <button type="button" class="text-primary-600 text-sm underline">
                  Manage address
                </button>
              </h3>
              <p class="text-core-600 text-sm">
                Let customers pick up their orders directly from you.
              </p>
            </div>
            <Switch v-model="form.allow_pickup" />
          </div>

          <!-- delivery -->
          <div class="flex items-center gap-6">
            <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-200">
              <Icon name="truck-fast" size="24" class="text-gray-600" />
            </span>

            <div class="flex-1">
              <h3 class="mb-1 flex items-end gap-2 text-base font-semibold">
                Allow Delivery?
                <button type="button" class="text-primary-600 text-sm underline">
                  Manage preferred couriers
                </button>
              </h3>
              <p class="text-core-600 text-sm">Offer deliver to your customers.</p>
            </div>
            <Switch v-model="form.allow_delivery" />
          </div>
        </div>

        <div class="border-core-100 flex justify-end gap-6 border-t px-6 py-4">
          <AppButton label="Save Changes" />
        </div>
      </div>
    </section>
  </div>
</template>
