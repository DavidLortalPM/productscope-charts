# Contributing

Thank you for helping. Bug fixes, accessibility fixes, documentation improvements and new chart ideas are all welcome.

## Before you start

- **A bug or an accessibility problem?** [Open an issue](https://github.com/DavidLortalPM/productscope-charts/issues/new/choose) with the chart, what you did, what you expected and what happened. A screen reader or keyboard problem is treated as a bug, not a nice-to-have.
- **A fix** can go straight to a pull request.
- **A new chart type?** Please open an issue first so we can talk it through. The toolkit stays small on purpose, so a chart has to earn its place: a clear question it answers that the existing charts do not.
- **Security problems:** see [SECURITY.md](SECURITY.md). Please do not open a public issue.

## Set up

You need Node 20 or later.

```
npm install
npm run dev        # http://127.0.0.1:8787, no Cloudflare login needed
```

## Making a change

1. Branch from `main`.
2. Make the change in `src/`. [Architecture](docs/architecture.md) explains where things are and has the steps for adding a chart.
3. **Run `npm run docs`** if you changed a chart, an option or an example. The reference pages, the files in `toolkit/`, `llms*.txt` and the Claude skill's references are generated from the source. Commit the result with your change. Do not edit generated files by hand.
4. **Run `npm run check`.** It checks the hand-written counts, that the generated files are current, and calls every page of the Worker. CI runs the same.
5. Look at it in the browser at `npm run dev`: keyboard (Tab, arrow keys, Home, End, Escape), the empty and one-point states, the dark theme and a narrow width of about 375px. Check the console is clean.
6. Add a line to `CHANGELOG.md` under **Unreleased**.
7. Open a pull request using the template.

## Ground rules for the toolkit

- **No dependencies and no network requests** in the toolkit. No `eval` and no inline event handlers. The strict Content-Security-Policy is the reason this exists.
- **Accessible by default.** Keyboard reachable, a screen-reader label, no meaning carried by colour alone, and the same data available as a table.
- **Every chart copes with empty, one-point and all-zero data.**
- **Colour comes from the tokens** (`--c1` to `--c9` and the rest), so both themes work. Do not change the categorical palette without re-checking colour-blind separation.
- **The script is a template literal.** Inside `CHARTS_JS`, `CHARTS_CSS` and `HELPERS` use no backticks and no dollar-brace sequences. `npm run docs` fails if one slips in.
- **Made-up data only.** Never add real or private data, in an example or a screenshot.

## Style

Plain, short and kind. British English in copy and documentation. Comments explain why, not what.

## Licence

By contributing you agree that your contribution is licensed under the [MIT licence](LICENSE), like the rest of the project.
