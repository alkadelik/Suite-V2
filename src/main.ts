import { createApp } from "vue"
import App from "./App.vue"
import router from "./router"
import { createPinia } from "pinia"
import piniaPluginPersistedstate from "pinia-plugin-persistedstate"
import Vue3Toastify, { ToastContainerOptions } from "vue3-toastify"
import "vue3-toastify/dist/index.css"
import { VueQueryPlugin } from "@tanstack/vue-query"
// @ts-expect-error: No type definitions available for 'floating-vue'
import FloatingVue from "floating-vue"
import "floating-vue/dist/style.css"

// Create Vue app instance
const app = createApp(App)

// createPinia for state management
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
app.use(FloatingVue)

// Configure Vue3Toastify
app.use(Vue3Toastify, { autoClose: 6000 } as ToastContainerOptions)

app.use(VueQueryPlugin)

// Use router
app.use(router)

// Mount the app to the DOM
app.mount("#app")
