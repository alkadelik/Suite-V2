import { defineStore } from "pinia"
import { IStoreDetails, TLocation } from "./types"
import { computed, ref } from "vue"
import { isStaging } from "@/utils/others"
import { ILiveStatusData } from "@modules/shared/types"

export const useSettingsStore = defineStore(
  "settings",
  () => {
    // State
    const locations = ref<TLocation[] | null>(null)
    const activeLocation = ref<TLocation | null>(null)
    const showPlanUpgradeModal = ref(false)
    const showAddLocationModal = ref(false)
    const locationForEdit = ref<TLocation | null>(null)
    const storeDetails = ref<IStoreDetails | null>(null)
    const liveStatus = ref<ILiveStatusData | null>(null)

    const storefrontUrl = computed(
      () =>
        `${isStaging ? "storefronts-v2.vercel.app" : "buy.leyyow.com"}/${storeDetails.value?.slug || "your-store"}`,
    )

    // Actions
    const setLocations = (locs: TLocation[]) => {
      locations.value = locs
    }

    const setActiveLocation = (loc: TLocation | null) => {
      if (loc) {
        activeLocation.value = loc
      }
    }

    const setPlanUpgradeModal = (value: boolean) => {
      showPlanUpgradeModal.value = value
    }

    const setAddLocationModal = (value: boolean) => {
      showAddLocationModal.value = value
    }

    const setStoreDetails = (details: IStoreDetails) => {
      storeDetails.value = details
    }

    const setLiveStatus = (status: ILiveStatusData) => {
      liveStatus.value = status
    }

    const setLocationForEdit = (location: TLocation | null) => {
      locationForEdit.value = location
    }

    return {
      locations,
      activeLocation,
      setLocations,
      setActiveLocation,
      showPlanUpgradeModal,
      setPlanUpgradeModal,
      showAddLocationModal,
      setAddLocationModal,
      locationForEdit,
      setLocationForEdit,
      setStoreDetails,
      storeDetails,
      storefrontUrl,
      liveStatus,
      setLiveStatus,
    }
  },
  { persist: true },
)
