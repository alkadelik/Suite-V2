import { defineStore } from "pinia"
import { TLocation } from "./types"
import { ref } from "vue"

export const useSettingsStore = defineStore(
  "settings",
  () => {
    // State
    const locations = ref<TLocation[] | null>(null)

    const activeLocation = ref<TLocation | null>(null)

    // Actions
    const setLocations = (locs: TLocation[]) => {
      locations.value = locs
    }

    const setActiveLocation = (loc: TLocation | null) => {
      activeLocation.value = loc
    }

    return {
      locations,
      activeLocation,
      setLocations,
      setActiveLocation,
    }
  },
  { persist: true },
)
