import type { RouteRecordRaw } from "vue-router"

const inventoryRoutes: RouteRecordRaw[] = [
  {
    path: "inventory",
    name: "Inventory",
    component: () => import("./views/index.vue"),
    meta: { requiresAuth: true },
  },
]

export default inventoryRoutes
