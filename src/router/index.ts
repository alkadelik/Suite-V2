import { createRouter, createWebHistory } from "vue-router"
import type { RouteRecordRaw } from "vue-router"

// Layout imports
import HomeLayout from "@/layouts/HomeLayout.vue"
import MainLayout from "@/layouts/MainLayout.vue"
import AuthLayout from "@/layouts/AuthLayout.vue"

// Module route imports
import inventoryRoutes from "@modules/inventory/routes"
import authRoutes from "@modules/auth/routes"
import customersRoutes from "@modules/customers/routes"
import ordersRoutes from "@modules/orders/routes"
import popupsRoutes from "@modules/popups/routes"

const routes: RouteRecordRaw[] = [
  // Home routes with HomeLayout
  {
    path: "/",
    component: HomeLayout,
    children: [
      {
        path: "",
        name: "Home",
        component: () => import("@modules/others/index.vue"),
      },
    ],
  },

  // Auth routes with AuthLayout
  {
    path: "/",
    component: AuthLayout,
    meta: { requiresAuth: true },
    children: [...authRoutes],
  },

  // Main app routes with MainLayout
  {
    path: "/",
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [...inventoryRoutes, ...customersRoutes, ...ordersRoutes, ...popupsRoutes],
  },

  // 404 - Catch all route (must be last)
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@modules/others/404.vue"),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// Navigation guards
router.beforeEach((_to, _from, next) => {
  // TODO: Add authentication checks here
  next()
})

export default router
