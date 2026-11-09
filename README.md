# Product Scope Charts

[![CI](https://github.com/DavidLortalPM/productscope-charts/actions/workflows/ci.yml/badge.svg)](https://github.com/DavidLortalPM/productscope-charts/actions/workflows/ci.yml)
[![Licence: MIT](https://img.shields.io/badge/licence-MIT-blue.svg)](LICENSE)

**Twenty-four SVG chart types, built from scratch with Claude. No libraries, no dependencies, accessible by default, and written to run under a strict Content-Security-Policy.**

[**See every chart live**](https://charts.productscope.uk) · [Docs](docs/README.md) · [Claude skill](docs/using-with-ai.md) · [Product Scope](https://productscope.uk)

[![Product Scope Charts](docs/preview.jpg)](https://charts.productscope.uk)

Copy four small files into a project, load them, and call a function with arrays of numbers. Each function returns a DOM node. Every chart has a [live demo](https://charts.productscope.uk) with the empty and one-point states, a [reference page](docs/charts/README.md) with its options and a complete example. All the data is made up (seeded random numbers generated in the browser), so there is nothing private in here.

## Quick start

1. **Copy the toolkit.** The four files in [`toolkit/`](toolkit) are all you need: `tokens.css`, `helpers.js`, `toolkit.css` and `toolkit.js`.
2. **Load them in order.** They are classic scripts that define globals, not modules.

   ```html
   <link rel="stylesheet" href="/toolkit/tokens.css">
   <link rel="stylesheet" href="/toolkit/toolkit.css">
   <div id="spend"></div>
   <script src="/toolkit/helpers.js"></script>
   <script src="/toolkit/toolkit.js"></script>
   ```

3. **Draw a chart.**

   ```js
   const host = document.getElementById('spend');
   setChartWidth(host.clientWidth);
   host.replaceChildren(lineChart({
     xs: ['2026-04', '2026-05', '2026-06', '2026-07'],
     xlabel: monthName,
     series: [{ name: 'Spend', values: [1820, 2310, 1960, 2540], colour: 'var(--c1)', area: true }],
     label: 'Monthly spend, April to July 2026'
   }));
   ```

A complete, working page is in [`examples/starter/`](examples/starter). Serve the repository with any static server (`python -m http.server 8200`) and open `/examples/starter/`. The full walk-through is in [Getting started](docs/getting-started.md).

## Use it with Claude

This repository includes a **Claude skill** so Claude knows how to pick the right chart, add the toolkit to your project and use it properly. In Claude Code:

```
claude plugin marketplace add DavidLortalPM/productscope-charts
claude plugin install productscope-charts@productscope
```

Then ask for what you need ("add a dashboard with spend over time and a breakdown by category"). To install the skill by hand, upload it to claude.ai, or just point any assistant at [`llms-full.txt`](llms-full.txt), see [Using it with AI](docs/using-with-ai.md).

## The charts

| Group | Charts |
| --- | --- |
| Over time | [Line](docs/charts/line.md), [stacked area](docs/charts/area.md), [sparkline](docs/charts/sparkline.md), [calendar](docs/charts/calendar.md), [heatmap](docs/charts/heatmap.md), [small multiples](docs/charts/small-multiples.md) |
| Comparing | [Grouped bars](docs/charts/bars.md), [ranked bars](docs/charts/hbars.md), [waterfall](docs/charts/waterfall.md), [diverging bars](docs/charts/diverging-bars.md), [slope](docs/charts/slope.md), [bump](docs/charts/bump.md) |
| Spread and relationships | [Histogram](docs/charts/histogram.md), [box plot](docs/charts/box-plot.md), [scatter and bubble](docs/charts/scatter.md) |
| Parts of a whole | [Stacked](docs/charts/stacked.md), [donut](docs/charts/donut.md), [treemap](docs/charts/treemap.md), [flow](docs/charts/flow.md), [funnel](docs/charts/funnel.md) |
| At a glance | [Gauge](docs/charts/gauge.md), [KPI tiles](docs/charts/kpi-tiles.md), [word cloud](docs/charts/word-cloud.md), [data table](docs/charts/data-table.md) |

There is also a [mock-up dashboard](https://charts.productscope.uk/dashboard) that puts ten of them together in one made-up product view.

## Why it exists

Most charting libraries want to inject scripts, styles and fonts, which fights a strict Content-Security-Policy, and accessibility tends to arrive as an afterthought. This toolkit is one stylesheet and one script. It draws plain SVG, and keyboard access, screen-reader labels and a colour-blind-checked palette are part of every chart rather than an add-on. It started life inside one of our own apps. We cleaned it up and gave it away as a free resource.

## What to expect

- **Scripts under a strict policy.** No `eval`, no inline event handlers, no external scripts, fonts or requests. The charts do set `style` attributes, so the policy needs `style-src 'unsafe-inline'` or, tighter, `style-src 'self'; style-src-attr 'unsafe-inline'` (the [starter](examples/starter) uses the second). Details in [Concepts](docs/concepts.md#content-security-policy).
- **Accessible by default.** Keyboard navigation, screen-reader labels, optional patterns instead of colour, and a table view you can offer next to any chart. Eight categorical colours, checked for colour-blind separation; three of the eight are below 3:1 contrast on the light theme, which legends, tooltips and the table view cover. If you find an accessibility problem, please [open an issue](https://github.com/DavidLortalPM/productscope-charts/issues/new/choose).
- **Honest about edge cases.** Empty, one-point, all-zero and outlier data are handled and shown, not hidden.
- **Light and dark themes**, and charts resize to their container, so they work on a phone.
- **Browsers.** Written for current evergreen browsers and tested in Chromium. Reports from other browsers are welcome.
- **Currency** is pounds by default. Change three lines for another currency (see [Getting started](docs/getting-started.md#things-to-know-before-you-use-it)).

## Run this repository

```
npm install
npm run dev        # http://127.0.0.1:8787, no Cloudflare login needed
npm run check      # consistency checks, generated docs are current, and a smoke test of every page
```

The site is a single Cloudflare Worker with no bindings and no secrets; the pages are generated on each request, so there is no build output. To deploy your own copy, run `npx wrangler deploy` against your own Cloudflare account. How the code is organised, and how to add a chart, is in [Architecture](docs/architecture.md). Contributions are welcome: see [CONTRIBUTING.md](CONTRIBUTING.md).

## Made by Product Scope

[Product Scope](https://productscope.uk) is a product-led consultancy run by David Lortal. We help organisations improve how their systems, teams and processes work together, through product modernisation, automation, integration and AI-assisted delivery.

If you would like charts like these (or the dashboards and reporting around them) in your own product, or want to talk about something bigger, **[get in touch](https://productscope.uk/contact/)**. You can also read how we work in the [articles](https://productscope.uk/blog/).

## Licence

MIT. See [`LICENSE`](LICENSE). © 2026 David Lortal / Product Scope Ltd. Fonts are under the SIL Open Font License (see `src/fonts/README.md`). See the [changelog](CHANGELOG.md) for what has changed.
