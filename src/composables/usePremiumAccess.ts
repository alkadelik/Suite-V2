import { useAuthStore } from "@modules/auth/store"
import { useSettingsStore } from "@modules/settings/store"
import { computed } from "vue"

/**
 * Composable to check if user has access to premium features
 * and trigger upgrade modal if they don't
 */
export function usePremiumAccess() {
  const authStore = useAuthStore()
  const settingsStore = useSettingsStore()

  /**
   * Check if user has an active subscription or is in trial mode
   */
  const hasPremiumAccess = computed(() => {
    const subscription = authStore.user?.subscription
    if (!subscription) return false

    // User has access if subscription is active OR in trial mode
    return subscription.is_active || subscription.trial_mode
  })

  /**
   * Check if user can perform a premium action
   * If not, shows the upgrade modal
   */
  const checkPremiumAccess = (): boolean => {
    if (hasPremiumAccess.value) {
      return true
    }

    // Show upgrade modal
    settingsStore.setPlanUpgradeModal(true)
    return false
  }

  return {
    hasPremiumAccess,
    checkPremiumAccess,
  }
}
