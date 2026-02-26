import { RouteRecordRaw } from "vue-router"

const reportsRoutes: RouteRecordRaw[] = [
  {
    path: "/reports",
    redirect: "/reports/end-of-day",
    children: [
      {
        path: "end-of-day",
        component: () => import("./views/end-of-day.vue"),
      },
      {
        path: "monthly",
        component: () => import("./views/monthly.vue"),
      },
    ],
  },
]

export default reportsRoutes
