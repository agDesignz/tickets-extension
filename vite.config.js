import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig(({ mode }) => ({
  root: "src",
  base: "./", // relative asset URLs, required for extensions
  build: {
    outDir: "../dist",
    emptyOutDir: true, // needed because outDir is outside root
    sourcemap: mode === "development",
    minify: mode === "development" ? false : "esbuild",
    rollupOptions: {
      input: {
        sidepanel: resolve(__dirname, "src/sidepanel/index.html"),
        "service-worker": resolve(
          __dirname,
          "src/background/service-worker.js",
        ),
      },
      output: {
        // The service worker needs a predictable filename; manifest points to it
        entryFileNames: (chunk) =>
          chunk.name === "service-worker"
            ? "background/service-worker.js"
            : "assets/[name]-[hash].js",
      },
    },
  },
}));
