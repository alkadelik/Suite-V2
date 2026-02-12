import type { RouteRecordRaw } from "vue-router"

const sharedRoutes: RouteRecordRaw[] = [
  {
    path: "/dashboard",
    name: "Dashboard",
    component: () => import("./views/dashboard.vue"),
  },
  {
    path: "/onboarding",
    name: "Onboarding",
    component: () => import("./views/onboarding.vue"),
  },
  {
    path: "/notifications",
    name: "Notifications",
    component: () => import("./views/notifications.vue"),
  },
]

export default sharedRoutes
