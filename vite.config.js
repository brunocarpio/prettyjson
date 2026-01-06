import { defineConfig } from "vite";

export default defineConfig({
  root: "./client",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    minify: "esbuild",
    sourcemap: false,
  },
  server: {
    https: false,
  },
});
