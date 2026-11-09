---
name: productscope-charts
description: Build charts, dashboards and reports as plain SVG with the Product Scope Charts toolkit (no charting library, no dependencies, works under a strict Content-Security-Policy, accessible by default). Use it whenever the user wants a chart, graph, dashboard, KPI tiles, sparkline, heatmap, histogram, box plot, word cloud, funnel and similar in a web page or internal tool, and especially when they cannot or do not want to add a charting library, need a strict CSP, or need keyboard and screen-reader support.
---

# Product Scope Charts

A toolkit of 24 SVG chart types: copy four small files into a project, load them, and call a function with arrays of numbers. Every chart function returns a DOM node. There is no build step and no library. MIT licensed. Live demos of every chart: https://charts.productscope.uk

This skill folder is self-contained:

- `assets/`: the four files to copy into the user's project (`tokens.css`, `helpers.js`, `toolkit.css`, `toolkit.js`).
- `references/chart-index.md`: every chart, grouped, with the function name and when to use it.
- `references/charts/<chart>.md`: options, a complete example and keyboard notes for one chart. **Read the one you are using before writing code.**
- `references/toolkit-api.md`: shared functions (`setChartWidth`, `setCategoryOrder`, `dataTable`, `legend`, `h` and others), plus conventions: sizing, theming, colours, accessibility, edge cases and the Content-Security-Policy.

## Workflow

1. **See whether the toolkit is already in the project.** Search for `toolkit.js` or a call such as `lineChart(`. If it is there, use it and skip to step 3. If the project has a *different* charting library already, say so and ask before adding this alongside it.
2. **Add the toolkit.** Copy the four files from `assets/` into the project's static files folder, and load them in this order (they are classic scripts that define globals, not modules):
   ```html
   <link rel="stylesheet" href="/toolkit/tokens.css">
   <link rel="stylesheet" href="/toolkit/toolkit.css">
   ...
   <script src="/toolkit/helpers.js"></script>
   <script src="/toolkit/toolkit.js"></script>
   ```
   If the project already has a theme, do not add a second set of colours: define the token names the charts read (see `tokens.css`) from the project's own variables, or edit the values in `tokens.css`. Keep the names.
3. **Pick the chart.** Open `references/chart-index.md`, choose by what the reader needs to see (table below), then read that chart's page in `references/charts/`.
4. **Draw it.** Measure the container, set the width (per chart, see the rules below), build the chart and append it, and redraw when the container resizes (ignore width changes under about 6px so a redraw cannot trigger another):
   ```js
   function draw() {
     setChartWidth(host.clientWidth);
     host.replaceChildren(lineChart({ xs, series, label: 'Monthly spend' }));
   }
   draw();
   new ResizeObserver(draw).observe(host);
   ```
5. **Finish each chart properly** (see the checklist below), then verify it.

## Choosing a chart

| The reader needs to see... | Use |
| --- | --- |
| how one measure moves over time | `lineChart` (or `areaChart` for parts over time) |
| daily rhythm, spikes | `calendar` |
| a pattern across two dimensions | `heatmap` |
| a trend beside a number, in a table or tile | `spark` |
| two measures per period | `barChart` (`mode: 'grouped'`) |
| what a total is made of, per period | `barChart` stacked, or `areaChart` |
| share of one total | `donut`, or `treemap` if there are many parts |
| a ranked top-N | `hbars` |
| what went up and what went down | `divergingBars` |
| before and after, per item | `slope` |
| rank changing over time | `bump` |
| how values are distributed | `histogram`; compare groups with `boxPlot` |
| whether two measures move together | `scatter` |
| how a start number became an end number | `waterfall` |
| where money or volume goes | `flow` |
| drop-off through steps | `funnel` |
| progress against a limit | `gauge` |
| the few headline numbers | KPI tiles (markup + `spark`) |
| the words people use | `wordCloud` |
| the exact numbers | `dataTable` |

If none fits, say so rather than bending a chart into something misleading.

## Checklist for every chart you add

- **`label`**: always set it. It is what a screen reader announces ("Monthly spend, April to September").
- **Empty and one-point data.** Charts handle both, so do not guard against them by hiding the chart. Do pass an `empty` message where the chart has that option.
- **Table view.** Offer a "Show as table" switch and build the table with `dataTable(head, rows, caption)` from the same data.
- **Legend** whenever a chart uses more than one colour: `legend([{ name, colour }])`.
- **Categories.** Call `setCategoryOrder(names)` once so each category has the same colour in every chart. Eight colours maximum, the rest fold into grey "Other".
- **Patterns switch** where the chart supports it: `setPatterns(true)` before drawing.
- **Outliers.** Use the chart's `cap` option rather than letting one huge value flatten the rest; the clipped value is still labelled with a ▲.
- **Never rely on colour alone** to carry meaning. Three of the eight colours are below 3:1 contrast on light backgrounds, which legends, tooltips and the table view cover.
- **Callbacks** in the examples (`openMonth`, `openCategory`, `onClick`) are the user's own functions. Wire them to the app's real navigation, or leave them out.

## Rules that are easy to break

- **No other charting library, no CDN, no inline event handlers, no `eval`.** The point of the toolkit is that it runs under a strict policy. Scripts need `script-src 'self'` or a nonce; the charts set `style` attributes, so the policy needs `style-src 'unsafe-inline'` or, tighter, `style-src 'self'; style-src-attr 'unsafe-inline'`.
- **If you embed the script as a template literal** (in a Worker, a server template or a bundler string) it must contain no backticks and no dollar-brace sequences. Use string concatenation inside the toolkit, never template strings.
- **Do not edit `toolkit.js` or `toolkit.css` in the user's project** to change one chart. Pass options, or wrap the chart. If a change is truly needed, say so, because the copy will then drift from upstream.
- **Pounds by default.** Pass `yfmt` and `tipfmt` (or `fmt`) to line, bar, area, donut and ranked-bar charts when the numbers are not money. Calendar, treemap, gauge, waterfall and flow have no option and always format pounds: for those, either change `money0` and `compact` for the whole project or choose another chart. Say so to the user instead of silently showing a £ on a count.
- **The toolkit styles charts, not the page.** Add base page styles yourself (body background, colour, font, box-sizing, a max width). Details, a "Show as table" recipe and a dashboard layout are in `references/toolkit-api.md`.
- **Call `setChartWidth(host.clientWidth)` right before drawing each chart**, with that chart's own container. It is global state, so one call at the top of a dashboard gives every card the wrong width.
- **`xlabel` differs by chart.** Line and area call `xlabel(value, index, isTooltip)`; bars and stacked call `xlabel(category, isTooltip)`. Read the chart's page.
- **Do not redeclare the toolkit's globals** (`h`, `sv`, `sum`, `legend`, `compact`, `MON`...) with `const` or `let` in a classic script: wrap your code in a function or use `<script type="module">`.
- **Colours.** Do not change `--c1` to `--c9` casually: they are checked for colour-blind separation. Do not invent chart colours outside them.
- **A dashboard** is a grid of cards. The toolkit CSS has `.wgrid` (12 columns) with `.w-full`, `.w-half`, `.w-third`, `.w-twothird`, and `.widget` for a card. Put KPI tiles (`.kgrid`) on top, then the charts, and keep a table view for each. For tiles, choose the three to eight numbers that matter most to the question the user asked and say which you chose. Colour a tile's change with `.good` or `.bad` by meaning, and `.flat` for a measure that is neither (like volume).

## Verify before saying it works

- Open the page and check the browser console is clean (a policy violation shows up there).
- Tab to each chart and use the arrow keys, Home, End and Escape.
- Try empty data, one data point and an outlier.
- Check the dark theme (`prefers-color-scheme: dark`) and a narrow width (about 375px).

## Keeping the toolkit current

The files in `assets/` are a copy. The source and changelog are at https://github.com/DavidLortalPM/productscope-charts. To update a project, re-copy the four files from `toolkit/` in that repository and check `CHANGELOG.md` for anything that changed.
