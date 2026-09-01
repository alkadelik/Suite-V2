import type { RouteRecordRaw } from "vue-router"
import { useUserRoles } from "@/composables/useUserRoles"
import { useSettingsStore } from "./store"

const settingsRoutes: RouteRecordRaw[] = [
  {
    path: "settings/",
    component: () => import("./views/index.vue"),
    name: "Settings",
    children: [
      {
        path: "",
        name: "SettingsEntry",
        component: () => import("./views/settings-entry.vue"),
      },
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
      {
        path: "password",
        name: "Password",
        component: () => import("./views/password.vue"),
      },
      {
        path: "teams",
        name: "Teams",
        component: () => import("./views/teams.vue"),
      },
      {
        path: "delivery-options",
        name: "DeliveryOptions",
        component: () => import("./views/delivery-options.vue"),
      },
      {
        path: "taxes",
        name: "Taxes",
        component: () => import("./views/taxes.vue"),
      },
      {
        path: "store-details",
        name: "StoreDetails",
        component: () => import("./views/store-details.vue"),
      },
      {
        path: "billing",
        name: "PlansAndBilling",
        component: () => import("./views/plans-and-billing.vue"),
      },
      {
        path: "design",
        component: () => import("./views/design.vue"),
        children: [
          {
            path: "",
            name: "Design",
            redirect: "/settings/design/themes",
          },
          {
            path: "themes",
            name: "DesignThemes",
            component: () => import("./views/design/themes.vue"),
          },
          {
            path: "theme-settings",
            name: "DesignThemeSettings",
            component: () => import("./views/design/theme-settings.vue"),
          },
          {
            path: "landing-page",
            name: "DesignLandingPage",
            component: () => import("./views/design/landing-page.vue"),
          },
          {
            path: "popup",
            name: "DesignPopup",
            component: () => import("./views/design/popup.vue"),
          },
        ],
      },
      {
        path: "production",
        name: "Production",
        component: () => import("./views/production.vue"),
      },
      {
        path: "api-key",
        name: "ApiKey",
        component: () => import("./views/api-key.vue"),
        // Owner-only, HQ-only. The nav link is hidden for everyone else, but a
        // hidden link is not access control — this stops a typed URL reaching a
        // page whose every request the backend would reject anyway.
        beforeEnter: () => {
          const { isOwner } = useUserRoles()
          const isHq = Boolean(useSettingsStore().activeLocation?.is_hq)
          return isOwner.value && isHq ? true : { path: "/settings" }
        },
      },
      {
        path: "domains",
        name: "Domains",
        component: () => import("./views/domains.vue"),
      },
      {
        path: "domains/built-in",
        name: "DomainBuiltInDetails",
        component: () => import("./views/domain-details.vue"),
      },
      {
        path: "domains/:uid",
        name: "DomainDetails",
        component: () => import("./views/domain-details.vue"),
      },
      // Catch-all route for settings 404
      {
        path: ":pathMatch(.*)*",
        name: "SettingsNotFound",
        component: () => import("@modules/404.vue"),
      },
    ],
  },
]

export default settingsRoutes
