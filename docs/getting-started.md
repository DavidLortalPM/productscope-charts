# Getting started

Product Scope Charts is a set of SVG chart functions. There is nothing to install: you copy four small files into your project, load them in order, and call a function with your data. Each function returns a DOM node that you append where you want the chart.

## 1. Copy the toolkit

The four files in [`toolkit/`](../toolkit) are all you need. (They are also on the [Get the code](https://charts.productscope.uk/toolkit) page.)

| File | What it is |
| --- | --- |
| `tokens.css` | Design tokens as CSS variables (colours, font, corner radius), light and dark. Edit the values to match your theme and keep the names. |
| `helpers.js` | A few helper functions the script expects to find: `h` (DOM builder), `money0` and `gbp` (currency), `monthName`, `fmtDate` and `legend`. Define them before the toolkit. |
| `toolkit.css` | The chart styles. |
| `toolkit.js` | Every chart function. |

## 2. Load them in order

They are classic scripts that define globals, not ES modules, so order matters: `helpers.js` first, then `toolkit.js`, then your own code.

```html
<link rel="stylesheet" href="/toolkit/tokens.css">
<link rel="stylesheet" href="/toolkit/toolkit.css">

<div id="spend"></div>

<script src="/toolkit/helpers.js"></script>
<script src="/toolkit/toolkit.js"></script>
<script src="/app.js"></script>
```

## 3. Draw a chart

```js
const host = document.getElementById('spend');
setChartWidth(host.clientWidth);          // size charts to their container (see "Sizing")
host.replaceChildren(
  lineChart({
    xs: ['2026-04', '2026-05', '2026-06', '2026-07'],
    xlabel: monthName,
    series: [{ name: 'Spend', values: [1820, 2310, 1960, 2540], colour: 'var(--c1)', area: true }],
    label: 'Monthly spend, April to July 2026'   // read out by screen readers
  })
);
```

Open [the page for any chart](charts/README.md) for its options and a complete example.

## 4. Redraw when the container resizes

Charts are drawn at the width you give `setChartWidth`, so redraw when the container changes size:

```js
function draw() {
  setChartWidth(host.clientWidth);
  host.replaceChildren(lineChart({ /* ... */ }));
}
draw();
new ResizeObserver(draw).observe(host);
```

## A working example

[`examples/starter/`](../examples/starter) is a complete page that draws a line chart, grouped bars and a donut, with a table view and a patterns switch, under a strict Content-Security-Policy. Serve the repository root with any static server and open `/examples/starter/`:

```
python -m http.server 8200
```

A dashboard recipe (cards, a grid, KPI tiles, a "Show as table" switch on every chart) is in [concepts](concepts.md#a-dashboard-layout).

## Things to know before you use it

- **The toolkit styles charts, not your page.** Set your own `body` background, colour, font and a maximum page width (a few lines of CSS: see [concepts](concepts.md#page-styles-are-yours)). The dark theme needs it.
- **Pounds by default.** Pass `yfmt` and `tipfmt` (or `fmt`) for counts or another currency. Five charts (calendar, treemap, gauge, waterfall, flow) have no such option and always format money: see [number formats](concepts.md#currency-and-number-formats).
- **Several charts on a page.** Call `setChartWidth` with each container's own width right before drawing that chart: see [concepts](concepts.md#several-charts-on-one-page).
- **Callbacks in the examples** such as `openMonth` or `openCategory` are your own functions. The toolkit only calls them.
- **Content-Security-Policy.** No `eval`, no external requests, no inline event handlers. See [concepts](concepts.md#content-security-policy) for the exact policy it needs.
- **Made-up data.** Every number on the demo site is generated in the browser from a seeded random generator. Nothing private is in this repository.

## Using it with an AI assistant

Install the Claude skill, or point an assistant at [`llms-full.txt`](../llms-full.txt). See [using it with AI](using-with-ai.md).
