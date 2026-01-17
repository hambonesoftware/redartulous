import { defineConfig } from "vite";
import { resolve } from "path";
import { existsSync, mkdirSync, renameSync, rmSync } from "fs";

export default defineConfig({
  build: {
    outDir: "public",
    emptyOutDir: true,
    assetsDir: "assets",
    rollupOptions: {
      input: {
        index: resolve(__dirname, "src/client/index.html"),
        launch: resolve(__dirname, "src/client/launch.html"),
      },
    },
  },
  plugins: [
    {
      name: "move-client-html",
      closeBundle() {
        const outDir = resolve(__dirname, "public");
        const nestedDir = resolve(outDir, "src/client");
        const files = [
          { source: resolve(nestedDir, "index.html"), target: resolve(outDir, "index.html") },
          { source: resolve(nestedDir, "launch.html"), target: resolve(outDir, "launch.html") },
        ];

        for (const { source, target } of files) {
          if (existsSync(source)) {
            mkdirSync(outDir, { recursive: true });
            renameSync(source, target);
          }
        }

        if (existsSync(nestedDir)) {
          rmSync(nestedDir, { recursive: true, force: true });
        }
      },
    },
  ],
});
