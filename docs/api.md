# Shared functions and helpers

The chart functions are documented on their own pages ([all charts](charts/README.md)). These are the smaller functions they share, which you will also use directly.

## Setup

- **`setChartWidth(px)`**: set the width charts are drawn at, in SVG units (about CSS pixels). Clamped to 320 to 1000. Call it before drawing a chart and again on resize. Default 1000.
- **`setCategoryOrder(names)`**: give your category names in priority order. The first eight get `--c1` to `--c8`; the rest are grey. Call it once.
- **`catColor(name)`**: the colour (a CSS `var(--cN)` string) for a category, or `var(--c9)` grey if it has no slot. Use it so a category keeps its colour across charts.
- **`setPatterns(on)`**: `true` makes charts that fill areas (line, area, bars, donut, treemap, histogram, box plot, funnel) overlay a texture on each colour, so they do not depend on colour alone. Applies to charts drawn after the call.

## Building things

- **`h(tag, attrs, ...children)`**: a tiny DOM builder (in `helpers.js`). `attrs.class` sets the class, `attrs.on` is an object of event listeners (`{ click: fn }`), any other attribute is set with `setAttribute`. `false` and `null` attributes and children are skipped. Children can be nodes, strings or arrays.
- **`sv(tag, attrs, ...children)`**: the same, for SVG elements.
- **`legend(items)`**: a legend row from `[{ name, colour }]`. Put it next to a chart that uses several colours.
- **`dataTable(head, rows, caption)`**: an accessible, horizontally scrolling `<table>`. `head` is an array of column titles, `rows` an array of arrays, `caption` an optional title. The first column is left-aligned, the rest are right-aligned numbers. Use it for the "Show as table" view.

## Small charts that are plain functions

These are documented on their chart pages, but are worth knowing as building blocks:

- **`spark(values, { w, h, fluid, label, bars })`**: a tiny axis-less trend. `fluid: true` makes it fill its container; `bars: true` draws columns. Always print the number beside it.
- **`hbars(items, { fmt, empty })`**: ranked horizontal bars from `[{ label, value, colour, sub, tag, onClick }]`.
- **`gauge({ label, value, target })`**: a bar against a target with the state (on track, nearly, over) spelled out in words.

## Formatting and maths

- **`money0(n)`, `gbp(n)`**: whole pounds, `£1,234`. Used as the default tooltip formatter. Change for another currency.
- **`compact(n)`**: `£2.3k`, `£1.2m`. Hard-codes the pound sign.
- **`monthName('2026-04')`**: `Apr 2026`. **`fmtDate('2026-04-09')`**: `9 Apr 2026`.
- **`sum(a)`, `median(a)`, `quantile(a, q)`**: with `q` from 0 to 1. `null` values count as zero in `sum`.
- **`niceStep(range, n)`, `yTicks(min, max, n)`**: tidy axis steps and tick values.

## Tooltips

Charts show their own tooltips. If you draw your own marks and want the same tooltip, use:

- **`showTip(x, y, title, rows)`**: `x` and `y` are viewport coordinates, `rows` is `[{ label, value, colour }]`.
- **`hideTip()`**: hide it. It also hides on scroll and on Escape.
