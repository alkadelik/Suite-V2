import { createApp, Plugin } from "vue"
import App from "./App.vue"
import router from "./router"
import { createPinia } from "pinia"
import piniaPluginPersistedstate from "pinia-plugin-persistedstate"
import { VueQueryPlugin } from "@tanstack/vue-query"
import FloatingVue from "floating-vue"
import "floating-vue/dist/style.css"

// Create Vue app instance
const app = createApp(App)

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
