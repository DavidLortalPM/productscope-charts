# Using it with an AI assistant

The chart functions are small and regular: arrays of numbers in, a DOM node out. That makes them easy for an AI assistant to use correctly, as long as it has the right documentation. There are three ways to give it that.

## 1. Install the Claude skill (best)

The skill in [`skills/productscope-charts`](../skills/productscope-charts) teaches Claude to choose the right chart for what you want to show, copy the toolkit into your project, and finish each chart properly (a screen-reader label, an empty state, a table view, a legend, stable colours). It loads the page for a chart only when it needs it, so it stays light.

**Claude Code, as a plugin** (updates with the repository):

```
claude plugin marketplace add DavidLortalPM/productscope-charts
claude plugin install productscope-charts@productscope
```

**Claude Code, by hand.** Copy the folder `skills/productscope-charts` into `~/.claude/skills/` to use it in every project, or into `.claude/skills/` inside one project.

**claude.ai.** Download `productscope-charts-skill.zip` from the [latest release](https://github.com/DavidLortalPM/productscope-charts/releases/latest) and upload it under Skills in your Claude settings. You can also zip the `skills/productscope-charts` folder yourself.

Then ask in plain words:

> Add a dashboard to this page: KPI tiles for spend, income and savings, spend over time with last year as a comparison, and a breakdown by category. Use the charts toolkit.

> Show how long our support conversations take. Which chart should I use, and can you build it from this CSV?

## 2. Point any assistant at the plain-text docs

If you cannot install a skill, give the assistant one of these:

- [`llms.txt`](../llms.txt): a short index with links, in the [llms.txt](https://llmstxt.org) format.
- [`llms-full.txt`](../llms-full.txt): everything in one file (getting started, concepts, shared functions, and every chart's options and example). Around 60 KB.

The raw URL works for assistants that can read the web:

```
https://raw.githubusercontent.com/DavidLortalPM/productscope-charts/main/llms-full.txt
```

The assistant still needs the four files in [`toolkit/`](../toolkit) in your project. Ask it to copy them in.

## 3. Paste the toolkit and describe your data

The [Get the code](https://charts.productscope.uk/toolkit) page has everything in one place. Paste it into the conversation, describe your data, and ask for the page.

## Tips for good results

- **Say what the reader needs to see**, not which chart to draw. "Which products drive most of the cost, and is that changing?" gets a better answer than "make a bar chart".
- **Give it real column names and a few rows of data**, or the shape of the data. Charts take plain arrays.
- **Ask for the empty and one-point states** to be checked. Every chart supports them.
- **Keep the generated docs generated.** The skill and the plain-text files are built from the source by `npm run docs`, so they are always in step with the code. Do not edit them by hand.
