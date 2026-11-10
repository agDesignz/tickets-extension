import { defineConfig } from "vite";
import webExtension, { readJsonFile } from "vite-plugin-web-extension";

export default defineConfig({
  plugins: [
    webExtension({
      manifest: () => readJsonFile("src/manifest.json"),
      webExtConfig: {
        startUrl: ["https://example.com"],
        chromiumBinary: process.env.CHROMIUM_BINARY,
      },
    }),
  ],
  build: {
    minify: false, // Keep code readable for debugging
    sourcemap: true, // Generate source maps for debugging
  },
});
