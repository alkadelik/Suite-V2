import type { RouteRecordRaw } from "vue-router"

const settingsRoutes: RouteRecordRaw[] = [
  {
    path: "settings/",
    component: () => import("./views/index.vue"),
    name: "Settings",
    redirect: { name: "Profile" },
    children: [
      {
        path: "locations",
        name: "Locations",
        component: () => import("./views/locations.vue"),
      },
      {
        path: "profile",
        name: "Profile",
        component: () => import("./views/profile.vue"),
      },
    ],
  },
]

export default settingsRoutes
