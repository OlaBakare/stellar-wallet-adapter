import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Ensure the example uses the source of the library during development
      "stellar-wallet-adapter": new URL("../src/index.tsx", import.meta.url).pathname,
    },
  },
  server: {
    port: 5173,
  },
});
