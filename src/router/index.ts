import { createRouter, createWebHistory } from "vue-router"
import type { RouteRecordRaw } from "vue-router"
import { useAuthStore } from "@modules/auth/store"
import { toast } from "@/composables/useToast"

// Layout imports
import LandingLayout from "@/layouts/LandingLayout.vue"
import MainLayout from "@/layouts/MainLayout.vue"
import AuthLayout from "@/layouts/AuthLayout.vue"

// Module route imports
import inventoryRoutes from "@modules/inventory/routes"
import authRoutes from "@modules/auth/routes"
import customersRoutes from "@modules/customers/routes"
import landingRoutes from "@modules/landing/routes"
import popupsRoutes from "@modules/popups/routes"
import ordersRoutes from "@modules/orders/routes"
import settingsRoutes from "@modules/settings/routes"
import sharedRoutes from "@modules/shared/routes"

const routes: RouteRecordRaw[] = [
  // Public pages routes with LandingLayout
  {
    path: "/",
    component: LandingLayout,
    children: [...landingRoutes],
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
      ...settingsRoutes,
      ...sharedRoutes,
    ],
  },

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
router.beforeEach((to, _from, next) => {
  const { isAuthenticated } = useAuthStore()
  // route requiresAuth but user is not authenticated ==> login page
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ path: "/login", query: { redirect: to.fullPath } })
  }

  // route is public but user is authenticated ==> dashboard
  if (!to.meta.requiresAuth && isAuthenticated) {
    toast.info("You already have an active session.")
    return next({ path: "/dashboard" })
  }

  next()
})

export default router
