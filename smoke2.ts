import { buildDocument } from "./src/renderer/document";
import { renderHtml, shutdownBrowser } from "./src/export/exporter";
import { validateRenderRequest } from "./src/core/schema";
import * as fs from "fs";

async function render(name: string, spec: any, w = 1920, h = 1080) {
  const html = await buildDocument(validateRenderRequest({ spec }).spec as never, { width: w, height: h });
  fs.writeFileSync(`./smoke-${name}.html`, html, "utf8");
  const png = await renderHtml(html, { format: "png", width: w, height: h, scale: 2 });
  fs.writeFileSync(`./smoke-${name}.png`, png.buffer);
  console.log(name, "PNG bytes:", png.buffer.length);
}

async function main() {
  // containers + cards
  await render("containers", {
    layout: "grid",
    theme: "corporate",
    title: "Microservices Architecture",
    components: [
      { type: "container", label: "Client Layer", items: ["Mobile App", "Web App", "API Consumer"], fill: "#f0f6ff" },
      { type: "container", label: "API Gateway", items: ["Load Balancer", "Auth Proxy"], fill: "#fff7e6" },
      { type: "container", label: "Services", items: ["Orders", "Payments", "Inventory", "Users"], fill: "#e6fff2" },
      { type: "container", label: "Data Layer", items: ["Postgres", "Redis", "Kafka"], fill: "#faf5ff" },
    ],
    instructions: ["One-way traffic flows through the gateway."],
  });

  // cards
  await render("cards", {
    layout: "cards",
    theme: "whiteboard",
    title: "Java Architect Roadmap",
    components: [
      { type: "stat-card", label: "Projects Shipped", data: { value: "24", unit: "apps" }, icon: "app" },
      { type: "title-card", label: "Core Java", sublabel: "Collections, JVM, Concurrency", icon: "java" },
      { type: "bullet-card", label: "Must-Know", items: ["Collections & Streams", "JVM Memory Model", "Concurrency", "GC & Tuning"] },
      { type: "warning-card", label: "Watch Out", data: { message: "Race conditions in shared state" }, icon: "warning" },
      { type: "summary-card", label: "Summary", data: { summary: "Master fundamentals before frameworks." } },
    ],
  });

  // charts
  await render("charts", {
    layout: "grid",
    theme: "technical",
    title: "System Metrics",
    components: [
      { type: "bar-chart", label: "Requests/sec", items: ["Mon", "Tue", "Wed", "Thu", "Fri"], data: { values: [420, 380, 510, 470, 620] } },
      { type: "pie-chart", label: "Traffic", items: ["Web", "Mobile", "API"], data: { values: [50, 30, 20] } },
      { type: "line-chart", label: "Latency", items: ["1h", "2h", "3h", "4h", "5h"], data: { values: [40, 35, 55, 45, 38] } },
      { type: "progress", label: "Deploy", data: { values: [75], max: 100 } },
    ],
  });

  // timeline
  await render("timeline", {
    layout: "roadmap",
    theme: "corporate",
    title: "Sprint Roadmap",
    components: [
      { type: "roadmap", label: "Q3 Releases", items: [
        { label: "MVP Core", sublabel: "Week 1-4" },
        { label: "Integrations", sublabel: "Week 5-8" },
        { label: "Scale & Harden", sublabel: "Week 9-12" },
        { label: "Launch", sublabel: "Week 13" },
      ] },
    ],
  });

  // table
  await render("table", {
    layout: "poster",
    theme: "minimal",
    title: "Feature Comparison",
    components: [
      { type: "table", label: "Plan Comparison", data: {
        headers: ["Feature", "Free", "Pro", "Enterprise"],
        rows: [["Users", "5", "50", "∞"], ["Storage", "1GB", "100GB", "10TB"], ["Support", "Community", "Email", "24/7 SLA"]],
      } },
    ],
  });

  // dark graph with diamond + containers
  await render("darkflow", {
    layout: "flow",
    theme: "dark",
    title: "Thread Lifecycle",
    components: [
      { type: "oval", label: "NEW", fill: "#1e3a5f" },
      { type: "box", label: "RUNNABLE", fill: "#123f33" },
      { type: "diamond", label: "BLOCKED?", fill: "#5a4512" },
      { type: "box", label: "WAITING", fill: "#4a2239" },
      { type: "oval", label: "TERMINATED", fill: "#2d2a63" },
    ],
    connections: [
      { from: "NEW", to: "RUNNABLE", label: "start()" },
      { from: "RUNNABLE", to: "BLOCKED?", label: "synchronized" },
      { from: "BLOCKED?", to: "WAITING", label: "YES" },
      { from: "BLOCKED?", to: "TERMINATED", label: "NO" },
    ],
    instructions: ["A thread moves between states as the JVM schedules it."],
    code: { lang: "java", text: "Thread t = new Thread(task); t.start();" },
  });

  await shutdownBrowser();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
