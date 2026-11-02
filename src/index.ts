// Public chart showcase. No bindings, no secrets, no real data: every number is generated in the browser.
import { CHARTS_CSS, CHARTS_JS } from "./charts";
import { PAGES, byPath, type Page } from "./pages";
import { esc, layout } from "./shell";
import dm400 from "./fonts/dm-sans-400.woff2";
import dm500 from "./fonts/dm-sans-500.woff2";
import dm600 from "./fonts/dm-sans-600.woff2";
import dm700 from "./fonts/dm-sans-700.woff2";
import pop400 from "./fonts/poppins-400.woff2";
import pop500 from "./fonts/poppins-500.woff2";
import pop600 from "./fonts/poppins-600.woff2";
import pop700 from "./fonts/poppins-700.woff2";
import ogImage from "./og.png";

const SITE_URL = "https://charts.productscope.uk";
const PS_URL = "https://productscope.uk";
const LASTMOD = "2026-11-02"; // bump when page content changes; used in sitemap.xml

// Self-hosted Product Scope fonts (DM Sans body, Poppins headings), served first-party.
const FONTS: Record<string, ArrayBuffer> = {
  "dm-sans-400": dm400, "dm-sans-500": dm500, "dm-sans-600": dm600, "dm-sans-700": dm700,
  "poppins-400": pop400, "poppins-500": pop500, "poppins-600": pop600, "poppins-700": pop700,
};

const NAV = PAGES.map(p => ({ path: p.path, name: p.name }));
const RUN = "every number is made up";

function headers(nonce: string, type: string): Headers {
  return new Headers({
    "content-type": type,
    "content-security-policy": `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline'; img-src data:; font-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; connect-src 'none'`,
    "x-content-type-options": "nosniff",
    "referrer-policy": "no-referrer",
    "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    "strict-transport-security": "max-age=15552000",
    "cache-control": "no-cache",
  });
}

// Small static responses (robots, sitemap, security.txt, share image).
const staticResponse = (body: BodyInit | null, type: string, maxAge = 3600) =>
  new Response(body, { headers: { "content-type": type, "cache-control": `public, max-age=${maxAge}`, "x-content-type-options": "nosniff" } });

const SECURITY_TXT = `# Security contact for charts.productscope.uk (a Product Scope Ltd resource)
Contact: ${PS_URL}/contact/
Expires: 2027-10-08T00:00:00Z
Preferred-Languages: en
Canonical: ${SITE_URL}/.well-known/security.txt
`;

function sitemapXml(): string {
  const paths = ["/", "/dashboard", ...PAGES.map(p => p.path), "/toolkit"];
  const urls = paths.map(p => `  <url><loc>${SITE_URL}${p === "/" ? "/" : p}</loc><lastmod>${LASTMOD}</lastmod></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

// Structured data. Breadcrumbs earn a real result in search; the rest tells search engines who publishes the site.
const ORG = { "@type": "Organization", "@id": `${PS_URL}/#organization`, name: "Product Scope", legalName: "Product Scope Ltd", url: `${PS_URL}/` };
const WEBSITE = { "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: "Product Scope Charts", url: `${SITE_URL}/`, inLanguage: "en-GB", publisher: { "@id": ORG["@id"] } };
function pageLd(path: string, title: string, description: string, crumbs: [string, string][], extra: object[] = []): object {
  const url = `${SITE_URL}${path === "/" ? "/" : path}`;
  const list = crumbs.map(([name, p], i) => ({ "@type": "ListItem", position: i + 1, name, item: `${SITE_URL}${p}` }));
  return { "@context": "https://schema.org", "@graph": [ORG, WEBSITE, { "@type": "WebPage", "@id": url, url, name: title, description, isPartOf: { "@id": WEBSITE["@id"] }, inLanguage: "en-GB", ...(crumbs.length > 1 ? { breadcrumb: { "@type": "BreadcrumbList", itemListElement: list } } : {}) }, ...extra] };
}

// ---- Product Scope components used by the pages (markup copied from productscope.uk; styles live in shell.ts) ----
const ICON = (d: string) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICONS = {
  shield: ICON(`<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><polyline points="9 12 11 14 15 10"/>`),
  keyboard: ICON(`<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>`),
  eye: ICON(`<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>`),
  trend: ICON(`<path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/>`),
  moon: ICON(`<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>`),
  phone: ICON(`<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>`),
  scale: ICON(`<path d="M12 3v18M7 21h10M5 7h14"/><path d="M5 7l-3 7a3.5 3.5 0 0 0 6 0zM19 7l-3 7a3.5 3.5 0 0 0 6 0z"/>`),
  file: ICON(`<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M10 13l-2 2 2 2M14 13l2 2-2 2"/>`),
  pound: ICON(`<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5a3 3 0 0 0-6 .5v3M8.5 12h5M8.5 16h7M9.5 12v4"/>`),
  db: ICON(`<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>`),
};
const LOCK = `<svg class="pf-browser__lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`;

// Native <details> accordion (.faq): works from the keyboard with no script. Answers are trusted markup.
const faq = (items: [string, string][]) =>
  `<div class="faq">${items.map(([q, a], i) => `<details class="faq__item"${i === 0 ? " open" : ""}><summary>${esc(q)}</summary><p>${a}</p></details>`).join("")}</div>`;

// Section header with the burgundy rule, optional button beside it (.cs-head).
const csHead = (title: string, lead: string, btn?: [string, string], id?: string) =>
  `<div class="cs-head"><div class="cs-head__main"><h2${id ? ` id="${id}"` : ""}>${title}</h2><p>${lead}</p></div>${btn ? `<a class="btn btn--outline cs-head__btn" href="${btn[0]}">${esc(btn[1])}</a>` : ""}</div>`;

// Chart groups: used for the chips, the grouped gallery and the "more like this" cards.
const GROUPS = [
  { id: "time", name: "Over time", blurb: "See how a measure moves, repeats or clusters across days, weeks and months.", paths: ["/line", "/sparkline", "/calendar", "/heatmap", "/small-multiples"] },
  { id: "compare", name: "Comparing", blurb: "Set one thing against another, in order or step by step.", paths: ["/bars", "/hbars", "/waterfall"] },
  { id: "parts", name: "Parts of a whole", blurb: "Show what a total is made of and where it goes.", paths: ["/stacked", "/donut", "/treemap", "/flow"] },
  { id: "glance", name: "At a glance", blurb: "Single figures, targets and the exact numbers behind them.", paths: ["/gauge", "/kpi-tiles", "/data-table"] },
];
const groupOf = (path: string) => GROUPS.find(g => g.paths.includes(path))!;
const chips = (activeId?: string) =>
  `<nav class="cat-chips" aria-label="Chart groups">${GROUPS.map(g => `<a class="cat-chip${g.id === activeId ? " cat-chip--active" : ""}" href="/#${g.id}"${g.id === activeId ? ' aria-current="true"' : ""}>${esc(g.name)} <span>${g.paths.length}</span></a>`).join("")}</nav>`;

// A chart card: the site's .post-card, with a live preview drawn in the media slot (decorative, so hidden from screen readers).
const chartCard = (p: Page, i: number, lvl = 4) =>
  `<a class="post-card" href="${p.path}"><div class="post-card__media thumb" data-t="${p.path.slice(1)}" aria-hidden="true"></div><div class="post-card__body"><span class="post-card__date">Chart ${String(i + 1).padStart(2, "0")}</span><h${lvl}>${esc(p.name)}</h${lvl}><p>${esc(p.tag)}</p><span class="post-card__more">View chart &rarr;</span></div></a>`;

const codeBlock = (id: string, code: string, label: string) =>
  `<div class="code"><div class="code-bar"><span class="split__label">${esc(label)}</span><button class="copy" type="button" data-copy="${id}">Copy</button></div><pre><code id="${id}">${esc(code)}</code></pre></div>`;

// Tiny live previews for the index cards, built with the same chart functions (text hidden by CSS: they are decorative).
// Also draws the browser-frame mock-up on the home page. Wrapped in a function so its names never clash with a page script.
const THUMBS = String.raw`
(function(){
const th={
 line:()=>lineChart({xs:MONTHS,series:[{name:'a',values:TOTAL,colour:'var(--c1)',area:true}],cap:3600,height:110}),
 bars:()=>barChart({cats:MONTHS.slice(-8),totals:false,mode:'grouped',series:[{name:'a',colour:'var(--c3)',values:TOTAL.slice(-8).map(v=>v*1.3)},{name:'b',colour:'var(--c2)',values:TOTAL.slice(-8)}],height:110}),
 stacked:()=>barChart({cats:MONTHS.slice(-9),totals:false,series:CATS.map((c,k)=>({name:c,colour:catColourOf(c),values:SP[k].slice(-9)})),cap:4200,height:110}),
 donut:()=>donut({parts:CATS.map((c,k)=>({name:c,value:SP[k][17],colour:catColourOf(c)})),size:112}),
 heatmap:()=>heatmap({rows:CATS.slice(0,5),cols:MONTHS.slice(-10),matrix:CATS.slice(0,5).map(c=>SP[CATS.indexOf(c)].slice(-10)),norm:'row',labelW:6,cellH:16}),
 calendar:()=>{const m=new Map();const r=rng(3);for(let t=Date.UTC(2026,3,1);t<=Date.UTC(2026,8,30);t+=864e5)m.set(new Date(t).toISOString().slice(0,10),Math.round(r()*40));return calendar({days:m})},
 treemap:()=>treemap({items:CATS.map((c,k)=>({label:c,value:sum(SP[k].slice(-12)),colour:catColourOf(c)})),height:120}),
 sparkline:()=>h('div',{style:'display:flex;flex-direction:column;gap:8px;align-items:center'},[0,2,4].map(k=>spark(SP[k].slice(-12),{w:200,h:28,bars:k===2}))),
 gauge:()=>h('div',{style:'width:100%'},[['a',520,600],['b',340,250],['c',195,200]].map(x=>gauge({label:'',value:x[1],target:x[2]}))),
 waterfall:()=>waterfall({steps:[{label:'',value:4200,total:true},{label:'',value:3100},{label:'',value:-1210},{label:'',value:-880},{label:'',value:-420},{label:'',value:4790,total:true}],height:120}),
 flow:()=>flow({left:[{label:'',value:3100},{label:'',value:450}],right:CATS.slice(0,5).map((c,k)=>({label:'',value:SP[k][17],colour:catColourOf(c)})),height:120}),
 hbars:()=>hbars([['',612,'Groceries'],['',388,'Transport'],['',301,'Eating out'],['',244,'Housing']].map(x=>({label:'x',value:x[1],colour:catColourOf(x[2])})),{}),
 'small-multiples':()=>h('div',{style:'display:grid;grid-template-columns:repeat(3,1fr);gap:6px'},CATS.slice(0,6).map((c,k)=>h('div',{style:'border:1px solid var(--line);border-radius:8px;padding:4px'},spark(SP[k].slice(-12),{w:70,h:26,fluid:true})))),
 'kpi-tiles':()=>h('div',{class:'kgrid',style:'grid-template-columns:repeat(2,1fr)'},[0,1,2,3].map(k=>h('div',{class:'kt',style:'padding:8px 10px'},h('span',{class:'v',style:'font-size:1.1rem'},gbp(TOTAL[14+k])),spark(TOTAL.slice(8+k,14+k),{w:100,h:18})))),
 'data-table':()=>dataTable(['Month','A','B'],[['Jul','£431','£1,210'],['Aug','£402','£1,210'],['Sep','£455','£1,270']])
};
document.querySelectorAll('.thumb').forEach(el=>{const f=th[el.getAttribute('data-t')];if(!f)return;setChartWidth(300);setPatterns(false);try{el.append(f())}catch(e){}
  el.querySelectorAll('[tabindex]').forEach(n=>n.removeAttribute('tabindex'))});
})();
`;

function chartPage(p: Page, i: number, nonce: string): string {
  const prev = PAGES[(i + PAGES.length - 1) % PAGES.length], next = PAGES[(i + 1) % PAGES.length];
  const g = groupOf(p.path);
  const start = Math.max(0, g.paths.indexOf(p.path));
  const related = [...g.paths.slice(start + 1), ...g.paths.slice(0, start)].slice(0, 3).map(x => byPath.get(x)!);
  const body = `
<section class="section"><div class="container stack">
<a class="back-link" href="/">&larr; All charts</a>
${chips(g.id)}
<section class="widget" aria-labelledby="live-h"><header><div><h2 id="live-h">Live demo</h2><p class="sub">Made-up data. Try the options, then switch to the empty and one-point states.</p></div></header>
<div id="tools" class="wtools" style="gap:6px 16px"></div>
<div id="frame" class="frame"></div>
<p class="live" id="msg" role="status" aria-live="polite"></p>
<p class="hint">${esc(p.keys)}</p></section>
</div></section>
<section class="section section--alt"><div class="container">
${csHead("How to use it", `Paste the toolkit from <a href="/toolkit">Get the code</a> into your page first, then call the chart like this.`, undefined, "use-h")}
${codeBlock("snip", p.snippet, "JavaScript")}
</div></section>
<section class="section"><div class="container">
${csHead("Options", "What you can pass to this chart.", undefined, "opt-h")}
<div class="feat-list">${p.opts.map(([k, v]) => `<div class="feat-row"><div class="feat-row__body"><h3><code>${esc(k)}</code></h3><p>${esc(v)}</p></div></div>`).join("")}</div>
</div></section>
<section class="section section--alt"><div class="container">
${csHead("More charts like this", `Other charts in the &ldquo;${esc(g.name)}&rdquo; group.`, ["/", "All charts"])}
<div class="cards">${related.map(r => chartCard(r, PAGES.indexOf(r), 3)).join("")}</div>
<nav class="post-nav" aria-label="Previous and next chart"><a href="${prev.path}">&larr; ${esc(prev.name)}</a><span>Chart ${i + 1} of ${PAGES.length}</span><a href="${next.path}">${esc(next.name)} &rarr;</a></nav>
</div></section>`;
  const title = `${p.title}: SVG, no library | Product Scope Charts`;
  const description = `${p.tag} Live demo and copyable code. Built from scratch in SVG, no library.`;
  return layout({ nonce, title, description, path: p.path, nav: NAV, hero: { title: p.title, lead: p.when }, body, script: THUMBS + p.script, ld: pageLd(p.path, title, description, [["Charts", "/"], [p.name, p.path]]) });
}

const FEATURES: [string, string, string][] = [
  [ICONS.shield, "Works under a strict content security policy", "No external scripts, fonts or styles, and no eval."],
  [ICONS.keyboard, "Keyboard and screen readers", "Tab into any chart and move with the arrow keys. Every chart has a screen-reader label and a data table behind it."],
  [ICONS.eye, "Colour that can be told apart", "Eight categorical colours checked for colour-blind separation, plus optional patterns instead of colour. Legends, tooltips and the table view back up the colours that fall below 3:1 contrast."],
  [ICONS.trend, "Honest about awkward data", "Empty, one-point and outlier data are handled and shown, not hidden."],
  [ICONS.moon, "Light and dark themes", "Both themes are built in. Your choice is saved in your browser's local storage and nowhere else."],
  [ICONS.phone, "Works on a phone", "Charts resize to their container, so the same code works from a phone to a wide screen."],
];

const HOME_FAQ: [string, string][] = [
  ["What are these charts for?", `They are for the dashboards, reports and admin screens inside a product: how a number moves over time, how a total breaks down, what needs attention and what to do next. Each chart page says when to use that chart and when not to.`],
  ["Can I use them to build a dashboard with an AI assistant?", `Yes, and that is how this site was made. Give an assistant such as Claude the toolkit page, describe what the dashboard should show and where the data comes from, and ask it to build the page with these charts. Each chart takes plain arrays and a few options, so it can connect them to your own data and restyle them with the design tokens. Check what it produces, as you would with any code, and test it with a keyboard and a screen reader.`],
  ["Can I use it commercially?", `Yes. The code is open source under the MIT licence, so you can use, copy and change it in your own projects, including commercial ones. Keep the licence notice with the code. The fonts on this site are under the SIL Open Font License.`],
  ["How do I change the currency?", `Currency is hard-coded to pounds in two helpers, <code>compact()</code> and <code>money0</code>. Change those two for another currency.`],
  ["Is it accessible?", `Every chart can be reached with the keyboard, has a screen-reader label and can be shown as a data table. There is an option to use patterns instead of colour. If you find a problem, please <a href="https://github.com/DavidLortalPM/productscope-charts/issues">open an issue on GitHub</a>.`],
  ["Was this built with AI?", `Yes. Claude built all fifteen charts and the mock-up dashboard, working from my direction. It is the same AI-assisted approach I use on products and reporting for clients, such as the <a href="https://productscope.uk/building-a-jira-time-reporting-dashboard-with-claude/">Jira time reporting dashboard I built with Claude</a>.`],
];

const FACTS: [string, string, string][] = [
  [ICONS.scale, "Licence", "MIT. Free to use and change."],
  [ICONS.file, "Files", "One stylesheet and one script."],
  [ICONS.moon, "Themes", "Light and dark, saved in your browser."],
  [ICONS.pound, "Currency", "Pounds. Two helpers to change."],
  [ICONS.db, "Data", "Made up, generated in your browser."],
];

function indexPage(nonce: string): string {
  const groups = GROUPS.map(g => `<div class="group" id="${g.id}"><h3 class="h2-rule">${esc(g.name)}</h3><p>${esc(g.blurb)}</p><div class="cards">${g.paths.map(x => byPath.get(x)!).map(pg => chartCard(pg, PAGES.indexOf(pg))).join("")}</div></div>`).join("");
  const body = `
<section class="section"><div class="container"><div class="split split--text">
<div class="split__body">
<h2 class="sr-only">About the charts</h2>
<p>These started as the charts inside one of my own apps. I pulled them out, swapped in made-up data and published them so anyone building a dashboard, report or admin screen can reuse them without taking on a charting library.</p>
<p>Each chart is a JavaScript function that takes arrays of numbers and a few options and draws plain SVG. The toolkit is one stylesheet and one script, with no dependencies and no external requests, so it runs under a strict content security policy. Colours, font and corner radius come from CSS variables, so it follows your theme, light or dark.</p>
<p>Every chart page gives you when to use it, a live demo, the options and a snippet to paste. The charts handle empty data, a single data point and outliers, can be used from the keyboard and can be shown as a table.</p>
<p>The dashboard is a worked example: ten of the fifteen charts on one page, wired to made-up data. Claude built it, and the charts. The function signatures are small and regular, so the same approach works for your own dashboards: give an AI assistant the toolkit, describe your data and ask it to build the page.</p>
<p><a href="/toolkit">Get the code</a> or <a href="https://github.com/DavidLortalPM/productscope-charts">view it on GitHub</a>.</p>
<div class="split__actions"><a class="btn btn--primary" href="/dashboard">Open the dashboard</a></div>
</div>
<div class="split__media"><aside class="cs-side-card" aria-labelledby="short-h"><h3 class="sidebar__title" id="short-h">Details</h3><ul class="cs-facts-side">${FACTS.map(([ic, t, d]) => `<li><span class="cs-side-ico">${ic}</span><div><span class="fact-t">${esc(t)}</span><span class="fact-d">${esc(d)}</span></div></li>`).join("")}</ul></aside></div>
</div></div></section>
<section class="section section--alt" id="charts"><div class="container">
${csHead("All fifteen charts", "Each page has a live demo you can change, a copyable snippet and the options. Jump to a group or scroll through them all.")}
${chips()}
${groups}
</div></section>
<section class="section section--cool"><div class="container">
${csHead("Small on purpose, simple to use", "One stylesheet and one script. Nothing to install, nothing to keep updating and nothing loaded from anywhere else. Copy it in, draw a chart and make it yours.", ["/toolkit", "Get the code"])}
<div class="cs-stats cs-stats--4">
<div class="cs-stat"><strong>15</strong><b>chart types</b><p>Plus a mock-up dashboard that uses ten of them.</p></div>
<div class="cs-stat"><strong>0</strong><b>libraries</b><p>One stylesheet and one script, built from scratch.</p></div>
<div class="cs-stat"><strong>0</strong><b>third-party requests</b><p>No external scripts, fonts or styles. No cookies and no analytics.</p></div>
<div class="cs-stat"><strong>MIT</strong><b>licence</b><p>Free to use and change, including in commercial work.</p></div>
</div>
<div class="deliver2-grid">
<div class="deliver2"><span class="deliver2__num">01</span><h3>Copy the code</h3><p>The toolkit page has the design tokens, three small helpers, one block of CSS and one script. Paste them into your page.</p></div>
<div class="deliver2"><span class="deliver2__num">02</span><h3>Draw a chart</h3><p>Call a chart function such as <code>lineChart</code> with your data and add the result to the page. Every chart page has a snippet to start from.</p></div>
<div class="deliver2"><span class="deliver2__num">03</span><h3>Make it yours</h3><p>Point the design tokens at your own theme, or ask an AI assistant to build the dashboard for you. Change two helpers if you need a currency other than pounds.</p></div>
</div>
<h3 class="h2-rule">Questions people ask</h3>
${faq(HOME_FAQ)}
</div></section>`;
  const title = "SVG charts, no libraries, built with Claude | Product Scope Charts";
  const description = "SVG charts with no libraries, built with Claude: live demos, copyable code and options for fifteen chart types, all with made-up data.";
  return layout({ nonce, title, description, path: "/", nav: NAV, hero: { title: "Product Scope Charts", lead: "Fifteen SVG chart types for the dashboards, reports and admin screens inside a product: line, bars, stacked, donut, heatmap, calendar, treemap, sparkline, gauge, waterfall, flow, ranked bars, small multiples, KPI tiles and data tables." }, body, script: THUMBS, ld: pageLd("/", title, description, [["Charts", "/"]]) });
}

// A mock-up product dashboard composed from the real chart functions. Everything is made up (seeded, so it is the same on every visit).
const DASH = String.raw`
setCategoryOrder(['Starter','Team','Business','Enterprise']);
const r=rng(42);
const N=n=>Math.round(n).toLocaleString('en-GB');
const kfmt=n=>n>=1000?(n/1000).toFixed(n>=10000?0:1)+'k':String(Math.round(n));
const pctd=(a,b)=>Math.round((a/b-1)*100);
const M12=MONTHS.slice(-12);
const PLANS=['Starter','Team','Business','Enterprise'];
const base=[5200,11800,15400,7600],grow=[0.012,0.022,0.026,0.034];
const REV=PLANS.map((p,k)=>M12.map((m,i)=>Math.round(base[k]*Math.pow(1+grow[k],i)*(0.97+r()*0.06))));
const MRR=M12.map((_,i)=>sum(REV.map(p=>p[i])));
const TARGET=M12.map((_,i)=>Math.round(MRR[0]*Math.pow(1.024,i)));
const W26=[];{const d0=Date.UTC(2026,3,6);for(let i=0;i<26;i++){const t=new Date(d0+i*7*864e5);W26.push(t.getUTCDate()+' '+MON[t.getUTCMonth()])}}
const WAU=W26.map((_,i)=>Math.round((9400+i*135)*(0.96+r()*0.08)+(i===17?-900:0)+(i===21?700:0)));
const WAU_LY=WAU.map(v=>Math.round(v*(0.72+r()*0.08)));
const open=MRR[10],close=MRR[11];
const churn=Math.round(open*0.021),contr=Math.round(open*0.012),expn=Math.round(open*0.04);
const neu=Math.max(0,close-open-expn+contr+churn);
const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],BLK=['00-03','03-06','06-09','09-12','12-15','15-18','18-21','21-24'];
const prof=[18,9,110,420,370,350,150,45],dayf=[1,1.06,1.1,1.05,0.92,0.28,0.2];
const HM=DAYS.map((d,i)=>prof.map(p=>Math.round(p*dayf[i]*(0.85+r()*0.3))));
const REG=[['United Kingdom',0.41,'var(--c1)'],['Europe',0.27,'var(--c3)'],['North America',0.24,'var(--c2)'],['Rest of world',0.08,'var(--c9)']];

const K=[
 {l:'Monthly recurring revenue',v:gbp(close),d:pctd(close,open),good:'up',s:MRR.slice(-6),href:'/stacked'},
 {l:'Weekly active users',v:N(WAU[25]),d:pctd(WAU[25],WAU[21]),good:'up',s:WAU.slice(-6),href:'/line'},
 {l:'Monthly churn',v:'1.9%',d:-10,good:'down',s:[2.6,2.4,2.3,2.2,2.0,1.9],href:'/waterfall'},
 {l:'Open support tickets',v:'37',d:-12,good:'down',s:[52,49,47,44,41,37],href:'/sparkline'}];
const tile=k=>{const cls=k.d===0?'flat':((k.d>0)===(k.good==='up')?'good':'bad');
  return h('a',{class:'kt',href:k.href},h('span',{class:'s'},k.l),h('span',{class:'v'},k.v),h('span',{class:'d '+cls},k.d===0?'no change':(k.d>0?'▲ ':'▼ ')+Math.abs(k.d)+'% vs last month'),spark(k.s,{w:160,h:30,label:k.l+', recent trend'}))};

const PANELS=[
 ['#d-rev',()=>barChart({cats:M12,series:PLANS.map((p,k)=>({name:p,colour:catColor(p),values:REV[k]})),lines:[{name:'Target',values:TARGET,colour:'var(--ink)'}],xlabel:(c,t)=>t?monthName(c):MON[+c.slice(5,7)-1],height:270,label:'Monthly recurring revenue by plan, with target'})],
 ['#d-region',()=>{const parts=REG.map(x=>({name:x[0],value:Math.round(close*x[1]),colour:x[2]}));const tot=sum(parts.map(p=>p.value));
   return h('div',{class:'donutrow'},donut({parts:parts,size:200,centre:{value:compact(close),label:'MRR'},label:'Revenue by region'}),h('div',{class:'legend'},parts.map(p=>h('span',{},h('i',{class:'sw',style:'background:'+p.colour}),p.name,h('span',{class:'pct'},Math.round(p.value/tot*100)+'%')))))}],
 ['#d-wf',()=>waterfall({steps:[{label:'New',value:neu},{label:'Expansion',value:expn},{label:'Contraction',value:-contr},{label:'Churn',value:-churn},{label:'Net new',value:neu+expn-contr-churn,total:true}],height:260,label:'Net new recurring revenue this month: new and expansion less contraction and churn'})],
 ['#d-wau',()=>lineChart({xs:W26,series:[{name:'This year',values:WAU,colour:'var(--c1)',area:true},{name:'Same week last year',values:WAU_LY,colour:'var(--muted)',dash:'2 4',width:1.5,faint:true}],yfmt:kfmt,tipfmt:N,height:260,label:'Weekly active users, last 26 weeks'})],
 ['#d-heat',()=>heatmap({rows:DAYS,cols:BLK,matrix:HM,norm:'global',fmt:N,unit:'Sessions',labelW:44,cellH:26,label:'Sessions by weekday and time of day'})],
 ['#d-feat',()=>hbars([['Dashboards',8420],['Reports',6310],['Alerts',4980],['Integrations',3720],['Exports',2260]].map(x=>({label:x[0],value:x[1],colour:'var(--c1)'})),{fmt:N})],
 ['#d-budget',()=>h('div',{},[['Support tooling',6900,9000],['Marketing',7800,9000],['Cloud hosting',3900,3500]].map(x=>gauge({label:x[0],value:x[1],target:x[2]})))],
 ['#d-rel',()=>dataTable(['Release','Shipped','Status','Adoption'],[['Scheduled reports','12 Oct','Live','64%'],['Team permissions','28 Sep','Live','81%'],['Slack alerts','9 Sep','Live','73%'],['Custom dashboards','Next week','In review','-']])]
];
$('#d-kpi').append(...K.map(tile));
function paint(){PANELS.forEach(p=>{const el=$(p[0]);if(!el)return;setChartWidth((el.clientWidth||600)-2);setPatterns(false);el.replaceChildren(p[1]())})}
paint();
let rw=0,raf=0;new ResizeObserver(()=>{const w=$('.dash').clientWidth;if(Math.abs(w-rw)<6)return;rw=w;cancelAnimationFrame(raf);raf=requestAnimationFrame(paint)}).observe($('.dash'));
`;

const dpanel = (cls: string, id: string, title: string, href: string, link: string) =>
  `<section class="widget ${cls}" aria-labelledby="${id}-h"><header><h2 id="${id}-h">${esc(title)}</h2><a class="d-link" href="${href}">${esc(link)} &rarr;</a></header><div id="${id}"></div></section>`;

// Which chart page is behind each part of the dashboard.
const DASH_USES: [string, string][] = [
  ["/kpi-tiles", "The four key figures at the top."],
  ["/sparkline", "The small trend line in each tile."],
  ["/stacked", "Recurring revenue by plan, with a target line."],
  ["/donut", "Revenue by region."],
  ["/waterfall", "Net new revenue this month."],
  ["/line", "Weekly active users, against the same weeks last year."],
  ["/heatmap", "When people use the product."],
  ["/hbars", "The most-used features."],
  ["/gauge", "Spend against budget."],
  ["/data-table", "Recent releases."],
];

function dashboardPage(nonce: string): string {
  const body = `
<section class="section section--alt"><div class="container stack">
<p class="dash-note">This is a dashboard for a fictional company, Acme Cloud, built from the same charts as the rest of this site and wired to made-up data. Hover or tab to any chart, switch the theme, or open a panel&rsquo;s chart page for its code and a table view.</p>
<div id="d-kpi" class="kgrid"></div>
<div class="dash">
${dpanel("d-8", "d-rev", "Recurring revenue by plan", "/stacked", "Stacked chart")}
${dpanel("d-4", "d-region", "Revenue by region", "/donut", "Donut")}
${dpanel("d-6", "d-wf", "Net new revenue this month", "/waterfall", "Waterfall")}
${dpanel("d-6", "d-wau", "Weekly active users", "/line", "Line chart")}
${dpanel("d-8", "d-heat", "When people use it", "/heatmap", "Heatmap")}
${dpanel("d-4", "d-feat", "Most-used features", "/hbars", "Ranked bars")}
${dpanel("d-6", "d-budget", "Spend against budget", "/gauge", "Gauge")}
${dpanel("d-6", "d-rel", "Recent releases", "/data-table", "Data table")}
</div></div></section>
<section class="section"><div class="container">
${csHead("From charts to working dashboards", "Claude built this dashboard and every chart on this site, working from my direction. I take the same approach to dashboards and reporting in real products, using AI where it speeds up delivery and keeping a person in charge of what gets built.", ["https://productscope.uk/building-a-jira-time-reporting-dashboard-with-claude/", "Read the Jira dashboard article"])}
</div></section>
<section class="section section--alt"><div class="container">
${csHead("Ten charts, one page", "Open any of these to see its live demo, code and options.", ["/", "All charts"])}
<div class="feat-list feat-list--titles">${DASH_USES.map(([path, note]) => `<div class="feat-row"><div class="feat-row__body"><h3><a href="${path}">${esc(byPath.get(path)!.name)}</a></h3><p>${esc(note)}</p></div></div>`).join("")}</div>
</div></section>`;
  const title = "Mock-up product dashboard in plain SVG charts | Product Scope Charts";
  const description = "A made-up product dashboard built from the SVG charts on this site: KPI tiles, stacked revenue, a waterfall, a usage heatmap and more. No libraries, all made-up data.";
  return layout({ nonce, title, description, path: "/dashboard", nav: NAV, hero: { title: "Mock-up dashboard", lead: "Ten of the fifteen charts working together in one view. Every number is made up." }, body, script: DASH, ld: pageLd("/dashboard", title, description, [["Charts", "/"], ["Dashboard", "/dashboard"]]) });
}

const TOKENS: [string, string][] = [
  ["--surface, --bg, --sunk", "Card, page and recessed backgrounds."],
  ["--ink, --ink-2, --muted", "Primary, secondary and axis text."],
  ["--line, --line-2", "Gridlines and borders."],
  ["--accent, --accent-ink", "Single-series colour and the text colour that sits on it."],
  ["--c1 … --c8, --c9", "Eight validated categorical colours in fixed order; c9 is grey for Other."],
  ["--ok, --guess, --decide", "Status colours (good, warning, bad) for gauges and deltas."],
  ["--f-ui, --r", "Font stack and corner radius."],
];

const TOOLKIT_FAQ: [string, string][] = [
  ["Why is there no backtick or dollar-brace in the script?", `The script is stored as a template literal in the source, so it contains no backticks and no dollar-brace sequences. Keep it that way if you embed it the same way.`],
  ["How do I make a chart fit its container?", `Call <code>setChartWidth(container.clientWidth)</code> before drawing so charts fit their container, and redraw on resize.`],
  ["How do I change the currency?", `Currency is hard-coded to pounds in <code>compact()</code> and <code>money0</code>. Change those two for another currency.`],
];

function toolkitPage(nonce: string): string {
  const body = `
<section class="section"><div class="container">
${csHead("1. Design tokens", "The charts read these CSS variables, so they follow your theme. Put light values on :root and dark values under prefers-color-scheme.", undefined, "tok-h")}
<div class="feat-list">${TOKENS.map(([k, v]) => `<div class="feat-row"><div class="feat-row__body"><h3><code>${esc(k)}</code></h3><p>${esc(v)}</p></div></div>`).join("")}</div>
</div></section>
<section class="section section--alt"><div class="container">
${csHead("2. Helpers the script expects", "Define these before the toolkit. They are the same few lines used by every page here.")}
${codeBlock("helpers", HELPERS, "JavaScript")}
</div></section>
<section class="section"><div class="container">
${csHead("3. Chart CSS", "One block of CSS. Paste it into a style element.")}
${codeBlock("css", CHARTS_CSS.trim(), "CSS")}
</div></section>
<section class="section section--alt"><div class="container">
${csHead("4. Chart script", "One script. Paste it into a script element, then call the chart functions.")}
${codeBlock("js", CHARTS_JS.trim(), "JavaScript")}
</div></section>
<section class="section"><div class="container">
${csHead("Notes", "Three things to know before you embed it.")}
${faq(TOOLKIT_FAQ)}
</div></section>`;
  const title = "Get the SVG chart code: CSS, script and design tokens | Product Scope Charts";
  const description = "Copy the whole chart toolkit: design tokens, three small helpers, one block of CSS and one script. No dependencies, MIT licensed.";
  const code = { "@type": "SoftwareSourceCode", name: "Product Scope Charts", description, codeRepository: "https://github.com/DavidLortalPM/productscope-charts", programmingLanguage: "JavaScript", license: "https://opensource.org/licenses/MIT", author: { "@id": ORG["@id"] }, publisher: { "@id": ORG["@id"] } };
  return layout({ nonce, title, description, path: "/toolkit", nav: NAV, hero: { title: "Get the code", lead: "Two blocks and a handful of design tokens. Paste the CSS into a style element and the script into a script element, define the three helpers, and call the chart functions." }, body, script: "", ld: pageLd("/toolkit", title, description, [["Charts", "/"], ["Get the code", "/toolkit"]], [code]) });
}

const HELPERS = `const h = (t, a = {}, ...k) => {            // tiny DOM builder
  const e = document.createElement(t);
  for (const [n, v] of Object.entries(a)) {
    if (n === 'on') for (const [ev, fn] of Object.entries(v)) e.addEventListener(ev, fn);
    else if (n === 'class') e.className = v;
    else if (v !== false && v != null) e.setAttribute(n, v);
  }
  for (const c of k.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c));
  return e;
};
const gbp = n => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n || 0);
const money0 = gbp;                         // default value formatter used by tooltips
const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const monthName=m=>MON[+m.slice(5,7)-1]+' '+m.slice(0,4);
const fmtDate=s=>{const m=/^([0-9]{4})-([0-9]{2})-([0-9]{2})/.exec(s||'');return m?(+m[3])+' '+MON[+m[2]-1]+' '+m[1]:(s||'')};`;

export default {
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    if (req.method !== "GET" && req.method !== "HEAD") return new Response("Method not allowed", { status: 405, headers: { allow: "GET, HEAD" } });
    // One address per page: /line/ redirects to /line (the canonical tag says the same).
    if (url.pathname.length > 1 && url.pathname.endsWith("/")) return Response.redirect(url.origin + url.pathname.replace(/\/+$/, "") + url.search, 301);
    let path = url.pathname.replace(/\/+$/, "") || "/";
    if (path === "/robots.txt") return staticResponse(`User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`, "text/plain; charset=utf-8");
    if (path === "/sitemap.xml") return staticResponse(req.method === "HEAD" ? null : sitemapXml(), "application/xml; charset=utf-8");
    if (path === "/.well-known/security.txt") return staticResponse(req.method === "HEAD" ? null : SECURITY_TXT, "text/plain; charset=utf-8");
    if (path === "/og.png") return staticResponse(ogImage, "image/png", 86400);
    if (path === "/favicon.ico") return new Response(null, { status: 204 });
    if (path.startsWith("/f/") && path.endsWith(".woff2")) {
      const buf = FONTS[path.slice(3, -6)];
      if (buf) return new Response(buf, { headers: { "content-type": "font/woff2", "cache-control": "public, max-age=31536000, immutable", "x-content-type-options": "nosniff" } });
      return new Response("Not found", { status: 404 });
    }
    const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
    let html: string | null = null;
    if (path === "/") html = indexPage(nonce);
    else if (path === "/toolkit") html = toolkitPage(nonce);
    else if (path === "/dashboard") html = dashboardPage(nonce);
    else if (byPath.has(path)) html = chartPage(byPath.get(path)!, PAGES.indexOf(byPath.get(path)!), nonce);
    if (html == null) {
      const body = layout({ nonce, title: "Not found | Product Scope Charts", description: "Page not found", path: "", nav: NAV, hero: { title: "Page not found", lead: "That page does not exist or may have moved." }, body: `<section class="section"><div class="container"><div class="btn-row"><a class="btn btn--primary" href="/">See all charts</a><a class="btn btn--outline" href="/toolkit">Get the code</a></div></div></section>`, script: "", cta: false });
      return new Response(req.method === "HEAD" ? null : body, { status: 404, headers: headers(nonce, "text/html; charset=utf-8") });
    }
    return new Response(req.method === "HEAD" ? null : html, { headers: headers(nonce, "text/html; charset=utf-8") });
  },
};
