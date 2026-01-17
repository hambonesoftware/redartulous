import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    outDir: "public",
    emptyOutDir: true,
    assetsDir: "assets",
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        launch: resolve(__dirname, "launch.html"),
      },
    },
  },
});
