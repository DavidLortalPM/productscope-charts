# Product Scope Charts: notes for AI agents

A public, open-source Cloudflare Worker (`charts.productscope.uk`). All demo data is made up; keep it that way. Nothing private belongs in this repo.

- **Deploy only with** `npm run deploy:productscope` (`wrangler deploy --profile productscope`). The default wrangler login on this machine is a different account, so never run a bare `wrangler deploy` here.
- Preview locally with `npm run dev` (http://127.0.0.1:8787). Local dev needs no login.
- The look and feel follows the Product Scope site (productscope.uk): navy header, hero band, post-card style cards, slate footer, Poppins headings, DM Sans body. Change the chrome in `src/shell.ts`; do not touch the chart palette tokens (`--c1` to `--c9`), which are validated for colour-blind separation.
- Keep the CSP strict (`src/index.ts`): no third-party hosts, scripts only via the per-request nonce. Fonts are served first-party from `/f/`.
- `CHARTS_JS` and `SHOW_JS` are template literals: no backticks and no dollar-brace sequences inside them.
- SEO plumbing lives in `src/index.ts`: `sitemap.xml` (built from `PAGES`; bump `LASTMOD` when content changes), `robots.txt`, `/.well-known/security.txt` (renew `Expires` before 2027-10-08), `/og.png` (share image, regenerate if the branding changes) and JSON-LD via `pageLd()`. A new chart page added to `PAGES` appears in the sitemap automatically.
- Link out to the charts from the main site. Do not embed them in an iframe (`frame-ancestors 'none'`).
