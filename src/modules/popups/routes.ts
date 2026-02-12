import type { RouteRecordRaw } from "vue-router"

const popupsRoutes: RouteRecordRaw[] = [
  {
    path: "popups",
    name: "Popups",
    component: () => import("./views/index.vue"),
    meta: { hideAppHeader: true },
  },
  {
    path: "popups/:id",
    name: "PopupDetails",
    component: () => import("./views/[id].vue"),
    meta: { hideAppHeader: true },
  },
  {
    path: "popups/eventful",
    name: "EventfulPopups",
    component: () => import("./views/eventful/index.vue"),
  },
  {
    path: "popups/eventful/:id",
    name: "EventfulPopupDetails",
    component: () => import("./views/eventful/[id].vue"),
  },
]

export default popupsRoutes
