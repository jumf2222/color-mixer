import { defineConfig } from "vite";
import solid from "@solidjs/vite-plugin";

export default defineConfig({
  plugins: [solid()],
  // Relative asset paths so the build works from any folder,
  // e.g. https://<user>.github.io/color-mixer/ on GitHub Pages.
  base: "./",
});
