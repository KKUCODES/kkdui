import { fileURLToPath, URL } from "node:url";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig(() => {
  const config = {
    plugins: [vue()],
    build: {
      lib: {
        entry: fileURLToPath(new URL("./src/index.ts", import.meta.url)),
        formats: ["es" as const],
        fileName: "index",
        cssFileName: "style"
      },
      rollupOptions: {
        external: ["vue"]
      }
    },
    test: {
      environment: "jsdom",
      include: ["src/**/*.test.ts"],
      maxWorkers: 4,
      minWorkers: 1
    }
  };

  return config;
});
