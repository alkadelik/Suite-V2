import type { RouteRecordRaw } from "vue-router"

const inventoryRoutes: RouteRecordRaw[] = [
  {
    path: "inventory",
    name: "Inventory",
    component: () => import("./views/index.vue"),
    meta: { requiresAuth: true, hideAppHeader: true },
  },
  {
    path: "inventory/:uid",
    name: "Product-Details",
    component: () => import("./views/single.vue"),
    meta: { requiresAuth: true, hideAppHeader: true },
  },
]

export default inventoryRoutes
