import type { RouteRecordRaw } from "vue-router"

const popupsRoutes: RouteRecordRaw[] = [
  {
    path: "popups",
    name: "Popups",
    component: () => import("./views/index.vue"),
  },
  {
    path: "popups/:id",
    name: "PopupDetails",
    component: () => import("./views/[id].vue"),
  },
]

export default popupsRoutes
