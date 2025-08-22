import type { RouteRecordRaw } from "vue-router"

const settingsRoutes: RouteRecordRaw[] = [
  {
    path: "settings/",
    children: [
      {
        path: "locations",
        name: "Locations",
        component: () => import("./views/locations.vue"),
      },
    ],
  },
]

export default settingsRoutes
