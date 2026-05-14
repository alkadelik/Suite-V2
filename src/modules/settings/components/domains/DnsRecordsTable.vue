<template>
  <DataTable
    :data="rows"
    :columns="columns"
    :show-pagination="false"
    :show-mobile-view="false"
    :fix-first-column="isMobile"
  >
    <template #cell:type="{ value }">
      <Chip :label="String(value)" size="sm" color="primary" variant="outlined" />
    </template>

    <template #cell:value="{ value }">
      <span class="font-medium break-all">{{ value }}</span>
    </template>

    <template #cell:status="{ item }">
      <Chip
        v-if="showStatus"
        size="sm"
        showDot
        variant="outlined"
        :label="statusLabel(item)"
        :color="statusColor(item)"
      />
    </template>

    <template #cell:action="{ item }">
      <button
        type="button"
        class="text-primary-600 cursor-pointer"
        aria-label="Copy value"
        @click="clipboardCopy(item.value)"
      >
        <Icon name="copy" size="20" />
      </button>
    </template>
  </DataTable>
</template>

<script lang="ts" setup>
import { computed } from "vue"
import { useMediaQuery } from "@vueuse/core"
import DataTable from "@components/DataTable.vue"
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"
import { clipboardCopy } from "@/utils/others"
import { DNS_RECORD_COLUMNS, type TChipColor } from "../../constants"
import type { TDnsRecord, TCustomDomainStatus } from "../../types"

const props = withDefaults(
  defineProps<{
    records?: TDnsRecord[] | null
    domainStatus?: TCustomDomainStatus
    /** Hide the Status column when used inside the connect wizard (records not yet created). */
    showStatus?: boolean
  }>(),
  { records: () => [], domainStatus: undefined, showStatus: true },
)

const isMobile = useMediaQuery("(max-width: 768px)")

/** Normalise: backend may use `host` or `name`; default to "@". */
type TRow = TDnsRecord & { host: string }
const rows = computed<TRow[]>(() =>
  (props.records ?? []).map((r) => ({ ...r, host: r.host ?? r.name ?? "@" })),
)

const columns = computed(() =>
  props.showStatus ? DNS_RECORD_COLUMNS : DNS_RECORD_COLUMNS.filter((c) => c.accessor !== "status"),
)

/** Per-record verification state — from the record if present, else derived from the domain status. */
function recordVerified(item: TRow): boolean {
  if (item.status) return item.status === "verified"
  return props.domainStatus === "ACTIVE"
}
function statusLabel(item: TRow): string {
  if (item.status === "pending") return "Checking"
  return recordVerified(item) ? "Found" : "Record not found"
}
function statusColor(item: TRow): TChipColor {
  if (item.status === "pending") return "warning"
  return recordVerified(item) ? "success" : "error"
}
</script>
