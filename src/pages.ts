// One entry per chart page. Every script is a plain template literal that runs in the browser after SHOW_JS
// (so h, demo, the chart functions and the made-up data are in scope): no backticks, no dollar-brace sequences.
// All numbers are generated from a seeded random generator in shell.ts: nothing here is real data.

import { USAGE_PAGES } from "./pages-usage";

export interface Page {
  path: string;
  name: string;
  title: string;
  tag: string; // one line for the index card
  when: string;
  keys: string; // keyboard / hover hint
  opts: [string, string][];
  snippet: string;
  script: string;
}

const KEYS_COLS = "Focus the chart with Tab, then use ← → Home End to move between columns; Esc closes the tooltip. On a phone, touch a column.";

export const PAGES: Page[] = [
  // ------------------------------------------------------------------ line
  {
    path: "/line", name: "Line", title: "Line and area chart",
    tag: "One or a few series over time, with a typical-value line and an optional comparison.",
    when: "Use it to show how one measure moves over time and to spot the odd month. Cap the axis when one outlier would flatten everything else; the ▲ label still tells the truth.",
    keys: KEYS_COLS,
    opts: [
      ["xs", "Array of x values (strings). Any length, including 0 or 1."],
      ["series", "[{ name, values, colour, area, dash, width, faint, points }]. A null value leaves a gap."],
      ["cap", "Clip the y-axis here. Values above it are drawn at the top with a ▲ and their real value."],
      ["threshold", "{ value, label }: a dashed reference line, e.g. the typical month."],
      ["xlabel", "(x, i, isTooltip) => string. Short label for the axis, long label for the tooltip."],
      ["yfmt / tipfmt", "Number formatters for the axis and the tooltip."],
      ["yMin, height, maxLabels", "Axis floor, pixel-ish height, and how many x labels to show at most."],
      ["label / empty", "aria-label for screen readers; text shown when there is no data."],
    ],
    snippet: String.raw`const chart = lineChart({
  xs: months,                              // ['2025-04', '2025-05', ...]
  xlabel: (m, i, isTooltip) => monthName(m),
  series: [
    { name: 'Spend', values: spend, colour: 'var(--c1)', area: true },
    { name: 'Same month last year', values: lastYear,
      colour: 'var(--muted)', dash: '2 4', width: 1.5, faint: true }
  ],
  cap: 3600,                               // clip the axis, label the outlier with a ▲
  threshold: { value: 2310, label: 'typical month £2.3k' },
  yfmt: v => compact(v),                   // axis labels
  label: 'Monthly spend',                  // aria-label
  empty: 'No spending in this range'
});
document.querySelector('#host').append(chart);`,
    script: String.raw`
const med=median(TOTAL),r=rng(5),PREV=TOTAL.map(v=>Math.round(Math.min(v,3300)*(0.8+r()*0.22)));
const peak=TOTAL.indexOf(Math.max(...TOTAL));
demo({
  states:[['normal','Normal'],['one','One point'],['empty','Empty']],
  toggles:[{id:'cap',label:'Cap the axis (▲)',on:true},{id:'cmp',label:'Compare with last year'},{id:'thr',label:'Typical-month line',on:true},{id:'area',label:'Area fill',on:true}],
  patterns:true,
  draw:S=>{const n=S.data==='empty'?0:S.data==='one'?1:MONTHS.length;
    const series=[{name:'Spend',values:TOTAL.slice(0,n),colour:'var(--c1)',area:S.area}];
    if(S.cmp)series.push({name:'Same month last year',values:PREV.slice(0,n),colour:'var(--muted)',dash:'2 4',width:1.5,faint:true});
    return lineChart({xs:MONTHS.slice(0,n),xlabel:(m,i,tip)=>monthName(m),series:series,cap:S.cap?3600:null,threshold:S.thr&&n>3?{value:med,label:'typical month '+compact(med)}:null,label:'Monthly spend, April 2025 to September 2026',empty:'No spending in this range'})},
  legend:S=>S.cmp&&S.data==='normal'?legend([{name:'Spend',colour:'var(--c1)'},{name:'Same month last year',colour:'var(--muted)'}]):null,
  table:S=>{const n=S.data==='empty'?0:S.data==='one'?1:MONTHS.length;return{caption:'Monthly spend (made-up numbers)',head:S.cmp?['Month','Spend','Same month last year']:['Month','Spend'],rows:MONTHS.slice(0,n).map((m,i)=>S.cmp?[monthName(m),gbp(TOTAL[i]),gbp(PREV[i])]:[monthName(m),gbp(TOTAL[i])])}},
  note:S=>S.data!=='normal'?(S.data==='empty'?'Empty state: a plain sentence instead of an empty plot.':'One point: drawn as a single dot, centred, with its tooltip.'):(S.cap?monthName(MONTHS[peak])+' ('+gbp(TOTAL[peak])+') runs off the capped axis, so it gets a ▲ and its real value.':'Without a cap, '+monthName(MONTHS[peak])+' flattens every other month.')
});`,
  },
  // ------------------------------------------------------------------ bars
  {
    path: "/bars", name: "Grouped bars", title: "Grouped bars with a line overlay",
    tag: "Compare two measures side by side per period, with a derived line on top.",
    when: "Use it to compare two things per period (money in against money out) and show a third derived number, such as the difference, as a line. Columns are clickable for drill-down.",
    keys: KEYS_COLS,
    opts: [
      ["cats", "Array of category labels, one per column group."],
      ["series", "[{ name, values, colour }]. In grouped mode each series gets its own bar."],
      ["mode", "'grouped' or 'stacked' (the default). See the stacked page."],
      ["lines", "[{ name, values, colour }] drawn over the bars; may go below zero."],
      ["cap", "Clip the axis. Bars above it get a zig-zag break and a ▲ label."],
      ["onClick", "(index) => void. Makes each column a click target."],
      ["totals", "false hides the value above each column (shown automatically for up to 14 columns)."],
      ["xlabel", "(category, isTooltip) => string. Called with one argument for the axis label and with true as the second for the tooltip. Note this differs from the line chart, whose second argument is the index."],
      ["tipfmt, yfmt, height", "Formatters for the tooltip and the axis, and the height. The defaults format pounds, so pass your own for counts or another currency."],
    ],
    snippet: String.raw`const chart = barChart({
  cats: months,
  xlabel: monthName,
  mode: 'grouped',
  series: [
    { name: 'Money in',  colour: 'var(--c3)', values: income },
    { name: 'Spending',  colour: 'var(--c2)', values: spending }
  ],
  lines: [{ name: 'Saved', colour: 'var(--ink)', values: saved }],
  cap: 4200,                       // bars above this get a break and a ▲ label
  onClick: i => openMonth(months[i]),
  label: 'Money in, spending and saved by month'
});`,
    script: String.raw`
const r=rng(21),INC=MONTHS.map((m,i)=>Math.round(3050+r()*140+(i===8?3400:0)+(i>=9?180:0))),SAVED=INC.map((v,i)=>v-TOTAL[i]);
demo({
  states:[['normal','Normal'],['one','One point'],['empty','Empty']],
  toggles:[{id:'cap',label:'Cap the axis (▲)',on:true},{id:'saved',label:'Saved line',on:true},{id:'short',label:'Last 12 months'}],
  patterns:true,
  draw:S=>{let off=S.short?MONTHS.length-12:0,n=S.data==='empty'?0:S.data==='one'?1:MONTHS.length-off;
    const sl=a=>a.slice(off,off+n),cats=sl(MONTHS);
    return barChart({cats:cats,xlabel:monthName,mode:'grouped',series:[{name:'Money in',colour:'var(--c3)',values:sl(INC)},{name:'Spending',colour:'var(--c2)',values:sl(TOTAL)}],lines:S.saved?[{name:'Saved',colour:'var(--ink)',values:sl(SAVED)}]:[],cap:S.cap?4200:null,onClick:i=>say(monthName(cats[i])+': in '+gbp(sl(INC)[i])+', out '+gbp(sl(TOTAL)[i])+', saved '+gbp(sl(SAVED)[i])+'. (This is where your app would open that month.)'),label:'Money in, spending and saved by month'})},
  legend:S=>S.data==='normal'?legend([{name:'Money in',colour:'var(--c3)'},{name:'Spending',colour:'var(--c2)'}].concat(S.saved?[{name:'Saved',colour:'var(--ink)'}]:[])):null,
  table:S=>{const off=S.short?MONTHS.length-12:0,n=S.data==='empty'?0:S.data==='one'?1:MONTHS.length-off;return{caption:'Money in, spending and saved (made-up numbers)',head:['Month','Money in','Spending','Saved'],rows:MONTHS.slice(off,off+n).map((m,k)=>[monthName(m),gbp(INC[off+k]),gbp(TOTAL[off+k]),gbp(SAVED[off+k])])}},
  note:S=>S.data==='normal'?'Click a column: the chart reports the click here, an app would navigate. December is clipped by the cap and marked with ▲.':''
});`,
  },
  // ------------------------------------------------------------------ stacked
  {
    path: "/stacked", name: "Stacked", title: "Stacked columns",
    tag: "Parts of a whole per period, one stable colour per category.",
    when: "Use it to show what a total is made of and how that mix changes over time. Keep to eight categories or fewer and let a grey Other absorb the rest.",
    keys: KEYS_COLS,
    opts: [
      ["cats / series / xlabel", "As the grouped chart (including xlabel(category, isTooltip)). Series stack in the order given, first at the bottom."],
      ["tipfmt, yfmt", "Formatters for the tooltip and the axis. The defaults format pounds, so pass your own for counts."],
      ["colour", "Use catColor(name) so a category is the same colour on every chart. setCategoryOrder(names) fixes the order once."],
      ["cap", "Clip the axis; tall stacks get a break and a ▲ total."],
      ["onClick", "(index) => void for drill-down."],
      ["setPatterns(true)", "Switches every fill to colour plus texture (call before drawing)."],
    ],
    snippet: String.raw`setCategoryOrder(['Groceries', 'Housing', 'Eating out', 'Transport', 'Travel', 'Leisure', 'Health']);

const chart = barChart({
  cats: months,
  xlabel: monthName,
  series: categories.map(name => ({
    name,
    colour: catColor(name),        // stable per name; unknown names fall back to grey
    values: byCategory[name]
  })),
  cap: 4200,
  onClick: i => openMonth(months[i]),
  label: 'Spending by category and month'
});
document.querySelector('#host').append(chart, legend(categories.map(n => ({ name: n, colour: catColor(n) }))));`,
    script: String.raw`
demo({
  states:[['normal','Normal'],['one','One point'],['empty','Empty']],
  toggles:[{id:'cap',label:'Cap the axis (▲)',on:true},{id:'noh',label:'Hide Housing'},{id:'short',label:'Last 12 months'}],
  patterns:true,
  draw:S=>{const off=S.short?MONTHS.length-12:0,n=S.data==='empty'?0:S.data==='one'?1:MONTHS.length-off,cats=MONTHS.slice(off,off+n);
    const series=CATS.map((c,k)=>({name:c,colour:catColourOf(c),values:SP[k].slice(off,off+n)})).filter(s=>!(S.noh&&s.name==='Housing'));
    return barChart({cats:cats,xlabel:monthName,series:series,cap:S.cap?(S.noh?2600:4200):null,onClick:i=>say(monthName(cats[i])+' total '+gbp(sum(series.map(s=>s.values[i])))+'. (An app would open that month.)'),label:'Spending by category and month'})},
  legend:S=>S.data==='empty'?null:legend(CATS.filter(c=>!(S.noh&&c==='Housing')).map(c=>({name:c,colour:catColourOf(c)}))),
  table:S=>{const off=S.short?MONTHS.length-12:0,n=S.data==='empty'?0:S.data==='one'?1:MONTHS.length-off,cs=CATS.filter(c=>!(S.noh&&c==='Housing'));return{caption:'Spending by category and month (made-up numbers)',head:['Month'].concat(cs,['Total']),rows:MONTHS.slice(off,off+n).map((m,k)=>[monthName(m)].concat(cs.map(c=>gbp(SP[CATS.indexOf(c)][off+k])),[gbp(sum(cs.map(c=>SP[CATS.indexOf(c)][off+k])))]))}},
  note:S=>S.data==='normal'?'Try Hide Housing: every other category keeps its colour (colour follows the category, never its rank).':''
});`,
  },
  // ------------------------------------------------------------------ donut
  {
    path: "/donut", name: "Donut", title: "Donut",
    tag: "Share of a total, with the hovered slice read out in the centre.",
    when: "Use it for a handful of parts that add up to one whole, when the share matters more than the exact amounts. Fold small slices into Other; more than six or seven slices want a bar list or treemap instead.",
    keys: "Tab through the slices; each announces its name, amount and share. Hover or focus a slice to read its share in the centre.",
    opts: [
      ["parts", "[{ name, value, colour }]. Order is drawn clockwise from 12 o'clock."],
      ["centre", "{ value, label } shown in the hole until a slice is hovered or focused."],
      ["size", "Pixel size of the square (default 220)."],
      ["fmt", "Formatter for the aria-label of each slice."],
      ["onClick", "(part) => void."],
    ],
    snippet: String.raw`const chart = donut({
  parts: [
    { name: 'Housing',   value: 1210, colour: catColor('Housing') },
    { name: 'Groceries', value: 438,  colour: catColor('Groceries') },
    { name: 'Other',     value: 164,  colour: 'var(--c9)' }
  ],
  centre: { value: '£1,812', label: 'September' },
  size: 240,
  onClick: part => openCategory(part.name),
  label: 'Spending by category, September'
});`,
    script: String.raw`
const IDX=MONTHS.length-1;
demo({
  states:[['normal','Normal'],['one','One part'],['empty','Empty']],
  toggles:[{id:'fold',label:'Group slices under 6% into Other',on:true}],
  patterns:true,
  draw:S=>{let parts=CATS.map((c,k)=>({name:c,value:SP[k][IDX],colour:catColourOf(c)})).filter(p=>p.value>0);
    if(S.data==='empty')parts=[];else if(S.data==='one')parts=parts.slice(0,1);
    else if(S.fold){const t=sum(parts.map(p=>p.value));let o=0;parts=parts.filter(p=>{if(p.name!=='Other'&&p.value/t<.06){o+=p.value;return false}return true});const e=parts.find(p=>p.name==='Other');if(e)e.value+=o;else if(o)parts.push({name:'Other',value:o,colour:GREY})}
    const t=sum(parts.map(p=>p.value));
    const d=donut({parts:parts,centre:{value:gbp(t),label:'September'},size:240,onClick:p=>say(p.name+': '+gbp(p.value)+' ('+pct(p.value,t)+'). An app would open that category.'),label:'Spending by category, September 2026'});
    if(!t)return d;
    return h('div',{class:'donutrow'},d,h('div',{class:'legend'},parts.map(p=>h('span',{},h('i',{class:'sw',style:'background:'+p.colour}),p.name,h('span',{class:'pct'},pct(p.value,t)+' · '+gbp(p.value))))))},
  table:S=>{let ps=CATS.map((c,k)=>[c,SP[k][IDX]]);if(S.data==='empty')ps=[];else if(S.data==='one')ps=ps.slice(0,1);const t=sum(ps.map(p=>p[1]));return{caption:'Spending by category, September 2026 (made-up numbers)',head:['Category','Amount','Share'],rows:ps.map(p=>[p[0],gbp(p[1]),pct(p[1],t)])}},
  note:S=>S.data==='normal'?'Hover, tap or Tab to a slice to see its share in the middle.':''
});`,
  },
  // ------------------------------------------------------------------ heatmap
  {
    path: "/heatmap", name: "Heatmap", title: "Heatmap",
    tag: "A grid of rows against columns, shaded by value, with clear no-data cells.",
    when: "Use it to spot patterns across two dimensions, such as category against month. Shade each row on its own scale when rows differ in size and you care about shape.",
    keys: "Tab to a cell to read its value; click or Enter to drill down. The grid scrolls sideways on a phone.",
    opts: [
      ["rows / cols", "Arrays of labels. cols can be formatted with collabel."],
      ["matrix", "matrix[row][col] numbers. null means no data (drawn as an empty cell, not zero)."],
      ["norm", "'row' scales each row to its own maximum; anything else uses one global scale."],
      ["showValues", "Prints compact values inside dark cells when they are wide enough."],
      ["fmt / unit", "Value formatter and the label used in the tooltip."],
      ["onClick", "(rowIndex, colIndex) => void."],
    ],
    snippet: String.raw`const chart = heatmap({
  rows: ['Groceries', 'Housing', 'Eating out'],
  cols: months,                    // ['2025-10', '2025-11', ...]
  collabel: monthName,
  matrix: [
    [412, 389, 455, /* ... */],
    [1150, 1150, 1210, /* ... */],
    [188, null, 301, /* ... null = no data */]
  ],
  norm: 'row',                     // each row on its own scale
  showValues: true,
  fmt: v => '£' + Math.round(v),
  onClick: (r, c) => openCell(r, c),
  label: 'Spending by category and month'
});`,
    script: String.raw`
const COLS=MONTHS.slice(-12),ROWS=CATS.slice(0,7);
demo({
  states:[['normal','Normal'],['one','One cell'],['empty','Empty']],
  toggles:[{id:'row',label:'Scale each row on its own'},{id:'vals',label:'Show values'},{id:'gaps',label:'Some missing data'}],
  draw:S=>{let rows=ROWS,cols=COLS,m=ROWS.map((c,k)=>SP[CATS.indexOf(c)].slice(-12));
    if(S.gaps){m=m.map((r,i)=>r.map((v,j)=>(i*5+j*3)%11===0?null:v))}
    if(S.data==='empty'){rows=[];cols=[];m=[]}else if(S.data==='one'){rows=rows.slice(0,1);cols=cols.slice(0,1);m=[[m[0][0]]]}
    return heatmap({rows:rows,cols:cols,collabel:monthName,matrix:m,norm:S.row?'row':'global',showValues:S.vals,fmt:gbp,unit:'Spend',onClick:(i,j)=>say(rows[i]+', '+monthName(cols[j])+': '+(m[i][j]==null?'no data':gbp(m[i][j]))+'. (An app would open these transactions.)'),label:'Spending by category and month'})},
  table:S=>({caption:'Spending by category and month (made-up numbers)',head:['Category'].concat(COLS.map(monthName)),rows:ROWS.map((c,i)=>[c].concat(SP[CATS.indexOf(c)].slice(-12).map(v=>gbp(v))))}),
  note:S=>S.data==='normal'?'Stronger colour means more. Housing is strongest all year and quiet rows stay pale; turn on row scaling to see each category on its own scale instead.':''
});`,
  },
  // ------------------------------------------------------------------ calendar
  {
    path: "/calendar", name: "Calendar", title: "Calendar heatmap",
    tag: "One cell per day, laid out in weeks, to show rhythm and one-off spikes.",
    when: "Use it for daily values over months, when weekday habits and single heavy days are the story. Shading is clipped at the 95th percentile so one huge day does not wash out the rest.",
    keys: "Hover a day for its date and value; click to drill down. The calendar scrolls sideways on a phone.",
    opts: [
      ["days", "A Map of 'YYYY-MM-DD' to number. Missing days inside the range count as zero."],
      ["onClick", "(dateString) => void."],
      ["label", "aria-label for the whole graphic."],
    ],
    snippet: String.raw`const days = new Map([
  ['2026-01-01', 42.5],
  ['2026-01-02', 0],
  ['2026-01-03', 118.9]
  // ... one entry per day
]);

const chart = calendar({
  days,
  onClick: date => openDay(date),   // 'YYYY-MM-DD'
  label: 'Daily spending calendar'
});`,
    script: String.raw`
const DAYS=new Map();{const r=rng(31);for(let t=Date.UTC(2026,0,1);t<=Date.UTC(2026,8,30);t+=864e5){const d=new Date(t),wd=(d.getUTCDay()+6)%7;let v=r()<.16?0:(14+r()*34)*(wd>=5?2.1:1)*(wd===4?1.4:1);if(d.getUTCDate()===1)v+=1150;DAYS.set(d.toISOString().slice(0,10),Math.round(v))}}
const KEYS=[...DAYS.keys()];
demo({
  states:[['normal','Normal'],['empty','Empty']],
  toggles:[{id:'short',label:'Last 90 days'},{id:'spike',label:'Add a £1,400 one-off day'}],
  draw:S=>{let ks=S.short?KEYS.slice(-90):KEYS;const m=new Map(ks.map(k=>[k,DAYS.get(k)]));if(S.spike&&ks.length)m.set(ks[Math.floor(ks.length/2)],1400);if(S.data==='empty')m.clear();
    return calendar({days:m,onClick:k=>say(k+': '+gbp(m.get(k)||0)+'. (An app would open that day.)'),label:'Daily spending, 2026'})},
  table:S=>{const ks=S.short?KEYS.slice(-90):KEYS;const wk=new Map();for(const k of (S.data==='empty'?[]:ks)){const d=new Date(k+'T00:00:00Z'),wd=(d.getUTCDay()+6)%7,mon=new Date(d.getTime()-wd*864e5).toISOString().slice(0,10);if(!wk.has(mon))wk.set(mon,[null,null,null,null,null,null,null]);wk.get(mon)[wd]=DAYS.get(k)}
    return{caption:'Spend per day, by week (made-up numbers)',head:['Week starting','Mon','Tue','Wed','Thu','Fri','Sat','Sun'],rows:[...wk.entries()].map(([w,a])=>[w].concat(a.map(v=>v==null?'':gbp(v))))}},
  note:S=>S.data==='normal'?'Weekends and the 1st of the month (rent) stand out. Add the one-off day: it takes the darkest shade without bleaching the others.':''
});`,
  },
  // ------------------------------------------------------------------ treemap
  {
    path: "/treemap", name: "Treemap", title: "Treemap",
    tag: "Area proportional to value, packed into a rectangle.",
    when: "Use it to show how a whole divides across many categories at once, when you want to see the big pieces at a glance. Small blocks lose their labels but stay hoverable and keyboard-focusable.",
    keys: "Tab through the blocks; hover or focus for amount and share. Labels appear only where a block is big enough.",
    opts: [
      ["items", "[{ label, value, colour }]. Zero and negative values are dropped; sorted largest first."],
      ["height", "Chart height (width follows the container)."],
      ["onClick", "(item) => void."],
      ["setPatterns(true)", "Adds a texture per block so colour is not the only cue."],
    ],
    snippet: String.raw`const chart = treemap({
  items: [
    { label: 'Housing',   value: 13850, colour: catColor('Housing') },
    { label: 'Groceries', value: 5120,  colour: catColor('Groceries') },
    { label: 'Travel',    value: 4710,  colour: catColor('Travel') }
  ],
  height: 340,
  onClick: item => openCategory(item.label),
  label: 'Spending by category, last 12 months'
});`,
    script: String.raw`
const T12=CATS.map((c,k)=>({label:c,value:sum(SP[k].slice(-12)),colour:catColourOf(c)}));
demo({
  states:[['normal','Normal'],['one','One block'],['empty','Empty']],
  toggles:[{id:'top',label:'Top 5 only'}],
  patterns:true,
  draw:S=>{let it=T12.slice();if(S.top)it=it.sort((a,b)=>b.value-a.value).slice(0,5);if(S.data==='empty')it=[];else if(S.data==='one')it=it.slice(0,1);
    return treemap({items:it,height:340,onClick:i=>say(i.label+': '+gbp(i.value)+'. An app would open that category.'),label:'Spending by category, last 12 months'})},
  table:S=>{let it=T12.slice().sort((a,b)=>b.value-a.value);if(S.top)it=it.slice(0,5);if(S.data==='empty')it=[];else if(S.data==='one')it=it.slice(0,1);const t=sum(it.map(i=>i.value));return{caption:'Spending by category, last 12 months (made-up numbers)',head:['Category','Spend','Share'],rows:it.map(i=>[i.label,gbp(i.value),pct(i.value,t)])}},
  note:S=>S.data==='normal'?'Small blocks (Health, Transport) have no label. Hover or Tab to them for the number.':''
});`,
  },
  // ------------------------------------------------------------------ sparkline
  {
    path: "/sparkline", name: "Sparkline", title: "Sparkline",
    tag: "A tiny trend with no axes, for tables, tiles and lists.",
    when: "Use it beside a number to show direction at a glance. It has no scale on purpose, so always print the figure next to it and never use it to compare exact values.",
    keys: "Sparklines are labelled images with a plain-English summary for screen readers; the number beside them is the data.",
    opts: [
      ["values", "Array of numbers. Fewer than 2 draws nothing (a dash for none)."],
      ["w, h", "Size in SVG units (default 120 × 32)."],
      ["bars", "true draws columns, with the latest one highlighted."],
      ["fluid", "true makes the svg 100% wide (set w to the width you expect)."],
      ["label", "aria-label, e.g. a sentence describing the trend."],
    ],
    snippet: String.raw`row.append(
  spark(values, {
    w: 120, h: 32,
    label: 'Groceries over 12 months, from £402 to £455'
  })
);

// columns instead of a line, wider
spark(values, { w: 260, h: 40, bars: true, label: '...' });`,
    script: String.raw`
const L12=ROWS_F();function ROWS_F(){return CATS.slice(0,7).map(c=>({c:c,v:SP[CATS.indexOf(c)].slice(-12)}))}
demo({
  states:[['normal','Normal'],['one','One point'],['empty','Empty']],
  segs:[{id:'size',label:'Size',opts:[['s','Small'],['m','Wide']],init:'s'}],
  toggles:[{id:'bars',label:'Columns instead of a line'}],
  draw:S=>h('div',{role:'list'},L12.map(r=>{const v=S.data==='empty'?[]:S.data==='one'?r.v.slice(0,1):r.v,w=S.size==='m'?260:120,hh=S.size==='m'?40:32;
    return h('div',{class:'sprow',role:'listitem'},h('span',{},r.c),h('span',{},spark(v,{w:w,h:hh,bars:S.bars,label:r.c+' over 12 months, from '+gbp(r.v[0])+' to '+gbp(r.v[11])})),h('span',{class:'v'},v.length?gbp(v[v.length-1]):'-'))})),
  table:S=>({caption:'Spend per category: first and latest month of the 12 (made-up numbers)',head:['Category','12 months ago','Latest','Change'],rows:L12.map(r=>[r.c,gbp(r.v[0]),gbp(r.v[11]),(r.v[11]>=r.v[0]?'+':'-')+Math.round(Math.abs(r.v[11]/r.v[0]-1)*100)+'%'])}),
  note:S=>S.data==='normal'?'No axes, so each sparkline is scaled to its own range and is baseline-anchored at zero. The printed number carries the precision.':''
});`,
  },
  // ------------------------------------------------------------------ gauge
  {
    path: "/gauge", name: "Gauge", title: "Gauge bar against a target",
    tag: "Progress against a budget or limit, with the state spelled out in words.",
    when: "Use it for one value against one target: a budget, a quota, a limit. State is shown by colour and by the words on the right, so it never relies on colour alone.",
    keys: "Each row has a tooltip title with the exact amounts; the words beside the bar carry the status.",
    opts: [
      ["label", "Name shown on the left (and in the tooltip)."],
      ["value", "What has been used so far."],
      ["target", "The budget or limit. Used above 85% shows 'nearly'; above 100% shows 'over' and a marker at the target."],
    ],
    snippet: String.raw`container.append(
  gauge({ label: 'Groceries',  value: 520, target: 600 }),   // on track
  gauge({ label: 'Transport',  value: 195, target: 200 }),   // nearly
  gauge({ label: 'Eating out', value: 340, target: 250 })    // over: bar full, marker at the target
);`,
    script: String.raw`
const BUD=[['Groceries',520,600],['Eating out',340,250],['Travel',160,300],['Transport',195,200],['Leisure',90,150],['Health',20,100]];
const stat=(v,t)=>v>t?'over':v/t>=.85?'nearly':'on track';
demo({
  states:[['normal','Normal'],['one','One budget'],['empty','Empty']],
  segs:[{id:'k',label:'Spending',opts:[['0.8','80%'],['1','As is'],['1.25','125%']],init:'1'}],
  draw:S=>{if(S.data==='empty')return h('div',{class:'note'},'No budgets set yet');const k=+S.k;let b=BUD;if(S.data==='one')b=b.slice(0,1);
    return h('div',{},b.map(x=>gauge({label:x[0],value:Math.round(x[1]*k),target:x[2]})))},
  table:S=>{const k=+S.k;let b=S.data==='empty'?[]:S.data==='one'?BUD.slice(0,1):BUD;return{caption:'Budgets (made-up numbers)',head:['Budget','Spent','Target','Used','Status'],rows:b.map(x=>[x[0],gbp(x[1]*k),gbp(x[2]),Math.round(x[1]*k/x[2]*100)+'%',stat(x[1]*k,x[2])])}},
  note:S=>S.data==='normal'?'Change the spending level: bars turn green, amber ("nearly") or red ("over", with a marker where the target was), and the words change too.':''
});`,
  },
  // ------------------------------------------------------------------ waterfall
  {
    path: "/waterfall", name: "Waterfall", title: "Waterfall",
    tag: "How a starting number becomes an ending number, step by step.",
    when: "Use it to explain a change: opening balance, what came in, what went out, closing balance. Totals stand on the baseline; changes float and connect with a dashed rule.",
    keys: "Hover a bar for its amount. Labels alternate in height on narrow screens so they do not collide.",
    opts: [
      ["steps", "[{ label, value, total?, colour? }]. value > 0 adds, value < 0 subtracts; total: true restarts from zero at that value."],
      ["height", "Chart height."],
      ["label", "aria-label."],
    ],
    snippet: String.raw`const chart = waterfall({
  steps: [
    { label: 'Start',     value: 4200, total: true },
    { label: 'Salary',    value: 3100 },
    { label: 'Housing',   value: -1210 },
    { label: 'Groceries', value: -438 },
    { label: 'End',       value: 5652, total: true }
  ],
  height: 300,
  label: 'How the balance changed in September'
});`,
    script: String.raw`
function steps(low){const open=low?500:4200,ch=[['Salary',3100],['Side gigs',450],['Housing',-1210],['Groceries',-438],['Eating out',-264],['Travel',-160],['Other',-420]];
  let run=open;ch.forEach(c=>{run+=c[1]});return[{label:'Start',value:open,total:true}].concat(ch.map(c=>({label:c[0],value:c[1]})),[{label:'End',value:run,total:true}])}
demo({
  states:[['normal','Normal'],['one','One step'],['empty','Empty']],
  toggles:[{id:'low',label:'Start with a low balance'}],
  draw:S=>{let st=steps(S.low);if(S.data==='empty')st=[];else if(S.data==='one')st=st.slice(0,1);return waterfall({steps:st,height:300,label:'How the balance changed in September'})},
  table:S=>{let st=steps(S.low);if(S.data==='empty')st=[];else if(S.data==='one')st=st.slice(0,1);let run=0;return{caption:'Balance walk (made-up numbers)',head:['Step','Change','Running balance'],rows:st.map(s=>{run=s.total?s.value:run+s.value;return[s.label,s.total?'-':(s.value>=0?'+':'')+gbp(s.value),gbp(run)]})}},
  note:S=>S.data==='normal'?(S.low?'With a low start the balance ends below zero, so the End bar turns red and hangs under the baseline.':'Green steps add, orange steps take away; first and last bars are totals.'):''
});`,
  },
  // ------------------------------------------------------------------ flow
  {
    path: "/flow", name: "Flow", title: "Flow (sources to uses)",
    tag: "Where money comes from and where it goes, as proportional ribbons.",
    when: "Use it to show the shape of a budget: income sources on the left, spending categories on the right. Each source is split across the uses in proportion, so it shows mix, not exact routing.",
    keys: "The chart is a labelled picture; the table view lists every source and use with amounts.",
    opts: [
      ["left", "[{ label, value }] sources (drawn green)."],
      ["right", "[{ label, value, colour }] uses; the colour tints the ribbons."],
      ["height", "Chart height. Width and label space follow the container."],
      ["label", "aria-label. If either side is empty the chart shows a short sentence instead."],
    ],
    snippet: String.raw`const chart = flow({
  left: [
    { label: 'Salary',    value: 3100 },
    { label: 'Side gigs', value: 450 }
  ],
  right: [
    { label: 'Housing',   value: 1210, colour: catColor('Housing') },
    { label: 'Groceries', value: 438,  colour: catColor('Groceries') },
    { label: 'Saved',     value: 1900, colour: 'var(--c9)' }
  ],
  height: 340,
  label: 'Where September money went'
});`,
    script: String.raw`
const SRC=[['Salary',3100],['Side gigs',450],['Interest',38]];
function uses(more){const k=more?1.5:1,u=CATS.map((c,i)=>({label:c,value:Math.round(SP[i][MONTHS.length-1]*k),colour:catColourOf(c)}));const sp=sum(u.map(x=>x.value)),inc=sum(SRC.map(s=>s[1]));if(inc>sp)u.push({label:'Saved',value:inc-sp,colour:'var(--c9)'});return u}
demo({
  states:[['normal','Normal'],['one','One source, one use'],['empty','Empty']],
  toggles:[{id:'more',label:'Spend 50% more (no savings left)'}],
  draw:S=>{let l=SRC.map(s=>({label:s[0],value:s[1]})),r=uses(S.more);if(S.data==='empty'){l=[];r=[]}else if(S.data==='one'){l=l.slice(0,1);r=r.slice(0,1)}
    return flow({left:l,right:r,height:340,label:'Where September money went'})},
  table:S=>{let l=SRC.map(s=>[ 'Money in: '+s[0],gbp(s[1])]),r=uses(S.more).map(x=>['Money out: '+x.label,gbp(x.value)]);if(S.data==='empty'){l=[];r=[]}else if(S.data==='one'){l=l.slice(0,1);r=r.slice(0,1)}return{caption:'Sources and uses, September (made-up numbers)',head:['Item','Amount'],rows:l.concat(r)}},
  note:S=>S.data==='normal'?'Heights are scaled to the larger side, so when spending exceeds income the left column is shorter.':''
});`,
  },
  // ------------------------------------------------------------------ hbars
  {
    path: "/hbars", name: "Ranked bars", title: "Ranked horizontal bars",
    tag: "A top-N list with a bar per row, a detail line and optional click-through.",
    when: "Use it for rankings with long labels (merchants, products, people) where columns would force tiny rotated text. It is plain HTML, so it wraps, selects and reads naturally.",
    keys: "When rows are clickable they are keyboard-focusable: Tab to a row and press Enter.",
    opts: [
      ["items", "[{ label, value, sub?, tag?, colour?, onClick? }]. Sorted by you; bars scale to the largest."],
      ["fmt", "Value formatter (default money0)."],
      ["empty", "Text for the empty state."],
    ],
    snippet: String.raw`container.append(
  hbars([
    { label: 'Greenleaf Market', value: 612, sub: '14 payments, average £44',
      colour: catColor('Groceries'), onClick: () => openMerchant('Greenleaf Market') },
    { label: 'Northline Rail',   value: 388, sub: '9 payments', tag: '▲ 12%',
      colour: catColor('Transport') }
  ], { fmt: v => '£' + Math.round(v), empty: 'No merchants yet' })
);`,
    script: String.raw`
const MER=[['Greenleaf Market',612,'Groceries','14 payments, average £44','▲ 8%'],['Northline Rail',388,'Transport','9 payments, average £43','▲ 12%'],['Corner Café',301,'Eating out','31 payments, average £10','▼ 5%'],['Brightwater Energy',244,'Housing','1 payment a month','—'],['Skybound Air',236,'Travel','2 payments, average £118','new'],['Harbour Books',142,'Leisure','6 payments, average £24','▲ 30%'],['Pixel Stream',96,'Leisure','Subscription','—'],['Meadow Pharmacy',74,'Health','5 payments, average £15','▼ 14%'],['Fit Studio',60,'Health','Subscription','—']];
demo({
  states:[['normal','Normal'],['one','One row'],['empty','Empty']],
  toggles:[{id:'top',label:'Top 5 only'},{id:'col',label:'Colour by category',on:true},{id:'sub',label:'Detail line',on:true}],
  draw:S=>{let m=MER;if(S.top)m=m.slice(0,5);if(S.data==='empty')m=[];else if(S.data==='one')m=m.slice(0,1);
    return hbars(m.map(x=>({label:x[0],value:x[1],sub:S.sub?x[3]:null,tag:x[4]==='—'?null:x[4],colour:S.col?catColourOf(x[2]):'var(--accent)',onClick:()=>say(x[0]+': '+gbp(x[1])+'. An app would open that merchant.')})),{empty:'No merchants in this range'})},
  table:S=>{let m=MER;if(S.top)m=m.slice(0,5);if(S.data==='empty')m=[];else if(S.data==='one')m=m.slice(0,1);return{caption:'Top merchants (made-up names and numbers)',head:['Merchant','Spent','Category','Detail'],rows:m.map(x=>[x[0],gbp(x[1]),x[2],x[3]])}},
  note:S=>S.data==='normal'?'Click a row, or Tab to it and press Enter. The tag is optional and always printed as text, never colour alone.':''
});`,
  },
  // ------------------------------------------------------------------ small multiples
  {
    path: "/small-multiples", name: "Small multiples", title: "Small multiples",
    tag: "One mini chart per category on a shared layout, with a detail chart for the one you pick.",
    when: "Use it instead of one crowded multi-line chart, or whenever series have different scales. Each card keeps its own scale, so compare shapes, then click one to read the exact figures.",
    keys: "Cards are buttons: Tab to one and press Enter or Space to show it in the detail chart below.",
    opts: [
      ["grid", "A CSS grid of .sm cards (auto-fill, minimum 180px) so it reflows from 1 column to many."],
      ["card", "Name, latest value, and spark(values, { w: 150, h: 36 }) in a <button class='c'> with aria-pressed."],
      ["detail", "A lineChart for the selected card, redrawn on click."],
    ],
    snippet: String.raw`const grid = h('div', { class: 'sm' }, categories.map(c =>
  h('button', { class: 'c', type: 'button', 'aria-pressed': String(c === selected),
      on: { click: () => select(c) } },
    h('span', { class: 'n' }, c),
    h('span', { class: 'v' }, money0(latest[c])),
    spark(series[c], { w: 150, h: 36, label: c + ' trend' }))));

detail.replaceChildren(lineChart({ xs: months, xlabel: monthName,
  series: [{ name: selected, values: series[selected], colour: catColor(selected), area: true }],
  height: 200 }));`,
    script: String.raw`
let SEL='Groceries';
demo({
  states:[['normal','Normal'],['one','One point'],['empty','Empty']],
  toggles:[{id:'bars',label:'Columns instead of lines'}],
  draw:S=>{const cs=S.data==='empty'?[]:CATS.slice(0,7);if(!cs.length)return h('div',{class:'note'},'No categories in this range');
    const vals=c=>{const v=SP[CATS.indexOf(c)];return S.data==='one'?v.slice(0,1):v};
    const wrap=h('div',{},h('div',{class:'sm'},cs.map(c=>h('button',{class:'c',type:'button','aria-pressed':String(c===SEL),on:{click:()=>{SEL=c;say('Showing '+c+' below.');redraw()}}},h('span',{class:'n'},c),h('span',{class:'v'},gbp(vals(c)[vals(c).length-1])+' latest'),spark(vals(c),{w:150,h:36,bars:S.bars,label:c+' trend'})))));
    const dv=vals(SEL);wrap.append(h('div',{style:'margin-top:16px'},h('div',{class:'tlabel'},SEL+' in detail'),lineChart({xs:MONTHS.slice(0,dv.length),xlabel:(m)=>monthName(m),series:[{name:SEL,values:dv,colour:catColourOf(SEL),area:true}],height:200,label:SEL+' by month'})));return wrap},
  table:S=>({caption:'Latest month against the 12-month average (made-up numbers)',head:['Category','Latest','12-month average','vs average'],rows:(S.data==='empty'?[]:CATS.slice(0,7)).map(c=>{const v=SP[CATS.indexOf(c)],l=v[v.length-1],a=sum(v.slice(-12))/12;return[c,gbp(l),gbp(a),(l>=a?'+':'-')+Math.round(Math.abs(l/a-1)*100)+'%']})}),
  note:S=>S.data==='normal'?'Click a card to change the detail chart. Each card has its own scale: compare shapes, not heights.':''
});`,
  },
  // ------------------------------------------------------------------ kpi tiles
  {
    path: "/kpi-tiles", name: "KPI tiles", title: "KPI tiles",
    tag: "Headline numbers with a change and a sparkline, plus a loading skeleton.",
    when: "Use them for the three to eight numbers someone should see first. Always pair the value with a change (arrow, size and period in words) and use the skeleton while data loads.",
    keys: "Tiles can be plain or links. Direction is shown with ▲/▼ and words; colour only says whether the change is good or bad.",
    opts: [
      [".kgrid", "A 4-column grid (2 on a phone) with 1px dividers. Children are .kt tiles."],
      [".kt", "Tile: .s label, .v value, .d change, optional spark(). Use <a class='kt'> for links."],
      [".d", "The change line. Colour by meaning with .good (green) or .bad (red). .up is red and .down is green, for measures where rising is bad such as cost. .flat is neutral grey: use it for a measure that is neither good nor bad, such as volume."],
      [".skel", "Shimmer placeholder while loading; respects prefers-reduced-motion."],
    ],
    snippet: String.raw`const tile = (label, value, delta, goodWhen, values) =>
  h('div', { class: 'kt' },
    h('span', { class: 's' }, label),
    h('span', { class: 'v' }, value),
    h('span', { class: 'd ' + (delta === 0 ? 'flat' : (delta > 0) === (goodWhen === 'up') ? 'good' : 'bad') },
      (delta > 0 ? '▲ ' : '▼ ') + Math.abs(delta) + '% vs last month'),
    spark(values, { w: 160, h: 30, label: label + ' trend' }));

grid.append(tile('Spent this month', '£2,310', 6, 'down', last6));

// loading state
h('div', { class: 'kt' }, h('div', { class: 'skel', style: 'height:1.4rem;width:60%' }));`,
    script: String.raw`
const mi=MONTHS.length-1;
const SAVEDV=MONTHS.map((m,i)=>3050+(i===8?3400:0)-TOTAL[i]);
const K=[
 {l:'Spent this month',v:gbp(TOTAL[mi]),d:Math.round((TOTAL[mi]/TOTAL[mi-1]-1)*100),good:'down',s:TOTAL.slice(-6),href:'/stacked'},
 {l:'Saved this month',v:gbp(SAVEDV[mi]),d:-9,good:'up',s:SAVEDV.slice(-6).map(x=>Math.max(x,0)),href:'/waterfall'},
 {l:'Eating out',v:gbp(SP[2][mi]),d:-14,good:'down',s:SP[2].slice(-6),href:'/hbars'},
 {l:'Groceries',v:gbp(SP[0][mi]),d:3,good:'down',s:SP[0].slice(-6),href:'/gauge'},
 {l:'Daily average',v:gbp2(TOTAL[mi]/30),d:0,good:'down',s:TOTAL.slice(-6).map(x=>x/30),href:'/calendar'},
 {l:'Subscriptions',v:gbp(96),d:0,good:'down',s:[88,88,96,96,96,96],href:'/hbars'},
 {l:'Budgets over',v:'1 of 6',d:0,good:'down',s:[0,1,0,0,1,1],href:'/gauge'},
 {l:'Cash buffer',v:'4.2 months',d:4,good:'up',s:[3.6,3.7,3.9,3.9,4.0,4.2],href:'/line'}];
demo({
  states:[['normal','Normal'],['loading','Loading'],['empty','Empty']],
  toggles:[{id:'sp',label:'Sparklines',on:true},{id:'link',label:'Tiles are links'}],
  draw:S=>h('div',{class:'kgrid'},K.map(k=>{
    if(S.data==='loading')return h('div',{class:'kt','aria-busy':'true'},h('div',{class:'skel sk'}),h('div',{class:'skel',style:'height:1rem;width:40%'}),h('div',{class:'skel',style:'height:30px;width:100%'}));
    const emp=S.data==='empty',cls=k.d===0?'flat':((k.d>0)===(k.good==='up')?'good':'bad');
    const kids=[h('span',{class:'s'},k.l),h('span',{class:'v'},emp?'—':k.v),h('span',{class:'d '+(emp?'flat':cls)},emp?'No data yet':(k.d===0?'● no change':(k.d>0?'▲ ':'▼ ')+Math.abs(k.d)+'% vs last month'))];
    if(S.sp&&!emp)kids.push(spark(k.s,{w:160,h:30,label:k.l+', last 6 months'}));
    return S.link?h('a',{class:'kt',href:k.href},kids):h('div',{class:'kt'},kids)})),
  table:S=>({caption:'Headline numbers (made-up)',head:['Metric','Value','Change'],rows:S.data==='empty'?[]:K.map(k=>[k.l,k.v,k.d===0?'no change':(k.d>0?'+':'-')+Math.abs(k.d)+'%'])}),
  note:S=>S.data==='normal'?'Green/red says whether the change is good for you (more saved is good, more spent is not); the arrow and the words say which way it moved.':S.data==='loading'?'Loading skeleton: same grid, so nothing jumps when the data arrives.':''
});`,
  },
  // ------------------------------------------------------------------ data table
  {
    path: "/data-table", name: "Data table", title: "Data table",
    tag: "The accessible twin of every chart: plain numbers in a real table.",
    when: "Use it beside any chart as the 'Show as table' view, or on its own when people need exact figures. First column is left-aligned labels; the rest are right-aligned numbers; wide tables scroll sideways.",
    keys: "A real <table> with a caption and column headers (scope='col'), so screen readers announce each cell with its row and column.",
    opts: [
      ["head", "Array of header strings. The first column is the row label."],
      ["rows", "Array of arrays of cells (strings or numbers; null becomes empty)."],
      ["caption", "Optional third argument: a visible caption that names the table."],
    ],
    snippet: String.raw`container.append(
  dataTable(
    ['Month', 'Groceries', 'Housing', 'Total'],
    [
      ['Jul 26', '£431', '£1,210', '£2,214'],
      ['Aug 26', '£402', '£1,210', '£2,180']
    ],
    'Spending by month'
  )
);`,
    script: String.raw`
const LASTN=MONTHS.slice(-6);
demo({
  states:[['normal','Normal'],['empty','Empty']],
  segs:[{id:'sort',label:'Sort',opts:[['new','Newest first'],['old','Oldest first'],['big','Biggest total']],init:'new'}],
  toggles:[{id:'tot',label:'Totals row',on:true},{id:'cmp',label:'Compact numbers'}],
  draw:S=>{if(S.data==='empty')return h('div',{class:'note'},'No rows in this range');
    const fm=S.cmp?(v=>compact(v)):gbp;let ix=LASTN.map((m,i)=>MONTHS.length-6+i);
    const tot=i=>sum(SP.map(c=>c[i]));
    ix=S.sort==='old'?ix:S.sort==='big'?ix.slice().sort((a,b)=>tot(b)-tot(a)):ix.slice().reverse();
    const head=['Month'].concat(CATS,['Total']);
    const rows=ix.map(i=>[monthName(MONTHS[i])].concat(SP.map(c=>fm(c[i])),[fm(tot(i))]));
    const el=dataTable(head,rows,'Spending by category, last 6 months (made-up numbers)');
    if(S.tot){const sums=CATS.map((c,k)=>fm(sum(ix.map(i=>SP[k][i]))));el.firstChild.append(h('tfoot',{},h('tr',{},h('td',{class:'l'},'Total'),...sums.map(s=>h('td',{},s)),h('td',{},fm(sum(ix.map(tot)))))))}
    return el},
  note:S=>S.data==='normal'?'Sorting and totals are ordinary code around the same table. On a phone the table scrolls sideways instead of squashing.':''
});`,
  },
  ...USAGE_PAGES,
];

export const byPath = new Map(PAGES.map(p => [p.path, p]));
