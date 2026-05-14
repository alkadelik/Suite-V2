<template>
  <div class="space-y-6 pb-6 md:pb-0">
    <SectionHeader
      title="Domains"
      subtitle="Connect and manage domains associated with your website."
    >
      <template #action>
        <div class="flex items-center gap-2">
          <AppButton
            v-if="GET_A_DOMAIN_ENABLED"
            label="Get A Domain"
            icon="shopping-cart"
            variant="outlined"
            color="alt"
            size="sm"
          />
          <!-- Desktop -->
          <div class="hidden md:block">
            <AppButton label="Connect New Domain" icon="add" size="sm" @click="openConnect()" />
          </div>
          <!-- Mobile -->
          <DropdownMenu
            class="md:hidden"
            :items="headerActions"
            placement="bottom-end"
            :show-chevron="false"
            size="sm"
            trigger-class="!bg-primary-50 !p-2 hover:!bg-primary-100 !border-0 !rounded-lg"
          >
            <template #trigger>
              <Icon name="dots-vertical" />
            </template>
          </DropdownMenu>
        </div>
      </template>
    </SectionHeader>

    <DomainsSkeleton v-if="isPending" />

    <template v-else>
      <BuiltInDomainCard :url="builtInUrl" />

      <CustomDomainCard
        v-if="customDomain"
        :domain="customDomain"
        :retrying="verifying"
        @retry="handleRetry"
        @disconnect="askDisconnect"
        @view="goToDetail"
      />

      <template v-else>
        <DomainEducationPanel @connect="openConnect()" />
        <HowItWorks />
      </template>
    </template>

    <ConnectDomainDrawer
      :open="connectOpen"
      :resume-domain="resumeDomain"
      @close="connectOpen = false"
      @live="onDomainLive"
    />

    <DomainLiveModal
      :open="liveOpen"
      :domain="liveDomain"
      @close="liveOpen = false"
      @go-to-store="goToStore"
    />

    <DisconnectDomainModal
      :open="disconnectOpen"
      :loading="disconnecting"
      :revert-to="builtInUrl"
      @close="disconnectOpen = false"
      @confirm="handleDisconnect"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue"
import { useRouter } from "vue-router"
import SectionHeader from "@components/SectionHeader.vue"
import AppButton from "@components/AppButton.vue"
import Icon from "@components/Icon.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import BuiltInDomainCard from "../components/domains/BuiltInDomainCard.vue"
import CustomDomainCard from "../components/domains/CustomDomainCard.vue"
import DomainEducationPanel from "../components/domains/DomainEducationPanel.vue"
import HowItWorks from "../components/domains/HowItWorks.vue"
import ConnectDomainDrawer from "../components/domains/ConnectDomainDrawer.vue"
import DomainLiveModal from "../components/domains/DomainLiveModal.vue"
import DisconnectDomainModal from "../components/domains/DisconnectDomainModal.vue"
import DomainsSkeleton from "../components/domains/DomainsSkeleton.vue"
import { GET_A_DOMAIN_ENABLED } from "../constants"
import { useGetCustomDomains, useVerifyCustomDomain, useDeleteCustomDomain } from "../api"
import { useSettingsStore } from "../store"
import { displayError } from "@/utils/error-handler"
import { toast } from "@/composables/useToast"
import type { TCustomDomain } from "../types"

const router = useRouter()
const settingsStore = useSettingsStore()
const builtInUrl = computed(() => settingsStore.storefrontUrl)

const { data: domainsData, isPending, error, refetch } = useGetCustomDomains()
watch(error, displayError)
const customDomain = computed<TCustomDomain | undefined>(() => domainsData.value?.results?.[0])

// --- connect drawer ---
const connectOpen = ref(false)
const resumeDomain = ref<TCustomDomain | null>(null)
function openConnect(resume: TCustomDomain | null = null) {
  resumeDomain.value = resume
  connectOpen.value = true
}

// --- live modal ---
const liveOpen = ref(false)
const liveDomain = ref("")
function onDomainLive(domain: string) {
  connectOpen.value = false
  liveDomain.value = domain
  liveOpen.value = true
  refetch()
}
function goToStore() {
  if (liveDomain.value)
    window.open(`https://${liveDomain.value.replace(/^https?:\/\//, "")}`, "_blank")
  liveOpen.value = false
}

// --- view detail ---
function goToDetail() {
  if (customDomain.value) router.push(`/settings/domains/${customDomain.value.uid}`)
}

// --- retry ---
const { mutate: verifyDomain, isPending: verifying } = useVerifyCustomDomain()
function handleRetry() {
  if (!customDomain.value) return
  verifyDomain(customDomain.value.uid, {
    onSuccess: () => {
      toast.success("Re-checking your domain…")
      refetch()
    },
    onError: displayError,
  })
}

// --- disconnect ---
const disconnectOpen = ref(false)
const { mutate: deleteDomain, isPending: disconnecting } = useDeleteCustomDomain()
function askDisconnect() {
  disconnectOpen.value = true
}
function handleDisconnect() {
  if (!customDomain.value) return
  deleteDomain(customDomain.value.uid, {
    onSuccess: () => {
      toast.success("Domain disconnected")
      disconnectOpen.value = false
      refetch()
    },
    onError: displayError,
  })
}

// --- mobile header actions ---
type THeaderAction = { label: string; icon: string; action: () => void; disabled?: boolean }
const headerActions = computed<THeaderAction[]>(() => [
  { label: "Connect New Domain", icon: "add", action: () => openConnect() },
  {
    label: "Get A Domain",
    icon: "shopping-cart",
    action: () => undefined,
    disabled: !GET_A_DOMAIN_ENABLED,
  },
])
</script>
