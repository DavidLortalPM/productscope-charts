// The few lines the chart script expects to find before it runs (a DOM builder, a currency formatter, month and date labels, a legend).
// Shown on the /toolkit page and written to toolkit/helpers.js by "npm run docs".
// This is a template literal: no backticks and no dollar-brace sequences inside.
export const HELPERS = `const h = (t, a = {}, ...k) => {            // tiny DOM builder
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
const fmtDate=s=>{const m=/^([0-9]{4})-([0-9]{2})-([0-9]{2})/.exec(s||'');return m?(+m[3])+' '+MON[+m[2]-1]+' '+m[1]:(s||'')};
const legend = items => h('div', { class: 'legend' }, items.map(i => h('span', {}, h('i', { class: 'sw', style: 'background:' + i.colour }), i.name))); // [{ name, colour }]`;
