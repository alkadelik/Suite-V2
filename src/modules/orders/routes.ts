import type { RouteRecordRaw } from "vue-router"

const ordersRoutes: RouteRecordRaw[] = [
  {
    path: "orders",
    name: "Orders",
    component: () => import("./views/index.vue"),
    meta: { hideAppHeader: true },
  },
  {
    path: "orders/add",
    name: "AddOrder",
    component: () => import("./views/add-order.vue"),
    meta: { hideAppHeader: true },
  },
]

export default ordersRoutes
