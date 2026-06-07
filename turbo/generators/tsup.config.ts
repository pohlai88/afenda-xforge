import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["index.ts"],
  outDir: "dist",
  format: ["cjs"],
  platform: "node",
  target: "node20",
  sourcemap: true,
  minify: false,
  clean: true,
  dts: false,
  splitting: false,
  external: ["@turbo/gen"],
});
