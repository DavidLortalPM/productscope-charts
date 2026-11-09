// Chart groups: the order the charts appear on the home page. Used for the chips, the grouped gallery, the "more like this" cards,
// previous/next links, and the generated docs.
export interface Group { id: string; name: string; blurb: string; paths: string[] }
export const GROUPS: Group[] = [
  { id: "time", name: "Over time", blurb: "See how a measure moves, repeats or clusters across days, weeks and months.", paths: ["/line", "/area", "/sparkline", "/calendar", "/heatmap", "/small-multiples"] },
  { id: "compare", name: "Comparing", blurb: "Set one thing against another, in order or step by step.", paths: ["/bars", "/hbars", "/waterfall", "/diverging-bars", "/slope", "/bump"] },
  { id: "spread", name: "Spread and relationships", blurb: "See how values are distributed and whether two measures move together.", paths: ["/histogram", "/box-plot", "/scatter"] },
  { id: "parts", name: "Parts of a whole", blurb: "Show what a total is made of and where it goes.", paths: ["/stacked", "/donut", "/treemap", "/flow", "/funnel"] },
  { id: "glance", name: "At a glance", blurb: "Single figures, targets, the words people use and the exact numbers behind them.", paths: ["/gauge", "/kpi-tiles", "/word-cloud", "/data-table"] },
];
