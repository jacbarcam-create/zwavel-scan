import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { vercel } from "@tanstack/start-adapter-vercel";

export default defineConfig({
  start: {
    adapter: vercel(),
  },
});