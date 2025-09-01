import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@components": path.resolve(__dirname, "./client/src/components"),
      "@lib": path.resolve(__dirname, "./client/src/lib"),
      "@shared": path.resolve(__dirname, "./shared"),  // ADD THIS LINE
    },
  },
  build: {
    outDir: "dist",
  },
});