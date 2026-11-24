# AGENTS.md

> `CLAUDE.md` contains one line: `See AGENTS.md.`

## What this repo is
Product Scope Charts: a **public**, MIT-licensed, open-source set of twenty-four SVG chart types with no runtime dependencies, plus the showcase site at https://charts.productscope.uk. The site is a single Cloudflare Worker (`src/index.ts`) with no bindings, no secrets and no database; the pages are generated on each request. `toolkit/` holds the four files people copy into their own projects. It also ships a Claude skill and plugin manifest. All demo data is made up. It holds no personal data and nothing private belongs here. Outsiders read this repo, so keep docs accurate and history tidy.

## Standards that apply
Follow the Product Scope Coding Standard and Deployment Standard: https://github.com/DavidLortalPM/engineering-standards (`CODING-STANDARD.md`, `DEPLOYMENT-STANDARD.md`). Where this repo differs, see "Exceptions". If a rule is unclear, ask. Do not guess. The repo-specific rules from the old `CLAUDE.md` are kept in full at the bottom of this file and still apply. `docs/architecture.md` has the steps for adding a chart.

## Commands
| Task | Command |
|---|---|
| Install | `npm ci` (Node 20 or later; CI uses 22) |
| Run locally | `npm run dev` (http://127.0.0.1:8787, no login needed) |
| Check everything | `npm run check` (consistency checks, generated docs current, smoke test of every route) |
| Regenerate the generated docs | `npm run docs` (`npm run docs:check` only checks) |
| Smoke test only | `npm run smoke` |
| Bundle the Worker without deploying | `npm run build:dry-run` |
| Release to production | `npm run deploy:productscope` (David only, see below) |
| Lint / type check | none exists (see Exceptions) |

There is no script called `verify`; `npm run check` is the equivalent. Run it before saying any task is done and report its real result. Never claim success without it.

## Deploy and rollback
Tier B (public app, no sensitive data, no accounts). Today David deploys by hand from his own computer with `npm run deploy:productscope` (`wrangler deploy --profile productscope`). Never run a bare `wrangler deploy` here: the default wrangler login on David's machine is a different account. Never deploy, push, tag or create a release without explicit approval.
- GitHub Actions only runs checks (`ci.yml`) and, when a GitHub release is published, attaches the skill zip (`release.yml`). Neither deploys.
- Whether Cloudflare Workers Builds is connected to this repo: **unknown, ask David**. I saw no Workers Builds check on the latest commit to `main`, so merging looks safe, but I could not confirm it.
- Rollback: redeploy the previous commit (`git checkout <commit>` then `npm run deploy:productscope`), or use **Rollback** on the Worker's Deployments page in the Cloudflare dashboard. Exact steps beyond that: unknown, ask David.

## Folder map
- `src/`: the Worker. `index.ts` (routes, headers, sitemap), `shell.ts` (page chrome, tokens, CSS), `charts*.ts` and `helpers.ts` (chart code), `pages*.ts` and `groups.ts` (page content and grouping), `fonts/`.
- `toolkit/`: generated copy-paste files. `docs/`: hand-written guides, plus generated `docs/charts/`.
- `skills/productscope-charts/` and `.claude-plugin/`: the Claude skill and plugin.
- `scripts/`: `build-docs.mjs`, `check.mjs`, `smoke.mjs`. `examples/starter/`: a complete example page.
- `llms.txt`, `llms-full.txt`: generated.

## Never do
- Never commit `.env`, `.dev.vars`, tokens, the Cloudflare account ID or any real or personal data. This repo is public.
- Never deploy to production, change DNS, rotate secrets or push, tag or release without explicit approval.
- Never edit generated files by hand (`toolkit/`, `docs/charts/`, `llms*.txt`, and the skill's `assets/` and `references/`). Run `npm run docs`.
- Never add a dependency, framework or third-party script or font host without asking.
- Never weaken the Content-Security-Policy or security headers.
- Never change the chart colour tokens `--c1` to `--c9`.

## Always do
- Platform first: native HTML, then CSS, then a little JavaScript, then a library.
- Keep new files small and explain *why* in comments.
- Run `npm run docs` then `npm run check` after any change to a chart, option or example, and add a `CHANGELOG.md` line under Unreleased for user-visible changes.
- Keep charts accessible: keyboard, empty and one-point data, dark theme, narrow widths.
- Use British English in copy. Use the tokens in `src/shell.ts` for colours and spacing.
- End every code reply with "Standard applied": the rules used and any not followed, with the reason.

## Data and privacy
No personal data. Demo data is seeded random numbers generated in the browser. Nothing is sent to a third party, and nothing from outside the repo should be pasted into it, because it is public.

## Exceptions to the standard
| Rule | Why | Owner | Review |
|---|---|---|---|
| No `verify` script name; `npm run check` is used | Existing name, documented in CONTRIBUTING and the PR template | David | Add a `verify` alias if wanted |
| No linter, formatter or type checker | None set up; TypeScript is not checked by `tsc` (repo audit: "partial") | David | Add ESLint, Prettier and a typecheck |
| Deploys from David's computer, not Workers Builds | Existing setup; the standard's target is Workers Builds | David | Decide, or archive: it duplicates `product-scope-resources` |
| No Dependabot | Removed 9 Nov 2026: no runtime dependencies, dev dependencies only (commit 36c7ba4) | David | Re-check if dependencies grow |
| `ci.yml` runs on every push to `main` and every pull request, with no path filter or concurrency cancel | Existing setup | David | Add path filters and cancel-in-progress |

## Learning log
- 2026-11-24: DON'T run a bare `wrangler deploy` in this folder. DO use `npm run deploy:productscope`, because the default login is another account.

---

## Repo-specific rules (kept from the previous CLAUDE.md)

### Product Scope Charts: notes for AI agents

A public, open-source Cloudflare Worker (`charts.productscope.uk`). All demo data is made up; keep it that way. Nothing private belongs in this repo. People outside Product Scope read this repository, so keep the docs accurate and the history tidy.

#### Deploying and running

- **Deploy only with** `npm run deploy:productscope` (`wrangler deploy --profile productscope`). The default wrangler login on this machine is a different account, so never run a bare `wrangler deploy` here.
- This folder is bound to the `productscope` wrangler profile (`wrangler auth activate`; check with `wrangler auth list`). The account ID is deliberately not committed, so forks can deploy to their own accounts. On this slow connection, prefix wrangler commands with `NODE_OPTIONS="--dns-result-order=ipv4first"` if the Cloudflare API times out.
- Preview locally with `npm run dev` (http://127.0.0.1:8787). Local dev needs no login. Stop the server and delete `dev.log` when you finish.

#### Keep the docs in step with the code (important)

The documentation is generated from the source so it cannot drift. **Whenever you add, remove or change a chart, an option or an example, run `npm run docs` and commit the result,** then `npm run check`.

- Generated, never edit by hand: `toolkit/`, `docs/charts/`, `llms.txt`, `llms-full.txt`, and `skills/productscope-charts/assets/` and `references/`. The sources are `src/pages.ts`, `src/pages-usage.ts`, `src/groups.ts`, `src/charts*.ts`, `src/helpers.ts` and the tokens in `src/shell.ts`.
- Hand-written: `README.md`, `docs/{README,getting-started,concepts,api,using-with-ai,architecture}.md`, `skills/productscope-charts/SKILL.md`, `CONTRIBUTING.md`, `SECURITY.md`, `examples/starter/`.
- `npm run check` (CI runs it) verifies the hand-written chart counts, the generated files, and calls every route of the Worker.
- **Add a line to `CHANGELOG.md` under Unreleased** for anything a user of the toolkit would notice. Bump the version in `package.json` and `.claude-plugin/plugin.json` together when releasing, and add the dated section.
- A new chart needs: its page in `src/pages-usage.ts` (or `pages.ts`), a place in `src/groups.ts`, a preview in `THUMBS` in `src/index.ts`. `docs/architecture.md` has the full steps.
- Do not add chart numbers to the home page: the cards show each chart's group, and the URLs carry no number.
- **Do not push, tag or create releases without being asked.** The repository is public.

#### Site rules

- The look and feel follows the Product Scope site (productscope.uk): navy header, hero band, post-card style cards, slate footer, Poppins headings, DM Sans body. Change the chrome in `src/shell.ts`; do not touch the chart palette tokens (`--c1` to `--c9`), which are validated for colour-blind separation.
- Keep the CSP strict (`src/index.ts`): no third-party hosts, scripts only via the per-request nonce. Fonts are served first-party from `/f/`. Be precise in copy: scripts are strict; the charts set `style` attributes, so `style-src` allows `'unsafe-inline'`.
- `CHARTS_JS`, `CHARTS_CSS`, `HELPERS` and `SHOW_JS` are template literals: no backticks and no dollar-brace sequences inside them (`npm run docs` fails if one slips in).
- The thumbnail CSS hides SVG text on the home page previews (`.thumb .ch text`). A chart made of text, like the word cloud, needs an exception.
- SEO plumbing lives in `src/index.ts`: `sitemap.xml` (built from `PAGES`; bump `LASTMOD` when content changes), `robots.txt`, `/.well-known/security.txt` (renew `Expires` before 2027-10-08), `/og.png` (share image, regenerate if the branding changes) and JSON-LD via `pageLd()`. A new chart page added to `PAGES` appears in the sitemap automatically.
- Link out to the charts from the main site. Do not embed them in an iframe (`frame-ancestors 'none'`).
- Reuse the real Product Scope components (`.hero-light`, `.cs-head`, `.split`, `.pf-browser`, `.post-card`, `.cat-chip`, `.cs-stats`, `.feat-row`, `.deliver2`, `.panel--warm`, `.faq`, `.cta-band--row`) with the same class names and markup as the main site; they are ported into `SHOW_CSS` in `src/shell.ts` and recoloured through tokens so they follow the dark theme. Do not draw new bespoke layout when a site component exists. The main site retired eyebrow kickers, so do not add them.
