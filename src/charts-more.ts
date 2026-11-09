// Nine more chart types, added to the toolkit: histogram, box plot, word cloud, diverging bars, stacked / percent area,
// scatter and bubble, bump (rank over time), slope and funnel. Same rules as charts.ts: SVG built from scratch, no libraries,
// keyboard reachable, empty / one-point / all-zero data handled, patterns optional, and no backtick or dollar-brace sequence
// in the script (it is stored as a template literal).

export const CHARTS_MORE_CSS = String.raw`
.dv{display:flex;flex-direction:column;gap:7px}
.dv .r{display:grid;grid-template-columns:minmax(90px,170px) 1fr minmax(84px,auto);gap:10px;align-items:center;font-size:.88rem;border-radius:8px;padding:2px 4px}
.dv .r.click{cursor:pointer}.dv .r.click:hover{background:var(--sunk)}
.dv .l{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dv .t{display:grid;grid-template-columns:1fr 1fr;height:14px}
.dv .t .n,.dv .t .p{background:var(--sunk);display:flex}
.dv .t .n{justify-content:flex-end;border-radius:99px 0 0 99px}
.dv .t .p{border-radius:0 99px 99px 0;border-left:2px solid var(--ink-2)}
.dv .t i{display:block;height:100%}
.dv .n i{border-radius:99px 0 0 99px}.dv .p i{border-radius:0 99px 99px 0}
.dv .v{font-weight:700;text-align:right;white-space:nowrap}
.dv .s{grid-column:2/4;color:var(--muted);font-size:.76rem;margin-top:-4px}
.dv .dvh{display:grid;grid-template-columns:minmax(90px,170px) 1fr minmax(84px,auto);gap:10px;font-size:.78rem;color:var(--muted);padding:0 4px}
.dv .dvh .k{display:grid;grid-template-columns:1fr 1fr}.dv .dvh .k span:first-child{text-align:right;padding-right:8px}.dv .dvh .k span:last-child{padding-left:8px}
.ch .fade{transition:opacity .15s}
.ch .word{cursor:default}.ch .word.click{cursor:pointer}
.ch .word:focus{outline:none}.ch .word:focus text,.ch .word:hover text{text-decoration:underline}
.ch .ser:focus{outline:none}
`;

export const CHARTS_MORE_JS = String.raw`
// ---- roving focus: the whole set is one Tab stop, the arrow keys move between the items
function roving(nodes){
  nodes.forEach((n,i)=>{n.setAttribute('tabindex',i===0?'0':'-1');
    n.addEventListener('keydown',e=>{const k=e.key;let j=-1;
      if(k==='ArrowRight'||k==='ArrowDown')j=Math.min(nodes.length-1,i+1);
      else if(k==='ArrowLeft'||k==='ArrowUp')j=Math.max(0,i-1);
      else if(k==='Home')j=0;else if(k==='End')j=nodes.length-1;
      else if(k==='Escape'){hideTip();return}
      if(j>=0){e.preventDefault();n.setAttribute('tabindex','-1');nodes[j].setAttribute('tabindex','0');nodes[j].focus()}})})}
function tipAt(node,title,rows){const b=node.getBoundingClientRect();showTip(b.left+b.width/2,b.top+b.height/2,title,rows)}

// ---- histogram. values:[numbers]. Optional: min, max (values above max pool into a last "or more" bin), binWidth, bins,
// integer (whole-number data: width-1 bins, labels centred), share (show %), markers:[{value,label}], xfmt, yfmt, xtitle, unit
function histBins(o){
  const vals=(o.values||[]).filter(v=>v!=null&&isFinite(v)),clip=o.max!=null;
  if(!vals.length)return{vals:vals,counts:[],nb:0,lo:0,bw:1,over:0};
  let lo=o.min!=null?o.min:0,hi=clip?o.max:Math.max(...vals);if(hi<=lo)hi=lo+1;
  let bw=o.binWidth||(o.integer&&hi-lo<=40?1:niceStep(hi-lo,o.bins||Math.max(6,Math.min(16,Math.round(Math.sqrt(vals.length))))));
  if(o.integer)bw=Math.max(1,Math.round(bw));
  lo=Math.floor(lo/bw+1e-9)*bw;
  const nb=clip?Math.max(1,Math.round((hi-lo)/bw)):Math.floor((hi-lo)/bw+1e-9)+1;
  const counts=new Array(nb).fill(0);let over=0;
  vals.forEach(v=>{let i=Math.floor((v-lo)/bw+1e-9);if(i<0)i=0;if(i>=nb){i=nb-1;over++}counts[i]++});
  return{vals:vals,counts:counts,nb:nb,lo:lo,bw:bw,over:over}}
function histRange(b,i,o){const xf=o.xfmt||(v=>String(Math.round(v*1000)/1000));const x0=b.lo+i*b.bw;
  if(i===b.nb-1&&b.over)return xf(x0)+' or more';
  return o.integer&&b.bw===1?xf(x0):xf(x0)+' to '+xf(x0+b.bw)}
function histogram(o){
  const b=histBins(o);if(!b.vals.length)return h('div',{class:'note'},o.empty||'No data in this range');
  const W=CW,mk=o.markers||[],m={l:50,r:14,t:mk.length>1?36:22,b:o.xtitle?50:34},H=o.height||270;
  const xf=o.xfmt||(v=>String(Math.round(v*1000)/1000)),total=b.vals.length,share=!!o.share;
  const ys=b.counts.map(c=>share?c/total*100:c),ticks=yTicks(0,Math.max(...ys,1),4),top=ticks[ticks.length-1];
  const step=(W-m.l-m.r)/b.nb,Y=v=>H-m.b-(v/top)*(H-m.t-m.b),X=v=>m.l+(v-b.lo)/b.bw*step;
  const yf=share?(v=>(Math.round(v*10)/10)+'%'):(o.yfmt||(v=>String(v)));
  const svg=sv('svg',{viewBox:'0 0 '+W+' '+H,role:'img','aria-label':(o.label||'Histogram')+': '+total+' values, median '+xf(median(b.vals))+', highest '+xf(Math.max(...b.vals)),tabindex:0,class:'ch'});
  const fills=fillSet(svg,[o.colour||'var(--c1)']);
  ticks.forEach(t=>svg.append(sv('line',{x1:m.l,x2:W-m.r,y1:Y(t),y2:Y(t),class:t===0?'axis':'grid'}),sv('text',{x:m.l-8,y:Y(t)+4,'text-anchor':'end'},yf(t))));
  const centred=!!o.integer&&b.bw===1,every=Math.ceil((centred?b.nb:b.nb+1)/Math.max(3,Math.floor(W/62))),lastE=centred||b.over?b.nb-1:b.nb,idx=[];
  for(let e=0;e<=lastE;e+=every)idx.push(e);
  if(idx[idx.length-1]!==lastE){if(lastE-idx[idx.length-1]<every*.6)idx.pop();idx.push(lastE)}
  idx.forEach(e=>svg.append(sv('text',{x:m.l+(e+(centred?.5:0))*step,y:H-m.b+16,'text-anchor':'middle'},xf(b.lo+e*b.bw)+(e===b.nb-1&&b.over?'+':''))));
  if(o.xtitle)svg.append(sv('text',{x:m.l+(W-m.l-m.r)/2,y:H-6,'text-anchor':'middle'},o.xtitle));
  b.counts.forEach((c,i)=>{if(!ys[i])return;const y=Y(ys[i]);svg.append(sv('rect',{x:m.l+i*step+1,y:y,width:Math.max(step-2,1),height:Math.max(H-m.b-y,.5),rx:2,fill:fills[0],opacity:i===b.nb-1&&b.over?.72:1}))});
  mk.forEach((k,j)=>{const x=Math.min(W-m.r,Math.max(m.l,X(k.value)+(centred?step/2:0))),ly=11+j*13;
    svg.append(sv('line',{x1:x,x2:x,y1:ly+3,y2:H-m.b,stroke:'var(--ink-2)','stroke-width':1.4,'stroke-dasharray':'4 3'}),sv('text',{x:x+(x>W*.68?-5:5),y:ly,'text-anchor':x>W*.68?'end':'start',class:'tot'},k.label))});
  const hi=sv('rect',{y:m.t,height:H-m.t-m.b,width:step,fill:'var(--ink)',opacity:0});svg.insertBefore(hi,svg.firstChild.nextSibling);
  let cum=0;const cums=b.counts.map(c=>(cum+=c)/total*100);
  hoverColumns(svg,{n:b.nb,left:m.l,right:m.r,W:W,
    onIndex:(i,x,y)=>{hi.setAttribute('x',m.l+i*step);hi.setAttribute('opacity',.07);
      showTip(x,y,histRange(b,i,o),[{label:o.unit||'Values',value:b.counts[i]+' ('+(Math.round(b.counts[i]/total*1000)/10)+'%)'},{label:'Running total',value:Math.round(cums[i]*10)/10+'%'}])},
    onLeave:()=>hi.setAttribute('opacity',0)});
  return svg}

// ---- box plot. groups:[{label,values:[numbers],colour?}]. Whiskers reach the furthest value within 1.5 x the interquartile range;
// dots beyond are outliers. Optional: cap (clip the axis, flag outliers above it), mean (diamond), yfmt, unit
function boxStats(values){
  const v=(values||[]).filter(x=>x!=null&&isFinite(x)).sort((a,b)=>a-b);if(!v.length)return null;
  const q1=quantile(v,.25),md=quantile(v,.5),q3=quantile(v,.75),iqr=q3-q1,lf=q1-1.5*iqr,hf=q3+1.5*iqr;
  const ins=v.filter(x=>x>=lf&&x<=hf),out=v.filter(x=>x<lf||x>hf);
  return{n:v.length,min:v[0],max:v[v.length-1],q1:q1,md:md,q3:q3,wl:ins.length?ins[0]:q1,wh:ins.length?ins[ins.length-1]:q3,out:out,mean:sum(v)/v.length}}
function boxPlot(o){
  const G=o.groups.map(g=>({g:g,s:boxStats(g.values)}));
  if(!G.length||G.every(x=>!x.s))return h('div',{class:'note'},o.empty||'No data in this range');
  const W=CW,H=o.height||300,m={l:60,r:14,t:20,b:52},n=G.length,yf=o.yfmt||(v=>String(Math.round(v*1000)/1000));
  const all=G.filter(x=>x.s).flatMap(x=>[x.s.wl,x.s.wh,x.s.q3,...(o.cap?[]:x.s.out)]);
  let max=Math.max(...all,1e-9);const capped=o.cap&&Math.max(...G.filter(x=>x.s).map(x=>x.s.max))>o.cap;if(o.cap)max=Math.max(max,o.cap);
  const ticks=yTicks(0,max,4),top=ticks[ticks.length-1];
  const svg=sv('svg',{viewBox:'0 0 '+W+' '+H,role:'img','aria-label':o.label||'Box plot',tabindex:0,class:'ch'});
  const fills=fillSet(svg,G.map((x,i)=>x.g.colour||o.colour||'var(--c1)'));
  const Y=v=>H-m.b-(Math.min(v,top)/top)*(H-m.t-m.b),step=(W-m.l-m.r)/n,bw=Math.max(10,Math.min(56,step*.5)),lim=Math.max(4,Math.floor(step/6.4));
  ticks.forEach(t=>svg.append(sv('line',{x1:m.l,x2:W-m.r,y1:Y(t),y2:Y(t),class:t===0?'axis':'grid'}),sv('text',{x:m.l-8,y:Y(t)+4,'text-anchor':'end'},yf(t))));
  G.forEach((x,i)=>{const cx=m.l+step*(i+.5),s=x.s,col=x.g.colour||o.colour||'var(--c1)';
    const lab=x.g.label.length>lim?x.g.label.slice(0,lim-1)+'…':x.g.label;
    svg.append(sv('text',{x:cx,y:H-m.b+16,'text-anchor':'middle'},lab),sv('text',{x:cx,y:H-m.b+30,'text-anchor':'middle',style:'font-size:10px'},s?'n = '+s.n:'no data'));
    if(!s)return;
    svg.append(sv('line',{x1:cx,x2:cx,y1:Y(s.wh),y2:Y(s.q3),stroke:col,'stroke-width':1.6}),sv('line',{x1:cx,x2:cx,y1:Y(s.q1),y2:Y(s.wl),stroke:col,'stroke-width':1.6}),
      sv('line',{x1:cx-bw/4,x2:cx+bw/4,y1:Y(s.wh),y2:Y(s.wh),stroke:col,'stroke-width':1.6}),sv('line',{x1:cx-bw/4,x2:cx+bw/4,y1:Y(s.wl),y2:Y(s.wl),stroke:col,'stroke-width':1.6}));
    const y0=Y(s.q3),y1=Y(s.q1);
    svg.append(sv('rect',{x:cx-bw/2,y:y0,width:bw,height:Math.max(y1-y0,2),rx:3,fill:fills[i],opacity:PATTERNS?1:.32,stroke:col,'stroke-width':1.6}),sv('line',{x1:cx-bw/2,x2:cx+bw/2,y1:Y(s.md),y2:Y(s.md),stroke:'var(--ink)','stroke-width':2.6}));
    if(o.mean)svg.append(sv('path',{d:'M'+cx+' '+(Y(s.mean)-5)+'l5 5-5 5-5-5z',fill:'var(--surface)',stroke:'var(--ink)','stroke-width':1.5}));
    s.out.forEach(v=>svg.append(sv('circle',{cx:cx+((v*1e4)%7-3)*1.2,cy:Y(v),r:2.6,fill:'none',stroke:col,'stroke-width':1.4})));
    if(o.cap&&s.out.some(v=>v>top))svg.append(sv('text',{x:cx,y:m.t-6,'text-anchor':'middle',class:'tot'},yf(s.max)+' ▲'))});
  const hi=sv('rect',{y:m.t,height:H-m.t-m.b,width:step,fill:'var(--ink)',opacity:0});svg.insertBefore(hi,svg.firstChild.nextSibling);
  hoverColumns(svg,{n:n,left:m.l,right:m.r,W:W,
    onIndex:(i,x,y)=>{hi.setAttribute('x',m.l+step*i);hi.setAttribute('opacity',.06);const s=G[i].s;
      showTip(x,y,G[i].g.label,s?[{label:'Highest (whisker)',value:yf(s.wh)},{label:'75th percentile',value:yf(s.q3)},{label:'Median',value:yf(s.md)},{label:'Mean',value:yf(s.mean)},{label:'25th percentile',value:yf(s.q1)},{label:'Lowest (whisker)',value:yf(s.wl)},{label:'Outliers',value:s.out.length?s.out.length+', highest '+yf(s.max):'none'},{label:o.unit||'Values',value:String(s.n)}]:[{label:o.unit||'Values',value:'no data'}])},
    onLeave:()=>hi.setAttribute('opacity',0)});
  return svg}

// ---- word cloud. words:[{text,value,colour?,delta?}]. Largest first, placed on a spiral so nothing overlaps.
// Optional: max (words shown), fmt, unit, minSize, maxSize, onClick. Tab once, then the arrow keys move word by word.
let MCTX=null;
function textW(t,size,weight){try{if(!MCTX)MCTX=document.createElement('canvas').getContext('2d');MCTX.font=(weight||600)+' '+size+'px '+(getComputedStyle(document.documentElement).getPropertyValue('--f-ui')||getComputedStyle(document.body).fontFamily||'sans-serif');const w=MCTX.measureText(t).width;if(w>0)return w*1.07+2}catch(e){}return t.length*size*.6}
function wordCloud(o){
  const W=CW,H=o.height||Math.round(Math.max(250,Math.min(380,W*.4)));
  const ws=(o.words||[]).filter(w=>w.value>0&&w.text).sort((a,b)=>b.value-a.value).slice(0,o.max||40);
  if(!ws.length)return h('div',{class:'note'},o.empty||'No words in this range');
  const fmt=o.fmt||(v=>String(v)),minS=o.minSize||(W<520?11:13),maxS=o.maxSize||(W<520?27:44),vmax=ws[0].value,vmin=ws[ws.length-1].value;
  const size=v=>ws.length===1?maxS:vmax===vmin?(minS+maxS)/2:minS+(maxS-minS)*Math.sqrt((v-vmin)/(vmax-vmin));
  const svg=sv('svg',{viewBox:'0 0 '+W+' '+H,role:'group','aria-label':(o.label||'Word cloud')+', '+ws.length+' words, most common first',class:'ch'});
  const g=sv('g'),placed=[],nodes=[],cx=W/2,cy=H/2,ratio=W/H*.85;let omitted=0,x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
  ws.forEach(w=>{const s=size(w.value),tw=textW(w.text,s),bh=s*1.08,pad=5;let at=null;
    for(let k=0,t=0;k<2600;k++,t+=.11){const r=2.1*t,x=cx+r*Math.cos(t)*ratio,y=cy+r*Math.sin(t);
      const L=x-tw/2-pad,R=x+tw/2+pad,T=y-bh/2-pad,B=y+bh/2+pad;
      if(L<2||R>W-2||T<2||B>H-2)continue;
      let hit=false;for(let q=0;q<placed.length;q++){const p=placed[q];if(L<p.R&&R>p.L&&T<p.B&&B>p.T){hit=true;break}}
      if(!hit){at={x:x,y:y,L:L,R:R,T:T,B:B};break}}
    if(!at){omitted++;return}
    placed.push(at);x0=Math.min(x0,at.L);x1=Math.max(x1,at.R);y0=Math.min(y0,at.T);y1=Math.max(y1,at.B);
    const rows=[{label:o.unit||'Mentions',value:fmt(w.value)}];if(w.delta!=null)rows.push({label:'Change',value:(w.delta>0?'▲ +':w.delta<0?'▼ ':'= ')+Math.abs(Math.round(w.delta*10)/10)+'%'});
    const node=sv('g',{class:'word fade'+(o.onClick?' click':''),role:'img','aria-label':w.text+', '+fmt(w.value)+' '+(o.unit||'mentions').toLowerCase()+(w.delta!=null?(w.delta>0?', rising':w.delta<0?', falling':', steady'):'')},
      sv('text',{x:at.x,y:at.y+s*.34,'text-anchor':'middle',style:'font-size:'+s+'px;font-weight:600;fill:'+(w.colour||o.colour||'var(--ink-2)')},w.text));
    node.addEventListener('pointermove',e=>showTip(e.clientX,e.clientY,w.text,rows));node.addEventListener('pointerleave',hideTip);
    node.addEventListener('focus',()=>tipAt(node,w.text,rows));node.addEventListener('blur',hideTip);
    if(o.onClick)node.addEventListener('click',()=>o.onClick(w));
    g.append(node);nodes.push(node)});
  if(placed.length)g.setAttribute('transform','translate('+Math.round((W-(x0+x1))/2)+' '+Math.round((H-(y0+y1))/2)+')');
  svg.append(g);if(nodes.length)roving(nodes);svg.setAttribute('data-omitted',omitted);return svg}

// ---- diverging bars (HTML). items:[{label,value,sub?,tag?,onClick?}]: positive to the right, negative to the left.
// Optional: fmt, leftLabel, rightLabel, upColour, downColour, sort (default true: biggest rise first), empty
function divergingBars(items,o){o=o||{};
  if(!items.length)return h('div',{class:'note'},o.empty||'Nothing to show');
  const list=o.sort===false?items:items.slice().sort((a,b)=>b.value-a.value),max=Math.max(1e-9,...list.map(i=>Math.abs(i.value)));
  const fmt=o.fmt||(v=>(v>0?'+':v<0?'−':'')+Math.abs(Math.round(v*10)/10)),upC=o.upColour||'var(--c2)',dnC=o.downColour||'var(--c1)';
  return h('div',{class:'dv'},
    h('div',{class:'dvh'},h('span'),h('span',{class:'k'},h('span',{},'◀ '+(o.leftLabel||'Down')),h('span',{},(o.rightLabel||'Up')+' ▶')),h('span')),
    list.map(i=>{const w=Math.abs(i.value)/max*100,up=i.value>0,dn=i.value<0;
      return h('div',{class:'r'+(i.onClick?' click':''),title:i.label+': '+fmt(i.value),tabindex:i.onClick?0:null,on:i.onClick?{click:i.onClick,keydown:e=>{if(e.key==='Enter')i.onClick()}}:{}},
        h('span',{class:'l'},i.label),
        h('span',{class:'t'},h('span',{class:'n'},dn?h('i',{style:'width:'+Math.max(2,w)+'%;background:'+dnC}):null),h('span',{class:'p'},up?h('i',{style:'width:'+Math.max(2,w)+'%;background:'+upC}):null)),
        h('span',{class:'v'},(up?'▲ ':dn?'▼ ':'= ')+fmt(i.value),i.tag?h('span',{style:'margin-left:6px;font-weight:500'},i.tag):null),
        i.sub?h('span',{class:'s'},i.sub):null)}))}

// ---- stacked or percent area. xs, series:[{name,values,colour}]. mode: 'stacked' (default) | 'percent' (share of each x).
// Optional: direct (name each band at the right edge), xlabel, yfmt, tipfmt, height, maxLabels, label, empty
function areaChart(o){
  const n=o.xs.length,pct=o.mode==='percent',W=CW,H=o.height||300,m={l:pct?44:54,r:o.direct?Math.round(Math.min(150,W*.2)):14,t:14,b:28};
  if(!n||o.series.every(s=>s.values.every(v=>!v)))return h('div',{class:'note'},o.empty||'No data in this range');
  const svg=sv('svg',{viewBox:'0 0 '+W+' '+H,role:'img','aria-label':o.label||'Stacked area chart',tabindex:0,class:'ch'});
  const fills=fillSet(svg,o.series.map(s=>s.colour||'var(--accent)'));
  const totals=o.xs.map((_,i)=>sum(o.series.map(s=>Math.max(0,s.values[i]||0))));
  const val=(s,i)=>{const v=Math.max(0,s.values[i]||0);return pct?(totals[i]?v/totals[i]*100:0):v};
  const ticks=yTicks(0,pct?100:Math.max(1,...totals),4),top=ticks[ticks.length-1];
  const X=i=>n<2?m.l+(W-m.l-m.r)/2:m.l+i*(W-m.l-m.r)/(n-1),Y=v=>H-m.b-(v/top)*(H-m.t-m.b),yf=pct?(v=>Math.round(v)+'%'):(o.yfmt||compact),tf=o.tipfmt||o.yfmt||(v=>String(Math.round(v*10)/10));
  ticks.forEach(t=>svg.append(sv('line',{x1:m.l,x2:W-m.r,y1:Y(t),y2:Y(t),class:t===0?'axis':'grid'}),sv('text',{x:m.l-8,y:Y(t)+4,'text-anchor':'end'},yf(t))));
  const every=Math.ceil(n/(o.maxLabels||Math.max(3,Math.floor(W/80))));
  o.xs.forEach((x,i)=>{if(i===n-1||(i%every===0&&n-1-i>=Math.ceil(every*.75)))svg.append(sv('text',{x:X(i),y:H-8,'text-anchor':n<2?'middle':i===0?'start':i===n-1?'end':'middle'},o.xlabel?o.xlabel(x,i):x))});
  const lo=o.series.map(()=>new Array(n).fill(0)),up=o.series.map(()=>new Array(n).fill(0));
  for(let i=0;i<n;i++){let acc=0;o.series.forEach((s,k)=>{lo[k][i]=acc;acc+=val(s,i);up[k][i]=acc})}
  o.series.forEach((s,k)=>{
    if(n<2){const x=X(0);svg.append(sv('rect',{x:x-28,y:Y(up[k][0]),width:56,height:Math.max(Y(lo[k][0])-Y(up[k][0]),0),fill:fills[k],stroke:'var(--surface)','stroke-width':1}));return}
    let d='';for(let i=0;i<n;i++)d+=(i?'L':'M')+X(i).toFixed(1)+' '+Y(up[k][i]).toFixed(1);for(let i=n-1;i>=0;i--)d+='L'+X(i).toFixed(1)+' '+Y(lo[k][i]).toFixed(1);
    svg.append(sv('path',{d:d+'Z',fill:fills[k],stroke:'var(--surface)','stroke-width':1,'stroke-linejoin':'round'}))});
  if(o.direct)o.series.forEach((s,k)=>{const a=Y(lo[k][n-1]),b=Y(up[k][n-1]);if(a-b<12)return;const nm=s.name.length>Math.floor((m.r-12)/6.2)?s.name.slice(0,Math.max(3,Math.floor((m.r-12)/6.2)-1))+'…':s.name;svg.append(sv('text',{x:X(n-1)+(n<2?34:8),y:(a+b)/2+4},nm))});
  const cross=sv('line',{y1:m.t,y2:H-m.b,stroke:'var(--ink)','stroke-width':1,opacity:0});svg.append(cross);
  hoverColumns(svg,{n:Math.max(n,1),left:m.l-(W-m.l-m.r)/(2*Math.max(n-1,1))*(n>1?1:0),right:m.r-(W-m.l-m.r)/(2*Math.max(n-1,1))*(n>1?1:0),W:W,
    onIndex:(i,x,y)=>{cross.setAttribute('x1',X(i));cross.setAttribute('x2',X(i));cross.setAttribute('opacity',.4);
      const rows=o.series.map(s=>({label:s.name,colour:s.colour,raw:s.values[i]||0,value:tf(s.values[i]||0)+(pct&&totals[i]?' · '+Math.round((s.values[i]||0)/totals[i]*100)+'%':'')})).filter(r=>r.raw).sort((a,b)=>b.raw-a.raw);
      rows.push({label:'Total',value:tf(totals[i])});showTip(x,y,o.xlabel?o.xlabel(o.xs[i],i,true):o.xs[i],rows)},
    onLeave:()=>cross.setAttribute('opacity',0)});
  return svg}

// ---- scatter / bubble. points:[{x,y,r?,label?,group?}]. Optional: groups:{name:colour}, trend (least-squares line),
// xfmt, yfmt, xtitle, ytitle, xMax, yMax (clip), maxR, height. Tab in, then the arrow keys step through points left to right.
function scatter(o){
  const P=(o.points||[]).filter(p=>p&&isFinite(p.x)&&isFinite(p.y));
  if(!P.length)return h('div',{class:'note'},o.empty||'No data in this range');
  const W=CW,H=o.height||330,m={l:o.ytitle?72:58,r:18,t:16,b:o.xtitle?54:36},xf=o.xfmt||(v=>String(Math.round(v*100)/100)),yf=o.yfmt||xf;
  const xs=P.map(p=>p.x),ys=P.map(p=>p.y),xt=yTicks(Math.min(0,...xs),(o.xMax!=null?o.xMax:Math.max(...xs))||1,5),yt=yTicks(Math.min(0,...ys),(o.yMax!=null?o.yMax:Math.max(...ys))||1,4);
  const xl=xt[0],xh=xt[xt.length-1],yl=yt[0],yh=yt[yt.length-1],pw=W-m.l-m.r,ph=H-m.t-m.b;
  const X=v=>m.l+(Math.min(Math.max(v,xl),xh)-xl)/((xh-xl)||1)*pw,Y=v=>H-m.b-(Math.min(Math.max(v,yl),yh)-yl)/((yh-yl)||1)*ph;
  const svg=sv('svg',{viewBox:'0 0 '+W+' '+H,role:'img','aria-label':(o.label||'Scatter chart')+', '+P.length+' points',tabindex:0,class:'ch'});
  const uid=++UID,cid='sc'+uid;svg.append(sv('defs',null,sv('clipPath',{id:cid},sv('rect',{x:m.l-6,y:m.t-6,width:pw+12,height:ph+12}))));
  yt.forEach(t=>svg.append(sv('line',{x1:m.l,x2:W-m.r,y1:Y(t),y2:Y(t),class:t===yl?'axis':'grid'}),sv('text',{x:m.l-8,y:Y(t)+4,'text-anchor':'end'},yf(t))));
  xt.forEach(t=>{svg.append(sv('line',{x1:X(t),x2:X(t),y1:m.t,y2:H-m.b,class:t===xl?'axis':'grid',opacity:.5}),sv('text',{x:X(t),y:H-m.b+16,'text-anchor':'middle'},xf(t)))});
  if(o.xtitle)svg.append(sv('text',{x:m.l+pw/2,y:H-8,'text-anchor':'middle'},o.xtitle));
  if(o.ytitle)svg.append(sv('text',{x:14,y:m.t+ph/2,'text-anchor':'middle',transform:'rotate(-90 14 '+(m.t+ph/2)+')'},o.ytitle));
  const gnames=Object.keys(o.groups||{}),hasR=P.some(p=>p.r!=null),rmax=Math.max(1e-9,...P.map(p=>p.r||0)),R=p=>hasR&&p.r!=null?3+Math.sqrt(Math.max(p.r,0)/rmax)*((o.maxR||15)-3):4.2;
  const colourOf=p=>(o.groups&&o.groups[p.group])||p.colour||o.colour||'var(--c1)',shapeOf=p=>PATTERNS?Math.max(0,gnames.indexOf(p.group))%4:0;
  const plot=sv('g',{'clip-path':'url(#'+cid+')'});
  if(o.trend&&P.length>2){const mx=sum(xs)/P.length,my=sum(ys)/P.length;let sxy=0,sxx=0,syy=0;P.forEach(p=>{sxy+=(p.x-mx)*(p.y-my);sxx+=(p.x-mx)*(p.x-mx);syy+=(p.y-my)*(p.y-my)});
    if(sxx>0){const b=sxy/sxx,a=my-b*mx;plot.append(sv('line',{x1:X(xl),y1:Y(a+b*xl),x2:X(xh),y2:Y(a+b*xh),stroke:'var(--ink)','stroke-width':1.6,'stroke-dasharray':'6 4',opacity:.75}));svg.setAttribute('data-r',syy>0?(sxy/Math.sqrt(sxx*syy)).toFixed(2):'0')}}
  const order=P.map((p,i)=>i).sort((a,b)=>P[a].x-P[b].x||P[a].y-P[b].y);
  const mark=(p)=>{const x=X(p.x),y=Y(p.y),r=R(p),c=colourOf(p),k=shapeOf(p),a={fill:c,'fill-opacity':hasR?.45:.6,stroke:c,'stroke-width':1.3};
    return k===1?sv('rect',Object.assign({x:x-r,y:y-r,width:r*2,height:r*2},a)):k===2?sv('path',Object.assign({d:'M'+x+' '+(y-r*1.25)+'L'+(x+r*1.25)+' '+y+'L'+x+' '+(y+r*1.25)+'L'+(x-r*1.25)+' '+y+'Z'},a)):k===3?sv('path',Object.assign({d:'M'+x+' '+(y-r*1.2)+'L'+(x+r*1.15)+' '+(y+r*.9)+'L'+(x-r*1.15)+' '+(y+r*.9)+'Z'},a)):sv('circle',Object.assign({cx:x,cy:y,r:r},a))};
  P.forEach(p=>plot.append(mark(p)));svg.append(plot);
  const ring=sv('circle',{r:10,fill:'none',stroke:'var(--ink)','stroke-width':2,opacity:0,'pointer-events':'none'});svg.append(ring);
  const rows=p=>{const r=[{label:o.xtitle||'x',value:xf(p.x)},{label:o.ytitle||'y',value:yf(p.y)}];if(p.r!=null)r.push({label:o.rtitle||'Size',value:(o.rfmt||String)(p.r)});if(p.group)r.push({label:'Group',value:p.group,colour:colourOf(p)});return r};
  const show=(p,cx,cy)=>{ring.setAttribute('cx',X(p.x));ring.setAttribute('cy',Y(p.y));ring.setAttribute('r',R(p)+4);ring.setAttribute('opacity',1);showTip(cx,cy,p.label||'Point',rows(p))};
  const clear=()=>{ring.setAttribute('opacity',0);hideTip()};
  svg.addEventListener('pointermove',e=>{const bb=svg.getBoundingClientRect(),k=W/bb.width,px=(e.clientX-bb.left)*k,py=(e.clientY-bb.top)*k;let best=-1,bd=1e9;P.forEach((p,i)=>{const d=Math.hypot(X(p.x)-px,Y(p.y)-py);if(d<bd){bd=d;best=i}});if(best>=0&&bd<=Math.max(22,R(P[best])+10))show(P[best],e.clientX,e.clientY);else clear()});
  svg.addEventListener('pointerleave',clear);svg.addEventListener('blur',clear);
  let cur=-1;svg.addEventListener('keydown',e=>{const k=e.key;if(k==='Escape'){clear();return}if(!['ArrowRight','ArrowLeft','ArrowUp','ArrowDown','Home','End'].includes(k))return;e.preventDefault();
    cur=k==='Home'?0:k==='End'?order.length-1:Math.max(0,Math.min(order.length-1,(cur<0?(k==='ArrowRight'||k==='ArrowUp'?-1:order.length):cur)+(k==='ArrowRight'||k==='ArrowUp'?1:-1)));
    const p=P[order[cur]],bb=svg.getBoundingClientRect(),s=bb.width/W;show(p,bb.left+X(p.x)*s,bb.top+Y(p.y)*s)});
  return svg}

// ---- bump chart: rank over time. xs, series:[{name,ranks:[1 = top, null = absent],colour,values?}]. rankSeries() builds ranks
// from values. Optional: xlabel, tipfmt (for values), rowH, maxLabels. Tab in, arrow keys move between series.
function rankSeries(series){
  const n=series[0]?series[0].values.length:0,out=series.map(s=>Object.assign({},s,{ranks:new Array(n).fill(null)}));
  for(let i=0;i<n;i++)out.map((s,k)=>({k:k,v:s.values[i]})).filter(a=>a.v!=null).sort((a,b)=>b.v-a.v||a.k-b.k).forEach((a,r)=>{out[a.k].ranks[i]=r+1});
  return out}
function bump(o){
  const n=o.xs.length,S=(o.series||[]).filter(s=>s.ranks.some(r=>r!=null));
  if(!n||!S.length)return h('div',{class:'note'},o.empty||'No data in this range');
  const R=Math.max(...S.flatMap(s=>s.ranks.filter(r=>r!=null))),W=CW,lw=W<560?74:Math.min(160,Math.round(W*.17)),rowH=o.rowH||28,m={l:lw+22,r:lw+22,t:32,b:10},H=m.t+m.b+(R-1)*rowH+14;
  const svg=sv('svg',{viewBox:'0 0 '+W+' '+H,role:'group','aria-label':o.label||'Rank over time',class:'ch'});
  const X=i=>n<2?W/2:m.l+i*(W-m.l-m.r)/(n-1),Y=r=>m.t+(r-1)*rowH,every=Math.ceil(n/Math.max(2,Math.floor((W-m.l-m.r)/64)));
  for(let r=1;r<=R;r++)svg.append(sv('line',{x1:m.l-6,x2:W-m.r+6,y1:Y(r),y2:Y(r),class:'grid',opacity:.5}));
  o.xs.forEach((x,i)=>{if(i%every===0||i===n-1)svg.append(sv('text',{x:X(i),y:14,'text-anchor':'middle'},o.xlabel?o.xlabel(x,i):x))});
  const cr=n<2?10.5:Math.max(4,Math.min(10.5,(W-m.l-m.r)/(n-1)/2.3)),lim=Math.max(4,Math.floor((lw-6)/6.2)),nodes=[],gs=[];
  S.forEach((s,k)=>{const col=s.colour||'var(--c1)',g=sv('g',{class:'ser fade',role:'img','aria-label':s.name+': rank '+s.ranks.map((r,i)=>r==null?'none':r).join(', then ')});
    let d='',prev=-1;s.ranks.forEach((r,i)=>{if(r==null){prev=-1;return}if(prev<0)d+='M'+X(i)+' '+Y(r);else{const x0=X(i-1),x1=X(i),mx=(x0+x1)/2;d+='C'+mx+' '+Y(s.ranks[i-1])+' '+mx+' '+Y(r)+' '+x1+' '+Y(r)}prev=i});
    if(d)g.append(sv('path',{d:d,fill:'none',stroke:col,'stroke-width':cr>8?4:3,'stroke-linecap':'round','stroke-linejoin':'round'}));
    s.ranks.forEach((r,i)=>{if(r==null)return;g.append(sv('circle',{cx:X(i),cy:Y(r),r:cr,fill:'var(--surface)',stroke:col,'stroke-width':cr>8?2.6:2}),cr>=8?sv('text',{x:X(i),y:Y(r)+3.6,'text-anchor':'middle',style:'font-size:10px;font-weight:700;fill:var(--ink)'},r):null)});
    const first=s.ranks.findIndex(r=>r!=null),last=s.ranks.length-1-s.ranks.slice().reverse().findIndex(r=>r!=null);
    const nm=s.name.length>lim?s.name.slice(0,lim-1)+'…':s.name;
    g.append(sv('text',{x:X(first)-17,y:Y(s.ranks[first])+4,'text-anchor':'end',style:'font-weight:600;fill:var(--ink-2)'},nm));
    if(last!==first||n>1)g.append(sv('text',{x:X(last)+17,y:Y(s.ranks[last])+4,style:'font-weight:600;fill:var(--ink-2)'},nm));
    const rows=()=>s.ranks.map((r,i)=>({label:o.xlabel?o.xlabel(o.xs[i],i,true):o.xs[i],value:r==null?'not ranked':'#'+r+(s.values&&s.values[i]!=null?' · '+(o.tipfmt||String)(s.values[i]):'')}));
    const on=()=>{gs.forEach((q,j)=>q.setAttribute('opacity',j===k?1:.16))},off=()=>gs.forEach(q=>q.setAttribute('opacity',1));
    g.addEventListener('pointerenter',on);g.addEventListener('pointerleave',()=>{off();hideTip()});g.addEventListener('pointermove',e=>showTip(e.clientX,e.clientY,s.name,rows().slice(-6)));
    g.addEventListener('focus',()=>{on();tipAt(g,s.name,rows().slice(-6))});g.addEventListener('blur',()=>{off();hideTip()});
    gs.push(g);nodes.push(g)});
  gs.forEach(g=>svg.append(g));roving(nodes);return svg}

// ---- slope chart: each item from one value to another. items:[{label,from,to,colour?}]. Optional: fromLabel, toLabel,
// fmt, upColour, downColour, height. Colour shows the direction, the arrow in the label does too.
function spread(ys,gap,lo,hi){const o=ys.map((y,i)=>i).sort((a,b)=>ys[a]-ys[b]),out=ys.slice();
  for(let j=1;j<o.length;j++)out[o[j]]=Math.max(out[o[j]],out[o[j-1]]+gap);
  if(o.length&&out[o[o.length-1]]>hi){out[o[o.length-1]]=hi;for(let j=o.length-2;j>=0;j--)out[o[j]]=Math.min(out[o[j]],out[o[j+1]]-gap)}
  return out.map(y=>Math.max(lo,y))}
function slope(o){
  const it=(o.items||[]).filter(i=>i.from!=null&&i.to!=null);if(!it.length)return h('div',{class:'note'},o.empty||'Nothing to compare');
  const W=CW,narrow=W<540,lw=narrow?104:Math.min(210,Math.round(W*.26)),m={l:lw,r:lw,t:34,b:12},H=o.height||Math.max(240,it.length*22+m.t+m.b+10);
  const fmt=o.fmt||(v=>String(Math.round(v*10)/10)),upC=o.upColour||'var(--c2)',dnC=o.downColour||'var(--c1)';
  const all=it.flatMap(i=>[i.from,i.to]),lo=Math.min(...all),hi=Math.max(...all),Y=v=>m.t+(hi===lo?.5:1-(v-lo)/(hi-lo))*(H-m.t-m.b);
  const svg=sv('svg',{viewBox:'0 0 '+W+' '+H,role:'group','aria-label':o.label||'Slope chart',class:'ch'});
  svg.append(sv('text',{x:m.l,y:16,'text-anchor':'middle',class:'tot'},o.fromLabel||'Before'),sv('text',{x:W-m.r,y:16,'text-anchor':'middle',class:'tot'},o.toLabel||'After'),
    sv('line',{x1:m.l,x2:m.l,y1:m.t-8,y2:H-m.b,class:'axis'}),sv('line',{x1:W-m.r,x2:W-m.r,y1:m.t-8,y2:H-m.b,class:'axis'}));
  const gap=Math.min(15,(H-m.t-m.b)/Math.max(it.length,1)),ly=spread(it.map(i=>Y(i.from)),gap,m.t,H-m.b),ry=spread(it.map(i=>Y(i.to)),gap,m.t,H-m.b);
  const lim=Math.max(5,Math.floor((lw-52)/6.3)),nodes=[],gs=[];
  it.forEach((i,k)=>{const d=i.to-i.from,col=i.colour||(d>0?upC:d<0?dnC:'var(--muted)'),arrow=d>0?'▲':d<0?'▼':'=';
    const nm=i.label.length>lim?i.label.slice(0,lim-1)+'…':i.label,pc=i.from?Math.round(d/i.from*100):null;
    const rows=[{label:o.fromLabel||'Before',value:fmt(i.from)},{label:o.toLabel||'After',value:fmt(i.to)},{label:'Change',value:(d>0?'+':d<0?'−':'')+fmt(Math.abs(d))+(pc!=null?' ('+(pc>0?'+':'')+pc+'%)':'')}];
    const g=sv('g',{class:'ser fade',role:'img','aria-label':i.label+': '+fmt(i.from)+' to '+fmt(i.to)+(d>0?', up':d<0?', down':', unchanged')},
      sv('line',{x1:m.l,y1:Y(i.from),x2:W-m.r,y2:Y(i.to),stroke:col,'stroke-width':2.4,'stroke-linecap':'round'}),
      sv('circle',{cx:m.l,cy:Y(i.from),r:4,fill:col}),sv('circle',{cx:W-m.r,cy:Y(i.to),r:4,fill:col}),
      sv('text',{x:m.l-12,y:ly[k]+4,'text-anchor':'end',style:'fill:var(--ink-2)'},nm+'  '+fmt(i.from)),
      sv('text',{x:W-m.r+12,y:ry[k]+4,style:'fill:var(--ink-2)'},arrow+' '+fmt(i.to)+'  '+nm));
    const on=()=>gs.forEach((q,j)=>q.setAttribute('opacity',j===k?1:.18)),off=()=>gs.forEach(q=>q.setAttribute('opacity',1));
    g.addEventListener('pointerenter',on);g.addEventListener('pointerleave',()=>{off();hideTip()});g.addEventListener('pointermove',e=>showTip(e.clientX,e.clientY,i.label,rows));
    g.addEventListener('focus',()=>{on();tipAt(g,i.label,rows)});g.addEventListener('blur',()=>{off();hideTip()});
    gs.push(g);nodes.push(g)});
  gs.forEach(g=>svg.append(g));roving(nodes);return svg}

// ---- funnel: steps that can only shrink. steps:[{label,value}]. Optional: fmt, colour, rowH, between (text between steps
// shows how many carried on, default true), empty. Bars are centred, widths are a share of the first step.
function funnel(o){
  const S=o.steps||[];if(!S.length||!(S[0].value>0))return h('div',{class:'note'},o.empty||'Nothing to show');
  const W=CW,narrow=W<560,lw=narrow?96:Math.min(200,Math.round(W*.24)),rw=narrow?76:118,m={l:lw,r:rw,t:4,b:4},rowH=o.rowH||40,gap=o.between===false?8:22,n=S.length,H=m.t+m.b+n*rowH+(n-1)*gap;
  const fmt=o.fmt||(v=>Math.round(v).toLocaleString('en-GB')),first=S[0].value,pw=W-m.l-m.r,cx=m.l+pw/2,lim=Math.max(5,Math.floor((lw-12)/6.4));
  const svg=sv('svg',{viewBox:'0 0 '+W+' '+H,role:'group','aria-label':o.label||'Funnel',class:'ch'});const fills=fillSet(svg,[o.colour||'var(--c1)']);const nodes=[];
  S.forEach((s,i)=>{const y=m.t+i*(rowH+gap),bw=Math.max(3,Math.min(1,s.value/first)*pw),prev=i?S[i-1].value:null;
    const pf=Math.round(s.value/first*1000)/10,pp=prev?Math.round(s.value/prev*1000)/10:null;
    const rows=[{label:'Count',value:fmt(s.value)},{label:'Of the start',value:pf+'%'}];if(i){rows.push({label:'Of the step before',value:pp+'%'},{label:'Dropped out',value:fmt(Math.max(prev-s.value,0))})}
    const g=sv('g',{class:'ser fade',role:'img','aria-label':s.label+': '+fmt(s.value)+', '+pf+'% of the start'+(i?', '+pp+'% of the step before':'')},
      sv('rect',{x:cx-bw/2,y:y,width:bw,height:rowH,rx:5,fill:fills[0],opacity:PATTERNS?1:1-i*(.5/Math.max(n,2))}),
      sv('text',{x:m.l-12,y:y+rowH/2+4,'text-anchor':'end',style:'fill:var(--ink-2);font-weight:600'},s.label.length>lim?s.label.slice(0,lim-1)+'…':s.label),
      sv('text',{x:W-m.r+12,y:y+rowH/2-1,style:'font-weight:800;fill:var(--ink);font-size:14px'},fmt(s.value)),sv('text',{x:W-m.r+12,y:y+rowH/2+13,style:'font-size:10.5px'},pf+'% of start'));
    if(i&&o.between!==false)svg.append(sv('text',{x:cx,y:y-gap/2+4,'text-anchor':'middle',style:'font-size:11px'},'↓ '+pp+'% carried on'));
    g.addEventListener('pointermove',e=>showTip(e.clientX,e.clientY,s.label,rows));g.addEventListener('pointerleave',hideTip);
    g.addEventListener('focus',()=>tipAt(g,s.label,rows));g.addEventListener('blur',hideTip);svg.append(g);nodes.push(g)});
  roving(nodes);return svg}
`;
