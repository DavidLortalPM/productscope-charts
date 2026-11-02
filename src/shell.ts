// Page shell for the showcase: design tokens (light + dark), page chrome, and the small demo harness every page uses.
// NOTE: SHOW_JS is a template literal that ends up inside a <script>, so it must contain no backticks and no
// dollar-brace sequences (String.raw keeps backslashes literal).
import { CHARTS_CSS, CHARTS_JS } from "./charts";

export const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Categorical colours are checked for lightness, chroma and colour-blind separation (light on white, dark on slate #1b2329).
// Light contrast is below 3:1 for slots 3, 4 and 5; legends, direct labels and the table view cover that.
// Chrome (header, hero band, cards, buttons, footer) mirrors the Product Scope site components (productscope.uk).
const DARK = `
  --bg:#141a1f; --surface:#1b2329; --sunk:#243038; --ink:#e7ecf0; --ink-2:#c3cbd1; --muted:#9aa5ad;
  --line:#2b363d; --line-2:#3a4850; --heading:#ffffff;
  --accent:#3987e5; --accent-ink:#0b0b0b; --link:#7fb2f2;
  --brand:#d77a8d; --brand-dark:#e59aab; --brand-fill:#8f1d3a;
  --shadow:0 10px 30px rgba(0,0,0,.4); --shadow-sm:0 4px 14px rgba(0,0,0,.3);
  --ok:#0ca30c; --guess:#fab219; --decide:#ff7a6b;
  --c1:#3987e5; --c2:#d95926; --c3:#199e70; --c4:#c98500; --c5:#d55181; --c6:#008300; --c7:#9085e9; --c8:#e66767; --c9:#66655f;
  color-scheme:dark`;

export const SHOW_CSS = `
[hidden]{display:none!important}
@font-face{font-family:'DM Sans';font-style:normal;font-weight:400;font-display:swap;src:url('/f/dm-sans-400.woff2') format('woff2')}
@font-face{font-family:'DM Sans';font-style:normal;font-weight:500;font-display:swap;src:url('/f/dm-sans-500.woff2') format('woff2')}
@font-face{font-family:'DM Sans';font-style:normal;font-weight:600;font-display:swap;src:url('/f/dm-sans-600.woff2') format('woff2')}
@font-face{font-family:'DM Sans';font-style:normal;font-weight:700;font-display:swap;src:url('/f/dm-sans-700.woff2') format('woff2')}
@font-face{font-family:'Poppins';font-style:normal;font-weight:400;font-display:swap;src:url('/f/poppins-400.woff2') format('woff2')}
@font-face{font-family:'Poppins';font-style:normal;font-weight:500;font-display:swap;src:url('/f/poppins-500.woff2') format('woff2')}
@font-face{font-family:'Poppins';font-style:normal;font-weight:600;font-display:swap;src:url('/f/poppins-600.woff2') format('woff2')}
@font-face{font-family:'Poppins';font-style:normal;font-weight:700;font-display:swap;src:url('/f/poppins-700.woff2') format('woff2')}
:root{
  --bg:#ffffff; --surface:#ffffff; --sunk:#f1f4f7; --ink:#263037; --ink-2:#43505a; --muted:#54606a;
  --line:#e3e8ea; --line-2:#cfd6db; --heading:#20282d;
  --accent:#2a78d6; --accent-ink:#ffffff; --link:#0b57d0;
  --brand:#800020; --brand-dark:#5e0018; --brand-fill:#800020;
  --nav:#1e3a5f; --slate:#1b2329;
  --ok:#006300; --guess:#a86b00; --decide:#c62d2d;
  --c1:#2a78d6; --c2:#eb6834; --c3:#1baf7a; --c4:#eda100; --c5:#e87ba4; --c6:#008300; --c7:#6250d6; --c8:#e34948; --c9:#b4b2a9;
  --f-ui:"DM Sans",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; --f-head:"Poppins",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; --f-mono:ui-monospace,SFMono-Regular,Consolas,"Liberation Mono",monospace;
  --r:10px; --r-sm:8px; --shadow:0 10px 30px rgba(0,0,0,.08); --shadow-sm:0 4px 14px rgba(0,0,0,.06);
  --header-h:76px; color-scheme:light;
}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){${DARK}}}
:root[data-theme="dark"]{${DARK}}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth;scroll-padding-top:calc(var(--header-h) + 12px)}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--f-ui);font-size:17px;line-height:1.65;font-variant-numeric:tabular-nums;-webkit-font-smoothing:antialiased;overflow-wrap:break-word}
h1,h2,h3{margin:0;text-wrap:balance;font-family:var(--f-head);color:var(--heading);line-height:1.25;font-weight:600;letter-spacing:.2px}
h1{font-size:clamp(2.2rem,5vw,3.5rem)}
h2{font-size:1.15rem}
p{margin:0}
a{color:var(--link)}
p a,li a,dd a,.hint a{text-decoration:underline;text-underline-offset:2px;text-decoration-thickness:1px}
:focus-visible{outline:3px solid var(--brand);outline-offset:2px;border-radius:2px}
.site-header :focus-visible,.site-footer :focus-visible{outline-color:#fff}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important}}
.skip-link{position:absolute;left:8px;top:-64px;z-index:200;background:#fff;color:#800020;font-family:var(--f-head);font-weight:600;padding:10px 18px;border-radius:6px;box-shadow:var(--shadow);transition:top .2s ease}
.skip-link:focus{top:8px}
.container{width:100%;max-width:1200px;margin-inline:auto;padding-inline:24px}
.section{padding:clamp(40px,5vw,64px) 0}

/* Header: navy bar with the burgundy accent line, animated scope mark + wordmark (as productscope.uk) */
.site-header{position:sticky;top:0;z-index:100;background:var(--nav);border-top:4px solid #800020;color:#fff;box-shadow:0 4px 18px rgba(0,0,0,.16)}
.site-header .container{display:flex;align-items:center;justify-content:space-between;min-height:var(--header-h);gap:24px}
.site-logo{display:inline-flex;align-items:center;gap:12px;color:#fff;text-decoration:none}
.site-logo:hover{color:#fff}
.ps-mark{width:40px;height:40px;flex:0 0 auto;overflow:visible;stroke-linecap:butt;stroke-linejoin:miter;transform-origin:50% 50%;animation:ps-expand 3.5s cubic-bezier(.2,.7,.2,1) both}
@keyframes ps-expand{from{transform:scale(.18) rotate(-90deg)}to{transform:scale(1) rotate(0deg)}}
@media (prefers-reduced-motion:reduce){.ps-mark{animation:none}}
.site-logo__name{font-family:var(--f-head);font-weight:700;text-transform:uppercase;letter-spacing:.03em;line-height:.98;font-size:1.05rem;color:#fff}
.site-logo__tag{font-family:var(--f-head);font-weight:500;text-transform:uppercase;letter-spacing:.14em;font-size:.72rem;color:#c7d2de;border-left:1px solid rgba(255,255,255,.3);padding-left:12px;margin-left:2px}
.header-right{display:flex;align-items:center;gap:14px}
.main-nav ul{list-style:none;display:flex;align-items:center;gap:28px;margin:0;padding:0}
.main-nav a{position:relative;color:#fff;font-family:var(--f-head);font-weight:500;font-size:.98rem;padding:6px 0;text-decoration:none;white-space:nowrap}
.main-nav a:hover{color:#fff}
.main-nav a::after{content:"";position:absolute;left:0;bottom:0;width:0;height:2px;background:#fff;transition:width .25s ease}
.main-nav a:hover::after,.main-nav a[aria-current="page"]::after{width:100%}
.main-nav a.nav-cta{font-weight:600;font-size:.85rem;letter-spacing:.02em;padding:8px 16px;border:2px solid rgba(255,255,255,.6);border-radius:4px;transition:all .2s ease}
.main-nav a.nav-cta::after{display:none}
.main-nav a.nav-cta:hover{background:#fff;border-color:#fff;color:#800020}
.theme,.nav-toggle{display:inline-grid;place-items:center;width:40px;height:40px;padding:0;border:2px solid rgba(255,255,255,.45);border-radius:4px;background:transparent;color:#fff;cursor:pointer;transition:background .2s ease,border-color .2s ease}
.theme:hover,.nav-toggle:hover{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.8)}
.theme svg,.nav-toggle svg{width:20px;height:20px}
.theme .i-sun{display:none}
:root[data-theme="dark"] .theme .i-moon{display:none}
:root[data-theme="dark"] .theme .i-sun{display:block}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]) .theme .i-moon{display:none}:root:not([data-theme="light"]) .theme .i-sun{display:block}}
.nav-toggle{display:none}
.site-logo,.site-logo__name{white-space:nowrap}
@media (max-width:1000px){
  .nav-toggle{display:inline-grid}
  .main-nav{display:none;position:absolute;top:100%;left:0;right:0;background:var(--nav);border-top:1px solid rgba(255,255,255,.15);box-shadow:0 10px 18px rgba(0,0,0,.18);padding:8px 24px 18px}
  .main-nav[data-open]{display:block}
  .main-nav ul{flex-direction:column;align-items:stretch;gap:0}
  .main-nav li{border-bottom:1px solid rgba(255,255,255,.1)}
  .main-nav li:last-child{border-bottom:0;padding-top:12px}
  .main-nav a{display:block;padding:14px 0;font-size:1.05rem}
  .main-nav a::after{display:none}
  .main-nav a[aria-current="page"]{color:#fff;font-weight:600}
  .main-nav a.nav-cta{display:inline-block;padding:10px 18px}
}
@media (max-width:520px){.site-logo__tag{display:none}.container{padding-inline:18px}.main-nav{padding-inline:18px}.site-header .container{gap:12px}}

/* Title band: hero-light with the 64px burgundy rule under the heading */
.hero-light{padding:clamp(40px,5vw,64px) 0 clamp(14px,2vw,28px)}
.hero-light h1{margin-bottom:0}
.hero-light h1::after{content:"";display:block;width:64px;height:3px;border-radius:2px;background:var(--brand);margin-top:16px}
.hero-light p.lead{font-family:var(--f-head);font-weight:400;font-size:clamp(1.12rem,1.6vw,1.32rem);line-height:1.5;color:var(--ink-2);max-width:none;margin:16px 0 0}
.hero-light + .section{padding-top:clamp(20px,2.5vw,32px)}
.content{display:flex;flex-direction:column;gap:26px}
.eyebrow{font-family:var(--f-head);font-size:.76rem;text-transform:uppercase;letter-spacing:.12em;color:var(--brand);font-weight:600}
.hero-light .eyebrow{display:block;margin-bottom:12px}
.code .eyebrow{color:var(--muted)}
.lede{color:var(--ink-2);font-size:1.05rem;max-width:68ch;margin-top:10px}
.when{background:var(--surface);border:1px solid var(--line);border-left:4px solid var(--brand);border-radius:var(--r-sm);padding:12px 16px;max-width:76ch}
.when b{display:block;font-size:.78rem;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin-bottom:2px}
.tlabel{font-size:.78rem;font-weight:700;color:var(--muted);margin:0 2px 0 6px;text-transform:uppercase;letter-spacing:.06em}
.tlabel:first-child{margin-left:0}
.frame{min-width:0}
.stage{min-width:0}
.stage.scroll{overflow-x:auto}
.hint{color:var(--muted);font-size:.85rem}
.live{font-size:.92rem;color:var(--ink-2);min-height:1.4em}
.panel{min-width:0}
.panel>header{display:flex;flex-wrap:wrap;gap:6px 14px;justify-content:space-between;align-items:center;margin-bottom:12px}
.code{position:relative}
pre{margin:0;background:var(--sunk);border:1px solid var(--line);border-radius:var(--r-sm);padding:14px 16px;overflow:auto;max-height:520px;font:.82rem/1.55 var(--f-mono);tab-size:2;color:var(--ink)}
dl.opts{display:grid;grid-template-columns:minmax(120px,max-content) 1fr;gap:8px 20px;margin:0;font-size:.95rem}
dl.opts dt{font-family:var(--f-mono);font-size:.82rem;color:var(--ink);font-weight:600}
dl.opts dd{margin:0;color:var(--ink-2)}
@media (max-width:640px){dl.opts{grid-template-columns:1fr}dl.opts dd{margin-bottom:6px}}
.pager{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-family:var(--f-head);font-weight:600;font-size:.92rem}
.pager a{color:var(--brand);text-decoration:none}
.pager a:hover{color:var(--brand-dark);text-decoration:underline}

/* Cards: the site's post-card treatment (white card, soft shadow, lift on hover, outline button) */
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:32px 28px}
a.card{display:flex;flex-direction:column;background:var(--surface);border:1px solid var(--line);border-radius:var(--r);overflow:hidden;box-shadow:var(--shadow-sm);color:inherit;text-decoration:none;min-width:0;transition:transform .2s ease,box-shadow .2s ease}
a.card:hover{transform:translateY(-4px);box-shadow:var(--shadow)}
.thumb{height:160px;overflow:hidden;background:var(--sunk);border-bottom:1px solid var(--line);pointer-events:none;padding:14px 18px;display:flex;align-items:center;justify-content:center}
.thumb>*{max-width:100%;width:100%}
.thumb .ch text{display:none}
.thumb .ch{min-width:0!important;outline:none}
.thumb .tip,.thumb .note{display:none}
.thumb .hb .l{visibility:hidden}
.thumb .gauge{grid-template-columns:1fr}.thumb .gauge>span:not(.t){display:none}
.card__body{padding:22px 24px 26px;display:flex;flex-direction:column;flex:1;gap:8px}
a.card h2{font-size:1.2rem;line-height:1.35;color:var(--heading);transition:color .2s ease}
a.card:hover h2{color:var(--brand)}
a.card p{font-size:.95rem;color:var(--ink-2);margin:0 0 10px}
.post-card__more{margin-top:auto;align-self:flex-start;display:inline-flex;align-items:center;gap:6px;font-family:var(--f-head);font-weight:600;font-size:.85rem;color:var(--brand);background:transparent;border:1.5px solid var(--brand);border-radius:4px;padding:8px 18px;transition:background .2s ease,color .2s ease,border-color .2s ease}
a.card:hover .post-card__more{background:var(--brand-fill);border-color:var(--brand-fill);color:#fff}
.sprow{display:grid;grid-template-columns:minmax(90px,150px) minmax(0,1fr) 90px;gap:10px;align-items:center;padding:7px 0;border-bottom:1px solid var(--line);font-size:.9rem}
.sprow.two{grid-template-columns:minmax(90px,150px) 130px minmax(0,1fr) 90px}
.sprow .v{text-align:right;font-weight:700}
.sm button.c{font:inherit;color:inherit;text-align:left;width:100%}
.sm .c[aria-pressed="true"]{border-color:var(--brand);box-shadow:inset 0 0 0 1px var(--brand)}
.kt .d.good{color:var(--ok)}.kt .d.bad{color:var(--decide)}
.kt .sk{height:1.4rem;width:60%}
.kgrid .skel{min-height:20px}
.dtable caption{caption-side:top;text-align:left;font-weight:700;padding:0 8px 8px;color:var(--ink-2)}
.dtable tfoot td{font-weight:700;border-top:2px solid var(--line-2)}
.dtable td.neg{color:var(--decide)}
.donutrow{display:flex;flex-wrap:wrap;gap:18px 32px;align-items:center;justify-content:center}
.donutrow .legend{flex-direction:column;gap:7px}
.donutrow .legend .pct{margin-left:auto;padding-left:14px;font-weight:700;color:var(--ink)}
.donutrow .legend{min-width:250px}.donutrow .legend span{width:100%;white-space:nowrap}
.twocol{display:grid;grid-template-columns:1fr 1fr;gap:16px}
@media (max-width:760px){.twocol{grid-template-columns:1fr}}
@media (max-width:520px){.widget,.panel{padding:16px}.wtools{gap:5px}.gauge{grid-template-columns:1fr auto}.gauge .t{grid-column:1/3;order:3}}

/* Footer: brand block + link columns + legal bar (as the site footer) */
.site-footer{background:var(--slate);color:#bdbdbd;padding:70px 0 0;font-size:.95rem;border-top:3px solid #800020;margin-top:clamp(40px,5vw,64px)}
.footer-main{display:grid;grid-template-columns:1.6fr 1fr 1fr;gap:clamp(32px,5vw,64px);padding-bottom:44px;align-items:start}
.footer-brand{max-width:420px}
.footer-brand__lock{display:inline-flex;align-items:center;gap:11px;color:#fff;margin-bottom:20px;text-decoration:none}
.footer-brand__lock .ps-mark{width:34px;height:34px;animation:none}
.footer-brand__name{font-family:var(--f-head);font-weight:700;text-transform:uppercase;letter-spacing:.03em;line-height:.98;font-size:1.05rem;color:#fff}
.footer-brand p{color:#8b969d;margin:0 0 16px;max-width:380px}
.site-footer h3{color:#fff;font-size:.95rem;letter-spacing:.04em;margin-bottom:16px}
.site-footer ul{list-style:none;margin:0;padding:0}
.site-footer li{margin-bottom:11px}
.site-footer a{color:#aeb8be;text-decoration:none;transition:color .2s ease}
.site-footer a:hover{color:#fff}
.footer-legal{border-top:1px solid rgba(255,255,255,.1);display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px 24px;padding:22px 0;font-size:.85rem;color:#8b969d}
.footer-totop{color:#8b969d;font-family:var(--f-head);font-weight:600;white-space:nowrap}
@media (max-width:860px){.footer-main{grid-template-columns:1fr 1fr}.footer-brand{grid-column:1/-1}}
@media (max-width:560px){.footer-main{grid-template-columns:1fr}.footer-legal{flex-direction:column}}
${CHARTS_CSS}

/* Product Scope component layer: applied after the toolkit CSS so the shared widgets share the site's look */
.panel,.widget{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);box-shadow:var(--shadow-sm);padding:24px 26px}
.panel h2,.widget h2{font-size:1.15rem}
.panel h2::after,.widget h2::after{content:"";display:block;width:40px;height:3px;border-radius:2px;background:var(--brand);margin-top:10px}
.widget .sub{font-size:.9rem}
.mini{border:1.5px solid var(--line-2);background:var(--surface);color:var(--ink-2);border-radius:4px;padding:5px 12px;font-family:var(--f-head);font-size:.78rem;font-weight:600;cursor:pointer;transition:all .2s ease}
.mini:hover:not([aria-pressed="true"]){background:var(--sunk);border-color:var(--brand);color:var(--brand)}
.mini[aria-pressed="true"]{background:var(--brand-fill);border-color:var(--brand-fill);color:#fff}
.copy{border:1.5px solid var(--brand);background:transparent;color:var(--brand);border-radius:4px;padding:6px 16px;font-family:var(--f-head);font-size:.82rem;font-weight:600;cursor:pointer;transition:all .2s ease}
.copy:hover{background:var(--brand-fill);border-color:var(--brand-fill);color:#fff}
.code{border:1px solid var(--line);border-radius:var(--r-sm);overflow:hidden;background:var(--sunk)}
.code-bar{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:7px 8px 7px 14px;border-bottom:1px solid var(--line);background:var(--surface)}
.code pre{border:0;border-radius:0;background:transparent}
.code-bar .copy{padding:4px 12px;font-size:.78rem}
.btn{display:inline-flex;align-items:center;gap:.5em;font-family:var(--f-head);font-weight:600;font-size:.9rem;letter-spacing:.02em;padding:13px 28px;border-radius:4px;border:2px solid transparent;cursor:pointer;text-decoration:none;transition:all .2s ease;white-space:nowrap}
.btn--primary{background:var(--brand-fill);border-color:var(--brand-fill);color:#fff}
.btn--primary:hover{background:var(--brand-dark);border-color:var(--brand-dark);color:#fff}
.feature{display:flex;flex-wrap:wrap;gap:16px 28px;align-items:center;justify-content:space-between}
.feature p{color:var(--ink-2);margin-top:8px;max-width:64ch}
.dash{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:22px}
.dash>.panel{display:flex;flex-direction:column;gap:6px;min-width:0}
.d-4{grid-column:span 4}.d-6{grid-column:span 6}.d-8{grid-column:span 8}
@media (max-width:960px){.d-4,.d-6,.d-8{grid-column:1/-1}}
.d-link{font-family:var(--f-head);font-weight:600;font-size:.8rem;color:var(--brand);text-decoration:none;white-space:nowrap}
.d-link:hover{color:var(--brand-dark);text-decoration:underline}
.dash-note{color:var(--ink-2);max-width:78ch}
.kt svg{max-width:100%;height:auto}
`;

export const SHOW_JS = String.raw`
const $=s=>document.querySelector(s);
const h=(t,a={},...k)=>{const e=document.createElement(t);for(const[n,v]of Object.entries(a)){if(n==='on')for(const[ev,fn]of Object.entries(v))e.addEventListener(ev,fn);else if(n==='class')e.className=v;else if(v!==false&&v!=null)e.setAttribute(n,v)}for(const c of k.flat())if(c!=null&&c!==false)e.append(c.nodeType?c:document.createTextNode(c));return e};
const gbp=n=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0}).format(Math.sign(n||0)*Math.round(Math.abs(n||0))+0);
const gbp2=n=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP'}).format(Math.sign(n||0)*Math.round(Math.abs(n||0)*100)/100+0);
const money0=gbp,money2=gbp2;
const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const monthName=m=>MON[+m.slice(5,7)-1]+' '+m.slice(0,4);
const fmtDate=s=>{const m=/^([0-9]{4})-([0-9]{2})-([0-9]{2})/.exec(s||'');return m?(+m[3])+' '+MON[+m[2]-1]+' '+m[1]:(s||'')};
${CHARTS_JS}
const legend=items=>h('div',{class:'legend'},items.map(i=>h('span',{},h('i',{class:'sw',style:'background:'+i.colour}),i.name)));

// ---- made-up data: a seeded random generator keeps every page the same on every visit
function rng(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
const MONTHS=[];for(let y=2025,m=4;y<2026||m<=9;){MONTHS.push(y+'-'+String(m).padStart(2,'0'));m++;if(m>12){m=1;y++}}
const CATS=['Groceries','Housing','Eating out','Transport','Travel','Leisure','Health','Other'];
setCategoryOrder(CATS.slice(0,7));
function spendData(){const r=rng(11),base=[420,1150,210,140,70,130,60,160];
  return CATS.map((c,k)=>MONTHS.map((m,i)=>{let v=base[k]*(0.86+r()*0.28);if(c==='Travel'){v=i===4?1450:i===8?3100:i===14?640:v*(0.7+r()*0.6)}if(c==='Leisure'&&i===8)v+=320;if(c==='Eating out'&&(i===8||i===11))v*=1.45;if(c==='Housing')v=base[k]+(i>=9?60:0);return Math.round(v)}))}
const SP=spendData(),TOTAL=MONTHS.map((_,i)=>sum(SP.map(c=>c[i])));
const catColourOf=c=>c==='Other'?GREY:catColor(c);
const pct=(v,t)=>Math.round(v/t*100)+'%';

// ---- demo harness: segmented data states, toggles, patterns, table view, live message, redraw on resize
let say=()=>{},redraw=()=>{};
function demo(cfg){
  const S={view:'chart',patterns:false};
  const segs=(cfg.segs||[]).slice();if(cfg.states)segs.unshift({id:'data',label:'Data',opts:cfg.states,init:'normal'});
  segs.forEach(g=>{S[g.id]=g.init!=null?g.init:g.opts[0][0]});
  (cfg.toggles||[]).forEach(t=>{S[t.id]=!!t.on});
  const tools=$('#tools'),frame=$('#frame'),msg=$('#msg');
  const btns=[];
  const mk=(label,get,fn)=>{const b=h('button',{class:'mini',type:'button','aria-pressed':'false',on:{click:()=>{fn();sync();render()}}},label);btns.push([b,get]);return b};
  const sync=()=>btns.forEach(([b,g])=>b.setAttribute('aria-pressed',String(!!g())));
  segs.forEach(g=>{const grp=h('span',{role:'group','aria-label':g.label,class:'wtools'},h('span',{class:'tlabel'},g.label));g.opts.forEach(([v,l])=>grp.append(mk(l,()=>S[g.id]===v,()=>{S[g.id]=v})));tools.append(grp)});
  const tg=h('span',{class:'wtools',role:'group','aria-label':'Options'});
  (cfg.toggles||[]).forEach(t=>tg.append(mk(t.label,()=>S[t.id],()=>{S[t.id]=!S[t.id]})));
  if(cfg.patterns)tg.append(mk('Patterns',()=>S.patterns,()=>{S.patterns=!S.patterns}));
  if(cfg.table)tg.append(mk('Show as table',()=>S.view==='table',()=>{S.view=S.view==='table'?'chart':'table'}));
  if(tg.children.length)tools.append(tg);
  const out=h('div',{class:'stage'}),tbl=h('div',{class:'stage'});frame.append(out,tbl);
  say=t=>{msg.textContent=t};
  let lastW=0;
  function render(){
    const w=frame.clientWidth||lastW||1000;lastW=w;setChartWidth(w-2);setPatterns(S.patterns);
    out.replaceChildren(...[cfg.draw(S),cfg.legend?cfg.legend(S):null].filter(Boolean));
    if(cfg.table){const t=cfg.table(S);tbl.replaceChildren(dataTable(t.head,t.rows,t.caption))}
    out.hidden=S.view==='table';tbl.hidden=S.view!=='table';
    if(cfg.note)say(cfg.note(S))}
  redraw=render;sync();render();
  let rw=0,raf=0;new ResizeObserver(()=>{const w=frame.clientWidth;if(Math.abs(w-rw)<6)return;rw=w;cancelAnimationFrame(raf);raf=requestAnimationFrame(render)}).observe(frame);
}

// ---- chrome: copy buttons and the theme switch
document.querySelectorAll('[data-copy]').forEach(b=>b.addEventListener('click',async()=>{
  const el=document.getElementById(b.getAttribute('data-copy'));const t=el.textContent;
  try{await navigator.clipboard.writeText(t)}catch(e){const r=document.createRange();r.selectNodeContents(el);const s=getSelection();s.removeAllRanges();s.addRange(r);try{document.execCommand('copy')}catch(e2){}}
  const old=b.textContent;b.textContent='Copied';setTimeout(()=>{b.textContent=old},1600)}));
(function(){})();
(function(){const b=$('#theme');if(!b)return;
  const mq=matchMedia('(prefers-color-scheme: dark)');
  const stored=()=>{try{const t=localStorage.getItem('cs_theme');return t==='light'||t==='dark'?t:null}catch(e){return null}};
  const eff=()=>stored()||(mq.matches?'dark':'light');
  const paint=()=>{const l=eff()==='dark'?'Switch to light theme':'Switch to dark theme';b.setAttribute('aria-label',l);b.title=l};
  paint();
  b.addEventListener('click',()=>{const n=eff()==='dark'?'light':'dark';document.documentElement.setAttribute('data-theme',n);try{localStorage.setItem('cs_theme',n)}catch(e){}paint()});
  if(mq.addEventListener)mq.addEventListener('change',paint)})();
(function(){const t=$('#navtoggle'),n=$('#primary-nav');if(!t||!n)return;
  const set=o=>{if(o)n.setAttribute('data-open','');else n.removeAttribute('data-open');t.setAttribute('aria-expanded',String(o));t.setAttribute('aria-label',o?'Close menu':'Open menu')};
  t.addEventListener('click',()=>set(!n.hasAttribute('data-open')));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&n.hasAttribute('data-open')){set(false);t.focus()}})})();
`;

export interface NavItem { path: string; name: string }
export interface Hero { eyebrow?: string; title: string; lead?: string }

const SITE = "https://charts.productscope.uk";
const PS = "https://productscope.uk";
const MARK = `<svg class="ps-mark" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="11" aria-hidden="true"><polyline class="ps-mark__c ps-mark__tl" points="10,40 10,10 40,10" /><polyline class="ps-mark__c ps-mark__tr" points="60,10 90,10 90,40" /><polyline class="ps-mark__c ps-mark__br" points="90,60 90,90 60,90" /><polyline class="ps-mark__c ps-mark__bl" points="40,90 10,90 10,60" /></svg>`;
const FAVICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none' stroke='%23800020' stroke-width='14'%3E%3Cpolyline points='10,40 10,10 40,10'/%3E%3Cpolyline points='60,10 90,10 90,40'/%3E%3Cpolyline points='90,60 90,90 60,90'/%3E%3Cpolyline points='40,90 10,90 10,60'/%3E%3C/svg%3E";

export function layout(o: { nonce: string; title: string; description: string; path: string; nav: NavItem[]; hero: Hero; body: string; script: string; ld?: object }): string {
  const canon = o.path ? SITE + o.path : "";
  const meta = o.path
    ? `<link rel="canonical" href="${esc(canon)}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Product Scope"><meta property="og:title" content="${esc(o.title)}"><meta property="og:description" content="${esc(o.description)}"><meta property="og:url" content="${esc(canon)}"><meta property="og:locale" content="en_GB"><meta property="og:image" content="${SITE}/og.png"><meta property="og:image:type" content="image/png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Product Scope Charts: hand-built SVG charts with no libraries"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(o.title)}"><meta name="twitter:description" content="${esc(o.description)}"><meta name="twitter:image" content="${SITE}/og.png">`
    : `<meta name="robots" content="noindex">`;
  const hero = `<section class="hero-light"><div class="container">${o.hero.eyebrow ? `<span class="eyebrow">${esc(o.hero.eyebrow)}</span>` : ""}<h1>${esc(o.hero.title)}</h1>${o.hero.lead ? `<p class="lead">${esc(o.hero.lead)}</p>` : ""}</div></section>`;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#1e3a5f">
<meta name="description" content="${esc(o.description)}">
<title>${esc(o.title)}</title>
${meta}
<link rel="icon" href="${FAVICON}">
${o.ld ? `<script type="application/ld+json" nonce="${o.nonce}">${JSON.stringify(o.ld).replace(/</g, "\\u003c")}</script>` : ""}
<script nonce="${o.nonce}">try{var t=localStorage.getItem('cs_theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}</script>
<style>${SHOW_CSS}</style></head>
<body><a class="skip-link" href="#main">Skip to content</a>
<header class="site-header"><div class="container">
<a class="site-logo" href="/" aria-label="Product Scope Charts - home">${MARK}<span class="site-logo__name">Product Scope</span><span class="site-logo__tag">Charts</span></a>
<div class="header-right">
<nav class="main-nav" id="primary-nav" aria-label="Primary"><ul>
<li><a href="/"${o.path === "/" ? ' aria-current="page"' : ""}>All charts</a></li>
<li><a href="/dashboard"${o.path === "/dashboard" ? ' aria-current="page"' : ""}>Dashboard</a></li>
<li><a href="/toolkit"${o.path === "/toolkit" ? ' aria-current="page"' : ""}>Get the code</a></li>
<li><a href="https://github.com/DavidLortalPM/productscope-charts">GitHub</a></li>
<li><a class="nav-cta" href="${PS}">Product Scope &#8599;</a></li>
</ul></nav>
<button class="theme" id="theme" type="button" aria-label="Switch to dark theme" title="Switch to dark theme"><svg class="i-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg><svg class="i-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg></button>
<button class="nav-toggle" id="navtoggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="primary-nav"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
</div>
</div></header>
<main id="main">
${hero}
<section class="section"><div class="container content">${o.body}</div></section>
</main>
<footer class="site-footer"><div class="container">
<div class="footer-main">
<div class="footer-brand"><a class="footer-brand__lock" href="${PS}">${MARK}<span class="footer-brand__name">Product Scope</span></a>
<p>Product-led consultancy for digital products, automation and AI-assisted delivery.</p>
<p>This chart showcase is a free resource. Every number in it is made up. It sets no cookies and collects no personal data.</p></div>
<div class="footer-col"><h3>Product Scope</h3><ul>
<li><a href="${PS}/">Home</a></li><li><a href="${PS}/about/">About Product Scope</a></li><li><a href="${PS}/services/">Services</a></li><li><a href="${PS}/case-studies/">Case Studies</a></li><li><a href="${PS}/blog/">Articles</a></li><li><a href="${PS}/contact/">Contact</a></li><li><a href="${PS}/privacy-policy/">Privacy Policy</a></li><li><a href="${PS}/terms/">Terms</a></li></ul></div>
<div class="footer-col"><h3>Charts</h3><ul>
<li><a href="/">All charts</a></li><li><a href="/toolkit">Get the code</a></li><li><a href="https://github.com/DavidLortalPM/productscope-charts">Source on GitHub</a></li></ul></div>
</div>
<div class="footer-legal">
<span>&copy; ${new Date().getFullYear()} Product Scope Ltd. UK-registered consultancy working with clients remotely.</span>
<span>167-169 Great Portland Street, 5th Floor, London, W1W 5PF. Company No. 14373211</span>
<a class="footer-totop" href="#main">Back to top &uarr;</a>
</div>
</div></footer>
<script nonce="${o.nonce}">${SHOW_JS}
${o.script}</script></body></html>`;
}
