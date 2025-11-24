import { defineStore } from "pinia"
import { IStoreDetails, TLocation } from "./types"
import { computed, ref } from "vue"

export const useSettingsStore = defineStore(
  "settings",
  () => {
    // State
    const locations = ref<TLocation[] | null>(null)
    const activeLocation = ref<TLocation | null>(null)
    const showPlanUpgradeModal = ref(false)
    const storeDetails = ref<IStoreDetails | null>(null)

    const storefrontUrl = computed(
      () => `buy.leyyow.com/${storeDetails.value?.slug || "your-store"}`,
    )

    // Actions
    const setLocations = (locs: TLocation[]) => {
      locations.value = locs
    }

    const setActiveLocation = (loc: TLocation | null) => {
      console.log("Setting active location to:", loc)
      if (loc) {
        activeLocation.value = loc
      }
    }

    const setPlanUpgradeModal = (value: boolean) => {
      console.log("Setting plan upgrade modal to:", value)
      showPlanUpgradeModal.value = value
    }

    const setStoreDetails = (details: IStoreDetails) => {
      storeDetails.value = details
    }

    return {
      locations,
      activeLocation,
      setLocations,
      setActiveLocation,
      showPlanUpgradeModal,
      setPlanUpgradeModal,
      setStoreDetails,
      storeDetails,
      storefrontUrl,
    }
  },
  { persist: true },
)
