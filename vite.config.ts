import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  root: "src/client",
  base: "./",
  build: {
    outDir: "../../public",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, "src/client/index.html"),
        launch: path.resolve(__dirname, "src/client/launch.html"),
      },
    },
  },
});
