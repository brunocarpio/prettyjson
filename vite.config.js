import { defineConfig } from "vite";

export default defineConfig({
  root: "./client",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  server: {
    https: false,
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
