import { defineConfig } from "tsup";

// Vercel build — bundles EVERYTHING (no externals) into one self-contained
// api/index.js so it runs from any deploy root. The default tsup.config.ts
// externalizes express/dotenv/etc. (they resolve from backend/node_modules),
// which breaks when Vercel deploys from the repo root and can't reach
// backend/node_modules at runtime.
export default defineConfig({
  entry: { index: "src/vercel-app.ts" },
  format: ["esm"],
  platform: "node",
  target: "node22",
  outDir: "api",
  sourcemap: false,
  clean: false,
  bundle: true,
  splitting: false,
  dts: false,
  // Bundle every dependency — no external list, so nothing resolves from
  // node_modules at runtime.
  noExternal: [/.*/],
});
