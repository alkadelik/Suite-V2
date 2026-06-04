<template>
  <PageHeader title="Discounts" />

  <div class="p-4 md:p-6">
    <!-- desktop header -->
    <SectionHeader
      title="Discounts"
      subtitle="Manage all your discounts and promos"
      class="hidden md:flex"
    />

    <Tabs
      :tabs="[
        { key: 'discounts', title: 'Discounts' },
        { key: 'coupons', title: 'Coupons' },
      ]"
      v-model="activeTab"
      class="mt-4"
    >
      <template #discounts>
        <DiscountsTabPlaceholder />
      </template>

      <template #coupons>
        <EmptyState
          v-if="couponsEmpty"
          title="You don't have any discount or promo yet!"
          description="Add a new discount type for your orders by clicking the button below."
        >
          <template #action>
            <div class="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <AppButton label="Add a discount" icon="add" disabled />
              <AppButton label="Add a Coupon" icon="add" @click="openCreate" />
            </div>
          </template>
        </EmptyState>

        <CouponsTab
          v-show="!couponsEmpty"
          ref="couponsTabRef"
          @add="openCreate"
          @edit="openEdit"
          @duplicate="openDuplicate"
          @empty="(v) => (couponsEmpty = v)"
        />
      </template>
    </Tabs>

    <CreateCouponDrawer
      :open="showCreateDrawer"
      :mode="drawerMode"
      :coupon="editTarget"
      @close="showCreateDrawer = false"
      @saved="onSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { storeToRefs } from "pinia"
import PageHeader from "@components/PageHeader.vue"
import SectionHeader from "@components/SectionHeader.vue"
import Tabs from "@components/Tabs.vue"
import EmptyState from "@components/EmptyState.vue"
import AppButton from "@components/AppButton.vue"
import DiscountsTabPlaceholder from "../components/DiscountsTabPlaceholder.vue"
import CouponsTab from "../components/CouponsTab.vue"
import CreateCouponDrawer from "../components/CreateCouponDrawer.vue"
import { useDiscountsStore } from "../store"
import { toast } from "@/composables/useToast"
import type { TCoupon } from "../types"

const store = useDiscountsStore()
const { activeTab } = storeToRefs(store)

const couponsEmpty = ref(false)
const couponsTabRef = ref<InstanceType<typeof CouponsTab> | null>(null)

// Drawer state — the drawer component is built in a later task.
const showCreateDrawer = ref(false)
const drawerMode = ref<"create" | "edit" | "duplicate">("create")
const editTarget = ref<TCoupon | null>(null)

const openCreate = () => {
  drawerMode.value = "create"
  editTarget.value = null
  showCreateDrawer.value = true
}

const openEdit = (coupon: TCoupon) => {
  drawerMode.value = "edit"
  editTarget.value = coupon
  showCreateDrawer.value = true
}

const openDuplicate = (coupon: TCoupon) => {
  drawerMode.value = "duplicate"
  editTarget.value = coupon
  showCreateDrawer.value = true
}

const onSaved = () => {
  showCreateDrawer.value = false
  toast.success(drawerMode.value === "edit" ? "Coupon updated!" : "Success! New coupon created!")
  store.setActiveTab("coupons")
  couponsTabRef.value?.refetch?.()
}
</script>
