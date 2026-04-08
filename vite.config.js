import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages project site: https://<user>.github.io/<repo>/
const repo = "scroll-trap-simulation3";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? `/${repo}/` : "/",
}));
