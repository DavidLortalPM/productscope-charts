# Architecture

For anyone changing this repository. If you only want to use the charts, you do not need this: see [getting started](getting-started.md).

## What it is

A single Cloudflare Worker (`src/index.ts`) that serves the showcase site at charts.productscope.uk. It has no bindings, no secrets and no database. Every page is generated as a string on each request, with a strict Content-Security-Policy and a fresh nonce, so there is no build output to deploy. The charts themselves are plain browser JavaScript and CSS that the Worker inlines into each page.

## Where things are

| Path | What it is |
| --- | --- |
| `src/charts.ts`, `src/charts-more.ts` | **The toolkit**: `CHARTS_CSS` and `CHARTS_JS`, as template literals. `charts.ts` has the core charts and the shared functions; `charts-more.ts` adds histogram, box plot, word cloud, diverging bars, area, scatter, bump, slope and funnel. |
| `src/helpers.ts` | The few helper functions the script expects (`h`, `money0`, `monthName`, `fmtDate`, `legend`). |
| `src/shell.ts` | The page chrome, design tokens (light and dark), the demo harness (`demo`), the seeded random generator and the made-up data. |
| `src/pages.ts`, `src/pages-usage.ts` | **One entry per chart page**: name, description, options, snippet and the demo script. `pages.ts` is the first fifteen, `pages-usage.ts` the later nine and the data they share. |
| `src/groups.ts` | The order and grouping of the charts. Drives the home page, the chips, previous/next links and the docs. |
| `src/index.ts` | The Worker: routes, the home page and its previews (`THUMBS`), the toolkit page, the dashboard, SEO plumbing and the CSP. |
| `src/fonts/` | DM Sans and Poppins, self-hosted (SIL Open Font License). |
| `toolkit/` | **Generated.** The four files people copy into their projects. |
| `docs/charts/`, `llms*.txt`, `skills/…/{assets,references}` | **Generated** from the source. |
| `scripts/` | `build-docs.mjs` (generator), `smoke.mjs` (calls every route), `check.mjs` (consistency checks), `load-source.mjs` (bundles the TypeScript for the scripts). |
| `examples/starter/` | A complete page using the toolkit under a tight CSP. |
| `skills/productscope-charts/` | The Claude skill. `SKILL.md` is hand-written; the rest is generated. |

## Commands

```
npm run dev            # local Worker at http://127.0.0.1:8787, no login needed
npm run docs           # regenerate toolkit/, docs/charts/, llms*.txt and the skill's references
npm run check          # consistency checks + docs are current + smoke test of every page
npm run build:dry-run  # bundle the Worker the way a deploy would, without deploying
```

CI runs `npm run check` and `npm run build:dry-run` on every push and pull request.

## Adding a chart

1. **Write the chart function** in `src/charts-more.ts` (or `charts.ts`). Follow the rules below.
2. **Add a page** to `src/pages-usage.ts` (or `pages.ts`): `path`, `name`, `title`, `tag` (one line), `when` (when to use it), `keys` (keyboard notes), `opts` (every option, one line each), `snippet` (a complete example) and `script` (the live demo, using `demo({...})`).
3. **Put it in a group** in `src/groups.ts`. It will not appear on the home page without this.
4. **Add a preview** to `THUMBS` in `src/index.ts` (the key is the path without the slash).
5. **Run `npm run docs`**, then `npm run check`. Commit the generated files with your change.
6. **Update the count** in the copy that says it by hand (`README.md` and `package.json` say "Twenty-four"; `npm run check` tells you if one is wrong). The site's own copy works the count out itself.
7. **Add a line to `CHANGELOG.md`** under Unreleased, and bump `LASTMOD` in `src/index.ts` so the sitemap shows a new date.

## Rules for chart code

- **Template literals.** `CHARTS_JS`, `CHARTS_CSS`, `HELPERS` and `SHOW_JS` are TypeScript template literals, so inside them use no backticks and no dollar-brace sequences. Use string concatenation. `npm run docs` fails if one slips in.
- **Every chart handles empty, one-point and all-zero data**, and is reachable and usable by keyboard. Offer the same data as a table.
- **Colour comes from tokens** (`--c1` to `--c9`, `--accent`, `--ok` and so on), never a hard-coded value, so both themes work. Do not change the categorical palette without re-checking colour-blind separation.
- **No dependencies, no network requests, no `eval`, no inline event handlers.** The strict policy is the point.
- **Size from the container.** Charts read the width set by `setChartWidth` rather than assuming one.
- **Made-up data only.** Demo numbers come from the seeded generator in `shell.ts`. Never put real data in this repository.

## Security policy of the site

The Worker sends `default-src 'none'; script-src 'nonce-…'; style-src 'unsafe-inline'; img-src data:; font-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; connect-src 'none'`, so the site cannot be framed and the pages cannot make requests. `npm run smoke` checks that every page keeps a nonce on each script and does not loosen `script-src`.

## Deploying

The Cloudflare account ID is deliberately not committed, so forks deploy to their own accounts: run `npx wrangler deploy` against yours. The Product Scope maintainers deploy with `npm run deploy:productscope`, which uses a named wrangler profile. The hosting is a custom domain on the Worker (`wrangler.jsonc`), with `workers_dev` and preview URLs switched off.
