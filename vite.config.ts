import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // We vertellen de build-tool hier dat hij geen SSR moet doen
  ssr: false 
});