import { defineConfig } from "tsup";
import { builtinModules } from "node:module";

export default defineConfig({
  entry: ["src/server/index.tsx"],
  format: ["cjs"],
  platform: "node",
  target: "node18",
  outDir: "dist/server",

  clean: true,
  minify: true,
  sourcemap: true,
  dts: false,

  splitting: false,
  external: [...builtinModules],

  noExternal: [
    "express",
    "@devvit/web",
    "@devvit/web/server",
    "@devvit/web/client",
    "@devvit/public-api"
  ],

  outExtension({ format }) {
    return { js: format === "cjs" ? ".cjs" : ".js" };
  },

  esbuildOptions(options) {
    // Parse JSX in .ts (your server file is .ts but contains JSX tags)
    options.loader = { ...(options.loader || {}), ".ts": "tsx" };

    // IMPORTANT: use Devvit.createElement, not jsx-runtime
    options.jsx = "transform";
    options.jsxFactory = "Devvit.createElement";
    options.jsxFragment = "Devvit.Fragment";
  }
});
