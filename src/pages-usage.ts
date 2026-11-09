// Nine chart pages added for dashboards that report on how a service is used: distributions (histogram, box plot,
// scatter), what people are asking about (word cloud, diverging bars, stacked area, bump, slope) and a funnel.
// The demos share one made-up dataset, USAGE_JS: about 1,900 conversations with a members' help assistant over 13 weeks.
// Every number comes from a seeded random generator, so nothing here is real and every visit looks the same.
// As in pages.ts, each script is a plain template literal: no backticks, no dollar-brace sequences.
import type { Page } from "./pages";

const KEYS_COLS = "Focus the chart with Tab, then use ← → Home End to move between columns; Esc closes the tooltip. On a phone, touch a column.";
const KEYS_ROVING = "Tab into the chart once, then use the arrow keys (or Home and End) to move from item to item; Esc closes the tooltip. On a phone, touch an item.";

const USAGE_JS = String.raw`
const wkShort=s=>(+s.slice(8))+' '+MON[+s.slice(5,7)-1];
const U=(function(){
  const r=rng(2026),norm=()=>Math.sqrt(-2*Math.log(Math.max(1e-9,r())))*Math.cos(6.283185307*r()),ln=(med,s)=>med*Math.exp(norm()*s);
  const TH=[['Renewals',14,.9],['Events and booking',12,.4],['Account access',13,0],['Payments',11,-.5],['Course materials',9,.1],['Certificates',6,1.2],['Complaints',5,-.6],['Benefits',8,-.1],['Volunteering',4,.3],['Policy questions',6,0],['Data requests',3,.5],['Other',7,0]];
  const NW=13,START=Date.UTC(2026,7,3),WEEKS=[];for(let w=0;w<NW;w++)WEEKS.push(new Date(START+w*7*864e5).toISOString().slice(0,10));
  const wt=(t,w)=>{let v=TH[t][1]*(1+TH[t][2]*(w-6)/8);if(w===NW-1){if(t===5)v*=2.1;if(t===6)v*=.45;if(t===0)v*=1.25}if(t===3&&w===9)v*=1.7;return Math.max(.4,v)};
  const threads=[];
  for(let i=0;i<1900;i++){
    const w=Math.min(NW-1,Math.floor(NW*Math.pow(r(),.88))),ws=TH.map((_,t)=>wt(t,w)),tot=ws.reduce((a,b)=>a+b,0);let x=r()*tot,t=0;while(t<ws.length-1&&x>ws[t]){x-=ws[t];t++}
    const turns=Math.max(1,Math.min(60,Math.round(ln(3,.72)))),member=1001+Math.floor(Math.pow(r(),1.5)*320);
    let minutes=ln(1.9,.5)*Math.pow(turns,.95);if(r()<.07)minutes+=ln(35,.6);minutes=Math.max(.3,minutes);
    const rc=[];let cost=0;for(let k=0;k<turns;k++){const c=ln(.0085,.5)*(1+.11*k)*(t===1?1.15:1);rc.push(c);cost+=c}
    threads.push({id:i+1,week:w,theme:t,member:member,turns:turns,minutes:minutes,cost:cost,rc:rc})}
  const names=TH.map(t=>t[0]),weekly=names.map(()=>new Array(NW).fill(0));threads.forEach(t=>weekly[t.theme][t.week]++);
  return{names:names,WEEKS:WEEKS,NW:NW,threads:threads,weekly:weekly,
    perWeek:WEEKS.map((_,w)=>threads.filter(t=>t.week===w).length),
    turns:threads.map(t=>t.turns),minutes:threads.map(t=>t.minutes),threadCost:threads.map(t=>t.cost),respCost:threads.flatMap(t=>t.rc)}})();
const ORDER=U.names.map((n,i)=>i).sort((a,b)=>sum(U.weekly[b])-sum(U.weekly[a]));
setCategoryOrder(ORDER.map(i=>U.names[i]));
const pf=v=>'£'+(Math.round(v*1000)/1000);
`;

export const USAGE_PAGES: Page[] = [
  // ------------------------------------------------------------------ histogram
  {
    path: "/histogram", name: "Histogram", title: "Histogram",
    tag: "How a measure is spread: thread length, thread time or cost per response, in bars.",
    when: "Use it when an average hides what is happening. A median conversation may be four questions while a few run to sixty, and a histogram shows both. Pool the long tail into a last bar so the common cases stay readable, and mark the median and the 90th percentile.",
    keys: KEYS_COLS,
    opts: [
      ["values", "Array of raw numbers. The chart bins them for you; use histBins(o) to get the same bins for a table."],
      ["min, max", "Axis floor, and a ceiling: values at or above max pool into a final 'or more' bar."],
      ["binWidth, bins", "A fixed bin width, or roughly how many bins you want (default about the square root of the count)."],
      ["integer", "True for whole-number data such as a count of questions: one bar per value, labels centred."],
      ["share", "True to show each bar as a percentage of all values instead of a count."],
      ["markers", "[{ value, label }]: dashed reference lines such as the median and the 90th percentile."],
      ["xfmt, yfmt, xtitle, unit", "Formatters, the x-axis title and the noun used in the tooltip."],
      ["label / empty", "aria-label for screen readers; text shown when there is no data."],
    ],
    snippet: String.raw`const chart = histogram({
  values: costPerResponse,                  // one number per response
  min: 0,
  max: quantile(costPerResponse, 0.97),     // pool the long tail into an 'or more' bar
  xfmt: v => '£' + (Math.round(v * 1000) / 1000),
  xtitle: 'Cost of one answer',
  unit: 'Responses',
  markers: [
    { value: median(costPerResponse), label: 'Median £0.009' },
    { value: quantile(costPerResponse, 0.9), label: '90% are under £0.021' }
  ],
  label: 'Cost per response',
  empty: 'No responses in this range'
});
document.querySelector('#host').append(chart);`,
    script: USAGE_JS + String.raw`
const HM={
 turns:{name:'Thread length',unit:'Threads',vals:U.turns,integer:true,min:1,max:20,xf:v=>String(v),xt:'Questions asked in a conversation',u:' questions'},
 minutes:{name:'Thread time',unit:'Threads',vals:U.minutes,min:0,max:60,xf:v=>String(Math.round(v)),xt:'Minutes from the first question to the last answer',u:' minutes'},
 resp:{name:'Cost per response',unit:'Responses',vals:U.respCost,min:0,q:.97,xf:pf,xt:'Cost of one answer',u:''},
 thread:{name:'Cost per thread',unit:'Threads',vals:U.threadCost,min:0,q:.96,xf:pf,xt:'Cost of a whole conversation',u:''}
};
function cfgOf(S){const M=HM[S.metric];let v=M.vals;if(S.data==='empty')v=[];else if(S.data==='one')v=v.slice(0,1);
  const o={values:v,min:M.min,max:S.pool?(M.max!=null?M.max:quantile(M.vals,M.q)):null,integer:M.integer,share:S.share,xfmt:M.xf,xtitle:M.xt,unit:M.unit,label:M.name+' histogram',empty:'No conversations in this range'};
  if(S.mk&&v.length>2)o.markers=[{value:median(v),label:'Median '+M.xf(median(v))},{value:quantile(v,.9),label:'90% are '+M.xf(quantile(v,.9))+' or less'}];
  return o}
demo({
  states:[['normal','Normal'],['one','One value'],['empty','Empty']],
  segs:[{id:'metric',label:'Measure',opts:[['turns','Thread length'],['minutes','Thread time'],['resp','Cost per response'],['thread','Cost per thread']],init:'turns'}],
  toggles:[{id:'pool',label:'Pool the long tail',on:true},{id:'mk',label:'Median and 90th percentile',on:true},{id:'share',label:'Show percentages'}],
  patterns:true,
  draw:S=>histogram(cfgOf(S)),
  table:S=>{const o=cfgOf(S),b=histBins(o),tot=b.vals.length;return{caption:HM[S.metric].name+' in bins (made-up numbers)',head:['Range',HM[S.metric].unit,'Share'],rows:b.counts.map((c,i)=>[histRange(b,i,o),c,(tot?Math.round(c/tot*1000)/10:0)+'%'])}},
  note:S=>{if(S.data==='empty')return 'Empty state: a sentence instead of an empty plot.';if(S.data==='one')return 'One value: a single bar, no markers.';
    const M=HM[S.metric],v=M.vals;return 'Median '+M.xf(median(v))+M.u+'. Nine in ten are '+M.xf(quantile(v,.9))+M.u+' or less. The longest is '+M.xf(Math.max(...v))+M.u+'.'+(S.pool?' The long tail is pooled into the last bar so the common cases stay readable.':' Without pooling, the long tail stretches the axis and squeezes the bars that matter.')}
});`,
  },
  // ------------------------------------------------------------------ box plot
  {
    path: "/box-plot", name: "Box plot", title: "Box plot",
    tag: "Compare the spread of a measure across groups: median, quartiles, whiskers and outliers.",
    when: "Use it to compare distributions side by side, such as the cost of a conversation by theme or the time a conversation takes by week. The box holds the middle half, the line is the median and the dots are the unusual ones. Cap the axis when one outlier would flatten the rest.",
    keys: KEYS_COLS,
    opts: [
      ["groups", "[{ label, values: [numbers], colour? }]. The chart works out the quartiles and whiskers; a group with no values says 'no data'."],
      ["cap", "Clip the axis here. Groups with outliers above it get a ▲ and the real maximum."],
      ["mean", "True to add a diamond at the mean, which a long tail pulls above the median."],
      ["colour", "One colour for every box (a group's own colour wins)."],
      ["yfmt, unit, height", "Axis and tooltip formatter, the noun for the count, and the chart height."],
      ["label / empty", "aria-label for screen readers; text shown when no group has data."],
    ],
    snippet: String.raw`const chart = boxPlot({
  groups: themes.map(t => ({
    label: t.name,
    colour: catColor(t.name),
    values: threads.filter(x => x.theme === t.id).map(x => x.cost)
  })),
  cap: 0.35,                       // outliers above this get a ▲ and their real value
  mean: true,
  yfmt: v => '£' + (Math.round(v * 100) / 100),
  unit: 'Threads',
  label: 'Cost per thread by theme'
});
document.querySelector('#host').append(chart);`,
    script: USAGE_JS + String.raw`
const mf=v=>(Math.round(v*10)/10)+' min';
function groupsOf(S){
  const val=x=>S.metric==='cost'?x.cost:x.minutes;let g;
  if(S.by==='theme')g=ORDER.slice(0,6).map(t=>({label:U.names[t],colour:catColor(U.names[t]),values:U.threads.filter(x=>x.theme===t).map(val)}));
  else g=U.WEEKS.slice(-8).map((w,j)=>({label:wkShort(w),values:U.threads.filter(x=>x.week===U.NW-8+j).map(val)}));
  if(S.data==='empty')g=g.map(x=>({label:x.label,colour:x.colour,values:[]}));else if(S.data==='one')g=g.slice(0,1);
  return g}
const fmtOf=S=>S.metric==='cost'?pf:mf;
demo({
  states:[['normal','Normal'],['one','One group'],['empty','Empty']],
  segs:[{id:'metric',label:'Measure',opts:[['cost','Cost per thread'],['mins','Thread time']],init:'cost'},{id:'by',label:'Group by',opts:[['theme','Theme'],['week','Week']],init:'theme'}],
  toggles:[{id:'mean',label:'Show the mean',on:true},{id:'cap',label:'Cap the axis (▲)',on:true}],
  patterns:true,
  draw:S=>{const g=groupsOf(S),all=g.flatMap(x=>x.values);return boxPlot({groups:g,colour:'var(--c1)',mean:S.mean,cap:S.cap&&all.length?quantile(all,.95):null,yfmt:fmtOf(S),unit:'Threads',label:(S.metric==='cost'?'Cost per thread':'Thread time')+' by '+S.by,empty:'No conversations in this range'})},
  table:S=>{const f=fmtOf(S);return{caption:(S.metric==='cost'?'Cost per thread':'Thread time')+' (made-up numbers)',head:['Group','Threads','Lowest','25th','Median','75th','Highest','Outliers'],rows:groupsOf(S).map(g=>{const s=boxStats(g.values);return s?[g.label,s.n,f(s.wl),f(s.q1),f(s.md),f(s.q3),f(s.wh),s.out.length]:[g.label,0,'','','','','','']})}},
  note:S=>S.data==='normal'?'Box = middle half of the threads, thick line = median'+(S.mean?', diamond = mean':'')+'. Whiskers reach the furthest value within 1.5 times the box height; dots beyond are outliers.'+(S.cap?' The axis is capped, so the biggest outliers are flagged with a ▲ and their real value.':''):(S.data==='empty'?'Empty state: groups with no values say so, and with none at all you get a sentence.':'One group: still drawn and still readable.')
});`,
  },
  // ------------------------------------------------------------------ word cloud
  {
    path: "/word-cloud", name: "Word cloud", title: "Word cloud",
    tag: "The words people use most, sized by how often they appear, with optional colour for rising and falling.",
    when: "Use it for a quick feel of what people are asking about, such as the words in the last 30 days of conversations. It is good for orientation and weak for exact comparison, so back it with the table view or a ranked list. Words are placed on a spiral, largest first, so they never overlap.",
    keys: KEYS_ROVING,
    opts: [
      ["words", "[{ text, value, delta?, colour? }]. Size follows the square root of value; delta is the percentage change, shown in the tooltip."],
      ["max", "How many words to draw (default 40, largest first). Words that cannot fit are left out."],
      ["colour", "Default word colour. Give a word its own colour to show rising or falling, as in the demo."],
      ["minSize, maxSize", "Smallest and largest font size in pixels."],
      ["fmt, unit", "Value formatter and the noun used in the tooltip and screen-reader label."],
      ["onClick", "(word) => void. Makes each word a click target."],
      ["label / empty", "aria-label for screen readers; text shown when there are no words."],
    ],
    snippet: String.raw`const chart = wordCloud({
  words: [
    { text: 'renew',       value: 186, delta: 14 },
    { text: 'certificate', value: 128, delta: 31, colour: 'var(--c2)' },
    { text: 'refund',      value: 104, delta: -18, colour: 'var(--c1)' }
  ],
  max: 40,
  unit: 'Mentions',
  onClick: w => filterConversations(w.text),
  label: 'Most common words, last 30 days'
});
document.querySelector('#host').append(chart);`,
    script: USAGE_JS + String.raw`
const W30=[['renew',186,14],['invoice',152,-3],['login',141,8],['certificate',128,31],['booking',121,11],['refund',104,-18],['password',98,-5],['event',94,12],['deadline',88,22],['receipt',81,0],['membership number',76,6],['cancel',72,-9],['upgrade',66,17],['CPD points',63,41],['direct debit',58,-12],['venue',54,5],['waiting list',51,26],['late fee',47,-24],['transfer',44,3],['email address',41,-2],['complaint',38,-35],['appeal',33,-8],['discount',31,9],['workshop',29,19],['volunteer',27,4],['exam dates',25,52],['address change',23,-6],['data request',20,15],['parking',18,2],['travel',17,-11],['newsletter',15,7],['accessibility',14,10],['feedback',12,-4]];
const wr=rng(9),W7=W30.map(w=>[w[0],Math.max(1,Math.round(w[1]*.24*(.8+wr()*.5))),Math.round(w[2]*(.5+wr()*1.4))]);
const tone=d=>d>10?'var(--c2)':d<-10?'var(--c1)':'var(--ink-2)';
function wordsOf(S){let w=(S.span==='30'?W30:W7);if(S.top)w=w.slice(0,20);if(S.data==='empty')w=[];else if(S.data==='one')w=w.slice(0,1);return w}
demo({
  states:[['normal','Normal'],['one','One word'],['empty','Empty']],
  segs:[{id:'span',label:'Period',opts:[['30','Last 30 days'],['7','Last 7 days']],init:'30'}],
  toggles:[{id:'trend',label:'Colour by trend',on:true},{id:'top',label:'Top 20 only'}],
  draw:S=>wordCloud({words:wordsOf(S).map(w=>({text:w[0],value:w[1],delta:w[2],colour:S.trend?tone(w[2]):null})),unit:'Mentions',label:'Most common words, '+(S.span==='30'?'last 30 days':'last 7 days'),empty:'No conversations in this range'}),
  legend:S=>S.trend&&S.data==='normal'?legend([{name:'Up more than 10%',colour:'var(--c2)'},{name:'Down more than 10%',colour:'var(--c1)'},{name:'About the same',colour:'var(--ink-2)'}]):null,
  table:S=>({caption:'Most common words (made-up numbers)',head:['Word','Mentions','Change on the period before'],rows:wordsOf(S).map(w=>[w[0],w[1],(w[2]>0?'+':'')+w[2]+'%'])}),
  note:S=>S.data==='normal'?'Tab into the cloud, then use the arrow keys to move word by word. Size shows how often; colour shows the trend, and the tooltip and table say it in words too.':(S.data==='empty'?'Empty state: a sentence instead of an empty box.':'One word: drawn large and centred.')
});`,
  },
  // ------------------------------------------------------------------ diverging bars
  {
    path: "/diverging-bars", name: "Diverging bars", title: "Diverging bars",
    tag: "What went up and what went down: bars either side of a zero line, biggest rise at the top.",
    when: "Use it for change between two periods, such as the themes trending up and down this week compared with last. Rises go right and falls go left from a shared zero line, and the arrow in the label means the direction never depends on colour alone. It is plain HTML, so labels wrap and select.",
    keys: "When rows are clickable they are keyboard-focusable: Tab to a row and press Enter.",
    opts: [
      ["items", "[{ label, value, sub?, tag?, onClick? }]. Positive values go right, negative left; bars scale to the largest change."],
      ["fmt", "Value formatter (default signed, one decimal)."],
      ["leftLabel, rightLabel", "Headings over the two sides (default Down and Up)."],
      ["upColour, downColour", "Bar colours (default orange for up, blue for down: separable for colour-blind readers)."],
      ["sort", "False keeps your order; the default sorts from the biggest rise to the biggest fall."],
      ["empty", "Text for the empty state."],
    ],
    snippet: String.raw`container.append(
  divergingBars([
    { label: 'Certificates', value: 9, sub: 'from 6 to 15 conversations' },
    { label: 'Renewals',     value: 4, sub: 'from 21 to 25' },
    { label: 'Complaints',   value: -7, sub: 'from 11 to 4' }
  ], {
    leftLabel: 'Fewer than last week',
    rightLabel: 'More than last week',
    fmt: v => (v > 0 ? '+' : '−') + Math.abs(v),
    empty: 'Nothing changed this week'
  })
);`,
    script: USAGE_JS + String.raw`
function itemsOf(S){let it=U.names.map((nm,t)=>{const a=U.weekly[t][U.NW-2],b=U.weekly[t][U.NW-1],d=b-a,p=a?Math.round(d/a*100):null;
    return{label:nm,value:S.unit==='pct'?(p==null?0:p):d,sub:'from '+a+' to '+b+' conversations',tag:S.unit==='pct'?null:(p==null?null:(p>0?'+':'')+p+'%'),a:a,b:b}});
  if(S.hide)it=it.filter(x=>Math.abs(x.b-x.a)>=3);
  it.sort((x,y)=>y.value-x.value);if(S.five){it=it.slice(0,5).concat(it.slice(-5).filter(x=>it.indexOf(x)>=5))}
  if(S.data==='empty')it=[];else if(S.data==='one')it=it.slice(0,1);return it}
demo({
  states:[['normal','Normal'],['one','One row'],['empty','Empty']],
  segs:[{id:'unit',label:'Change in',opts:[['abs','Conversations'],['pct','Percent']],init:'abs'}],
  toggles:[{id:'five',label:'Top 5 each way'},{id:'hide',label:'Hide small changes (under 3)'}],
  draw:S=>divergingBars(itemsOf(S).map(x=>({label:x.label,value:x.value,sub:x.sub,tag:x.tag,onClick:()=>say(x.label+': '+x.a+' last week before, '+x.b+' last week. An app would open those conversations.')})),{fmt:S.unit==='pct'?(v=>(v>0?'+':v<0?'−':'')+Math.abs(v)+'%'):null,leftLabel:'Fewer than the week before',rightLabel:'More than the week before',empty:'Nothing changed this week'}),
  table:S=>({caption:'Change in conversations, last week against the week before (made-up numbers)',head:['Theme','Week before','Last week','Change'],rows:itemsOf(S).map(x=>[x.label,x.a,x.b,(x.b-x.a>0?'+':'')+(x.b-x.a)])}),
  note:S=>S.data==='normal'?'Click a row, or Tab to it and press Enter. The arrow and the sign in each value say the direction in words, not just colour.':''
});`,
  },
  // ------------------------------------------------------------------ stacked area
  {
    path: "/area", name: "Stacked area", title: "Stacked and percent area",
    tag: "Volume over time, split into themes, or the same data as a share of the total.",
    when: "Use it when the total and its make-up both matter, such as conversations per week by theme. Stacked shows how much; switch to share of total to see which themes are gaining ground whatever the volume. Name the larger bands at the right edge as well as in the legend, so people do not have to hunt for them.",
    keys: KEYS_COLS,
    opts: [
      ["xs", "Array of x values (strings). Any length, including 0 or 1."],
      ["series", "[{ name, values, colour }], stacked in order from the bottom."],
      ["mode", "'stacked' (default) or 'percent' for each x as a share of 100%."],
      ["direct", "True to name each band at the right edge. Bands too thin to hold a label are skipped, so keep a legend as well."],
      ["xlabel", "(x, i, isTooltip) => string. Short label for the axis, long label for the tooltip."],
      ["yfmt, tipfmt, height, maxLabels", "Number formatters and sizes. Pass your own yfmt: the default is in pounds."],
      ["label / empty", "aria-label for screen readers; text shown when there is no data."],
    ],
    snippet: String.raw`const chart = areaChart({
  xs: weeks,                                   // ['2026-08-03', '2026-08-10', ...]
  xlabel: (w, i, isTooltip) => (isTooltip ? 'Week of ' : '') + fmtDate(w),
  mode: 'stacked',                             // or 'percent'
  direct: true,                                // name the bands at the right edge
  series: [
    { name: 'Renewals',    colour: catColor('Renewals'),    values: renewalsPerWeek },
    { name: 'Payments',    colour: catColor('Payments'),    values: paymentsPerWeek },
    { name: 'Other themes', colour: 'var(--c9)',            values: otherPerWeek }
  ],
  yfmt: v => String(v),
  label: 'Conversations per week by theme',
  empty: 'No conversations in this range'
});
document.querySelector('#host').append(chart);`,
    script: USAGE_JS + String.raw`
function seriesOf(S){const s=ORDER.slice(0,7).map(t=>({name:U.names[t],values:U.weekly[t],colour:catColor(U.names[t])})),rest=ORDER.slice(7);
  s.push({name:'Other themes',values:U.WEEKS.map((_,w)=>sum(rest.map(t=>U.weekly[t][w]))),colour:GREY});return s.reverse()}
const nOf=S=>S.data==='empty'?0:S.data==='one'?1:U.NW;
demo({
  states:[['normal','Normal'],['one','One week'],['empty','Empty']],
  segs:[{id:'mode',label:'Show',opts:[['stacked','Conversations'],['percent','Share of total']],init:'stacked'}],
  toggles:[{id:'direct',label:'Name the bands',on:true}],
  patterns:true,
  draw:S=>{const n=nOf(S);return areaChart({xs:U.WEEKS.slice(0,n),xlabel:(w,i,tip)=>(tip?'Week of ':'')+wkShort(w),mode:S.mode,direct:S.direct,series:seriesOf(S).map(s=>({name:s.name,colour:s.colour,values:s.values.slice(0,n)})),yfmt:v=>String(v),label:'Conversations per week by theme, 3 August to 1 November 2026',empty:'No conversations in this range'})},
  legend:S=>S.data==='normal'?legend(seriesOf(S).slice().reverse().map(s=>({name:s.name,colour:s.colour}))):null,
  table:S=>{const n=nOf(S),ss=seriesOf(S).slice().reverse();return{caption:'Conversations per week by theme (made-up numbers)',head:['Week'].concat(ss.map(s=>s.name)).concat(['Total']),rows:U.WEEKS.slice(0,n).map((w,i)=>[wkShort(w)].concat(ss.map(s=>s.values[i])).concat([U.perWeek[i]]))}},
  note:S=>S.data!=='normal'?(S.data==='empty'?'Empty state: a sentence instead of an empty plot.':'One week: drawn as a single stacked column.'):(S.mode==='percent'?'Each week adds up to 100%, so a band that grows is gaining share even if the total is flat.':'The height of the whole stack is the number of conversations in the week; each band is one theme.')
});`,
  },
  // ------------------------------------------------------------------ scatter
  {
    path: "/scatter", name: "Scatter and bubble", title: "Scatter and bubble chart",
    tag: "Two measures against each other, one dot per item, with size, groups and a trend line.",
    when: "Use it to see whether two things move together, such as thread length against cost, and to spot the threads that do not follow the pattern. Add a third measure as bubble size, split the dots into groups, and fit a trend line when the cloud is dense.",
    keys: "Tab into the chart, then use the arrow keys to step through the points from left to right (Home and End jump to the ends); Esc closes the tooltip. Hover or touch a dot to read it.",
    opts: [
      ["points", "[{ x, y, r?, label?, group? }]. r makes it a bubble chart; label is the tooltip title."],
      ["groups", "{ groupName: colour }. With patterns on, each group also gets its own marker shape."],
      ["trend", "True to draw a least-squares line (the correlation is on the SVG as data-r)."],
      ["xMax, yMax", "Clip the axes; points beyond are drawn on the edge."],
      ["xfmt, yfmt, rfmt, xtitle, ytitle, rtitle", "Formatters and axis titles."],
      ["maxR, height, colour", "Largest bubble radius, chart height and the default dot colour."],
      ["label / empty", "aria-label for screen readers; text shown when there is no data."],
    ],
    snippet: String.raw`const chart = scatter({
  points: threads.map(t => ({
    x: t.questions, y: t.cost, r: t.minutes,
    label: 'Thread ' + t.id, group: t.themeGroup
  })),
  groups: { Renewals: 'var(--c1)', Payments: 'var(--c2)', 'Other themes': 'var(--c9)' },
  trend: true,
  xMax: 30, yMax: 0.4,
  xtitle: 'Questions in the thread',
  ytitle: 'Cost',
  yfmt: v => '£' + (Math.round(v * 100) / 100),
  rtitle: 'Minutes',
  label: 'Thread length against cost'
});
document.querySelector('#host').append(chart);`,
    script: USAGE_JS + String.raw`
const SG=ORDER.slice(0,3).map(t=>U.names[t]);
const GCOL={};SG.forEach(n=>GCOL[n]=catColor(n));GCOL['Other themes']=GREY;
const SR=rng(31),SAMPLE=U.threads.filter(()=>SR()<.17);
function pointsOf(S){let p=SAMPLE.map(t=>({x:t.turns,y:t.cost,r:S.bub?t.minutes:null,label:'Thread '+t.id,group:SG.indexOf(U.names[t.theme])>=0?U.names[t.theme]:'Other themes'}));
  if(S.data==='empty')p=[];else if(S.data==='one')p=p.slice(0,1);return p}
demo({
  states:[['normal','Normal'],['one','One point'],['empty','Empty']],
  toggles:[{id:'trend',label:'Trend line',on:true},{id:'bub',label:'Size by minutes'},{id:'grp',label:'Colour by theme',on:true}],
  patterns:true,
  draw:S=>scatter({points:pointsOf(S),groups:S.grp?GCOL:null,trend:S.trend,xMax:30,yMax:.4,xtitle:'Questions in the thread',ytitle:'Cost of the thread',xfmt:v=>String(v),yfmt:v=>'£'+(Math.round(v*100)/100),rtitle:'Minutes',rfmt:v=>(Math.round(v*10)/10)+' min',maxR:14,label:'Thread length against cost',empty:'No conversations in this range'}),
  legend:S=>S.grp&&S.data==='normal'?legend(Object.keys(GCOL).map(n=>({name:n,colour:GCOL[n]}))):null,
  table:S=>({caption:'A sample of conversations (made-up numbers)',head:['Thread','Questions','Cost','Minutes','Theme'],rows:pointsOf(S).slice(0,60).map(p=>[p.label,p.x,pf(p.y),(Math.round(SAMPLE.find(t=>'Thread '+t.id===p.label).minutes*10)/10),p.group])}),
  note:S=>S.data==='normal'?'Longer conversations cost more because every answer re-reads the whole thread. Hover a dot, or Tab in and use the arrow keys. The table shows the first 60 of '+SAMPLE.length+' sampled threads.':(S.data==='empty'?'Empty state: a sentence instead of an empty plot.':'One point: drawn on its own with room around it.')
});`,
  },
  // ------------------------------------------------------------------ bump
  {
    path: "/bump", name: "Bump chart", title: "Bump chart",
    tag: "Rank over time: who is first this week, and how each one got there.",
    when: "Use it when order matters more than size, such as which themes lead the conversation each week. Lines cross where the order changes, so the story of who is climbing and who is falling reads at once. Hover or focus a line to isolate it.",
    keys: KEYS_ROVING,
    opts: [
      ["xs", "Array of x values (strings), usually periods."],
      ["series", "[{ name, ranks, values?, colour }]. ranks[i] is 1 for the top; null means not ranked that period. Use rankSeries() to build ranks from values."],
      ["xlabel", "(x, i, isTooltip) => string."],
      ["tipfmt", "Formatter for the values shown beside each rank in the tooltip."],
      ["rowH", "Height of one rank row in pixels (default 28)."],
      ["label / empty", "aria-label for screen readers; text shown when there is no data."],
    ],
    snippet: String.raw`const ranked = rankSeries([
  { name: 'Renewals',   colour: catColor('Renewals'),   values: renewalsPerWeek },
  { name: 'Payments',   colour: catColor('Payments'),   values: paymentsPerWeek },
  { name: 'Certificates', colour: catColor('Certificates'), values: certificatesPerWeek }
]);
const chart = bump({
  xs: weeks,
  xlabel: (w, i, isTooltip) => fmtDate(w),
  series: ranked,                    // each has ranks: [3, 2, 2, 1, ...]
  tipfmt: v => v + ' conversations',
  label: 'Rank of themes by weekly conversations'
});
document.querySelector('#host').append(chart);`,
    script: USAGE_JS + String.raw`
const BT=ORDER.slice(0,8);
function dataB(S){const n=S.data==='empty'?0:S.data==='one'?1:(S.span==='6'?6:U.NW),off=U.NW-n;
  return{xs:U.WEEKS.slice(off),series:n?rankSeries(BT.map(t=>({name:U.names[t],values:U.weekly[t].slice(off),colour:catColor(U.names[t])}))):[]}}
demo({
  states:[['normal','Normal'],['one','One week'],['empty','Empty']],
  segs:[{id:'span',label:'Weeks',opts:[['13','All 13'],['6','Last 6']],init:'13'}],
  draw:S=>{const d=dataB(S);return bump({xs:d.xs,xlabel:(w,i,tip)=>(tip?'Week of ':'')+wkShort(w),series:d.series,tipfmt:v=>v+' conversations',label:'Rank of the eight busiest themes by weekly conversations',empty:'No conversations in this range'})},
  table:S=>{const d=dataB(S);return{caption:'Rank (and conversations) by week, busiest eight themes (made-up numbers)',head:['Theme'].concat(d.xs.map(wkShort)),rows:d.series.map(s=>[s.name].concat(s.ranks.map((r,i)=>r==null?'':'#'+r+' ('+s.values[i]+')')))}},
  note:S=>S.data==='normal'?'Hover or focus a line to isolate it, then read its rank week by week. Arrow keys move between themes.':(S.data==='empty'?'Empty state: a sentence instead of an empty plot.':'One week: just the ranking, no lines to draw.')
});`,
  },
  // ------------------------------------------------------------------ slope
  {
    path: "/slope", name: "Slope chart", title: "Slope chart",
    tag: "Two moments side by side, one line per item, so rises and falls read at a glance.",
    when: "Use it to compare the same items at two points: this week against last, or the first month against the latest. The slope of each line is the change, steep for big movers and flat for steady ones, and labels at both ends carry the numbers. Use it for a handful of items rather than dozens.",
    keys: KEYS_ROVING,
    opts: [
      ["items", "[{ label, from, to, colour? }]. Colour follows direction unless you set one."],
      ["fromLabel, toLabel", "Headings over the two axes."],
      ["fmt", "Value formatter for the labels and tooltip."],
      ["upColour, downColour", "Line colours for a rise and a fall (default orange and blue)."],
      ["height", "Chart height; by default it grows with the number of items."],
      ["label / empty", "aria-label for screen readers; text shown when there is nothing to compare."],
    ],
    snippet: String.raw`const chart = slope({
  items: [
    { label: 'Certificates', from: 6,  to: 15 },
    { label: 'Renewals',     from: 21, to: 25 },
    { label: 'Complaints',   from: 11, to: 4 }
  ],
  fromLabel: 'Week before',
  toLabel: 'Last week',
  fmt: v => Math.round(v),
  label: 'Conversations by theme, week on week'
});
document.querySelector('#host').append(chart);`,
    script: USAGE_JS + String.raw`
function itemsOf(S){let it=U.names.map((nm,t)=>{const w=U.weekly[t];let a,b;if(S.cmp==='wow'){a=w[U.NW-2];b=w[U.NW-1]}else{a=sum(w.slice(0,4))/4;b=sum(w.slice(-4))/4}return{label:nm,from:Math.round(a*10)/10,to:Math.round(b*10)/10}});
  if(S.mv)it=it.filter(x=>Math.abs(x.to-x.from)>=2);if(S.data==='empty')it=[];else if(S.data==='one')it=it.slice(0,1);return it}
demo({
  states:[['normal','Normal'],['one','One item'],['empty','Empty']],
  segs:[{id:'cmp',label:'Compare',opts:[['wow','Last week with the week before'],['q','Last 4 weeks with the first 4']],init:'wow'}],
  toggles:[{id:'mv',label:'Only the movers (change of 2 or more)'}],
  draw:S=>slope({items:itemsOf(S),fromLabel:S.cmp==='wow'?'Week before':'First 4 weeks',toLabel:S.cmp==='wow'?'Last week':'Last 4 weeks',fmt:v=>String(Math.round(v*10)/10),label:'Conversations per week by theme',empty:'Nothing to compare'}),
  table:S=>({caption:'Conversations per week by theme (made-up numbers)',head:['Theme',S.cmp==='wow'?'Week before':'First 4 weeks (average)',S.cmp==='wow'?'Last week':'Last 4 weeks (average)','Change'],rows:itemsOf(S).map(x=>[x.label,x.from,x.to,(x.to-x.from>0?'+':'')+Math.round((x.to-x.from)*10)/10])}),
  note:S=>S.data==='normal'?'Orange lines went up, blue lines went down; the arrow in each right-hand label says so in words too. Hover or focus a line to isolate it.':(S.data==='empty'?'Empty state: a sentence instead of an empty plot.':'One item: a single line, labelled at both ends.')
});`,
  },
  // ------------------------------------------------------------------ funnel
  {
    path: "/funnel", name: "Funnel", title: "Funnel",
    tag: "A journey where each step can only lose people, with the drop-off between steps.",
    when: "Use it for a sequence people drop out of: conversations started, answered, rated and rated helpful. Bar widths are a share of the first step, and the text between the steps says how many carried on, which is the number that tells you where to look.",
    keys: KEYS_ROVING,
    opts: [
      ["steps", "[{ label, value }] in order. Widths are value / first value."],
      ["between", "False hides the 'carried on' text between steps."],
      ["fmt", "Value formatter (default thousands separators)."],
      ["colour, rowH", "Bar colour (later steps fade a little) and row height."],
      ["label / empty", "aria-label for screen readers; text shown when the first step is empty."],
    ],
    snippet: String.raw`const chart = funnel({
  steps: [
    { label: 'Conversations started',  value: 1900 },
    { label: 'Assistant gave an answer', value: 1786 },
    { label: 'Member rated the answer', value: 768 },
    { label: 'Rated helpful',           value: 622 }
  ],
  between: true,
  label: 'From first question to a helpful answer'
});
document.querySelector('#host').append(chart);`,
    script: USAGE_JS + String.raw`
const N0=U.threads.length;
function stepsOf(S){const k=S.who==='new'?[.9,.3,.7]:[.94,.43,.81];const a=Math.round(N0*k[0]),b=Math.round(a*k[1]),c=Math.round(b*k[2]);
  let s=[{label:'Conversations started',value:N0},{label:'Assistant gave an answer',value:a},{label:'Member rated the answer',value:b},{label:'Rated helpful',value:c}];
  if(S.data==='empty')s=s.map(x=>({label:x.label,value:0}));else if(S.data==='one')s=s.slice(0,1);return s}
demo({
  states:[['normal','Normal'],['one','One step'],['empty','Empty']],
  segs:[{id:'who',label:'Members',opts:[['all','Everyone'],['new','New members']],init:'all'}],
  toggles:[{id:'between',label:'Show the drop-off between steps',on:true}],
  patterns:true,
  draw:S=>funnel({steps:stepsOf(S),between:S.between,label:'From first question to a helpful answer',empty:'No conversations in this range'}),
  table:S=>{const s=stepsOf(S);return{caption:'Conversation funnel (made-up numbers)',head:['Step','Conversations','Of the start','Of the step before'],rows:s.map((x,i)=>[x.label,x.value,s[0].value?Math.round(x.value/s[0].value*1000)/10+'%':'',i&&s[i-1].value?Math.round(x.value/s[i-1].value*1000)/10+'%':''])}},
  note:S=>S.data==='normal'?'Compare the percentages between steps, not just the bars: the biggest fall is the step to look at. New members rate far fewer answers.':(S.data==='empty'?'Empty state: a sentence when the first step has nothing in it.':'One step: nothing to compare yet.')
});`,
  },
];
