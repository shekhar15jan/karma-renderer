/** render-video - bundles the composition, resolves metadata and renders an MP4. */

import path from "path";
import fs from "fs";
import os from "os";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia } from "@remotion/renderer";
import type { ValidatedVideoRequest } from "./video-schema";

const COMPOSITION_ID = "karma-video";

export interface VideoRenderResult {
  buffer: Buffer;
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
}

export async function renderVideoBuffer(request: ValidatedVideoRequest): Promise<VideoRenderResult> {
  const entryPoint = path.join(__dirname, "remotion-root.js");
  if (!fs.existsSync(entryPoint)) {
    throw new Error(`Remotion entry point not found: ${entryPoint}`);
  }

  const inputProps = { video: request };

  const serveUrl = await bundle({ entryPoint, onProgress: (p) => p });
  const composition = await selectComposition({ serveUrl, id: COMPOSITION_ID, inputProps });

  const outputLocation = path.join(os.tmpdir(), `karma-video-${process.pid}-${Date.now()}.mp4`);
  try {
    await renderMedia({
      composition,
      serveUrl,
      codec: "h264",
      outputLocation,
      inputProps,
      chromiumOptions: { gl: "swangle" },
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
