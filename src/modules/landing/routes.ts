import type { RouteRecordRaw } from "vue-router"

const landingRoutes: RouteRecordRaw[] = [
  {
    path: "",
    name: "Home",
    component: () => import("./views/index.vue"),
  },
]

export default landingRoutes
