import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/app.ts"], // 여러 엔트리 가능
  outDir: "build",
  format: ["esm"],
  splitting: false,
  sourcemap: false,
  clean: true,
  minify: true,
  target: "es2022",
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
});
