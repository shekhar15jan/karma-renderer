/** Karma Visual Rendering Engine - HTTP server. */

import express from "express";
import type { Request, Response } from "express";
import { safeValidateRenderRequest } from "../core/schema";
import { buildDocument } from "../renderer/document";
import { KNOWN_ICONS } from "../icons/icons";
import { THEMES } from "../theme/themes";
import { safeValidateVideoRequest, sanitizeVideoRequest } from "../video/video-schema";
import { renderVideoBuffer, renderStaticSlideVideo, renderHybridSlideVideo, getCurrentRenderProgress, renderThumbnailBuffer } from "../video/render-video";
import { CATALOGUE } from "../catalogue/index";
import { FRAME_COMPONENTS } from "../video/frames/registry";
import { TECH_ICONS } from "../icons/techIcons.generated";
import { assignWithFallback, type SceneComponent } from "../catalogue/assign";

const app = express();
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ limit: "200mb", extended: true }));

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "karma-renderer", themes: Object.keys(THEMES), icons: KNOWN_ICONS.length });
});

app.get("/icons", (_req: Request, res: Response) => {
  res.json({ icons: KNOWN_ICONS });
});

/** The frame/widget/icon catalogue, for a read-only browser UI (never used by the
 *  render pipeline itself — that reads catalogue/index.ts directly, in-process). */
app.get("/catalogue", (_req: Request, res: Response) => {
  res.json({
    version: CATALOGUE.version,
    atoms: CATALOGUE.atoms,
    frames: CATALOGUE.frames.map((f) => ({
      ...f,
      migrated: Boolean(FRAME_COMPONENTS[f.id]),
    })),
    widgets: CATALOGUE.widgets,
    icons: Object.values(TECH_ICONS).map((i) => ({
      slug: i.slug,
      title: i.title,
      category: i.category,
      hex: i.hex,
      source: i.source,
    })),
  });
});

interface ValidateScene {
  sceneIndex: number;
  frameId: string;
  components: SceneComponent[];
}

/** Dry-run slot assignment for a proposed frame+components pairing, without rendering.
 *  Used by the Director Agent (karma-backend) to confirm a chosen frame's slot contract
 *  is actually satisfiable — including the fallback walk assignWithFallback already
 *  does internally — before it's accepted into the script. No I/O, pure/synchronous. */
app.post("/catalogue/validate", (req: Request, res: Response) => {
  const scenes = req.body?.scenes;
  if (!Array.isArray(scenes)) {
    res.status(400).json({ success: false, error: "expected { scenes: [{ sceneIndex, frameId, components }] }" });
    return;
  }
  try {
    const results = scenes.map((s: ValidateScene) => {
      const assignment = assignWithFallback(s.frameId, s.components ?? []);
      return {
        sceneIndex: s.sceneIndex,
        frame: s.frameId,
        resolvedFrame: assignment.frame,
        unsatisfied: assignment.unsatisfied,
        issues: assignment.issues,
      };
    });
    res.json({ success: true, results });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(400).json({ success: false, error: "Validation failed: " + msg });
  }
});

app.get("/video/progress", (_req: Request, res: Response) => {
  const progress = getCurrentRenderProgress();
  if (!progress) {
    res.json({ success: false, error: "no render in progress" });
    return;
  }
  res.json(progress);
});

app.post("/thumbnail", async (req: Request, res: Response) => {
  const body = req.body ?? {};
  if (typeof body.title !== "string" || body.title.trim() === "") {
    res.status(400).json({ success: false, error: "title is required" });
    return;
  }
  try {
    const buffer = await renderThumbnailBuffer({
      title: body.title.slice(0, 80),
      subtitle: typeof body.subtitle === "string" ? body.subtitle.slice(0, 40) : undefined,
      badges: Array.isArray(body.badges) ? body.badges.filter((b: unknown) => typeof b === "string").map((b: string) => b.slice(0, 16)) : [],
      channelName: typeof body.channelName === "string" ? body.channelName.slice(0, 40) : undefined,
    });
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Length", buffer.length);
    res.send(buffer);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[thumbnail] render failed:", msg);
    res.status(500).json({ success: false, error: "Thumbnail render failed: " + msg });
  }
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
      : validated.data.sceneMotion === "hybrid"
      ? await renderHybridSlideVideo(validated.data)
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
