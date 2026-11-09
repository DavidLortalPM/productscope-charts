// Small consistency checks that keep hand-written copy honest as charts are added or removed.
import fs from "node:fs";
import { loadSource, ROOT } from "./load-source.mjs";

const { PAGES } = await loadSource();
const read = f => fs.readFileSync(ROOT + "/" + f, "utf8");
const failures = [];

const UNDER_20 = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const word = n => n < 20 ? UNDER_20[n] : TENS[Math.floor(n / 10)] + (n % 10 ? "-" + UNDER_20[n % 10] : "");
const count = PAGES.length, countWord = word(count);
const cap = s => s[0].toUpperCase() + s.slice(1);

// Counts written by hand in copy: they must match the number of chart pages.
const pkg = JSON.parse(read("package.json"));
if (!pkg.description.toLowerCase().includes(countWord)) failures.push(`package.json description should say "${countWord}" chart types (there are ${count}).`);
if (!read("README.md").includes(`**${cap(countWord)} SVG chart types`)) failures.push(`README.md should open with "${cap(countWord)} SVG chart types" (there are ${count}).`);
// Any other "<number-word> chart types" or "All <number-word> charts" in the docs that does not match.
const everyWord = UNDER_20.concat(Array.from({ length: 80 }, (_, i) => word(i + 20)));
for (const f of ["README.md", "CONTRIBUTING.md", "docs/README.md", "docs/getting-started.md", "docs/concepts.md", "docs/using-with-ai.md", "docs/architecture.md", "skills/productscope-charts/SKILL.md"]) {
  if (!fs.existsSync(ROOT + "/" + f)) continue;
  for (const m of read(f).matchAll(/\b([A-Za-z]+(?:-[a-z]+)?)\s+(?:SVG\s+)?chart types\b/g)) {
    const w = m[1].toLowerCase();
    if (everyWord.includes(w) && w !== countWord) failures.push(`${f} says "${m[0]}" but there are ${count} charts.`);
  }
  for (const m of read(f).matchAll(/\b(\d+)\s+(?:SVG\s+)?chart types\b/g)) if (+m[1] !== count) failures.push(`${f} says "${m[0]}" but there are ${count} charts.`);
}

// The changelog must have an entry for the current version.
const changelog = read("CHANGELOG.md");
if (!changelog.includes(`## [${pkg.version}]`) && !/^## \[Unreleased\]/m.test(changelog)) failures.push(`CHANGELOG.md has no entry for ${pkg.version} and no Unreleased section.`);

// The plugin manifest and package.json agree on the version.
const plugin = JSON.parse(read(".claude-plugin/plugin.json"));
if (plugin.version !== pkg.version) failures.push(`.claude-plugin/plugin.json is version ${plugin.version} but package.json is ${pkg.version}.`);

// The skill must have the frontmatter Claude needs.
const skill = read("skills/productscope-charts/SKILL.md");
if (!/^---\nname: productscope-charts\ndescription: .{40,}\n---/.test(skill)) failures.push("skills/productscope-charts/SKILL.md needs name and description frontmatter.");

// Every relative link and heading anchor in the Markdown files must point at something that exists.
const mdFiles = [];
const walk = dir => {
  for (const e of fs.readdirSync(ROOT + "/" + dir, { withFileTypes: true })) {
    if ([".git", "node_modules", ".wrangler"].includes(e.name)) continue;
    const rel = dir ? dir + "/" + e.name : e.name;
    if (e.isDirectory()) walk(rel);
    else if (e.name.endsWith(".md")) mdFiles.push(rel);
  }
};
walk("");
const slugify = h => h.toLowerCase().replace(/`/g, "").replace(/[^\w\- ]/g, "").trim().replace(/ /g, "-");
const anchorsOf = file => new Set([...read(file).replace(/```[\s\S]*?```/g, "").matchAll(/^#{1,6}\s+(.+?)\s*$/gm)].map(m => slugify(m[1])));
const linkSkip = /^(https?:|mailto:|data:)/;
for (const f of mdFiles) {
  const text = read(f).replace(/```[\s\S]*?```/g, "");
  const dir = f.includes("/") ? f.slice(0, f.lastIndexOf("/")) : "";
  for (const m of text.matchAll(/\]\(([^)\s]+)\)/g)) {
    const [target, anchor] = m[1].split("#");
    if (linkSkip.test(m[1])) continue;
    const resolved = target ? new URL(target, "file:///" + (dir ? dir + "/" : "")).pathname.slice(1) : f;
    const full = ROOT + "/" + decodeURIComponent(resolved);
    if (!fs.existsSync(full)) { failures.push(`${f} links to ${m[1]}, which does not exist.`); continue; }
    if (anchor && resolved.endsWith(".md") && !anchorsOf(decodeURIComponent(resolved)).has(anchor)) failures.push(`${f} links to ${m[1]}, but that page has no heading for #${anchor}.`);
  }
}

if (failures.length) {
  console.error("Consistency check failed:\n" + failures.map(f => "  - " + f).join("\n"));
  process.exit(1);
}
console.log(`Consistency checks passed (${count} charts, version ${pkg.version}).`);
