// Chart toolkit: SVG built from scratch, no libraries (so a strict CSP stays strict). 8 named colour slots (the rest fold into grey),
// charts size themselves to their container width (setChartWidth) so text stays readable on a phone, label counts follow the
// width, dataTable takes a caption, and heatmap value text switches ink so it stays legible on pale cells.
// Every chart can show its data as a table, charts are keyboard-reachable (Tab, arrow keys, Escape), patterns can replace
// colour, and every chart copes with empty, one-point and all-zero data. NOTE: this is a TypeScript template literal, so the
// script must contain no backticks and no dollar-brace sequences.

import { CHARTS_MORE_CSS, CHARTS_MORE_JS } from "./charts-more";

const CHARTS_CSS_CORE = `
.wgrid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:16px}
.w-full{grid-column:span 12}.w-half{grid-column:span 6}.w-third{grid-column:span 4}.w-twothird{grid-column:span 8}
@media (max-width:1000px){.w-half,.w-third,.w-twothird{grid-column:span 12}}
.widget{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:18px 20px;min-width:0;display:flex;flex-direction:column;gap:12px}
.widget>header{display:flex;flex-wrap:wrap;gap:8px 14px;justify-content:space-between;align-items:flex-start}
.widget h2{font-size:1.05rem}
.widget .sub{margin:2px 0 0;color:var(--muted);font-size:.85rem;max-width:60ch}
.wtools{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.mini{border:1px solid var(--line-2);background:var(--surface);border-radius:99px;padding:4px 11px;font-size:.8rem;font-weight:600;cursor:pointer;color:var(--ink-2)}
.mini[aria-pressed="true"]{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.mini:hover:not([aria-pressed="true"]){background:var(--sunk)}
.ch{display:block;width:100%;height:auto;overflow:visible;outline-offset:3px}
.ch text{fill:var(--muted);font-family:var(--f-ui);font-size:11px}
.ch .grid{stroke:var(--line);stroke-width:1}
.ch .axis{stroke:var(--line-2);stroke-width:1}
.ch .tot{fill:var(--ink-2);font-weight:700}
.ch .cell:hover{stroke:var(--ink);stroke-width:1.5}
.ch .click{cursor:pointer}
.tip{position:absolute;z-index:50;pointer-events:none;background:var(--surface);border:1px solid var(--line-2);border-radius:12px;padding:10px 12px;font-size:.84rem;box-shadow:0 10px 28px rgba(0,0,0,.16);min-width:190px;max-width:320px}
.tip b{display:block;margin-bottom:6px}
.tip .row{display:flex;justify-content:space-between;gap:14px}
.tip .row span:first-child{display:inline-flex;align-items:center;gap:7px;color:var(--ink-2)}
.sw{width:11px;height:11px;border-radius:4px;flex:none;display:inline-block}
.legend{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:.82rem;color:var(--ink-2)}
.legend span{display:inline-flex;align-items:center;gap:6px}
.hb{display:flex;flex-direction:column;gap:7px}
.hb .r{display:grid;grid-template-columns:minmax(90px,170px) 1fr auto;gap:10px;align-items:center;font-size:.88rem;border-radius:8px;padding:2px 4px}
.hb .r.click{cursor:pointer}.hb .r.click:hover{background:var(--sunk)}
.hb .l{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-transform:capitalize}
.hb .t{height:12px;background:var(--sunk);border-radius:99px;overflow:hidden}.hb .t i{display:block;height:100%;border-radius:99px}
.hb .v{font-weight:700;text-align:right;min-width:70px}
.hb .s{grid-column:2/4;color:var(--muted);font-size:.76rem;margin-top:-4px}
.gauge{display:grid;grid-template-columns:minmax(80px,150px) 1fr auto;gap:10px;align-items:center;font-size:.88rem;padding:3px 0}
.gauge .t{height:14px;background:var(--sunk);border-radius:99px;overflow:hidden;position:relative}.gauge .t i{display:block;height:100%;border-radius:99px}
.gauge .mark{position:absolute;top:-2px;bottom:-2px;width:2px;background:var(--ink)}
.tone-ok{background:var(--ok)}.tone-warn{background:var(--guess)}.tone-bad{background:var(--decide)}
.kgrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1px;background:var(--line);border:1px solid var(--line);border-radius:var(--r);overflow:hidden}
.kt{background:var(--surface);padding:16px 18px;display:flex;flex-direction:column;gap:3px;min-width:0;color:inherit;text-decoration:none}
a.kt:hover{background:var(--sunk)}
.kt .v{font-size:clamp(1.5rem,2.6vw,2.1rem);font-weight:800;letter-spacing:-.03em;line-height:1.1}
.kt .d{font-size:.8rem;font-weight:700}.kt .d.up{color:var(--decide)}.kt .d.down{color:var(--ok)}.kt .d.flat{color:var(--muted)}.kt .d.good{color:var(--ok)}.kt .d.bad{color:var(--decide)}
.kt .s{font-size:.8rem;color:var(--muted)}
.kt svg{margin-top:4px}
@media (max-width:900px){.kgrid{grid-template-columns:repeat(2,minmax(0,1fr))}}
.sm{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:14px}
.sm .c{border:1px solid var(--line);border-radius:12px;padding:10px 12px;display:flex;flex-direction:column;gap:2px;cursor:pointer;background:var(--surface)}
.sm .c:hover{background:var(--sunk)}.sm .n{font-weight:700;font-size:.88rem;text-transform:capitalize}.sm .v{font-size:.8rem;color:var(--muted)}
.dtable{width:100%;border-collapse:collapse;font-size:.85rem}
.dtable th,.dtable td{padding:6px 8px;border-bottom:1px solid var(--line);text-align:right;white-space:nowrap}
.dtable th.l,.dtable td.l{text-align:left}
.dtable td.l{white-space:normal}
.skel{background:linear-gradient(90deg,var(--sunk),var(--surface),var(--sunk));background-size:200% 100%;border-radius:10px;animation:sk 1.2s infinite linear}
@keyframes sk{from{background-position:200% 0}to{background-position:-200% 0}}
@media (prefers-reduced-motion:reduce){.skel{animation:none}}
.note{color:var(--muted);font-size:.85rem;padding:18px;text-align:center}
`;

const CHARTS_JS_CORE = `
const NS='http://www.w3.org/2000/svg';
const sv=(t,a,...k)=>{const e=document.createElementNS(NS,t);if(a)for(const[n,v]of Object.entries(a))if(v!=null&&v!==false)e.setAttribute(n,v);for(const c of k.flat())if(c!=null&&c!==false)e.append(c.nodeType?c:document.createTextNode(c));return e};
const compact=n=>{const a=Math.abs(n||0);const s=a>=1e6?(a/1e6).toFixed(1)+'m':a>=1e4?Math.round(a/1e3)+'k':a>=1e3?(a/1e3).toFixed(1)+'k':String(Math.round(a));return (n<0?'-':'')+'£'+s};
const sum=a=>a.reduce((x,y)=>x+(y||0),0);
const median=a=>{const s=a.slice().sort((x,y)=>x-y);const m=Math.floor(s.length/2);return s.length?(s.length%2?s[m]:(s[m-1]+s[m])/2):0};
const quantile=(a,q)=>{const s=a.slice().sort((x,y)=>x-y);if(!s.length)return 0;const i=(s.length-1)*q,lo=Math.floor(i),hi=Math.ceil(i);return s[lo]+(s[hi]-s[lo])*(i-lo)};
function niceStep(range,n){const raw=range/n,mag=Math.pow(10,Math.floor(Math.log10(raw||1))),f=raw/mag;return (f<=1?1:f<=2?2:f<=2.5?2.5:f<=5?5:10)*mag}
function yTicks(min,max,n){n=n||4;const step=niceStep((max-min)||1,n);const lo=Math.floor(min/step)*step,hi=Math.ceil(max/step)*step;const t=[];for(let v=lo;v<=hi+step*1e-6;v+=step)t.push(+v.toFixed(6));return t}

// ---- colours: one stable colour per category across every chart; 8 named slots, grey for the rest
const SLOT=['var(--c1)','var(--c2)','var(--c3)','var(--c4)','var(--c5)','var(--c6)','var(--c7)','var(--c8)'];
// chart width in SVG units: the caller sets it from the container so 1 unit is about 1 css pixel
let CW=1000;function setChartWidth(w){CW=Math.max(320,Math.min(1000,Math.round(w||1000)))}
const GREY='var(--c9)';const CATCOL=new Map();
function setCategoryOrder(names){CATCOL.clear();names.slice(0,SLOT.length).forEach((n,i)=>CATCOL.set(n,SLOT[i]))}
const catColor=n=>CATCOL.get(n)||GREY;
let PATTERNS=false;let UID=0;
function setPatterns(on){PATTERNS=!!on}
// Pattern fills (not only colour): each colour gets its own texture when switched on.
function fillSet(svg,colours){
  if(!PATTERNS)return colours.slice();
  const defs=sv('defs');const uid=++UID;
  const out=colours.map((c,i)=>{const id='pt'+uid+'_'+i;const k=i%5;
    const over=k===0?sv('path',{d:'M0 8L8 0',stroke:'#fff','stroke-width':2,opacity:.55}):k===1?sv('circle',{cx:4,cy:4,r:1.6,fill:'#fff',opacity:.7}):k===2?sv('path',{d:'M0 0L8 8M8 0L0 8',stroke:'#fff','stroke-width':1.4,opacity:.5}):k===3?sv('path',{d:'M0 4H8',stroke:'#fff','stroke-width':2,opacity:.55}):sv('path',{d:'M4 0V8',stroke:'#fff','stroke-width':2,opacity:.55});
    defs.append(sv('pattern',{id,width:8,height:8,patternUnits:'userSpaceOnUse'},sv('rect',{width:8,height:8,fill:c}),over));return 'url(#'+id+')'});
  svg.append(defs);return out}

// ---- tooltip (one shared element)
let TIP=null;
function tipEl(){if(!TIP){TIP=document.createElement('div');TIP.className='tip';TIP.setAttribute('role','status');TIP.hidden=true;document.body.append(TIP)}return TIP}
function showTip(x,y,title,rows){const t=tipEl();t.replaceChildren(h('b',{},title),...rows.map(r=>h('div',{class:'row'},h('span',{},r.colour?h('i',{class:'sw',style:'background:'+r.colour}):null,r.label),h('span',{},r.value))));t.hidden=false;const w=t.offsetWidth,hh=t.offsetHeight;let px=x+14,py=y+14;if(px+w>innerWidth-8)px=x-w-14;if(py+hh>innerHeight-8)py=y-hh-14;t.style.left=Math.max(4,px+scrollX)+'px';t.style.top=Math.max(4,py+scrollY)+'px'}
function hideTip(){if(TIP)TIP.hidden=true}
window.addEventListener('scroll',hideTip,{passive:true});
document.addEventListener('keydown',e=>{if(e.key==='Escape')hideTip()});

// ---- shared hover/keyboard behaviour for column-like charts
function hoverColumns(svg,o){ // o: n, left, right, W, onIndex(i,x,y,fromKey), onLeave
  let cur=-1;
  const idxAt=ev=>{const r=svg.getBoundingClientRect();const px=(ev.clientX-r.left)*(o.W/r.width);return Math.max(0,Math.min(o.n-1,Math.floor((px-o.left)/((o.W-o.left-o.right)/o.n))))};
  svg.addEventListener('pointermove',ev=>{const i=idxAt(ev);cur=i;o.onIndex(i,ev.clientX,ev.clientY)});
  svg.addEventListener('pointerleave',()=>{hideTip();o.onLeave&&o.onLeave()});
  svg.addEventListener('keydown',ev=>{if(ev.key==='ArrowRight'||ev.key==='ArrowLeft'||ev.key==='Home'||ev.key==='End'){ev.preventDefault();cur=ev.key==='Home'?0:ev.key==='End'?o.n-1:Math.max(0,Math.min(o.n-1,(cur<0?(ev.key==='ArrowRight'?-1:o.n):cur)+(ev.key==='ArrowRight'?1:-1)));const r=svg.getBoundingClientRect();const step=(o.W-o.left-o.right)/o.n;o.onIndex(cur,r.left+(o.left+step*(cur+.5))*(r.width/o.W),r.top+r.height/3)}else if(ev.key==='Escape'){hideTip();o.onLeave&&o.onLeave()}});
  svg.addEventListener('blur',()=>{hideTip();o.onLeave&&o.onLeave()})}

// ---- line / area chart. series:[{name,values,colour,dash,area}]
function lineChart(o){
  const W=CW,H=o.height||260,m={l:58,r:14,t:16,b:28},n=o.xs.length;
  const svg=sv('svg',{viewBox:'0 0 '+W+' '+H,role:'img','aria-label':o.label||'Line chart',tabindex:0,class:'ch'});
  if(!n||o.series.every(s=>s.values.every(v=>v==null))){return h('div',{class:'note'},o.empty||'No data in this range')}
  const fills=fillSet(svg,o.series.map(s=>s.colour||'var(--accent)'));
  const vals=o.series.flatMap(s=>s.values.filter(v=>v!=null));
  let max=Math.max(1,...vals,o.threshold?o.threshold.value:0),min=o.yMin!=null?o.yMin:Math.min(0,...vals);
  let clipped=false;if(o.cap&&max>o.cap){max=o.cap;clipped=true}
  const ticks=yTicks(min,max,4),top=ticks[ticks.length-1],bot=ticks[0];
  const X=i=>n<2?m.l+(W-m.l-m.r)/2:m.l+i*(W-m.l-m.r)/(n-1);
  const Y=v=>H-m.b-((Math.min(v,top)-bot)/((top-bot)||1))*(H-m.t-m.b);
  const yf=o.yfmt||compact;
  ticks.forEach(t=>{svg.append(sv('line',{x1:m.l,x2:W-m.r,y1:Y(t),y2:Y(t),class:t===0?'axis':'grid'}),sv('text',{x:m.l-8,y:Y(t)+4,'text-anchor':'end'},yf(t)))});
  const every=Math.ceil(n/(o.maxLabels||Math.max(3,Math.floor(W/80))));o.xs.forEach((x,i)=>{if(i===n-1||(i%every===0&&n-1-i>=Math.ceil(every*.75)))svg.append(sv('text',{x:X(i),y:H-8,'text-anchor':n<2?'middle':i===0?'start':i===n-1?'end':'middle'},o.xlabel?o.xlabel(x,i):x))});
  if(o.threshold){const y=Y(o.threshold.value);svg.append(sv('line',{x1:m.l,x2:W-m.r,y1:y,y2:y,stroke:'var(--muted)','stroke-dasharray':'5 4','stroke-width':1.3}),sv('text',{x:W-m.r,y:y-5,'text-anchor':'end'},o.threshold.label))}
  o.series.forEach((s,si)=>{let d='',a='',start=-1;s.values.forEach((v,i)=>{if(v==null){if(start>=0&&s.area){a+='L'+X(i-1)+' '+Y(0)+'Z'}start=-1;return}d+=(start<0?'M':'L')+X(i).toFixed(1)+' '+Y(v).toFixed(1);if(s.area){a+=(start<0?'M'+X(i).toFixed(1)+' '+Y(0)+'L':'L')+X(i).toFixed(1)+' '+Y(v).toFixed(1)}start=i});if(start>=0&&s.area)a+='L'+X(start)+' '+Y(0)+'Z';
    if(s.area)svg.append(sv('path',{d:a,fill:fills[si],opacity:PATTERNS?.5:.14}));
    svg.append(sv('path',{d:d,fill:'none',stroke:s.colour||'var(--accent)','stroke-width':s.width||2.4,'stroke-dasharray':s.dash||null,'stroke-linejoin':'round','stroke-linecap':'round',opacity:s.faint?.55:1}));
    if(n<=40||s.points)s.values.forEach((v,i)=>{if(v!=null)svg.append(sv('circle',{cx:X(i),cy:Y(v),r:n<=14?3.2:2,fill:s.colour||'var(--accent)'}))});
    s.values.forEach((v,i)=>{if(v!=null&&v>top)svg.append(sv('text',{x:X(i),y:m.t-3,'text-anchor':'middle',class:'tot'},yf(v)+' ▲'))})});
  const cross=sv('line',{y1:m.t,y2:H-m.b,stroke:'var(--ink)','stroke-width':1,opacity:0});const dots=o.series.map(s=>sv('circle',{r:5,fill:s.colour||'var(--accent)',stroke:'var(--surface)','stroke-width':2,opacity:0}));svg.append(cross,...dots);
  hoverColumns(svg,{n:Math.max(n,1),left:m.l-(W-m.l-m.r)/(2*Math.max(n-1,1))*(n>1?1:0),right:m.r-(W-m.l-m.r)/(2*Math.max(n-1,1))*(n>1?1:0),W:W,
    onIndex:(i,x,y)=>{cross.setAttribute('x1',X(i));cross.setAttribute('x2',X(i));cross.setAttribute('opacity',.35);dots.forEach((d,k)=>{const v=o.series[k].values[i];d.setAttribute('cx',X(i));d.setAttribute('cy',v==null?-99:Y(v));d.setAttribute('opacity',v==null?0:1)});
      showTip(x,y,o.xlabel?o.xlabel(o.xs[i],i,true):o.xs[i],o.series.map((s,k)=>({label:s.name,colour:s.colour,value:s.values[i]==null?'no data':(o.tipfmt||o.yfmt||money0)(s.values[i])})))},
    onLeave:()=>{cross.setAttribute('opacity',0);dots.forEach(d=>d.setAttribute('opacity',0))}});
  return svg}

// ---- column chart (stacked or grouped), optional line overlay, optional axis cap with a visible break
function barChart(o){
  const W=CW,H=o.height||280,m={l:58,r:14,t:22,b:30},n=o.cats.length;
  const svg=sv('svg',{viewBox:'0 0 '+W+' '+H,role:'img','aria-label':o.label||'Bar chart',tabindex:0,class:'ch'});
  if(!n||o.series.every(s=>s.values.every(v=>!v))&&!(o.lines||[]).length){return h('div',{class:'note'},o.empty||'No data in this range')}
  const fills=fillSet(svg,o.series.map(s=>s.colour||'var(--accent)'));
  const stacked=o.mode!=='grouped';
  const totals=o.cats.map((_,i)=>stacked?sum(o.series.map(s=>Math.max(0,s.values[i]||0))):Math.max(0,...o.series.map(s=>s.values[i]||0)));
  const lineVals=(o.lines||[]).flatMap(l=>l.values.filter(v=>v!=null));
  let max=Math.max(1,...totals,...lineVals,0),min=Math.min(0,...lineVals);
  let capped=false;if(o.cap&&max>o.cap){max=o.cap;capped=true}
  const ticks=yTicks(min,max,4),top=ticks[ticks.length-1],bot=ticks[0];
  const step=(W-m.l-m.r)/n,bw=Math.max(3,Math.min(64,step*.72));
  const Y=v=>H-m.b-((Math.min(Math.max(v,bot),top)-bot)/((top-bot)||1))*(H-m.t-m.b);
  const yf=o.yfmt||compact;
  ticks.forEach(t=>{svg.append(sv('line',{x1:m.l,x2:W-m.r,y1:Y(t),y2:Y(t),class:t===0?'axis':'grid'}),sv('text',{x:m.l-8,y:Y(t)+4,'text-anchor':'end'},yf(t)))});
  const every=Math.ceil(n/(o.maxLabels||Math.max(3,Math.floor(W/70))));
  o.cats.forEach((c,i)=>{const cx=m.l+step*(i+.5);if(i===n-1||(i%every===0&&n-1-i>=Math.ceil(every*.75)))svg.append(sv('text',{x:cx,y:H-9,'text-anchor':'middle'},o.xlabel?o.xlabel(c):c));
    if(stacked){let acc=0;o.series.forEach((s,k)=>{const v=Math.max(0,s.values[i]||0);if(!v)return;const y0=Y(acc+v),y1=Y(acc);if(y1-y0>0.4)svg.append(sv('rect',{x:cx-bw/2,y:y0,width:bw,height:Math.max(y1-y0-(y1-y0>3?1:0),.5),rx:2,fill:fills[k],class:o.onClick?'click':null}));acc+=v})}
    else{const gw=bw/o.series.length;o.series.forEach((s,k)=>{const v=Math.max(0,s.values[i]||0);if(!v)return;const y0=Y(v),y1=Y(0);svg.append(sv('rect',{x:cx-bw/2+k*gw,y:y0,width:Math.max(gw-1.5,2),height:Math.max(y1-y0,.5),rx:2,fill:fills[k]}))})}
    if(capped&&totals[i]>top){svg.append(sv('path',{d:'M'+(cx-bw/2-2)+' '+(Y(top)+9)+'l'+(bw/4+1)+' -6 '+(bw/4+1)+' 6 '+(bw/4+1)+' -6 '+(bw/4+1)+' 6',fill:'none',stroke:'var(--surface)','stroke-width':3}),sv('text',{x:cx,y:m.t-6,'text-anchor':'middle',class:'tot'},yf(totals[i])+' ▲'))}
    else if(o.totals!==false&&n<=14&&totals[i]>0)svg.append(sv('text',{x:cx,y:Y(totals[i])-5,'text-anchor':'middle',class:'tot'},yf(totals[i])));
    if(o.onClick)svg.append(sv('rect',{x:m.l+step*i,y:m.t,width:step,height:H-m.t-m.b,fill:'transparent',class:'click',onclick:null,'data-i':i}))});
  (o.lines||[]).forEach(l=>{let d='';l.values.forEach((v,i)=>{if(v==null)return;d+=(d?'L':'M')+(m.l+step*(i+.5)).toFixed(1)+' '+Y(v).toFixed(1)});svg.append(sv('path',{d:d,fill:'none',stroke:l.colour||'var(--ink)','stroke-width':2.4,'stroke-linejoin':'round'}));l.values.forEach((v,i)=>{if(v!=null)svg.append(sv('circle',{cx:m.l+step*(i+.5),cy:Y(v),r:3,fill:l.colour||'var(--ink)'}))})});
  const hi=sv('rect',{y:m.t,height:H-m.t-m.b,width:step,fill:'var(--ink)',opacity:0});svg.insertBefore(hi,svg.firstChild.nextSibling);
  const clickLayer=[...svg.querySelectorAll('rect[data-i]')];clickLayer.forEach(r=>r.addEventListener('click',()=>o.onClick(+r.getAttribute('data-i'))));
  hoverColumns(svg,{n:n,left:m.l,right:m.r,W:W,
    onIndex:(i,x,y)=>{hi.setAttribute('x',m.l+step*i);hi.setAttribute('opacity',.06);const rows=o.series.map((s,k)=>({label:s.name,colour:s.colour,value:(o.tipfmt||money0)(s.values[i]||0),raw:s.values[i]||0})).filter(r=>r.raw).sort((a,b)=>b.raw-a.raw).slice(0,10);(o.lines||[]).forEach(l=>rows.push({label:l.name,colour:l.colour,value:l.values[i]==null?'-':(o.tipfmt||money0)(l.values[i])}));if(stacked&&o.series.length>1)rows.push({label:'Total',value:(o.tipfmt||money0)(totals[i])});showTip(x,y,o.xlabel?o.xlabel(o.cats[i],true):o.cats[i],rows)},
    onLeave:()=>hi.setAttribute('opacity',0)});
  return svg}

// ---- donut
function donut(o){
  const size=o.size||220,r=size/2-6,ri=r*.62,total=sum(o.parts.map(p=>p.value));
  const svg=sv('svg',{viewBox:'0 0 '+size+' '+size,role:'img','aria-label':o.label||'Donut chart',class:'ch',style:'max-width:'+size+'px;margin:auto'});
  if(!total)return h('div',{class:'note'},'Nothing to show');
  const fills=fillSet(svg,o.parts.map(p=>p.colour));
  const cx=size/2,cy=size/2;let a0=-Math.PI/2;const centreV=sv('text',{x:cx,y:cy+2,'text-anchor':'middle',style:'font-size:22px;font-weight:800;fill:var(--ink)'},o.centre?o.centre.value:'');const centreL=sv('text',{x:cx,y:cy+20,'text-anchor':'middle'},o.centre?o.centre.label:'');
  o.parts.forEach((p,i)=>{const frac=p.value/total,a1=a0+frac*Math.PI*2,big=a1-a0>Math.PI?1:0;
    const pt=(a,rad)=>[cx+Math.cos(a)*rad,cy+Math.sin(a)*rad];const [x0,y0]=pt(a0,r),[x1,y1]=pt(a1-(frac>.999?.0001:0),r),[x2,y2]=pt(a1-(frac>.999?.0001:0),ri),[x3,y3]=pt(a0,ri);
    const path=sv('path',{d:'M'+x0+' '+y0+'A'+r+' '+r+' 0 '+big+' 1 '+x1+' '+y1+'L'+x2+' '+y2+'A'+ri+' '+ri+' 0 '+big+' 0 '+x3+' '+y3+'Z',fill:fills[i],stroke:'var(--surface)','stroke-width':2,class:o.onClick?'click cell':'cell',tabindex:0,'aria-label':p.name+' '+(o.fmt||money0)(p.value)+', '+Math.round(frac*100)+'%'});
    const on=()=>{centreV.textContent=Math.round(frac*100)+'%';centreL.textContent=p.name.length>16?p.name.slice(0,15)+'…':p.name};const off=()=>{centreV.textContent=o.centre?o.centre.value:'';centreL.textContent=o.centre?o.centre.label:''};
    path.addEventListener('pointerenter',on);path.addEventListener('pointerleave',off);path.addEventListener('focus',on);path.addEventListener('blur',off);if(o.onClick)path.addEventListener('click',()=>o.onClick(p));
    svg.append(path);a0=a1});
  svg.append(centreV,centreL);return svg}

// ---- ranked horizontal bars (HTML). items:[{label,value,sub,colour,onClick,tag}]
function hbars(items,o){o=o||{};const max=Math.max(1,...items.map(i=>Math.abs(i.value)));const fmt=o.fmt||money0;
  if(!items.length)return h('div',{class:'note'},o.empty||'Nothing to show');
  return h('div',{class:'hb'},items.map(i=>h('div',{class:'r'+(i.onClick?' click':''),title:i.label+': '+fmt(i.value),tabindex:i.onClick?0:null,on:i.onClick?{click:i.onClick,keydown:e=>{if(e.key==='Enter')i.onClick()}}:{}},
    h('span',{class:'l'},i.label),h('span',{class:'t'},h('i',{style:'width:'+Math.max(2,Math.abs(i.value)/max*100)+'%;background:'+(i.colour||'var(--accent)')})),h('span',{class:'v'},fmt(i.value),i.tag?h('span',{style:'margin-left:6px'},i.tag):null),i.sub?h('span',{class:'s'},i.sub):null)))}

// ---- heatmap. matrix[r][c] numbers (null = no data). norm: row | global
function heatmap(o){
  const nr=o.rows.length,nc=o.cols.length,cw=Math.max(26,Math.min(64,Math.floor(880/Math.max(nc,1)))),ch=o.cellH||26,lw=o.labelW||130,W=lw+nc*cw+10,H=22+nr*ch+6;
  if(!nr||!nc)return h('div',{class:'note'},'No data in this range');
  const svg=sv('svg',{viewBox:'0 0 '+W+' '+H,role:'img','aria-label':o.label||'Heatmap',class:'ch',style:'min-width:'+Math.min(W,720)+'px'});
  const gmax=Math.max(1,...o.matrix.flat().map(v=>v||0));
  o.cols.forEach((c,j)=>{if(nc<=18||j%2===0)svg.append(sv('text',{x:lw+j*cw+cw/2,y:14,'text-anchor':'middle'},o.collabel?o.collabel(c):c))});
  o.rows.forEach((r,i)=>{svg.append(sv('text',{x:lw-8,y:22+i*ch+ch/2+4,'text-anchor':'end',style:'text-transform:capitalize'},r.length>20?r.slice(0,19)+'…':r));
    const rmax=Math.max(1,...o.matrix[i].map(v=>v||0));
    o.cols.forEach((c,j)=>{const v=o.matrix[i][j];const sc=(o.norm==='row'?rmax:gmax);const t=v==null||v<=0?0:Math.sqrt(v/sc);
      const rect=sv('rect',{x:lw+j*cw+1,y:22+i*ch+1,width:cw-2,height:ch-2,rx:4,fill:v==null?'var(--sunk)':'var(--accent)','fill-fill':null,opacity:v==null?.5:(v<=0?.07:.12+.88*t),class:'cell'+(o.onClick?' click':''),tabindex:0,'aria-label':r+' '+c+' '+(v==null?'no data':(o.fmt||money0)(v))});
      rect.addEventListener('pointermove',e=>showTip(e.clientX,e.clientY,r+' · '+(o.collabel?o.collabel(c):c),[{label:o.unit||'Spend',value:v==null?'no data':(o.fmt||money0)(v)}]));rect.addEventListener('pointerleave',hideTip);
      rect.addEventListener('focus',()=>{const b=rect.getBoundingClientRect();showTip(b.left+b.width/2,b.top,r+' · '+(o.collabel?o.collabel(c):c),[{label:o.unit||'Spend',value:v==null?'no data':(o.fmt||money0)(v)}])});rect.addEventListener('blur',hideTip);
      if(o.onClick)rect.addEventListener('click',()=>o.onClick(i,j));svg.append(rect);
      if(o.showValues&&v>0&&cw>=40&&t>.5)svg.append(sv('text',{x:lw+j*cw+cw/2,y:22+i*ch+ch/2+4,'text-anchor':'middle',style:'fill:'+(t>.7?'var(--accent-ink)':'var(--ink)')+';font-weight:700;font-size:10px;pointer-events:none'},compact(v)))})});
  return h('div',{style:'overflow-x:auto'},svg)}

// ---- calendar heatmap of daily values. days: Map 'YYYY-MM-DD' -> number
function calendar(o){
  const days=o.days;const keys=[...days.keys()].sort();if(!keys.length)return h('div',{class:'note'},'No data in this range');
  const parse=s=>new Date(s+'T00:00:00Z');const start=parse(keys[0]),end=parse(keys[keys.length-1]);
  const mon=d=>(d.getUTCDay()+6)%7;const first=new Date(start.getTime()-mon(start)*864e5);
  const weeks=Math.ceil(((end-first)/864e5+1)/7);const cs=15,g=3,lw=30,W=lw+weeks*(cs+g)+8,H=22+7*(cs+g);
  const vals=[...days.values()].filter(v=>v>0);const cap=Math.max(1,quantile(vals,.95));
  const svg=sv('svg',{viewBox:'0 0 '+W+' '+H,role:'img','aria-label':o.label||'Daily spending calendar',class:'ch',style:'min-width:'+Math.min(W,760)+'px'});
  ['Mon','','Wed','','Fri','','Sun'].forEach((t,i)=>{if(t)svg.append(sv('text',{x:0,y:22+i*(cs+g)+cs-3},t))});
  let lastM='';
  for(let w=0;w<weeks;w++){for(let d=0;d<7;d++){const dt=new Date(first.getTime()+(w*7+d)*864e5);if(dt<start||dt>end)continue;const k=dt.toISOString().slice(0,10),v=days.get(k)||0;
    const ml=k.slice(0,7);if(d===0&&ml!==lastM&&k.slice(8)<'08'){svg.append(sv('text',{x:lw+w*(cs+g),y:12},monthName(ml)));lastM=ml}
    const rect=sv('rect',{x:lw+w*(cs+g),y:22+d*(cs+g),width:cs,height:cs,rx:3,fill:v>0?'var(--accent)':'var(--sunk)',opacity:v>0?.18+.82*Math.sqrt(Math.min(v,cap)/cap):1,class:'cell'+(o.onClick?' click':''),'aria-label':fmtDate(k)+' '+money0(v)});
    rect.addEventListener('pointermove',e=>showTip(e.clientX,e.clientY,fmtDate(k),[{label:'Spent',value:money0(v)}]));rect.addEventListener('pointerleave',hideTip);if(o.onClick)rect.addEventListener('click',()=>o.onClick(k));svg.append(rect)}}
  return h('div',{style:'overflow-x:auto'},svg)}

// ---- treemap (squarified)
function squarify(items,x,y,w,h2){const total=sum(items.map(i=>i.value));const out=[];if(!total)return out;let rem=items.map(i=>({item:i,area:i.value*(w*h2)/total}));let rx=x,ry=y,rw=w,rh=h2;
  const worst=(row,side)=>{const s=sum(row.map(r=>r.area)),mx=Math.max(...row.map(r=>r.area)),mn=Math.min(...row.map(r=>r.area));return Math.max(side*side*mx/(s*s),(s*s)/(side*side*mn))};
  while(rem.length){const side=Math.min(rw,rh);let row=[rem[0]],i=1;while(i<rem.length&&worst(row.concat([rem[i]]),side)<=worst(row,side)){row.push(rem[i]);i++}
    const s=sum(row.map(r=>r.area));
    if(rw>=rh){const cw=s/rh;let cy=ry;for(const r of row){const chh=r.area/cw;out.push({item:r.item,x:rx,y:cy,w:cw,h:chh});cy+=chh}rx+=cw;rw-=cw}
    else{const chh=s/rw;let cx=rx;for(const r of row){const cw=r.area/chh;out.push({item:r.item,x:cx,y:ry,w:cw,h:chh});cx+=cw}ry+=chh;rh-=chh}
    rem=rem.slice(row.length)}return out}
function treemap(o){const W=CW,H=o.height||340;const items=o.items.filter(i=>i.value>0).sort((a,b)=>b.value-a.value);if(!items.length)return h('div',{class:'note'},'Nothing to show');
  const svg=sv('svg',{viewBox:'0 0 '+W+' '+H,role:'img','aria-label':o.label||'Treemap',class:'ch'});const fills=fillSet(svg,items.map(i=>i.colour));const total=sum(items.map(i=>i.value));
  squarify(items,0,0,W,H).forEach(r=>{const i=items.indexOf(r.item);const g=sv('g',{class:'cell'+(o.onClick?' click':''),tabindex:0,'aria-label':r.item.label+' '+money0(r.item.value)},sv('rect',{x:r.x+1.5,y:r.y+1.5,width:Math.max(r.w-3,0),height:Math.max(r.h-3,0),rx:6,fill:fills[i],opacity:.92}));
    if(r.w>70&&r.h>38){g.append(sv('text',{x:r.x+10,y:r.y+22,style:'fill:#fff;font-weight:700;font-size:13px;text-transform:capitalize;paint-order:stroke;stroke:rgba(0,0,0,.6);stroke-width:3px'},r.item.label.length>Math.floor(r.w/8)?r.item.label.slice(0,Math.max(3,Math.floor(r.w/8)-1))+'…':r.item.label),sv('text',{x:r.x+10,y:r.y+38,style:'fill:#fff;font-size:12px;paint-order:stroke;stroke:rgba(0,0,0,.6);stroke-width:3px'},money0(r.item.value)+' · '+Math.round(r.item.value/total*100)+'%'))}
    g.addEventListener('pointermove',e=>showTip(e.clientX,e.clientY,r.item.label,[{label:'Spend',value:money0(r.item.value)},{label:'Share',value:Math.round(r.item.value/total*1000)/10+'%'}]));g.addEventListener('pointerleave',hideTip);if(o.onClick)g.addEventListener('click',()=>o.onClick(r.item));svg.append(g)});
  return svg}

// ---- sparkline
function spark(values,o){o=o||{};const w=o.w||120,hh=o.h||32,n=values.length;const svg=sv('svg',{viewBox:'0 0 '+w+' '+hh,width:o.fluid?'100%':w,height:hh,role:'img','aria-label':o.label||'Trend',style:o.fluid?'display:block':''});
  if(n<2)return n?svg:h('span',{class:'s'},'-');const max=Math.max(...values),min=Math.min(0,...values),X=i=>2+i*(w-4)/(n-1),Y=v=>hh-3-((v-min)/((max-min)||1))*(hh-8);
  if(o.bars){const bw=Math.max(2,(w-4)/n-2);values.forEach((v,i)=>svg.append(sv('rect',{x:X(i)-bw/2,y:Y(v),width:bw,height:Math.max(1,hh-3-Y(v)),rx:1.5,fill:i===n-1?'var(--accent)':'var(--line-2)'})));return svg}
  let d='';values.forEach((v,i)=>{d+=(i?'L':'M')+X(i).toFixed(1)+' '+Y(v).toFixed(1)});svg.append(sv('path',{d:d+'L'+X(n-1)+' '+Y(min)+'L'+X(0)+' '+Y(min)+'Z',fill:'var(--accent)',opacity:.12}),sv('path',{d:d,fill:'none',stroke:'var(--accent)','stroke-width':1.8,'stroke-linejoin':'round'}),sv('circle',{cx:X(n-1),cy:Y(values[n-1]),r:2.6,fill:'var(--accent)'}));return svg}

// ---- gauge bar against a target (budgets): tone by how much of the target is used
function gauge(o){const pct=o.target>0?o.value/o.target:0;const tone=pct>1?'tone-bad':pct>=.85?'tone-warn':'tone-ok';
  return h('div',{class:'gauge',title:o.label+': '+money0(o.value)+' of '+money0(o.target)},h('span',{style:'text-transform:capitalize'},o.label),h('span',{class:'t'},h('i',{class:tone,style:'width:'+Math.min(100,pct*100)+'%'}),pct>1?h('i',{class:'mark',style:'left:'+Math.min(98,100/pct)+'%'}):null),h('span',{style:'text-align:right;font-weight:700'},money0(o.value),h('span',{class:'s',style:'font-weight:500;margin-left:4px'},'of '+money0(o.target)+' · '+(pct>1?'over':pct>=.85?'nearly':'on track'))))}

// ---- waterfall. steps:[{label,value,total?,colour}] value positive = adds, negative = takes away
function waterfall(o){const W=CW,H=o.height||300,m={l:58,r:14,t:20,b:56},n=o.steps.length;if(!n)return h('div',{class:'note'},'Nothing to show');
  const svg=sv('svg',{viewBox:'0 0 '+W+' '+H,role:'img','aria-label':o.label||'Waterfall',class:'ch'});let run=0;const pos=o.steps.map(s=>{if(s.total){const r={s:s,from:0,to:s.value};run=s.value;return r}const r={s:s,from:run,to:run+s.value};run+=s.value;return r});
  const hi=Math.max(...pos.flatMap(p=>[p.from,p.to]),1),lo=Math.min(...pos.flatMap(p=>[p.from,p.to]),0),ticks=yTicks(lo,hi,4),top=ticks[ticks.length-1],bot=ticks[0];const Y=v=>H-m.b-((v-bot)/((top-bot)||1))*(H-m.t-m.b),step=(W-m.l-m.r)/n,bw=Math.min(70,step*.7),lim=step<70?Math.max(5,Math.floor(step*1.9/6)):12;
  ticks.forEach(t=>svg.append(sv('line',{x1:m.l,x2:W-m.r,y1:Y(t),y2:Y(t),class:t===0?'axis':'grid'}),sv('text',{x:m.l-8,y:Y(t)+4,'text-anchor':'end'},compact(t))));
  pos.forEach((p,i)=>{const cx=m.l+step*(i+.5),y0=Y(Math.max(p.from,p.to)),y1=Y(Math.min(p.from,p.to));const col=p.s.total?(p.s.value>=0?'var(--ok)':'var(--decide)'):(p.s.value>=0?'var(--ok)':(p.s.colour||'var(--c2)'));
    const r=sv('rect',{x:cx-bw/2,y:y0,width:bw,height:Math.max(y1-y0,1.5),rx:3,fill:col,class:'cell'});r.addEventListener('pointermove',e=>showTip(e.clientX,e.clientY,p.s.label,[{label:p.s.total?'Total':'Change',value:money0(p.s.value)}]));r.addEventListener('pointerleave',hideTip);svg.append(r);
    svg.append(sv('text',{x:cx,y:y0-5,'text-anchor':'middle',class:'tot'},(p.s.total?'':(p.s.value>=0?'+':''))+compact(p.s.value)),sv('text',{x:cx,y:H-m.b+16+(step<70&&i%2?13:0),'text-anchor':'middle',style:'text-transform:capitalize'},p.s.label.length>lim?p.s.label.slice(0,lim-1)+'…':p.s.label));
    if(i<n-1)svg.append(sv('line',{x1:cx+bw/2,x2:cx+step-bw/2,y1:Y(p.to),y2:Y(p.to),stroke:'var(--line-2)','stroke-dasharray':'3 3'}))});
  return svg}

// ---- sankey-style flow: sources -> sinks, each source split in proportion to the sinks (a proportional view)
function flow(o){const W=CW,H=o.height||340,nw=16,pad=8;const L=o.left.filter(x=>x.value>0),R=o.right.filter(x=>x.value>0);const tl=sum(L.map(x=>x.value)),tr=sum(R.map(x=>x.value));if(!tl||!tr)return h('div',{class:'note'},'Needs money in and spending in this range');
  const svg=sv('svg',{viewBox:'0 0 '+W+' '+H,role:'img','aria-label':o.label||'Money flow',class:'ch'});const sc=(H-pad*Math.max(L.length,R.length))/Math.max(tl,tr);
  let y=0;const ln=L.map(x=>{const hh=x.value*sc;const r={x:x,y:y,h:hh};y+=hh+pad;return r});y=0;const rn=R.map(x=>{const hh=x.value*sc;const r={x:x,y:y,h:hh};y+=hh+pad;return r});
  const lm=Math.min(190,Math.round(W*.3)),lc=Math.max(6,Math.floor((lm-10)/6.3)),lx=lm,rx=W-lm-nw;const lo=ln.map(n=>({o:0}));const ro=rn.map(n=>({o:0}));
  ln.forEach((a,i)=>{rn.forEach((b,j)=>{const share=b.x.value/tr;const hh=a.h*share;const y0=a.y+(lo[i].o);const y1=b.y+(ro[j].o);lo[i].o+=hh;ro[j].o+=a.h*share*(tl/tr)*0+ (a.x.value*share*sc*(tr>0?1:0))*0+hh;
    const cxm=(lx+nw+rx)/2;svg.append(sv('path',{d:'M'+(lx+nw)+' '+y0+'C'+cxm+' '+y0+' '+cxm+' '+y1+' '+rx+' '+y1+'L'+rx+' '+(y1+hh)+'C'+cxm+' '+(y1+hh)+' '+cxm+' '+(y0+hh)+' '+(lx+nw)+' '+(y0+hh)+'Z',fill:b.x.colour||'var(--accent)',opacity:.28}))})});
  ln.forEach(a=>{svg.append(sv('rect',{x:lx,y:a.y,width:nw,height:Math.max(a.h,2),rx:3,fill:'var(--ok)'}),sv('text',{x:lx-8,y:a.y+Math.min(a.h/2,14)+4,'text-anchor':'end',style:'text-transform:capitalize'},(a.x.label.length>lc?a.x.label.slice(0,lc-1)+'…':a.x.label)+' '+compact(a.x.value)))});
  rn.forEach(b=>{svg.append(sv('rect',{x:rx,y:b.y,width:nw,height:Math.max(b.h,2),rx:3,fill:b.x.colour||'var(--accent)'}),sv('text',{x:rx+nw+8,y:b.y+Math.min(b.h/2,12)+4,style:'text-transform:capitalize'},(b.x.label.length>lc?b.x.label.slice(0,lc-1)+'…':b.x.label)+' '+compact(b.x.value)))});
  return svg}

function dataTable(head,rows,caption){return h('div',{style:'overflow-x:auto'},h('table',{class:'dtable'},caption?h('caption',{},caption):null,h('thead',{},h('tr',{},...head.map((x,i)=>h('th',{class:i===0?'l':'',scope:'col'},x)))),h('tbody',{},rows.map(r=>h('tr',{},...r.map((c,i)=>h('td',{class:i===0?'l':''},c==null?'':String(c))))))))}
`;

// The core charts above, then the distribution / ranking / text charts from charts-more.ts, as one stylesheet and one script.
export const CHARTS_CSS = CHARTS_CSS_CORE + CHARTS_MORE_CSS;
export const CHARTS_JS = CHARTS_JS_CORE + CHARTS_MORE_JS;
