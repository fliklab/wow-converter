import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

const inlineCss = (): Plugin => ({
  name: "inline-css",
  enforce: "post" as const,
  generateBundle(_options, bundle) {
    const htmlAsset = bundle["index.html"];
    if (htmlAsset?.type !== "asset" || typeof htmlAsset.source !== "string") {
      return;
    }

    for (const asset of Object.values(bundle)) {
      if (asset.type !== "asset" || !asset.fileName.endsWith(".css")) {
        continue;
      }

      const css =
        typeof asset.source === "string"
          ? asset.source
          : new TextDecoder().decode(asset.source);
      const escapedFileName = asset.fileName.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );
      const stylesheetLink = new RegExp(
        `<link[^>]+href=["']/${escapedFileName}["'][^>]*>`
      );
      const inlinedHtml = htmlAsset.source.replace(
        stylesheetLink,
        `<style>${css}</style>`
      );

      if (inlinedHtml !== htmlAsset.source) {
        htmlAsset.source = inlinedHtml;
        delete bundle[asset.fileName];
      }
    }
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), inlineCss()],
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
