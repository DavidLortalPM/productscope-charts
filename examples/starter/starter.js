// Made-up numbers. Replace them with your own.
const months = ['2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07'];
const spend = [1820, 2310, 1960, 2540, 2150, 2870];
const income = [3050, 3100, 3050, 3200, 3150, 3300];
const categories = [
  { name: 'Housing', value: 1210 },
  { name: 'Groceries', value: 438 },
  { name: 'Transport', value: 262 },
  { name: 'Eating out', value: 301 },
  { name: 'Leisure', value: 244 },
  { name: 'Other', value: 415 }
];

// Give each category one colour for every chart. The first eight get --c1 to --c8; anything else is grey.
setCategoryOrder(categories.filter(c => c.name !== 'Other').map(c => c.name));

const state = { patterns: false, table: false };
const $ = id => document.getElementById(id);

// Every chart has a table version built from the same data, for people who prefer or need one.
const tables = {
  line: () => dataTable(['Month', 'Spend'], months.map((m, i) => [monthName(m), money0(spend[i])]), 'Monthly spend'),
  bars: () => dataTable(['Month', 'Money in', 'Spending'], months.map((m, i) => [monthName(m), money0(income[i]), money0(spend[i])]), 'Money in and spending'),
  donut: () => dataTable(['Category', 'Amount'], categories.map(c => [c.name, money0(c.value)]), 'Spending by category, July 2026')
};

const charts = {
  line: () => lineChart({
    xs: months,
    xlabel: monthName,
    series: [{ name: 'Spend', values: spend, colour: 'var(--c1)', area: true }],
    yfmt: compact,
    label: 'Monthly spend, February to July 2026'
  }),
  bars: () => h('div', {},
    barChart({
      cats: months,
      xlabel: monthName,
      mode: 'grouped',
      series: [
        { name: 'Money in', colour: 'var(--c3)', values: income },
        { name: 'Spending', colour: 'var(--c2)', values: spend }
      ],
      label: 'Money in and spending by month'
    }),
    legend([{ name: 'Money in', colour: 'var(--c3)' }, { name: 'Spending', colour: 'var(--c2)' }])),
  donut: () => donut({
    parts: categories.map(c => ({ name: c.name, value: c.value, colour: c.name === 'Other' ? 'var(--c9)' : catColor(c.name) })),
    centre: { value: money0(categories.reduce((t, c) => t + c.value, 0)), label: 'July' },
    size: 240,
    label: 'Spending by category, July 2026'
  })
};

function draw() {
  setPatterns(state.patterns);
  for (const id of Object.keys(charts)) {
    const host = $(id);
    // Charts are drawn at the width they are given, so measure the container first.
    setChartWidth(host.clientWidth || 600);
    host.replaceChildren(state.table ? tables[id]() : charts[id]());
  }
}

function toggle(id, key) {
  const button = $(id);
  button.addEventListener('click', () => {
    state[key] = !state[key];
    button.setAttribute('aria-pressed', String(state[key]));
    draw();
  });
}
toggle('patterns', 'patterns');
toggle('table', 'table');

draw();
// Redraw when a container changes size, so text stays readable from a phone to a desktop.
let last = 0;
new ResizeObserver(() => {
  const w = $('line').clientWidth;
  if (Math.abs(w - last) < 6) return;
  last = w;
  draw();
}).observe($('line'));
