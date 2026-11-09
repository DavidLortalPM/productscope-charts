# Product Scope Charts: notes for AI agents

A public, open-source Cloudflare Worker (`charts.productscope.uk`). All demo data is made up; keep it that way. Nothing private belongs in this repo. People outside Product Scope read this repository, so keep the docs accurate and the history tidy.

## Deploying and running

- **Deploy only with** `npm run deploy:productscope` (`wrangler deploy --profile productscope`). The default wrangler login on this machine is a different account, so never run a bare `wrangler deploy` here.
- This folder is bound to the `productscope` wrangler profile (`wrangler auth activate`; check with `wrangler auth list`). The account ID is deliberately not committed, so forks can deploy to their own accounts. On this slow connection, prefix wrangler commands with `NODE_OPTIONS="--dns-result-order=ipv4first"` if the Cloudflare API times out.
- Preview locally with `npm run dev` (http://127.0.0.1:8787). Local dev needs no login. Stop the server and delete `dev.log` when you finish.

## Keep the docs in step with the code (important)

The documentation is generated from the source so it cannot drift. **Whenever you add, remove or change a chart, an option or an example, run `npm run docs` and commit the result,** then `npm run check`.

- Generated, never edit by hand: `toolkit/`, `docs/charts/`, `llms.txt`, `llms-full.txt`, and `skills/productscope-charts/assets/` and `references/`. The sources are `src/pages.ts`, `src/pages-usage.ts`, `src/groups.ts`, `src/charts*.ts`, `src/helpers.ts` and the tokens in `src/shell.ts`.
- Hand-written: `README.md`, `docs/{README,getting-started,concepts,api,using-with-ai,architecture}.md`, `skills/productscope-charts/SKILL.md`, `CONTRIBUTING.md`, `SECURITY.md`, `examples/starter/`.
- `npm run check` (CI runs it) verifies the hand-written chart counts, the generated files, and calls every route of the Worker.
- **Add a line to `CHANGELOG.md` under Unreleased** for anything a user of the toolkit would notice. Bump the version in `package.json` and `.claude-plugin/plugin.json` together when releasing, and add the dated section.
- A new chart needs: its page in `src/pages-usage.ts` (or `pages.ts`), a place in `src/groups.ts`, a preview in `THUMBS` in `src/index.ts`. `docs/architecture.md` has the full steps.
- Do not add chart numbers to the home page: the cards show each chart's group, and the URLs carry no number.
- **Do not push, tag or create releases without being asked.** The repository is public.

## Site rules

- The look and feel follows the Product Scope site (productscope.uk): navy header, hero band, post-card style cards, slate footer, Poppins headings, DM Sans body. Change the chrome in `src/shell.ts`; do not touch the chart palette tokens (`--c1` to `--c9`), which are validated for colour-blind separation.
- Keep the CSP strict (`src/index.ts`): no third-party hosts, scripts only via the per-request nonce. Fonts are served first-party from `/f/`. Be precise in copy: scripts are strict; the charts set `style` attributes, so `style-src` allows `'unsafe-inline'`.
- `CHARTS_JS`, `CHARTS_CSS`, `HELPERS` and `SHOW_JS` are template literals: no backticks and no dollar-brace sequences inside them (`npm run docs` fails if one slips in).
- The thumbnail CSS hides SVG text on the home page previews (`.thumb .ch text`). A chart made of text, like the word cloud, needs an exception.
- SEO plumbing lives in `src/index.ts`: `sitemap.xml` (built from `PAGES`; bump `LASTMOD` when content changes), `robots.txt`, `/.well-known/security.txt` (renew `Expires` before 2027-10-08), `/og.png` (share image, regenerate if the branding changes) and JSON-LD via `pageLd()`. A new chart page added to `PAGES` appears in the sitemap automatically.
- Link out to the charts from the main site. Do not embed them in an iframe (`frame-ancestors 'none'`).
- Reuse the real Product Scope components (`.hero-light`, `.cs-head`, `.split`, `.pf-browser`, `.post-card`, `.cat-chip`, `.cs-stats`, `.feat-row`, `.deliver2`, `.panel--warm`, `.faq`, `.cta-band--row`) with the same class names and markup as the main site; they are ported into `SHOW_CSS` in `src/shell.ts` and recoloured through tokens so they follow the dark theme. Do not draw new bespoke layout when a site component exists. The main site retired eyebrow kickers, so do not add them.
