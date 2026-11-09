# Documentation

| Read this | When |
| --- | --- |
| [Getting started](getting-started.md) | You want a first chart on a page. |
| [All charts](charts/README.md) | You are choosing a chart or need one chart's options and example. |
| [Concepts and conventions](concepts.md) | You need to know about sizing, theming, colours, accessibility, edge cases or the Content-Security-Policy. |
| [Shared functions and helpers](api.md) | You need `setChartWidth`, `setCategoryOrder`, `dataTable`, `legend`, `h` and friends. |
| [Using it with AI](using-with-ai.md) | You want Claude, or another assistant, to build with the toolkit. |
| [Architecture](architecture.md) | You are changing this repository or adding a chart. |

Live demos of every chart, with the empty and one-point states, are at [charts.productscope.uk](https://charts.productscope.uk). The files to copy into your project are in [`toolkit/`](../toolkit), and a working page is in [`examples/starter/`](../examples/starter).

## Which files are written by hand and which are generated

Hand-written, edit freely: `getting-started.md`, `concepts.md`, `api.md`, `using-with-ai.md`, `architecture.md` and this page.

**Generated, do not edit** (run `npm run docs` to refresh): everything in `docs/charts/`, `toolkit/`, `llms.txt`, `llms-full.txt`, and the copies of those inside `skills/productscope-charts/` (`assets/` and `references/`). They are built from the source in `src/`, so they cannot drift from the code, and CI fails if they are out of date.
