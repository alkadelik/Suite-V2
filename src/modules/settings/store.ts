import { defineStore } from "pinia"
import { TLocation } from "./types"
import { ref } from "vue"

export const useSettingsStore = defineStore(
  "settings",
  () => {
    // State
    const locations = ref<TLocation[] | null>(null)
    const activeLocation = ref<TLocation | null>(null)
    const showPlanUpgradeModal = ref(false)

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

    return {
      locations,
      activeLocation,
      setLocations,
      setActiveLocation,
      showPlanUpgradeModal,
      setPlanUpgradeModal,
    }
  },
  { persist: true },
)
