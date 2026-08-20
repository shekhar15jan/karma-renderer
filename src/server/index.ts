/** Karma Visual Rendering Engine - HTTP server. */

import express from "express";
import type { Request, Response } from "express";
import { safeValidateRenderRequest } from "../core/schema";
import { buildDocument } from "../renderer/document";
import { KNOWN_ICONS } from "../icons/icons";
import { THEMES } from "../theme/themes";
import { safeValidateVideoRequest, sanitizeVideoRequest } from "../video/video-schema";
import { renderVideoBuffer, renderStaticSlideVideo, getCurrentRenderProgress } from "../video/render-video";

const app = express();
app.use(express.json({ limit: "50mb" }));

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "karma-renderer", themes: Object.keys(THEMES), icons: KNOWN_ICONS.length });
});

app.get("/icons", (_req: Request, res: Response) => {
  res.json({ icons: KNOWN_ICONS });
});

app.get("/video/progress", (_req: Request, res: Response) => {
  const progress = getCurrentRenderProgress();
  if (!progress) {
    res.json({ success: false, error: "no render in progress" });
    return;
  }
  res.json(progress);
});

app.post("/video", async (req: Request, res: Response) => {
  const validated = safeValidateVideoRequest(sanitizeVideoRequest(req.body));
  if (!validated.ok) {
    res.status(400).json({ success: false, error: validated.error });
    return;
  }

  try {
    const result = validated.data.sceneMotion === "static"
      ? await renderStaticSlideVideo(validated.data)
      : await renderVideoBuffer(validated.data);
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
  server.close(() => process.exit(0));
});
process.on("SIGINT", async () => {
  server.close(() => process.exit(0));
});
