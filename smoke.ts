import { buildDocument } from "./src/renderer/document";
import { renderHtml, shutdownBrowser } from "./src/export/exporter";
import { validateRenderRequest } from "./src/core/schema";
import * as fs from "fs";

async function main() {
  const spec = {
    layout: "flow",
    theme: "whiteboard",
    title: "MULTITHREADED APP",
    subtitle: "Threads in a single process share memory",
    width: 1920,
    height: 1080,
    components: [
      { id: "app", type: "box", label: "APP", fill: "#DAE8FC", line: "#6C8EBF", icon: "app" },
      { id: "t1", type: "box", label: "DOWNLOAD", icon: "download" },
      { id: "t2", type: "box", label: "MUSIC", icon: "play" },
      { id: "t3", type: "box", label: "UI UPDATE", icon: "monitor" },
      { id: "mem", type: "cylinder", label: "SHARED MEMORY", icon: "database" },
    ],
    connections: [
      { from: "app", to: "t1", style: "orthogonal" },
      { from: "app", to: "t2", style: "orthogonal" },
      { from: "app", to: "t3", style: "orthogonal" },
      { from: "t1", to: "mem", style: "orthogonal" },
      { from: "t2", to: "mem", style: "orthogonal" },
      { from: "t3", to: "mem", style: "orthogonal" },
    ],
    instructions: ["A process can run multiple tasks in parallel using threads."],
    code: { lang: "java", text: "ExecutorService pool = Executors.newFixedThreadPool(4);" },
  };

  const html = await buildDocument(validateRenderRequest({ spec }).spec as never, { width: 1920, height: 1080 });
  fs.writeFileSync("./smoke-out.html", html, "utf8");

  const png = await renderHtml(html, { format: "png", width: 1920, height: 1080, scale: 2 });
  fs.writeFileSync("./smoke-out.png", png.buffer);
  console.log("PNG bytes:", png.buffer.length);

  await shutdownBrowser();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
