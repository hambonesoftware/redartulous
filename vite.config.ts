import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    // 1. Change outDir to 'webroot' to avoid the 'public' folder conflict
    outDir: resolve(__dirname, "webroot"), 
    emptyOutDir: true,
    assetsDir: "assets",
    rollupOptions: {
      input: {
        // Keep these so Vite knows which HTML files to build
        index: resolve(__dirname, "src/client/index.html"),
        launch: resolve(__dirname, "src/client/launch.html"),
      },
    },
  },
  // Removed the 'move-client-html' plugin as we will point Devvit 
  // directly to the correct subfolder instead.
});