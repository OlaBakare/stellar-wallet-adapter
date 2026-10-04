import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/test/**", "src/types/globals.d.ts"],
      thresholds: {
        "src/adapters/createKitAdapter.ts": {
          branches: 85,
          functions: 100,
          lines: 95,
        },
        "src/context/WalletContext.tsx": {
          functions: 85,
          lines: 85,
        },
        "src/kit/kit-manager.ts": {
          branches: 70,
          functions: 90,
          lines: 90,
        },
      },
    },
  },
  resolve: {
    alias: {
      // Ensure tests import library source directly
      "^@/": "/src/",
    },
  },
});
