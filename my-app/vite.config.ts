import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "my-app", "src"),
      "@shared": path.resolve(__dirname, "my-app", "shared"),
      "@assets": path.resolve(__dirname, "my-app", "public", "assets"),
    },
  },
  root: path.resolve(__dirname, "my-app"),
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
});