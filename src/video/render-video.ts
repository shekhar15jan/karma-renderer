/** render-video - bundles the composition, resolves metadata and renders an MP4. */

import path from "path";
import fs from "fs";
import os from "os";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia } from "@remotion/renderer";
import { enableTailwind } from "@remotion/tailwind";
import type { ValidatedVideoRequest } from "./video-schema";

const COMPOSITION_ID = "karma-video";

/** Resolves the Remotion entry point for both dev (tsx, src/*.tsx) and prod (dist/*.js). */
export function resolveRemotionEntry(): string {
  const candidates = [
    path.join(__dirname, "remotion-root.js"),
    path.join(__dirname, "remotion-root.tsx"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  throw new Error(`Remotion entry point not found (tried: ${candidates.join(", ")})`);
}

function resolveConcurrency(): number {
  const env = Number(process.env.CONCURRENCY);
  if (Number.isInteger(env) && env > 0) {
    return env;
  }
  const cpus = Math.max(1, os.availableParallelism?.() ?? os.cpus().length);
  const freeMemMB = Math.floor(os.freemem() / 1024 / 1024);
  const memCapped = Math.max(1, Math.floor(freeMemMB / 600));
  return Math.max(1, Math.min(cpus, memCapped));
}

function clampInt(raw: string | undefined, min: number, max: number, fallback: number): number {
  const value = Number(raw);
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, Math.trunc(value)));
}

export interface VideoRenderResult {
  buffer: Buffer;
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
}

export async function renderVideoBuffer(request: ValidatedVideoRequest): Promise<VideoRenderResult> {
  const entryPoint = resolveRemotionEntry();

  const inputProps = { video: request };

  const serveUrl = await bundle({ entryPoint, webpackOverride: enableTailwind, onProgress: (p) => p });
  const composition = await selectComposition({ serveUrl, id: COMPOSITION_ID, inputProps });

  const outputLocation = path.join(os.tmpdir(), `karma-video-${process.pid}-${Date.now()}.mp4`);
  try {
    const concurrency = resolveConcurrency();
    const x264Preset = (process.env.X264_PRESET ?? "veryfast").trim() || "veryfast";
    const jpegQuality = clampInt(process.env.JPEG_QUALITY, 1, 100, 70);
    await renderMedia({
      composition,
      serveUrl,
      codec: "h264",
      outputLocation,
      inputProps,
      chromiumOptions: { gl: "swangle" },
      concurrency,
      x264Preset: x264Preset as "ultrafast" | "superfast" | "veryfast" | "fast" | "faster" | "medium" | "slow" | "slower" | "veryslow" | "placebo",
      jpegQuality,
      logLevel: "error",
    });
    const buffer = await fs.promises.readFile(outputLocation);
    return {
      buffer,
      width: composition.width,
      height: composition.height,
      fps: composition.fps,
      durationInFrames: composition.durationInFrames,
    };
  } finally {
    try {
      await fs.promises.unlink(outputLocation);
    } catch {
      /* ignore */
    }
  }
}
