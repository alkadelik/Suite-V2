import { createApp, Plugin } from "vue"
import App from "./App.vue"
import router from "./router"
import { createPinia } from "pinia"
import piniaPluginPersistedstate from "pinia-plugin-persistedstate"
import { VueQueryPlugin } from "@tanstack/vue-query"
import FloatingVue from "floating-vue"
import "floating-vue/dist/style.css"
import * as Sentry from "@sentry/vue"

// Create Vue app instance
const app = createApp(App)

// Initialize Sentry for error tracking (only in production)
if (import.meta.env.PROD) {
  Sentry.init({
    app,
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_API_BASE_URL?.includes("bpi") ? "staging" : "production",
    integrations: [Sentry.browserTracingIntegration({ router })],
    tracesSampleRate: 0.1,
    ignoreErrors: ["ResizeObserver loop limit exceeded"],
  })
}

// createPinia for state management
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

app.use(FloatingVue as Plugin<unknown>)

app.use(VueQueryPlugin)

// Use router
app.use(router)

// Mount the app to the DOM
app.mount("#app")
