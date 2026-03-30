import { defineConfig, loadEnv } from "vite"
import vue from "@vitejs/plugin-vue"
import tailwindcss from "@tailwindcss/vite"
import svgLoader from "vite-svg-loader"

export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }

  const shouldUseSentry = process.env.PROD && process.env.VITE_SENTRY_DSN

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
      // generates source maps and uploads them to Sentry,
      // but doesn't expose them publicly via sourceMappingURL comments.
      sourcemap: shouldUseSentry ? "hidden" : false,
    },
  }
})
