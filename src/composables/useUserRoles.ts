import { computed } from "vue"
import { useAuthStore } from "@modules/auth/store"

const STOCK_VALUE_ALLOWED_ROLES = ["owner", "manager", "finance"] as const

/** Centralized role checks. Add helpers here as new role gates emerge. */
export function useUserRoles() {
  const authStore = useAuthStore()

  const isOwner = computed(() => authStore.user?.roles?.some((r) => r.type === "owner") ?? false)

  const canViewStockValue = computed(
    () =>
      authStore.user?.roles?.some((r) =>
        (STOCK_VALUE_ALLOWED_ROLES as readonly string[]).includes(r.type),
      ) ?? false,
  )

  return { isOwner, canViewStockValue }
}
