import { createRouter, createWebHistory } from "vue-router"
import type { RouteRecordRaw } from "vue-router"
import { useAuthStore } from "@modules/auth/store"
import { useSettingsStore } from "@modules/settings/store"
import { toast } from "@/composables/useToast"

// Layout imports
// import LandingLayout from "@/layouts/LandingLayout.vue"
import MainLayout from "@/layouts/MainLayout.vue"
import AuthLayout from "@/layouts/AuthLayout.vue"

// Module route imports
import inventoryRoutes from "@modules/inventory/routes"
import authRoutes from "@modules/auth/routes"
import customersRoutes from "@modules/customers/routes"
// import landingRoutes from "@modules/landing/routes"
import popupsRoutes from "@modules/popups/routes"
import ordersRoutes from "@modules/orders/routes"
import settingsRoutes from "@modules/settings/routes"
import sharedRoutes from "@modules/shared/routes"
import expensesRoutes from "@modules/expenses/routes"
import productionRoutes from "@modules/production/routes"
import marketingRoutes from "@modules/marketing/routes"
import { isStaging } from "@/utils/others"

const routes: RouteRecordRaw[] = [
  // Public pages routes with LandingLayout
  // {
  //   path: "/",
  //   component: LandingLayout,
  //   children: [...landingRoutes],
  // },
  {
    path: "/",
    redirect: "/dashboard",
  },
  // Auth routes with AuthLayout
  {
    path: "/",
    component: AuthLayout,
    children: [...authRoutes],
  },

  // Main app routes with MainLayout - authenticated users only
  {
    path: "/",
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      ...inventoryRoutes,
      ...customersRoutes,
      ...ordersRoutes,
      ...popupsRoutes,
      ...sharedRoutes,
      ...expensesRoutes,
      ...productionRoutes,
      ...marketingRoutes,
    ],
  },
  {
    path: "/",
    meta: { requiresAuth: true },
    children: [...settingsRoutes],
  },

  { path: "/pay/:id", component: () => import("@modules/landing/views/payment-link.vue") },

  { path: "/dawn", component: () => import("@modules/landing/views/dawn.vue") },
  { path: "/heritage", component: () => import("@modules/landing/views/heritage.vue") },
  { path: "/grace", component: () => import("@modules/landing/views/grace.vue") },
  { path: "/bloom", component: () => import("@modules/landing/views/bloom.vue") },
  { path: "/ember", component: () => import("@modules/landing/views/ember.vue") },

  // 404 - Catch all route (must be last)
  {
    path: "/",
    component: MainLayout,
    children: [
      {
        path: ":pathMatch(.*)*",
        name: "NotFound",
        component: () => import("@modules/404.vue"),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    else return { top: 0, behavior: "smooth" }
  },
})

/**
 * ======= Navigation guards =======
 *  */
router.beforeEach((to, from, next) => {
  const { isAuthenticated, user } = useAuthStore()

  // Define auth-related pages that should bypass certain checks
  const authPages = ["/login", "/signup", "/forgot-password", "/reset-password", "/confirm-email"]
  const isAuthPage = authPages.includes(to.path)

  // Allow navigation if coming from signup completion flow
  if (from.path === "/signup" && to.path === "/confirm-email") {
    return next()
  }

  // Prevent redirect loops - if already on target page, continue
  if (to.path === from.path) {
    return next()
  }

  // Handle authenticated users first
  if (isAuthenticated && user) {
    // Check email confirmation status
    if (!user.is_email_verified && !to.path.includes("/confirm-email")) {
      toast.info("Please confirm your email to continue.")
      return next({ path: "/confirm-email", query: { email: user.email, redirect: to.fullPath } })
    }

    // Check payment account status (only for confirmed users)
    if (user.is_email_verified && !user.store_uid && !to.path.includes("/create-store")) {
      toast.info("Please create your store to complete your profile.")
      return next({ path: "/create-store", query: { redirect: to.fullPath } })
    }

    // Redirect authenticated users away from auth pages to dashboard
    if (isAuthPage && !to.path.includes("/confirm-email") && !to.path.includes("/create-store")) {
      toast.info("You already have an active session.")
      return next({ path: "/dashboard" })
    }

    const hQOnlyPages = ["/popups", "/onboarding"]
    // Restrict HQ-only pages to HQ users
    if (hQOnlyPages.includes(to.path)) {
      const { activeLocation } = useSettingsStore()
      if (activeLocation && !activeLocation.is_hq) {
        toast.info("This module is only available at the HQ location.")
        return next({ path: "/dashboard" })
      }
    }

    // Restrict settings pages for non-HQ locations
    const branchAllowedPages = ["/settings/profile", "/settings/password"]
    if (to.path.startsWith("/settings") && to.path !== "/settings") {
      const { activeLocation } = useSettingsStore()
      if (activeLocation && !activeLocation.is_hq && !branchAllowedPages.includes(to.path)) {
        const pathName = to.path.split("/settings/")[1].replace("-", " ")?.toUpperCase()
        toast.info(`${pathName} is only available at the HQ location.`)
        return next({ path: "/settings/profile" })
      }
    }
  }

  // Handle unauthenticated users
  if (!isAuthenticated) {
    // Redirect to login if trying to access protected routes
    if (to.meta.requiresAuth) {
      return next({ path: "/login", query: { redirect: to.fullPath } })
    }
  }

  // prevent access to upcoming features for non-staging environments
  const upcomingFeaturePaths = ["/raw-materials"]

  if (!isStaging && upcomingFeaturePaths.includes(to.path)) {
    const featureName = to.path.replace("/", "").toUpperCase()
    toast.info(`The ${featureName} feature is coming soon!`)
    return next({ path: "/dashboard" })
  }

  next()
})

export default router
