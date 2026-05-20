import { defineStore } from "pinia"
import { IStoreDetails, TLocation } from "./types"
import { computed, ref } from "vue"
import { isStaging } from "@/utils/others"
import { ILiveStatusData } from "@modules/shared/types"
import { useAuthStore } from "@modules/auth/store"

export const useSettingsStore = defineStore(
  "settings",
  () => {
    // State
    const locations = ref<TLocation[] | null>(null)
    const activeLocation = ref<TLocation | null>(null)
    const showPlanUpgradeModal = ref(false)
    const showPlanLimitModal = ref(false)
    const showMobileMenu = ref(false)
    const showAddLocationModal = ref(false)
    const locationForEdit = ref<TLocation | null>(null)
    const storeDetails = ref<IStoreDetails | null>(null)
    const liveStatus = ref<ILiveStatusData | null>(null)

    const isInternational = computed(() => useAuthStore().user?.is_international ?? false)

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

    const setPlanLimitModal = (value: boolean) => {
      showPlanLimitModal.value = value
      if (value) showMobileMenu.value = false
    }

    const setMobileMenu = (value: boolean) => {
      showMobileMenu.value = value
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
      showPlanLimitModal,
      setPlanLimitModal,
      showMobileMenu,
      setMobileMenu,
      showAddLocationModal,
      setAddLocationModal,
      locationForEdit,
      setLocationForEdit,
      setStoreDetails,
      storeDetails,
      storefrontUrl,
      isInternational,
      liveStatus,
      setLiveStatus,
    }
  },
  { persist: true },
)
