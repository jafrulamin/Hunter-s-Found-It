// vite.config.js
// Vite is the build/dev tool we use for the React app.
// We add a proxy so that during development, any request the browser makes
// to "/api/..." gets forwarded to the backend running on port 5000.
// That way we don't have to deal with CORS in dev.

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
});
