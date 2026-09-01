import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Plain Vite + React SPA. `vite build` emits a static bundle to `dist/`.
// Deep-link support (e.g. /app) comes from the SPA fallback configured in
// `vercel.json` for production and Vite's dev server here.
export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  server: {
    port: 3000,
    host: true,
  },
  preview: {
    port: 3000,
  },
});
