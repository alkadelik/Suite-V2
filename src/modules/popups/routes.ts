import type { RouteRecordRaw } from "vue-router"

const popupsRoutes: RouteRecordRaw[] = [
  {
    path: "popups",
    name: "Popups",
    component: () => import("./views/index.vue"),
    meta: { requiresAuth: true },
  },
]

export default popupsRoutes
