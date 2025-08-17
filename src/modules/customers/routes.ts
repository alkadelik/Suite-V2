import type { RouteRecordRaw } from "vue-router"

const customersRoutes: RouteRecordRaw[] = [
  {
    path: "/customers",
    name: "Customers",
    component: () => import("./views/index.vue"),
    meta: { requiresAuth: true },
  },
]

export default customersRoutes
