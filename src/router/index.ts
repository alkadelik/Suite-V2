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
      ...sharedRoutes,
    ],
  },
  {
    path: "/",
    meta: { requiresAuth: true },
    children: [...settingsRoutes],
  },

  { path: "/pay/:id", component: () => import("@modules/landing/views/payment-link.vue") },

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
      return next({ path: "/confirm-email", query: { email: user.email } })
    }

    // Check payment account status (only for confirmed users)
    if (user.is_email_verified && user.store_uid === "" && !to.path.includes("/create-store")) {
      toast.info("Please create your store to complete your profile.")
      return next({ path: "/create-store" })
    }

    // Redirect authenticated users away from auth pages to dashboard
    if (isAuthPage && !to.path.includes("/confirm-email") && !to.path.includes("/create-store")) {
      toast.info("You already have an active session.")
      return next({ path: "/dashboard" })
    }
  }

  // Handle unauthenticated users
  if (!isAuthenticated) {
    // Redirect to login if trying to access protected routes
    if (to.meta.requiresAuth) {
      return next({ path: "/login", query: { redirect: to.fullPath } })
    }
  }

  next()
})

export default router
