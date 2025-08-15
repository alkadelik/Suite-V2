import type { RouteRecordRaw } from "vue-router"

const ordersRoutes: RouteRecordRaw[] = [
  {
    path: "orders",
    name: "Orders",
    component: () => import("./views/index.vue"),
    meta: { requiresAuth: true },
  },
]

export default ordersRoutes
