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
