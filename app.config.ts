// app.config.ts
import { defineConfig } from "@tanstack/start/config";

export default defineConfig({
  server: {
    preset: "vercel",
  },
  // We expliciet linken naar de router
  vite: {
    plugins: [
      // Zorg dat de router-plugin ook hier actief is voor de build
      import("@tanstack/router-plugin/vite").then(m => m.default()),
    ],
  },
});