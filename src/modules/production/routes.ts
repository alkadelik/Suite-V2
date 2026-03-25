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

  {
    path: "recipes",
    name: "Recipes",
    component: () => import("./views/recipes/index.vue"),
    meta: { hideAppHeader: true },
  },
  {
    path: "production-run",
    name: "ProductionRun",
    component: () => import("./views/production-run/index.vue"),
    meta: { hideAppHeader: true },
  },
  {
    path: "recipes/:id",
    name: "RecipeDetails",
    component: () => import("./views/recipes/[id].vue"),
    meta: { hideAppHeader: true },
  },
]

export default productionRoutes
