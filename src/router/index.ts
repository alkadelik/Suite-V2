import { createRouter, createWebHistory } from "vue-router"
import type { RouteRecordRaw } from "vue-router"

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

// Navigation guards
router.beforeEach((_to, _from, next) => {
  // TODO: Add authentication checks here
  next()
})

export default router
