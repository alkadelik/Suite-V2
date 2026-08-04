import type { RouteRecordRaw } from "vue-router"

// Public changelog — top level, no `requiresAuth`, reachable logged out.
const announcementsRoutes: RouteRecordRaw[] = [
  {
    path: "/changelog",
    name: "Changelog",
    component: () => import("./views/changelog.vue"),
  },
]

export default announcementsRoutes
