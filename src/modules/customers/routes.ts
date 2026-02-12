import type { RouteRecordRaw } from "vue-router"

const customersRoutes: RouteRecordRaw[] = [
  {
    path: "/customers",
    name: "Customers",
    component: () => import("./views/index.vue"),
    meta: { requiresAuth: true, hideAppHeader: true },
  },
  {
    path: "/customers/:id",
    name: "CustomerDetail",
    component: () => import("./views/[id].vue"),
    meta: { requiresAuth: true, hideAppHeader: true },
  },
]

export default customersRoutes
