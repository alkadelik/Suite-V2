import type { RouteRecordRaw } from "vue-router"

const marketingRoutes: RouteRecordRaw[] = [
  {
    path: "/email-list",
    name: "EmailList",
    component: () => import("./views/email-list.vue"),
    meta: { hideAppHeader: true },
  },
]

export default marketingRoutes
