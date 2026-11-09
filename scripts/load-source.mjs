// Bundles the TypeScript sources the docs are built from (no Cloudflare bindings, so it runs in plain Node)
// and returns them. esbuild is already a dependency of wrangler.
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import path from "node:path";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export async function loadSource() {
  const result = await build({
    stdin: {
      contents: [
        'export { PAGES } from "./src/pages.ts";',
        'export { GROUPS } from "./src/groups.ts";',
        'export { HELPERS } from "./src/helpers.ts";',
        'export { CHARTS_CSS, CHARTS_JS } from "./src/charts.ts";',
        'export { SHOW_CSS } from "./src/shell.ts";',
      ].join("\n"),
      resolveDir: ROOT,
      loader: "ts",
    },
    bundle: true,
    format: "esm",
    platform: "node",
    write: false,
    logLevel: "silent",
  });
  const code = result.outputFiles[0].text;
  return import("data:text/javascript;base64," + Buffer.from(code).toString("base64"));
}
