import { ref } from "vue"
import { useSettingsStore } from "@modules/settings/store"
import type { TLocation } from "@modules/settings/types"

const confirmSwitch = ref(false)
const pendingLocation = ref<TLocation | null>(null)

export function useLocationSwitch() {
  const { setActiveLocation } = useSettingsStore()

  const requestLocationSwitch = (location: TLocation) => {
    pendingLocation.value = location
    confirmSwitch.value = true
  }

  const confirmLocationSwitch = () => {
    if (pendingLocation.value) {
      const oldLocation = useSettingsStore().activeLocation
      setActiveLocation(pendingLocation.value)

      // Trigger reload only if location actually changed
      if (oldLocation?.uid !== pendingLocation.value.uid) {
        window.location.href = "/dashboard"
      }

      confirmSwitch.value = false
      pendingLocation.value = null
    }
  }

  const cancelLocationSwitch = () => {
    confirmSwitch.value = false
    pendingLocation.value = null
  }

  return {
    confirmSwitch,
    pendingLocation,
    requestLocationSwitch,
    confirmLocationSwitch,
    cancelLocationSwitch,
  }
}
