import { ref } from "vue"
import { useRouter } from "vue-router"
import { useSettingsStore } from "@modules/settings/store"
import type { TLocation } from "@modules/settings/types"

const confirmSwitch = ref(false)
const pendingLocation = ref<TLocation | null>(null)

export function useLocationSwitch() {
  const router = useRouter()
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
        router.go(0)
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
