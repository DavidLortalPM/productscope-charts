# Security policy

## Reporting a vulnerability

Please do not open a public issue for a security problem.

- **Preferred:** use GitHub's private reporting. On the repository, open the **Security** tab and choose **Report a vulnerability**.
- **Or** use the contact form at [productscope.uk/contact](https://productscope.uk/contact/) and say it is about Product Scope Charts. The same contact is published at [charts.productscope.uk/.well-known/security.txt](https://charts.productscope.uk/.well-known/security.txt).

Please include what you found, how to reproduce it, and which browser and version you used. We will acknowledge your report within a few working days and tell you what we plan to do.

## What is in scope

- The toolkit (`toolkit/`, which is built from `src/charts.ts`, `src/charts-more.ts` and `src/helpers.ts`): for example a way for data passed to a chart to run script or inject markup.
- The Worker that serves charts.productscope.uk (`src/`), including its Content-Security-Policy and headers.

Chart functions build their DOM with `createElement`, `setAttribute` and text nodes rather than HTML strings, and the showcase holds no secrets and no user data: every number on it is made up. A report that shows otherwise is exactly what we want to hear about.

## Supported versions

Fixes are made to the latest release only. The toolkit is copied into projects rather than installed, so after a security fix, copy the current files from `toolkit/` into your project.
