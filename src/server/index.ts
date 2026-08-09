/** Karma Visual Rendering Engine - HTTP server. */

import express from "express";
import type { Request, Response } from "express";
import { safeValidateRenderRequest } from "../core/schema";
import { buildDocument } from "../renderer/document";
import { renderHtml, shutdownBrowser } from "../export/exporter";
import { KNOWN_ICONS } from "../icons/icons";
import { THEMES } from "../theme/themes";
import { safeValidateVideoRequest } from "../video/video-schema";
import { renderVideoBuffer } from "../video/render-video";

const app = express();
app.use(express.json({ limit: "50mb" }));

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "karma-renderer", themes: Object.keys(THEMES), icons: KNOWN_ICONS.length });
});

app.get("/icons", (_req: Request, res: Response) => {
  res.json({ icons: KNOWN_ICONS });
});

app.post("/render", async (req: Request, res: Response) => {
  const validated = safeValidateRenderRequest(req.body);
  if (!validated.ok) {
    res.status(400).json({ success: false, error: validated.error });
    return;
  }
  const { spec, format = "png", width, height, scale = 1 } = validated.data;
  const finalWidth = width ?? spec.width ?? 1920;
  const finalHeight = height ?? spec.height ?? 1080;
  const finalScale = format === "png" ? Math.max(1, Math.min(scale, 4)) : 1;

  try {
    const html = await buildDocument(spec as never, { width: finalWidth, height: finalHeight });
    const result = await renderHtml(html, { format, width: finalWidth, height: finalHeight, scale: finalScale });
    res.setHeader("Content-Type", result.mimeType);
    res.setHeader("Content-Length", result.buffer.length);
    res.setHeader("X-Karma-Renderer", "visual-engine-v1");
    res.send(result.buffer);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[render] failed:", msg);
    res.status(500).json({ success: false, error: "Render failed: " + msg });
  }
});

app.post("/video", async (req: Request, res: Response) => {
  const validated = safeValidateVideoRequest(req.body);
  if (!validated.ok) {
    res.status(400).json({ success: false, error: validated.error });
    return;
  }

  try {
    const result = await renderVideoBuffer(validated.data);
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Length", result.buffer.length);
    res.setHeader("X-Karma-Renderer", "remotion-video-v1");
    res.setHeader("X-Karma-Video-Fps", String(result.fps));
    res.setHeader("X-Karma-Video-Duration", String(Math.round(result.durationInFrames / result.fps)));
    res.send(result.buffer);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[video] render failed:", msg);
    res.status(500).json({ success: false, error: "Video render failed: " + msg });
  }
});

const port = Number(process.env.PORT ?? 3000);
const server = app.listen(port, () => {
  console.log(`[karma-renderer] listening on :${port}`);
});

process.on("SIGTERM", async () => {
  await shutdownBrowser();
  server.close(() => process.exit(0));
});
process.on("SIGINT", async () => {
  await shutdownBrowser();
  server.close(() => process.exit(0));
});
