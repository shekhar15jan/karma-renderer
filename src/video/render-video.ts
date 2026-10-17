/** render-video - bundles the composition, resolves metadata and renders an MP4. */

import path from "path";
import fs from "fs";
import os from "os";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia, renderStill } from "@remotion/renderer";
import { enableTailwind } from "@remotion/tailwind";
import type { ValidatedVideoRequest } from "./video-schema";

const COMPOSITION_ID = "karma-video";
const THUMBNAIL_COMPOSITION_ID = "karma-thumbnail";

let bundlePromise: Promise<string> | null = null;

/** Bundles the Remotion project once per process; webpack bundling dominates render latency. */
function getServeUrl(): Promise<string> {
  if (!bundlePromise) {
    bundlePromise = bundle({ entryPoint: resolveRemotionEntry(), webpackOverride: enableTailwind, onProgress: (p) => p })
      .catch((e) => {
        bundlePromise = null;
        throw e;
      });
  }
  return bundlePromise;
}

/** Optional Chrome/Chromium binary override (REMOTION_BROWSER_EXECUTABLE). */
function browserExecutable(): string | undefined {
  const value = process.env.REMOTION_BROWSER_EXECUTABLE?.trim();
  return value ? value : undefined;
}

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
  /** Start time (seconds) of each scene, in request order. */
  sceneStarts: number[];
}

export async function renderVideoBuffer(request: ValidatedVideoRequest): Promise<VideoRenderResult> {
  const inputProps = { video: request };

  const serveUrl = await getServeUrl();
  const composition = await selectComposition({ serveUrl, id: COMPOSITION_ID, inputProps, browserExecutable: browserExecutable() });
  const prepared = (composition.props as { prepared?: { scenes: { startFrame: number }[] } }).prepared;
  const sceneStarts = (prepared?.scenes ?? []).map((s) => s.startFrame / composition.fps);

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
      browserExecutable: browserExecutable(),
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
      sceneStarts,
    };
  } finally {
    try {
      await fs.promises.unlink(outputLocation);
    } catch {
      /* ignore */
    }
  }
}

export interface ThumbnailRequest {
  title: string;
  subtitle?: string;
  badges?: string[];
  channelName?: string;
  width?: number;
  height?: number;
}

/** Renders a YouTube thumbnail (PNG) from the karma-thumbnail composition. */
export async function renderThumbnailBuffer(request: ThumbnailRequest): Promise<Buffer> {
  const serveUrl = await getServeUrl();
  const inputProps = { ...request };
  const composition = await selectComposition({ serveUrl, id: THUMBNAIL_COMPOSITION_ID, inputProps, browserExecutable: browserExecutable() });
  const outputLocation = path.join(os.tmpdir(), `karma-thumb-${process.pid}-${Date.now()}.png`);
  try {
    await renderStill({
      composition,
      serveUrl,
      output: outputLocation,
      inputProps,
      imageFormat: "png",
      chromiumOptions: { gl: "swangle" },
      browserExecutable: browserExecutable(),
      logLevel: "error",
    });
    return await fs.promises.readFile(outputLocation);
  } finally {
    try {
      await fs.promises.unlink(outputLocation);
    } catch {
      /* ignore */
    }
  }
}
