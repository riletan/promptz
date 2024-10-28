import { coverageConfigDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    coverage: {
      reporter: ["json", "text"],
      exclude: [
        "API.ts",
        "mutations.ts",
        "next.config.js",
        "queries.ts",
        "subscriptions.ts",
        "commitlint.config.js",
        "amplify/**",
        ...coverageConfigDefaults.exclude,
      ],
    },
    environment: "jsdom",
    setupFiles: ["./vitest.setup.js"],
    alias: {
      "@/": new URL("./", import.meta.url).pathname,
    },
  },
});
