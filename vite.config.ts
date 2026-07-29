import { fileURLToPath, URL } from "node:url";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig(() => {
  const config = {
    plugins: [vue()],
    build: {
      lib: {
        entry: {
          index: fileURLToPath(new URL("./src/index.ts", import.meta.url)),
          icons: fileURLToPath(new URL("./src/icons/index.ts", import.meta.url))
        },
        formats: ["es" as const],
        fileName: (_format: string, entryName: string) => `${entryName}.js`,
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
