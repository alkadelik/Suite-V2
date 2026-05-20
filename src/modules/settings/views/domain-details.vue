<template>
  <div class="min-w-0 space-y-6 overflow-x-hidden pb-6 md:pb-0">
    <BackButton label="Back to Domains" to="/settings/domains" class="mb-2" />

    <DomainDetailsSkeleton v-if="loadingDetails" :built-in="isBuiltIn" />

    <div
      v-else-if="!isBuiltIn && !domain"
      class="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center"
    >
      <p class="text-sm font-medium text-gray-700">We couldn't find that domain.</p>
      <p class="mt-1 text-sm text-gray-500">It may have been removed or the link is incorrect.</p>
      <RouterLink
        to="/settings/domains"
        class="text-primary-600 mt-4 inline-block text-sm font-medium"
      >
        Back to Domains
      </RouterLink>
    </div>

    <template v-else>
      <!-- Header: title + chips + actions -->
      <div class="flex min-w-0 items-start justify-between gap-3">
        <div class="min-w-0 flex-1">
          <div class="flex min-w-0 items-center gap-2">
            <h2 class="min-w-0 truncate text-base font-bold text-gray-900 md:text-xl">
              {{ titleUrl }}
            </h2>
            <button
              type="button"
              class="text-primary-600 shrink-0 cursor-pointer"
              aria-label="Copy URL"
              @click="clipboardCopy(titleUrl)"
            >
              <Icon name="copy" size="20" />
            </button>
          </div>
          <div class="mt-1 flex flex-wrap gap-1.5">
            <Chip
              v-for="chip in chips"
              :key="chip.label"
              :label="chip.label"
              :color="chip.color"
              size="sm"
              variant="outlined"
              showDot
            />
          </div>
        </div>
        <div v-if="!isBuiltIn" class="hidden shrink-0 items-center gap-2 md:flex">
          <AppButton
            label="Manage DNS"
            icon="edit"
            variant="outlined"
            color="alt"
            size="sm"
            @click="scrollToDns"
          />
          <AppButton
            label="Open URL"
            icon="export"
            icon-placement="right"
            size="sm"
            @click="openUrl"
          />
        </div>
        <DropdownMenu
          v-if="!isBuiltIn"
          class="shrink-0 md:hidden"
          :items="detailMobileActions"
          placement="bottom-end"
          :show-chevron="false"
          size="sm"
          trigger-class="!p-1 hover:!bg-gray-100 !border-0 !rounded-lg"
        >
          <template #trigger>
            <Icon name="dots-vertical" />
          </template>
        </DropdownMenu>
      </div>

      <!-- Setup banner (custom domains in a non-active state) -->
      <WarningBox v-if="!isBuiltIn && banner" :header="banner.title">
        <p class="text-sm">{{ banner.message }}</p>
        <button
          type="button"
          class="text-warning-700 mt-1 flex items-center gap-1 text-sm font-medium"
          @click="completeSetup"
        >
          Complete Setup <Icon name="arrow-right" size="16" />
        </button>
      </WarningBox>

      <!-- Domain Details -->
      <section class="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <header class="border-b border-gray-200 px-4 py-4 text-sm font-semibold text-gray-800">
          Domain Details
        </header>
        <div class="space-y-3 p-4">
          <dl class="divide-y divide-gray-200 rounded-xl bg-gray-50">
            <div class="flex items-center justify-between gap-3 px-4 py-4 text-sm">
              <dt class="text-gray-500">SSL Certificate</dt>
              <dd class="font-medium text-gray-900">
                <Chip :label="sslLabel" :color="sslColor" size="sm" variant="outlined" showDot />
              </dd>
            </div>
            <div class="flex items-center justify-between gap-3 px-4 py-4 text-sm">
              <dt class="text-gray-500">Provider</dt>
              <dd class="font-semibold text-gray-900">{{ isBuiltIn ? "Leyyow" : "—" }}</dd>
            </div>
            <div class="flex items-center justify-between gap-3 px-4 py-4 text-sm">
              <dt class="text-gray-500">{{ isBuiltIn ? "Expires" : "Date Connected" }}</dt>
              <dd class="font-semibold text-gray-900">
                {{ isBuiltIn ? "Never" : connectedDate }}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <template v-if="!isBuiltIn && domain">
        <!-- DNS Records -->
        <section
          ref="dnsSection"
          class="overflow-hidden rounded-xl border border-gray-200 bg-white"
        >
          <header class="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <span class="text-sm font-semibold text-gray-800">DNS Records</span>
            <AppButton
              label="Refresh Records"
              icon="refresh-cw-01"
              variant="outlined"
              color="alt"
              size="xs"
              :loading="refreshing"
              @click="refreshRecords"
            />
          </header>
          <div class="p-2">
            <DnsRecordsTable :records="domain.dns_records" :domain-status="domain.status" />
          </div>
        </section>

        <!-- Redirect & Routing -->
        <section class="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <header class="border-b border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800">
            Redirect &amp; Routing
          </header>
          <div class="flex items-center justify-between gap-3 px-4 py-4 text-sm">
            <div class="min-w-0">
              <p class="text-xs text-gray-500">From</p>
              <p class="truncate font-medium">https://{{ builtInUrl }}</p>
            </div>
            <Icon name="arrow-right" size="18" class="shrink-0 text-gray-400" />
            <div class="min-w-0 text-right">
              <p class="text-xs text-gray-500">To</p>
              <p class="truncate font-medium">{{ titleUrl }}</p>
            </div>
          </div>
        </section>

        <!-- Actions -->
        <section class="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <header class="border-b border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800">
            Actions
          </header>
          <div class="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p class="text-sm font-semibold">Remove this domain</p>
              <p class="text-sm text-gray-500">
                Your store will revert to https://{{ builtInUrl }}. You can reconnect anytime.
              </p>
            </div>
            <AppButton
              label="Disconnect Domain"
              icon="link-2"
              variant="outlined"
              color="error"
              @click="disconnectOpen = true"
            />
          </div>
        </section>
      </template>
    </template>

    <ConnectDomainDrawer
      :open="connectOpen"
      :resume-domain="domain ?? null"
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
import { RouterLink, useRoute, useRouter } from "vue-router"
import BackButton from "@components/BackButton.vue"
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import WarningBox from "@components/WarningBox.vue"
import DnsRecordsTable from "../components/domains/DnsRecordsTable.vue"
import DomainDetailsSkeleton from "../components/domains/DomainDetailsSkeleton.vue"
import ConnectDomainDrawer from "../components/domains/ConnectDomainDrawer.vue"
import DomainLiveModal from "../components/domains/DomainLiveModal.vue"
import DisconnectDomainModal from "../components/domains/DisconnectDomainModal.vue"
import { DOMAIN_STATUS_META, type TChipColor } from "../constants"
import { useGetCustomDomain, useVerifyCustomDomain, useDeleteCustomDomain } from "../api"
import { useSettingsStore } from "../store"
import { clipboardCopy } from "@/utils/others"
import { displayError } from "@/utils/error-handler"
import { toast } from "@/composables/useToast"

const route = useRoute()
const router = useRouter()
const settingsStore = useSettingsStore()

const uidParam = computed(() => {
  const p = route.params.uid
  return typeof p === "string" ? p : ""
})
const isBuiltIn = computed(() => !uidParam.value)
const builtInUrl = computed(() => settingsStore.storefrontUrl)

const {
  data: domain,
  isPending,
  error,
} = useGetCustomDomain(uidParam, {
  enabled: () => !isBuiltIn.value && !!uidParam.value,
})
watch(error, displayError)
const loadingDetails = computed(() => !isBuiltIn.value && isPending.value)

const titleUrl = computed(() =>
  isBuiltIn.value
    ? `https://${builtInUrl.value.replace(/^https?:\/\//, "")}`
    : `https://${(domain.value?.domain ?? "").replace(/^https?:\/\//, "")}`,
)
const meta = computed(() => (domain.value ? DOMAIN_STATUS_META[domain.value.status] : undefined))
const chips = computed<{ label: string; color: TChipColor }[]>(() =>
  isBuiltIn.value
    ? [
        { label: "Primary", color: "primary" },
        { label: "Secure", color: "success" },
        { label: "Never Expires", color: "primary" },
      ]
    : (meta.value?.chips ?? []),
)
const banner = computed(() => meta.value?.banner)
const connectedDate = computed(() => {
  const d = domain.value?.verified_at ?? domain.value?.created_at
  return d ? new Date(d).toLocaleDateString() : "—"
})
const sslActive = computed(() => isBuiltIn.value || domain.value?.status === "ACTIVE")
const sslLabel = computed(() => (sslActive.value ? "Active" : "Unavailable"))
const sslColor = computed<TChipColor>(() => (sslActive.value ? "success" : "alt"))

function openUrl() {
  window.open(titleUrl.value, "_blank")
}

const dnsSection = ref<HTMLElement | null>(null)
function scrollToDns() {
  dnsSection.value?.scrollIntoView({ behavior: "smooth" })
}

type TMobileAction = { label: string; icon: string; action: () => void }
const detailMobileActions = computed<TMobileAction[]>(() => [
  { label: "Manage DNS", icon: "edit", action: scrollToDns },
  { label: "Open URL", icon: "export", action: openUrl },
])

const { mutate: verifyDomain, isPending: refreshing } = useVerifyCustomDomain()
function refreshRecords() {
  if (!domain.value) return
  verifyDomain(domain.value.uid, {
    onSuccess: () => toast.success("Re-checking your DNS records…"),
    onError: displayError,
  })
}

const connectOpen = ref(false)
function completeSetup() {
  connectOpen.value = true
}

const liveOpen = ref(false)
const liveDomain = ref("")
function onDomainLive(d: string) {
  connectOpen.value = false
  liveDomain.value = d
  liveOpen.value = true
}
function goToStore() {
  if (liveDomain.value) {
    window.open(`https://${liveDomain.value.replace(/^https?:\/\//, "")}`, "_blank")
  }
  liveOpen.value = false
}

const disconnectOpen = ref(false)
const { mutate: deleteDomain, isPending: disconnecting } = useDeleteCustomDomain()
function handleDisconnect() {
  if (!domain.value) return
  deleteDomain(domain.value.uid, {
    onSuccess: () => {
      toast.success("Domain disconnected")
      disconnectOpen.value = false
      void router.push("/settings/domains")
    },
    onError: displayError,
  })
}
</script>
