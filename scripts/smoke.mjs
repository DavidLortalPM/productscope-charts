// Smoke test: bundles the Worker, calls its fetch handler for every route and checks the basics.
// Needs no Cloudflare account, no network and no browser. Run with `npm run smoke` (also part of `npm run check`).
import { build } from "esbuild";
import fs from "node:fs/promises";
import { ROOT } from "./load-source.mjs";

const result = await build({
  entryPoints: [ROOT + "/src/index.ts"],
  bundle: true,
  format: "esm",
  platform: "node",
  write: false,
  logLevel: "silent",
  // Fonts and the share image are imported as binary data (the Worker's wrangler rule does this in production).
  // esbuild's own "binary" loader needs a newer Node than we support, so read them with Buffer instead.
  plugins: [{
    name: "binary-assets",
    setup(b) {
      b.onLoad({ filter: /\.(woff2|png)$/ }, async args => ({
        contents: `export default new Uint8Array(Buffer.from("${(await fs.readFile(args.path)).toString("base64")}", "base64"));`,
        loader: "js",
      }));
    },
  }],
});
const worker = (await import("data:text/javascript;base64," + Buffer.from(result.outputFiles[0].text).toString("base64"))).default;
const { PAGES, GROUPS } = await (await import("./load-source.mjs")).loadSource();

const failures = [];
const expect = (ok, message) => { if (!ok) failures.push(message); };
const get = async (path, init) => {
  try {
    return await worker.fetch(new Request("https://charts.productscope.uk" + path, init));
  } catch (e) {
    // A route that throws is a failure with a readable reason, not a crash of the whole test.
    failures.push(`${path} threw: ${String(e && e.message).slice(0, 200)}`);
    return new Response("", { status: 500 });
  }
};

// the groups list and the page list agree (checked first: a chart missing from groups breaks its own page)
const listed = GROUPS.flatMap(g => g.paths);
for (const p of PAGES) expect(listed.includes(p.path), `${p.path} is in PAGES but not in any group in src/groups.ts`);
expect(new Set(listed).size === listed.length, "src/groups.ts lists a chart more than once");

// every page returns 200 HTML with a strict policy, a nonce that matches, and no inline script without it
const htmlPaths = ["/", "/dashboard", "/toolkit", ...PAGES.map(p => p.path)];
for (const path of htmlPaths) {
  const res = await get(path);
  const html = await res.text();
  expect(res.status === 200, `${path} returned ${res.status}`);
  expect((res.headers.get("content-type") || "").startsWith("text/html"), `${path} is not served as HTML`);
  const csp = res.headers.get("content-security-policy") || "";
  const nonce = (csp.match(/script-src 'nonce-([^']+)'/) || [])[1];
  expect(nonce, `${path} has no nonce-based script-src`);
  expect(/default-src 'none'/.test(csp) && /connect-src 'none'/.test(csp), `${path} has a weaker Content-Security-Policy than expected`);
  expect(!/script-src[^;]*'unsafe-(inline|eval)'/.test(csp), `${path} allows unsafe scripts`);
  const scripts = [...html.matchAll(/<script\b([^>]*)>/g)].map(m => m[1]);
  expect(scripts.length > 0 && scripts.every(a => nonce && a.includes(`nonce="${nonce}"`)), `${path} has a <script> without the nonce`);
  expect(!/\son[a-z]+="/i.test(html), `${path} has an inline event-handler attribute`);
  expect(/<title>[^<]{5,}<\/title>/.test(html) && /<meta name="description"/.test(html), `${path} is missing a title or description`);
  expect(/<link rel="canonical"/.test(html), `${path} has no canonical link`);
}

// chart pages show their options and snippet, and are reachable from the home page
const home = await (await get("/")).text();
for (const p of PAGES) {
  expect(home.includes(`href="${p.path}"`), `The home page does not link to ${p.path}`);
  expect(home.includes(`data-t="${p.path.slice(1)}"`), `The home page has no preview slot for ${p.path}`);
}
// every chart has a preview drawn in index.ts (THUMBS)
const thumbSource = await fs.readFile(ROOT + "/src/index.ts", "utf8");
for (const p of PAGES) {
  const key = p.path.slice(1);
  expect(new RegExp(`(^|\\s)(${key}|'${key}'):\\(\\)`).test(thumbSource), `No home-page preview (THUMBS entry) for ${p.path}`);
}

// plumbing
const sitemap = await (await get("/sitemap.xml")).text();
for (const path of htmlPaths) expect(sitemap.includes(`<loc>https://charts.productscope.uk${path === "/" ? "/" : path}</loc>`), `${path} is missing from sitemap.xml`);
expect((await get("/robots.txt")).status === 200, "/robots.txt is not served");
expect((await get("/.well-known/security.txt")).status === 200, "/.well-known/security.txt is not served");
const og = await get("/og.png");
expect(og.status === 200 && (og.headers.get("content-type") || "") === "image/png", "/og.png is not served as an image");
expect((await get("/f/dm-sans-400.woff2")).status === 200, "A self-hosted font is not served");
expect((await get("/this-page-does-not-exist")).status === 404, "An unknown path does not return 404");
expect((await get("/line/")).status === 301, "A trailing slash does not redirect");
expect((await get("/", { method: "POST" })).status === 405, "POST is not rejected");

if (failures.length) {
  console.error("Smoke test failed:\n" + failures.map(f => "  - " + f).join("\n"));
  process.exit(1);
}
console.log(`Smoke test passed: ${htmlPaths.length} pages, sitemap, robots, security.txt, og image and fonts.`);
