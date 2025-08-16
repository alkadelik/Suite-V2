import type { RouteRecordRaw } from "vue-router"

const popupsRoutes: RouteRecordRaw[] = [
  {
    path: "popups",
    name: "Popups",
    component: () => import("./views/index.vue"),
  },
]

export default popupsRoutes
