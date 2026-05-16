// vite.config.js
// Vite is the build/dev tool we use for the React app.

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
