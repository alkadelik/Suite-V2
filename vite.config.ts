import { defineConfig, loadEnv } from "vite"
import vue from "@vitejs/plugin-vue"
import tailwindcss from "@tailwindcss/vite"
import svgLoader from "vite-svg-loader"

export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }

  return {
    plugins: [
      vue(),
      tailwindcss(),
      svgLoader({
        svgo: true,
        svgoConfig: {
          plugins: [{ name: "removeDimensions" }],
        },
      }),
    ],
    resolve: {
      alias: {
        "@components": "/src/components",
        "@modules": "/src/modules",
        "@": "/src",
      },
    },
    server: {
      host: true,
      port: Number(process.env.VITE_PORT) || 8080,
    },
    build: {
      sourcemap: process.env.NODE_ENV !== "production",
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes("node_modules")) {
              if (id.includes("chart.js") || id.includes("vue-chartjs")) return "vendor-charts"
              if (id.includes("@tiptap")) return "vendor-editor"
              if (id.includes("@tanstack")) return "vendor-tanstack"
              if (id.includes("vee-validate") || id.includes("yup")) return "vendor-forms"
              if (id.includes("floating-vue")) return "vendor-ui"
              if (id.includes("vue-router") || id.includes("pinia")) return "vendor-core"
            }
          },
        },
      },
    },
  }
})
