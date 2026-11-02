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
    "cache-control": "no-cache",
  });
}

const codeBlock = (id: string, code: string, label: string) =>
  `<div class="code"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px"><span class="eyebrow">${esc(label)}</span><button class="copy" type="button" data-copy="${id}">Copy</button></div><pre><code id="${id}">${esc(code)}</code></pre></div>`;

function chartPage(p: Page, i: number, nonce: string): string {
  const prev = PAGES[(i + PAGES.length - 1) % PAGES.length], next = PAGES[(i + 1) % PAGES.length];
  const pager = `<nav class="pager" aria-label="Previous and next chart"><a href="${prev.path}">← ${esc(prev.name)}</a><a href="/">All charts</a><a href="${next.path}">${esc(next.name)} →</a></nav>`;
  const body = `
${pager}
<section class="widget" aria-labelledby="live-h"><header><div><h2 id="live-h">Live demo</h2><p class="sub">Made-up data. Try the options, then switch to the empty and one-point states.</p></div></header>
<div id="tools" class="wtools" style="gap:6px 16px"></div>
<div id="frame" class="frame"></div>
<p class="live" id="msg" role="status" aria-live="polite"></p>
<p class="hint">${esc(p.keys)}</p></section>
<section class="panel" aria-labelledby="use-h"><header><h2 id="use-h">How to use it</h2></header>${codeBlock("snip", p.snippet, "JavaScript")}</section>
<section class="panel" aria-labelledby="opt-h"><header><h2 id="opt-h">Options</h2></header><dl class="opts">${p.opts.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl></section>
${pager}`;
  return layout({ nonce, title: `${p.title} | Product Scope Charts`, description: p.tag, path: p.path, nav: NAV, hero: { eyebrow: `Chart ${i + 1} of ${PAGES.length}`, title: p.title, lead: p.when }, body, script: p.script });
}

// Tiny live previews for the index cards, built with the same chart functions (text hidden by CSS: they are decorative).
const THUMBS = String.raw`
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
`;

function indexPage(nonce: string): string {
  const cards = PAGES.map(p => `<a class="card" href="${p.path}"><div class="thumb" data-t="${p.path.slice(1)}" aria-hidden="true"></div><div class="card__body"><h2>${esc(p.name)}</h2><p>${esc(p.tag)}</p><span class="post-card__more">View chart &rarr;</span></div></a>`).join("");
  const body = `
<ul style="margin:0;padding-left:20px;color:var(--ink-2);max-width:76ch">
<li>Works with a strict content security policy: no external scripts, fonts or styles, no <code>eval</code>.</li>
<li>Light and dark themes, keyboard navigation, screen-reader labels, a data table behind every chart, optional patterns instead of colour.</li>
<li>Every chart copes with empty, one-point and outlier data. Phone-friendly: charts resize to their container.</li>
<li>Eight categorical colours checked for colour-blind separation and contrast; ${RUN}.</li></ul>
<div class="cards">${cards}</div>
<section class="panel"><h2>Use it in your own project</h2><p style="margin-top:6px;color:var(--ink-2)">The whole toolkit is one stylesheet and one script with no dependencies. <a href="/toolkit">See the code and how to wire it up →</a></p></section>`;
  return layout({ nonce, title: "Chart showcase | Product Scope", description: "Hand-built SVG charts with no libraries: live demos, copyable code and options for fifteen chart types, all with made-up data.", path: "/", nav: NAV, hero: { eyebrow: "Hand-built SVG, no libraries", title: "Chart showcase", lead: "Fifteen chart types in one small toolkit: line, bars, stacked, donut, heatmap, calendar, treemap, sparkline, gauge, waterfall, flow, ranked bars, small multiples, KPI tiles and data tables. Each page has a live demo, a copyable snippet and the options." }, body, script: THUMBS });
}

function toolkitPage(nonce: string): string {
  const body = `
<section class="panel"><h2>1. Design tokens</h2><p class="sub" style="color:var(--muted);margin:4px 0 10px">The charts read these CSS variables, so they follow your theme. Put light values on :root and dark values under prefers-color-scheme.</p>
<dl class="opts"><dt>--surface, --bg, --sunk</dt><dd>Card, page and recessed backgrounds.</dd><dt>--ink, --ink-2, --muted</dt><dd>Primary, secondary and axis text.</dd><dt>--line, --line-2</dt><dd>Gridlines and borders.</dd><dt>--accent, --accent-ink</dt><dd>Single-series colour and the text colour that sits on it.</dd><dt>--c1 … --c8, --c9</dt><dd>Eight validated categorical colours in fixed order; c9 is grey for Other.</dd><dt>--ok, --guess, --decide</dt><dd>Status colours (good, warning, bad) for gauges and deltas.</dd><dt>--f-ui, --r</dt><dd>Font stack and corner radius.</dd></dl></section>
<section class="panel"><h2>2. Helpers the script expects</h2><p style="margin:4px 0 10px;color:var(--ink-2)">Define these before the toolkit. They are the same few lines used by every page here.</p>
${codeBlock("helpers", HELPERS, "JavaScript")}</section>
<section class="panel">${codeBlock("css", CHARTS_CSS.trim(), "3. Chart CSS")}</section>
<section class="panel">${codeBlock("js", CHARTS_JS.trim(), "4. Chart script")}</section>
<section class="panel"><h2>Notes</h2><ul style="margin:6px 0 0;padding-left:20px;color:var(--ink-2)"><li>The script is stored as a template literal in the source, so it contains no backticks and no dollar-brace sequences. Keep it that way if you embed it the same way.</li><li>Call <code>setChartWidth(container.clientWidth)</code> before drawing so charts fit their container; redraw on resize.</li><li>Currency is hard-coded to pounds in <code>compact()</code> and <code>money0</code>; change those two for another currency.</li></ul></section>`;
  return layout({ nonce, title: "Get the code | Product Scope Charts", description: "The chart toolkit: tokens, helpers, CSS and script.", path: "/toolkit", nav: NAV, hero: { eyebrow: "Reference", title: "Get the code", lead: "Two blocks and a handful of design tokens. Paste the CSS into a style element and the script into a script element, define the three helpers, and call the chart functions." }, body, script: "" });
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
    let path = url.pathname.replace(/\/+$/, "") || "/";
    if (path === "/robots.txt") return new Response("User-agent: *\nAllow: /\n", { headers: { "content-type": "text/plain; charset=utf-8" } });
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
    else if (byPath.has(path)) html = chartPage(byPath.get(path)!, PAGES.indexOf(byPath.get(path)!), nonce);
    if (html == null) {
      const body = layout({ nonce, title: "Not found | Product Scope Charts", description: "Page not found", path: "", nav: NAV, hero: { title: "Page not found", lead: "That page does not exist." }, body: `<p><a href="/">See all charts</a></p>`, script: "" });
      return new Response(req.method === "HEAD" ? null : body, { status: 404, headers: headers(nonce, "text/html; charset=utf-8") });
    }
    return new Response(req.method === "HEAD" ? null : html, { headers: headers(nonce, "text/html; charset=utf-8") });
  },
};
