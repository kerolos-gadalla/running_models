import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: path.join(__dirname, "docs"),
  },
  plugins: [react()],
});
