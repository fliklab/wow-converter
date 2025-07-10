import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    port: 3000,
    open: true,
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    },
    fs: {
      allow: [".."],
    },
  },
  build: {
    outDir: "build",
    sourcemap: true,
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks: {
          "jsquash-core": [
            "@jsquash/avif",
            "@jsquash/jpeg",
            "@jsquash/png",
            "@jsquash/webp",
            "@jsquash/resize",
          ],
        },
      },
    },
  },
  worker: {
    format: "es",
  },
  optimizeDeps: {
    exclude: [
      "@jsquash/avif",
      "@jsquash/jpeg",
      "@jsquash/png",
      "@jsquash/webp",
      "@jsquash/resize",
    ],
    esbuildOptions: {
      target: "esnext",
    },
  },
  assetsInclude: ["**/*.wasm"],
  define: {
    global: "globalThis",
  },
});
