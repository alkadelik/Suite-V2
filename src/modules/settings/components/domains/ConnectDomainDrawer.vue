<template>
  <Teleport to="body">
    <Drawer
      :open="open"
      position="right"
      max-width="2xl"
      :show-header="false"
      body-class="flex flex-col overflow-y-hidden"
      :handle-padding="false"
      @close="onClose"
    >
      <!-- Sticky header: rendered in the named #header slot so it lives outside
         the scrollable body div and never scrolls away. -->
      <template #header>
        <div class="flex shrink-0 items-center justify-between border-b border-gray-200 p-5">
          <h2 class="text-lg font-semibold text-gray-800">Connect Domain</h2>
          <div class="flex items-center gap-3">
            <ol class="flex items-center gap-1.5">
              <template v-for="(label, i) in stepLabels" :key="label">
                <li
                  class="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold"
                  :class="
                    i < stepIndex
                      ? 'bg-primary-500 text-white'
                      : i === stepIndex
                        ? 'bg-primary-50 border-primary-500 text-primary-600 border'
                        : 'bg-gray-100 text-gray-400'
                  "
                >
                  <Icon v-if="i < stepIndex" name="check" size="14" />
                  <span v-else>{{ i + 1 }}</span>
                </li>
                <li
                  v-if="i < stepLabels.length - 1"
                  class="h-px w-6"
                  :class="i < stepIndex ? 'bg-primary-500' : 'bg-gray-200'"
                />
              </template>
            </ol>
            <button
              type="button"
              class="cursor-pointer text-gray-500"
              aria-label="Close"
              @click="onClose"
            >
              <Icon name="close-circle" size="20" />
            </button>
          </div>
        </div>
      </template>

      <!-- STEP 1 — enter domain (AppForm wraps the field AND the submit button) -->
      <AppForm
        v-if="stepIndex === 0"
        :schema="domainSchema"
        v-slot="{}"
        class="flex flex-1 flex-col overflow-hidden"
        @submit="handleCreate"
      >
        <div class="flex-1 space-y-4 overflow-y-auto p-5">
          <p class="text-sm text-gray-600">
            Enter the domain name you would like to use with your storefront.
          </p>
          <FormField
            type="text"
            name="domain"
            label="Domain Name"
            placeholder="e.g. yourbrand.com"
            required
          />
          <p v-if="createError" class="text-error-600 text-sm">{{ createError }}</p>
        </div>
        <div class="flex shrink-0 justify-end border-t border-gray-200 p-5">
          <AppButton type="submit" label="Continue" :loading="creating" :disabled="creating" />
        </div>
      </AppForm>

      <!-- STEP 2 — add DNS records -->
      <div v-else-if="stepIndex === 1" class="flex flex-1 flex-col overflow-hidden">
        <div class="flex-1 space-y-5 overflow-y-auto p-5">
          <p class="text-sm text-gray-600">
            Log in to your domain registrar and add the following records.
          </p>
          <InfoBox
            message="DNS changes can take up to 48 hours to propagate, but usually happen within a few minutes. Continue to the next step when you've saved the records."
          />
          <div class="rounded-xl border border-gray-200">
            <header class="border-b border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800">
              DNS records to add
            </header>
            <div class="p-2">
              <DnsRecordsTable :records="dnsRecords" :show-status="false" />
            </div>
          </div>
          <div class="rounded-xl border border-gray-200 p-4">
            <h3 class="text-sm font-semibold text-gray-800">Domain instructions</h3>
            <ol class="mt-3 list-decimal space-y-2 pl-5 text-sm text-gray-600">
              <li v-for="(line, i) in DNS_INSTRUCTION_STEPS" :key="i">{{ line }}</li>
            </ol>
          </div>
        </div>
        <div class="flex shrink-0 justify-between border-t border-gray-200 p-5">
          <AppButton
            label="Back"
            icon="arrow-left"
            variant="outlined"
            color="alt"
            @click="goBack"
          />
          <AppButton label="I've added the records" @click="goToVerify" />
        </div>
      </div>

      <!-- STEP 3 — verifying -->
      <div v-else class="flex flex-1 flex-col overflow-hidden">
        <div class="flex-1 space-y-6 overflow-y-auto p-5">
          <p class="text-sm text-gray-600">
            Once you've saved the DNS records in your registrar, check that they're correctly
            pointing to Leyyow. This usually takes a few minutes.
          </p>

          <div class="flex items-center justify-center gap-3 py-2">
            <div class="flex flex-col items-center gap-1">
              <img :src="earthImg" alt="" class="h-7 w-7" />
              <span class="max-w-24 truncate text-xs text-gray-600">{{
                activeDomain?.domain
              }}</span>
            </div>
            <span class="h-px w-10 bg-gray-200" />
            <Icon
              name="loader"
              size="20"
              class="text-gray-400"
              :class="{ 'animate-spin': polling }"
            />
            <span class="h-px w-10 bg-gray-200" />
            <div class="flex flex-col items-center gap-1">
              <img src="/LYW-icon.svg" alt="Leyyow" class="h-7 w-7" />
              <span class="text-xs text-gray-600">Leyyow</span>
            </div>
          </div>

          <div class="text-center">
            <p class="font-semibold text-gray-900">{{ stateHeading }}</p>
            <p class="text-sm text-gray-500">{{ stateMessage }}</p>
          </div>

          <ul class="rounded-xl border border-gray-200 p-4">
            <li
              v-for="check in checklist"
              :key="check.key"
              class="flex items-center justify-between border-b border-gray-100 py-2 last:border-0"
            >
              <span class="flex items-center gap-2 text-sm text-gray-700">
                <Icon :name="check.icon" size="16" /> {{ check.label }}
              </span>
              <Icon v-if="check.done" name="check-circle" size="18" class="text-success-600" />
              <Icon
                v-else-if="polling"
                name="loader"
                size="16"
                class="animate-spin text-gray-400"
              />
              <span v-else class="text-gray-300">—</span>
            </li>
          </ul>
        </div>
        <div class="flex shrink-0 justify-between border-t border-gray-200 p-5">
          <AppButton
            label="Back"
            icon="arrow-left"
            variant="outlined"
            color="alt"
            @click="goBack"
          />
          <AppButton
            v-if="verifyState === 'failed'"
            label="Try again"
            :loading="verifying"
            @click="retryVerification"
          />
          <AppButton
            v-else-if="verifyState === 'timeout'"
            label="Close"
            variant="outlined"
            color="alt"
            @click="onClose"
          />
          <AppButton v-else label="Checking…" disabled :loading="polling" />
        </div>
      </div>
    </Drawer>
  </Teleport>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue"
import * as yup from "yup"
import Drawer from "@components/Drawer.vue"
import AppForm from "@components/form/AppForm.vue"
import FormField from "@components/form/FormField.vue"
import AppButton from "@components/AppButton.vue"
import Icon from "@components/Icon.vue"
import InfoBox from "@components/InfoBox.vue"
import DnsRecordsTable from "./DnsRecordsTable.vue"
import { DNS_INSTRUCTION_STEPS, MOCK_DNS_RECORDS } from "../../constants"
import { useCreateCustomDomain, useGetCustomDomain, useVerifyCustomDomain } from "../../api"
import { displayError } from "@/utils/error-handler"
import type { TCustomDomain, TDnsRecord } from "../../types"
import earthImg from "@/assets/images/domains/earth.png"

const props = defineProps<{ open: boolean; resumeDomain?: TCustomDomain | null }>()
const emit = defineEmits<{ close: []; live: [domain: string] }>()

const stepLabels = ["Domain", "DNS Records", "Verify"]
const stepIndex = ref(0)

// The domain being set up — either freshly created or the one passed via resumeDomain.
const activeDomain = ref<TCustomDomain | null>(null)
const dnsRecords = computed<TDnsRecord[]>(
  () =>
    activeDomain.value?.dns_records ?? activeDomain.value?.verification_records ?? MOCK_DNS_RECORDS,
)

const domainSchema = yup.object({
  domain: yup
    .string()
    .required("Enter a domain")
    .matches(
      /^(?!-)([a-zA-Z0-9-]{1,63}(?<!-)\.)+[a-zA-Z]{2,}$/,
      "Enter a valid domain like yourbrand.com (no http://, no path)",
    ),
})

const { mutate: createDomain, isPending: creating } = useCreateCustomDomain()
const createError = ref("")

function handleCreate(values: Record<string, unknown>) {
  createError.value = ""
  createDomain(
    { domain: String(values.domain).trim().toLowerCase() },
    {
      onSuccess: (res) => {
        // API responses are wrapped in `{ data: ... }`.
        const body = res.data as { data?: TCustomDomain } & Partial<TCustomDomain>
        activeDomain.value = body.data ?? (body as TCustomDomain)
        stepIndex.value = 1
      },
      onError: (err) => {
        const respData = (err as { response?: { data?: { error?: { message?: string } } } })
          .response?.data?.error
        if (respData?.message) createError.value = respData.message
        else displayError(err)
      },
    },
  )
}

function goToVerify() {
  stepIndex.value = 2
}
function goBack() {
  if (stepIndex.value > 0) stepIndex.value -= 1
}

// --- Step 3: verification polling ---

type TVerifyState = "checking" | "live" | "failed" | "timeout"
const verifyState = ref<TVerifyState>("checking")
const pollAttempts = ref(0)
const MAX_POLL_ATTEMPTS = 24 // ~2 minutes at 5s

const onStep3 = computed(() => props.open && stepIndex.value === 2)
const polling = computed(() => onStep3.value && verifyState.value === "checking")

const domainUid = computed(() => activeDomain.value?.uid ?? "")
const { data: polledDomain } = useGetCustomDomain(domainUid, {
  enabled: () => onStep3.value && !!domainUid.value,
  refetchInterval: () => (polling.value ? 5000 : false),
})

const { mutate: verifyDomain, isPending: verifying } = useVerifyCustomDomain()

const checklist = computed(() => {
  const status = polledDomain.value?.status ?? activeDomain.value?.status ?? "PENDING"
  const recordDetected = status === "VERIFYING" || status === "ACTIVE"
  const sslDone = status === "ACTIVE"
  return [
    { key: "domain", icon: "global" as string, label: "Domain entered", done: true },
    { key: "record", icon: "link-01" as string, label: "Record detected", done: recordDetected },
    { key: "ssl", icon: "shield-tick" as string, label: "SSL provisioning", done: sslDone },
  ]
})

const stateHeading = computed(() => {
  if (verifyState.value === "live") return "Connected!"
  if (verifyState.value === "failed") return "We couldn't connect yet"
  return "We're trying to connect"
})
const stateMessage = computed(() => {
  if (verifyState.value === "failed")
    return "Your DNS records weren't detected. Double-check them and try again."
  if (verifyState.value === "timeout")
    return "Still checking — we'll email you when it's live. You can close this window."
  return "Checking your domain connection…"
})

// React to every refetch result (new object reference per fetch).
// Watching the whole object (not just .status) means we increment on every
// successful poll, so stuck-PENDING domains reach MAX_POLL_ATTEMPTS correctly.
watch(polledDomain, (fetched) => {
  if (!onStep3.value || !fetched) return
  if (activeDomain.value) {
    activeDomain.value = { ...activeDomain.value, ...fetched }
  }
  const status = fetched.status
  if (status === "ACTIVE") {
    verifyState.value = "live"
    emit("live", activeDomain.value?.domain ?? "")
    return
  }
  if (status === "FAILED") {
    verifyState.value = "failed"
    return
  }
  pollAttempts.value += 1
  if (pollAttempts.value >= MAX_POLL_ATTEMPTS) verifyState.value = "timeout"
})

// On entering step 3: reset the clock and nudge the backend once.
watch(onStep3, (active) => {
  if (!active) return
  verifyState.value = "checking"
  pollAttempts.value = 0
  if (domainUid.value) verifyDomain(domainUid.value)
})

function retryVerification() {
  if (!domainUid.value) return
  verifyState.value = "checking"
  pollAttempts.value = 0
  verifyDomain(domainUid.value)
}

function reset() {
  stepIndex.value = 0
  activeDomain.value = null
  createError.value = ""
  verifyState.value = "checking"
  pollAttempts.value = 0
}
function onClose() {
  emit("close")
}

// When opened: reset, or jump to step 2 if resuming an existing domain.
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    reset()
    if (props.resumeDomain) {
      activeDomain.value = props.resumeDomain
      stepIndex.value = 1
    }
  },
  { immediate: true },
)
</script>
