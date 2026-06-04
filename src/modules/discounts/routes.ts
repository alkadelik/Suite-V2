import type { RouteRecordRaw } from "vue-router"

const discountsRoutes: RouteRecordRaw[] = [
  {
    path: "discounts",
    name: "Discounts",
    component: () => import("./views/index.vue"),
    meta: { requiresAuth: true, hideAppHeader: true },
  },
  {
    path: "discounts/coupons/:uid",
    name: "Coupon-Details",
    component: () => import("./views/coupon-details.vue"),
    meta: { requiresAuth: true, hideAppHeader: true },
  },
]

export default discountsRoutes
