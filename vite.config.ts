import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: resolve(__dirname, "src/client"),
  publicDir: resolve(__dirname, "public"),
  build: {
    outDir: resolve(__dirname, "dist/webroot"),
    emptyOutDir: true,
    assetsDir: "assets",
    rollupOptions: {
      input: {
        index: resolve(__dirname, "src/client/index.html"),
        launch: resolve(__dirname, "src/client/launch.html"),
      },
    },
  },
});
