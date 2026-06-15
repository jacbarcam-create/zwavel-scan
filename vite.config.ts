import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Verwijder de adapter-import en de 'start'-configuratie
  // TanStack Start/Vinxi detecteert Vercel automatisch als je 
  // het op Vercel deployt.
});