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
      port: Number(process.env.VITE_PORT) || 8080,
    },
    build: {
      sourcemap: true,
    },
  }
})
