# Changelog

All notable changes to Product Scope Charts. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/): a new chart or option is a minor version, a fix is a patch, and anything that changes the name or meaning of an existing option is a major version.

The toolkit is copied into projects rather than installed, so when you update your copy, check this file for what changed.

## [Unreleased]

## [1.1.0] - 2026-11-09

### Added

- **Nine chart types**, for 24 in total: histogram, box plot, word cloud, diverging bars, stacked and percent area, scatter and bubble, bump chart, slope chart and funnel.
- **Documentation.** Getting started, concepts and conventions, a shared-function reference, an architecture guide, and a reference page for every chart (`docs/`).
- **`toolkit/`**: the four files to copy into a project (`tokens.css`, `helpers.js`, `toolkit.css`, `toolkit.js`), generated from the source so they cannot drift.
- **A Claude skill** (`skills/productscope-charts`) and a Claude Code plugin manifest, so Claude can choose charts and add the toolkit to a project. Plain-text docs for other assistants in `llms.txt` and `llms-full.txt`.
- **A starter example** (`examples/starter/`): a complete page under a tight Content-Security-Policy.
- **Continuous integration**: consistency checks, generated docs kept current, a smoke test of every page and a Worker dry-run on each push and pull request. Dependabot for dependencies and workflow actions.
- Contributing guide, security policy, and issue and pull request templates.
- `legend()` is now part of the copy-paste helpers (`helpers.js`). The stacked-columns example used it without it being included.

### Changed

- The home page cards show each chart's group instead of a chart number, and previous and next links on chart pages follow the order shown on the home page.
- The home page's "Small on purpose" section and stats band are gone; the three steps (copy the code, draw a chart, make it yours) are now the introduction to the FAQ. The currency wording now says what is true: pounds by default, with formatter options on most charts.
- The README now describes the Content-Security-Policy precisely: scripts are strict (no `eval`, no inline handlers, no external requests); the charts set `style` attributes, so `style-src` needs `'unsafe-inline'` or, tighter, `style-src-attr 'unsafe-inline'`.

### Fixed

- The word cloud preview on the home page was blank.

## [1.0.0] - 2026-11-02

### Added

- First public release: fifteen SVG chart types (line, grouped bars, stacked columns, donut, heatmap, calendar, treemap, sparkline, gauge, waterfall, flow, ranked bars, small multiples, KPI tiles and data table), each with a live demo, a copyable example and its options.
- A mock-up dashboard using ten of the charts, and a "Get the code" page with the toolkit.
- Light and dark themes, keyboard navigation, screen-reader labels, optional patterns instead of colour, and empty, one-point and outlier handling.
- A strict Content-Security-Policy with a per-request nonce, self-hosted fonts, a sitemap and structured data.

[Unreleased]: https://github.com/DavidLortalPM/productscope-charts/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/DavidLortalPM/productscope-charts/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/DavidLortalPM/productscope-charts/releases/tag/v1.0.0
