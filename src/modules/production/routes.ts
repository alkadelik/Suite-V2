import type { RouteRecordRaw } from "vue-router"

const productionRoutes: RouteRecordRaw[] = [
  {
    path: "raw-materials",
    name: "RawMaterials",
    component: () => import("./views/raw-materials/index.vue"),
    meta: { hideAppHeader: true },
  },
  {
    path: "raw-materials/:id",
    name: "RawMaterialDetails",
    component: () => import("./views/raw-materials/[id].vue"),
    meta: { hideAppHeader: true },
  },
]

export default productionRoutes
