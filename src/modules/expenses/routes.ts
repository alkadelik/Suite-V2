import type { RouteRecordRaw } from "vue-router"

const expensesRoutes: RouteRecordRaw[] = [
  {
    path: "expenses",
    name: "Expenses",
    component: () => import("./views/index.vue"),
    meta: { hideAppHeader: true },
  },
]

export default expensesRoutes
