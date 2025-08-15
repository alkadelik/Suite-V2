import type { RouteRecordRaw } from "vue-router"

const authRoutes: RouteRecordRaw[] = [
  // Direct auth routes without /auth prefix
  {
    path: "login",
    name: "Login",
    component: () => import("./views/login.vue"),
  },
  {
    path: "register",
    name: "Register",
    component: () => import("./views/register.vue"),
  },
  {
    path: "signup",
    name: "Signup",
    component: () => import("./views/signup.vue"),
  },
]

export default authRoutes
