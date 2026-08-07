import { layoutGraph } from "./src/layout/layout";

async function main() {
  const components = [
    { id: "NEW", type: "oval", label: "NEW" },
    { id: "RUN", type: "box", label: "RUNNABLE" },
    { id: "BLK", type: "diamond", label: "BLOCKED?" },
    { id: "WAI", type: "box", label: "WAITING" },
    { id: "TER", type: "oval", label: "TERMINATED" },
  ];
  const connections = [
    { from: "NEW", to: "RUN" },
    { from: "RUN", to: "BLK" },
    { from: "BLK", to: "WAI" },
    { from: "BLK", to: "TER" },
  ];
  const r = await layoutGraph(components as never, connections as never, [] as never, 1920, 1080, "DOWN", "layered");
  console.log("nodes:", r.nodes.length, r.nodes.map((n) => `${n.id}@(${Math.round(n.x)},${Math.round(n.y)})`));
  console.log("edges:", r.edges.length, r.edges.map((e) => `${e.from}->${e.to}`));
  console.log("containers:", r.containers.length);
}

main().catch((e) => {
  console.error("ERR", e);
  process.exit(1);
});
