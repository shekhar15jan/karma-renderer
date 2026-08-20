/** render-video - bundles the composition, resolves metadata and renders an MP4. */

import path from "path";
import fs from "fs";
import os from "os";
import { spawn, spawnSync } from "child_process";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia, renderStill } from "@remotion/renderer";
import { enableTailwind } from "@remotion/tailwind";
import type { ValidatedVideoRequest } from "./video-schema";
import { estimateSceneSeconds, type CaptionCue } from "./prepare";
import { generateSRT } from "./compositions/Captions";

const COMPOSITION_ID = "karma-video";

/** Resolves the Tailwind config explicitly so utilities are generated regardless of CWD. */
export function resolveTailwindConfig(): string {
  return path.resolve(__dirname, "..", "..", "tailwind.config.js");
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

/** Retains the rendered MP4 in a persistent directory before the temp file is removed.
 *  Enabled via KARMA_VIDEO_OUTPUT_DIR so failed/timeout requests can still be recovered. */
async function retainOutput(outputLocation: string): Promise<string | null> {
  const dir = process.env.KARMA_VIDEO_OUTPUT_DIR;
  if (!dir) return null;
  try {
    await fs.promises.mkdir(dir, { recursive: true });
    const target = path.join(dir, path.basename(outputLocation));
    await fs.promises.copyFile(outputLocation, target);
    console.log(`[video] retained output at ${target}`);
    return target;
  } catch (e) {
    console.warn("[video] could not retain output:", e instanceof Error ? e.message : String(e));
    return null;
  }
}

export interface VideoRenderResult {
  buffer: Buffer;
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
}

export interface RenderProgress {
  status: "rendering" | "encoding" | "done" | "failed";
  renderedFrames: number;
  encodedFrames: number;
  totalFrames: number;
  progress: number;
  stitchStage?: string;
  renderEstimatedTime?: number;
}

/** Live progress of the most recent (or in-flight) video render. Exposed via
 *  GET /video/progress so the backend can relay frame-level progress to clients. */
let currentProgress: RenderProgress | null = null;

export function getCurrentRenderProgress(): RenderProgress | null {
  return currentProgress;
}

export async function renderVideoBuffer(request: ValidatedVideoRequest): Promise<VideoRenderResult> {
  const entryPoint = resolveRemotionEntry();

  const inputProps = { video: request };

  const serveUrl = await bundle({
    entryPoint,
    webpackOverride: (current) => enableTailwind(current, { configLocation: resolveTailwindConfig() }),
    onProgress: (p) => p,
  });
  const composition = await selectComposition({ serveUrl, id: COMPOSITION_ID, inputProps });
  currentProgress = {
    status: "rendering",
    renderedFrames: 0,
    encodedFrames: 0,
    totalFrames: composition.durationInFrames,
    progress: 0,
  };

  const outputLocation = path.join(os.tmpdir(), `karma-video-${process.pid}-${Date.now()}.mp4`);
  try {
    const concurrency = resolveConcurrency();
    const x264Preset = (process.env.X264_PRESET ?? "veryfast").trim() || "veryfast";
    const jpegQuality = clampInt(process.env.JPEG_QUALITY, 1, 100, 90);
    await renderMedia({
      composition,
      serveUrl,
      codec: "h264",
      outputLocation,
      inputProps,
      chromiumOptions: { gl: "swangle" },
      concurrency,
      x264Preset: x264Preset as "ultrafast" | "superfast" | "veryfast" | "fast" | "faster" | "medium" | "slow" | "slower" | "veryslow" | "placebo",
      crf: 18,
      jpegQuality,
      logLevel: "error",
      onProgress: (p) => {
        if (!currentProgress) return;
        currentProgress.renderedFrames = p.renderedFrames;
        currentProgress.encodedFrames = p.encodedFrames;
        currentProgress.progress = Math.round(p.progress * 1000) / 10;
        currentProgress.stitchStage = p.stitchStage;
        if (p.renderEstimatedTime != null) currentProgress.renderEstimatedTime = p.renderEstimatedTime;
      },
    });
    if (currentProgress) {
      currentProgress.status = "done";
      currentProgress.renderedFrames = composition.durationInFrames;
      currentProgress.progress = 100;
    }
    const retained = await retainOutput(outputLocation);
    const buffer = await fs.promises.readFile(outputLocation);
    return {
      buffer,
      width: composition.width,
      height: composition.height,
      fps: composition.fps,
      durationInFrames: composition.durationInFrames,
    };
  } catch (e) {
    if (currentProgress) {
      currentProgress.status = "failed";
      currentProgress.progress = 100;
    }
    throw e;
  } finally {
    try {
      await fs.promises.unlink(outputLocation);
    } catch {
      /* ignore */
    }
  }
}

/* ----------------------------------------------------------------------------
 * Static-slide pipeline (sceneMotion === "static")
 *
 * Renders ONE still per scene (matching "1 duration = 1 scene = 1 frame") and
 * assembles the video with system ffmpeg: xfade transitions between scenes,
 * word-synced captions burned via the subtitles filter, narration audio placed
 * at exact scene offsets, and background music ducked under narration.
 * Turns a ~2h software render into a few minutes.
 * ------------------------------------------------------------------------- */

function buildCues(scenes: SlideScene[], fps: number): CaptionCue[] {
  const cues: CaptionCue[] = [];
  for (const scene of scenes) {
    if (scene.captions) {
      for (const cue of scene.captions) {
        cues.push({
          start: scene.startFrame / fps + cue.start,
          end: scene.startFrame / fps + cue.end,
          text: cue.text,
        });
      }
    }
  }
  return cues;
}

/** Prefer a full ffmpeg (xfade/subtitles support); fall back to Remotion's bundled minimal one. */
function resolveFfmpeg(): string {
  const candidates = [
    process.env.FFMPEG_PATH,
    "ffmpeg",
    "/usr/bin/ffmpeg",
    "/usr/local/bin/ffmpeg",
    path.join(__dirname, "..", "..", "node_modules", "@remotion", "compositor-linux-x64-gnu", "ffmpeg"),
    path.join(__dirname, "..", "..", "node_modules", "@remotion", "compositor-linux-x64-musl", "ffmpeg"),
  ].filter((c): c is string => Boolean(c));
  for (const c of candidates) {
    try {
      const r = spawnSync(c, ["-hide_banner", "-version"], { encoding: "utf8" });
      if (r.status === 0 && r.stdout) return c;
    } catch {
      /* try next */
    }
  }
  throw new Error("ffmpeg not found on system or in Remotion bundle");
}

function resolveFfprobe(): string {
  const candidates = [
    process.env.FFPROBE_PATH,
    "ffprobe",
    "/usr/bin/ffprobe",
    path.join(__dirname, "..", "..", "node_modules", "@remotion", "compositor-linux-x64-gnu", "ffprobe"),
    path.join(__dirname, "..", "..", "node_modules", "@remotion", "compositor-linux-x64-musl", "ffprobe"),
  ].filter((c): c is string => Boolean(c));
  for (const c of candidates) {
    try {
      const r = spawnSync(c, ["-version"], { encoding: "utf8" });
      if (r.status === 0) return c;
    } catch {
      /* try next */
    }
  }
  throw new Error("ffprobe not found");
}

function probeAudioSeconds(file: string): number {
  const r = spawnSync(resolveFfprobe(),
    ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", file],
    { encoding: "utf8" });
  const d = parseFloat((r.stdout ?? "").trim());
  return Number.isFinite(d) && d > 0 ? d : 0;
}

function writeDataUriFile(dataUri: string, filePath: string): void {
  const comma = dataUri.indexOf(",");
  const b64 = comma >= 0 ? dataUri.slice(comma + 1) : dataUri;
  fs.writeFileSync(filePath, Buffer.from(b64, "base64"));
}

function runFfmpeg(bin: string, args: string[], tag: string, timeoutMs = 20 * 60 * 1000): Promise<void> {
  return new Promise((resolve, reject) => {
    const p = spawn(bin, ["-nostdin", ...args]);
    let err = "";
    const timer = setTimeout(() => {
      p.kill("SIGKILL");
      reject(new Error(`${tag} ffmpeg timed out after ${Math.round(timeoutMs / 60000)} minutes: ${err.slice(-2000)}`));
    }, timeoutMs);
    p.stderr.on("data", (d: Buffer) => {
      err += d.toString();
    });
    p.on("error", (e) => {
      clearTimeout(timer);
      reject(e);
    });
    p.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve();
      else reject(new Error(`${tag} ffmpeg exited ${code}: ${err.slice(-2000)}`));
    });
  });
}

function xfadeName(type: string | undefined): string {
  switch (type) {
    case "slide-left": return "slideleft";
    case "slide-right": return "slideright";
    case "slide-up": return "slideup";
    case "slide-down": return "slidedown";
    case "wipe-left": return "wipeleft";
    case "wipe-right": return "wiperight";
    default: return "fade"; // zoom/flip/fade -> crossfade
  }
}

function escapeFilterPath(p: string): string {
  return p.replace(/\\/g, "/").replace(/:/g, "\\:").replace(/'/g, "\\'");
}

/** Builds a libass force_style from the validated captions config (preset/fontSize/position),
 *  so the static (still + xfade) path honors the same settings as the Remotion path. */
function buildLibassStyle(captions: { preset?: string; fontSize?: number; position?: number } | undefined, height: number): string {
  const preset = captions?.preset ?? "youtube";
  const fontSize = captions?.fontSize ?? 28;
  const position = captions?.position ?? 0.85;

  const fontPx = Math.max(8, Math.round((fontSize / 1080) * height));
  const box = preset === "bold" || preset === "youtube";
  const bold = preset === "bold" || preset === "youtube";
  const outline = preset === "clean" || preset === "minimal" ? 1 : 0;
  const shadow = preset === "bold" ? 1 : preset === "youtube" ? 1 : 0;
  const alignment = position >= 0.7 ? 2 : position <= 0.3 ? 8 : 5;
  const marginV = Math.round(height * 0.02);

  return [
    "FontName=Inter",
    `FontSize=${fontPx}`,
    "PrimaryColour=&H00FFFFFF",
    "OutlineColour=&H00000000",
    box ? "BackColour=&H99000000" : "BackColour=&H80000000",
    box ? "BorderStyle=4" : "BorderStyle=1",
    `Outline=${outline}`,
    `Shadow=${shadow}`,
    `MarginV=${marginV}`,
    `Alignment=${alignment}`,
    bold ? "Bold=1" : "Bold=0",
  ].join(",");
}

interface NarrationSource {
  file: string;
  offsetSec: number;
}

interface SlideScene {
  index: number;
  startFrame: number;
  durationFrames: number;
  audio?: string;
  spec: any;
  captions?: Array<{ start: number; end: number; text: string }>;
}

/** Builds the slide timeline in Node (getAudioDurationInSeconds is browser-only), probing
 *  narration durations with ffprobe. Mirrors prepare.ts behaviour. */
function buildSlideTimeline(request: ValidatedVideoRequest, narrationFiles: (string | null)[]): {
  introFrames: number;
  transition: number;
  endPaddingFrames: number;
  scenes: SlideScene[];
} {
  const fps = request.fps;
  const introFrames = !request.enableIntro
    ? 0
    : Math.round(Math.min(6, Math.max(2.2, 2 + (request.introTitle ?? "Karma OS").length / 12)) * fps);
  const scenes: SlideScene[] = [];
  let cursor = introFrames;
  request.scenes.forEach((scene, i) => {
    const file = narrationFiles[i];
    let dur: number;
    if (file) {
      dur = Math.max(1, Math.round(probeAudioSeconds(file) * fps));
    } else {
      dur = Math.max(1, Math.round(estimateSceneSeconds(scene.visualSpec as any) * fps));
    }
    scenes.push({
      index: i,
      startFrame: cursor,
      durationFrames: dur,
      audio: scene.audio,
      spec: scene.visualSpec as any,
      captions: scene.captions as any,
    });
    cursor += dur;
  });
  return { introFrames, transition: request.transitionDuration, endPaddingFrames: request.endPaddingFrames, scenes };
}

export async function renderStaticSlideVideo(request: ValidatedVideoRequest): Promise<VideoRenderResult> {
  const entryPoint = resolveRemotionEntry();
  const inputProps = { video: request };

  const serveUrl = await bundle({
    entryPoint,
    webpackOverride: (current) => enableTailwind(current, { configLocation: resolveTailwindConfig() }),
    onProgress: (p) => p,
  });
  const composition = await selectComposition({ serveUrl, id: COMPOSITION_ID, inputProps });
  const fps = composition.fps;
  const width = composition.width;
  const height = composition.height;

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "karma-slide-"));
  try {
    const ffmpeg = resolveFfmpeg();

    // write narration audio first (needed to probe durations in Node)
    const narrationFiles: (string | null)[] = request.scenes.map((scene, i) => {
      if (!scene.audio) return null;
      const file = path.join(tmp, `nar-${i}.audio`);
      writeDataUriFile(scene.audio, file);
      return file;
    });
    const timeline = buildSlideTimeline(request, narrationFiles);
    const { introFrames, transition, endPaddingFrames } = timeline;
    const preparedScenes = timeline.scenes;
    const transitionSec = transition / fps;
    const transitionType = request.transition;
    const lastScene = preparedScenes[preparedScenes.length - 1];
    const endScreenStartFrame = lastScene ? lastScene.startFrame + lastScene.durationFrames + transition : 0;
    const endScreenFrames = Math.min(endPaddingFrames ?? 60, 180);
    const endDur = endScreenFrames / fps;
    const sceneDurs = preparedScenes.map((s) => s.durationFrames / fps);
    const introDur = introFrames / fps;
    const totalSec = introDur + sceneDurs.reduce((a, b) => a + b, 0) + endDur;

    const stillCount = (introFrames > 0 ? 1 : 0) + preparedScenes.length + (endScreenFrames > 0 ? 1 : 0);
    currentProgress = { status: "rendering", renderedFrames: 0, encodedFrames: 0, totalFrames: stillCount, progress: 0 };

    const stillPaths: string[] = [];
    const renderStillFrame = async (frame: number, name: string): Promise<void> => {
      const output = path.join(tmp, name);
      const maxFrame = Math.max(0, composition.durationInFrames - 1);
      const safeFrame = Math.min(Math.max(0, frame), maxFrame);
      await renderStill({ composition, serveUrl, inputProps, frame: safeFrame, output });
      if (currentProgress) {
        currentProgress.renderedFrames += 1;
        currentProgress.progress = Math.round((currentProgress.renderedFrames / Math.max(1, currentProgress.totalFrames)) * 1000) / 10;
      }
      stillPaths.push(output);
    };

    if (introFrames > 0) {
      await renderStillFrame(Math.max(0, introFrames - 5), "still-intro.png");
    }
    for (const scene of preparedScenes) {
      const frame = Math.min(scene.startFrame + transition + 5, scene.startFrame + scene.durationFrames - 1);
      await renderStillFrame(frame, `still-${scene.index}.png`);
    }
    if (endScreenFrames > 0) {
      await renderStillFrame(endScreenStartFrame + 5, "still-end.png");
    }

    const narrations: NarrationSource[] = preparedScenes
      .filter((s) => narrationFiles[s.index])
      .map((s) => ({ file: narrationFiles[s.index] as string, offsetSec: s.startFrame / fps }));
    let musicFile: string | null = null;
    if (request.music) {
      musicFile = path.join(tmp, "music.audio");
      writeDataUriFile(request.music, musicFile);
    }

    // captions SRT (word-synced, burned via libass)
    let captionsPath: string | null = null;
    if (request.captions?.burnIn) {
      const cues = buildCues(preparedScenes, fps);
      if (cues.length > 0) {
        captionsPath = path.join(tmp, "captions.srt");
        fs.writeFileSync(captionsPath, generateSRT(cues));
      }
    }

    // ---- segment layout ------------------------------------------------------
    // segStills + segDurs are xfaded together; the end still is hard-concatenated.
    const segStills = stillPaths.slice(0, endScreenFrames > 0 ? -1 : undefined);
    const segDurs: number[] = [];
    if (introFrames > 0) segDurs.push(introDur);
    for (let i = 0; i < preparedScenes.length; i++) {
      segDurs.push(sceneDurs[i] + (i === preparedScenes.length - 1 ? 0 : transitionSec));
    }
    const nSegs = segStills.length;

    // ---- input args ----------------------------------------------------------
    const inputArgs: string[] = [];
    segStills.forEach((sp, i) => inputArgs.push("-loop", "1", "-t", String(segDurs[i]), "-i", sp));
    if (endScreenFrames > 0) {
      inputArgs.push("-loop", "1", "-t", String(endDur), "-i", stillPaths[stillPaths.length - 1]);
    }
    narrations.forEach((n) => inputArgs.push("-i", n.file));
    if (musicFile) inputArgs.push("-i", musicFile);

    // ---- video filter graph --------------------------------------------------
    const vGraph: string[] = [];
    const totalInputs = stillPaths.length;
    for (let i = 0; i < totalInputs; i++) {
      vGraph.push(`[${i}:v]fps=${fps},scale=${width}:${height},setsar=1[v${i}]`);
    }
    let label = "v0";
    let offset = 0;
    for (let k = 1; k < nSegs; k++) {
      offset += segDurs[k - 1] - transitionSec;
      const out = `x${k}`;
      vGraph.push(`[${label}][v${k}]xfade=transition=${xfadeName(transitionType)}:duration=${transitionSec}:offset=${offset}[${out}]`);
      label = out;
    }
    if (captionsPath) {
      const style = buildLibassStyle(request.captions, height);
      vGraph.push(`[${label}]subtitles='${escapeFilterPath(captionsPath)}':force_style='${style}'[vsub]`);
      label = "vsub";
    }
    vGraph.push(`[${label}]format=yuv420p,fps=${fps}[vA]`);
    if (endScreenFrames > 0) {
      vGraph.push(`[v${totalInputs - 1}]format=yuv420p,fps=${fps}[vE]`);
      vGraph.push(`[vA][vE]concat=n=2:v=1:a=0[vout]`);
    } else {
      vGraph.push(`[vA]copy[vout]`);
    }

    const videoOut = path.join(tmp, "video.mp4");
    await runFfmpeg(ffmpeg,
      [...inputArgs, "-filter_complex", vGraph.join(";"), "-map", "[vout]", "-an",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-r", String(fps), videoOut],
      "video");

    // ---- audio filter graph (narrations at scene offsets + ducked music) -----
    // IMPORTANT: the audio ffmpeg gets its OWN input list (narrations + music
    // only), NOT the video `inputArgs`. Reusing `inputArgs` would also hand the
    // audio process all the `-loop 1` still images as unmapped inputs; those
    // looping image demuxers never reach EOF while the graph drains, which can
    // wedge ffmpeg in a flush deadlock (infinite reads, no muxer finalization).
    const audioInputArgs: string[] = [];
    narrations.forEach((n) => audioInputArgs.push("-i", n.file));
    if (musicFile) audioInputArgs.push("-i", musicFile);
    const musicIdx = narrations.length;

    const aGraph: string[] = [];
    const narLabels: string[] = [];
    narrations.forEach((n, j) => {
      const ms = Math.round(n.offsetSec * 1000);
      // Pad to the full timeline (FINITE) so amix sees EOF on every input and
      // terminates. Infinite `apad` inside an amix graph deadlocks ffmpeg 5.1
      // (pad filter never receives EOF -> produces frames forever).
      aGraph.push(`[${j}:a]adelay=${ms}:all=1,apad=whole_dur=${totalSec}[n${j}]`);
      narLabels.push(`n${j}`);
    });
    if (narLabels.length === 0 && !musicFile) {
      aGraph.push("anullsrc=r=48000:cl=stereo[aout]");
    } else if (narLabels.length === 0 && musicFile) {
      aGraph.push(`[${musicIdx}:a]atrim=0:${totalSec},volume=${request.musicVolume}[aout]`);
    } else if (narLabels.length > 0 && !musicFile) {
      const mix = narLabels.map((l) => `[${l}]`).join("");
      aGraph.push(`${mix}amix=inputs=${narLabels.length}:normalize=0[aout]`);
    } else {
      const mix = narLabels.map((l) => `[${l}]`).join("");
      aGraph.push(`${mix}amix=inputs=${narLabels.length}:normalize=0[nar]`);
      aGraph.push(`[${musicIdx}:a]atrim=0:${totalSec},volume=${request.musicVolume}[mus]`);
      aGraph.push(`[mus][nar]sidechaincompress=threshold=0.02:ratio=10:attack=15:release=300:makeup=1.0[duck]`);
      aGraph.push(`[duck][nar]amix=inputs=2:normalize=0[aout]`);
    }

    const audioOut = path.join(tmp, "audio.m4a");
    await runFfmpeg(ffmpeg,
      [...audioInputArgs, "-filter_complex", aGraph.join(";"), "-map", "[aout]",
        "-c:a", "aac", "-b:a", "192k", "-t", String(totalSec), audioOut],
      "audio");

    if (currentProgress) {
      currentProgress.status = "encoding";
      currentProgress.stitchStage = "encoding";
      currentProgress.progress = 80;
    }

    const finalOut = path.join(tmp, "final.mp4");
    await runFfmpeg(ffmpeg,
      ["-i", videoOut, "-i", audioOut, "-c:v", "copy", "-c:a", "copy",
        "-movflags", "+faststart", "-t", String(totalSec), finalOut],
      "mux");

    // The backend persists the renderer's response buffer as the VIDEO artifact,
    // so no recovery copy is retained here (avoids a duplicate file in
    // ready-videos). KARMA_VIDEO_OUTPUT_DIR retention remains for the still path.
    const buffer = await fs.promises.readFile(finalOut);
    if (currentProgress) {
      currentProgress.status = "done";
      currentProgress.renderedFrames = stillCount;
      currentProgress.progress = 100;
    }
    return { buffer, width, height, fps, durationInFrames: Math.round(totalSec * fps) };
  } catch (e) {
    if (currentProgress) {
      currentProgress.status = "failed";
      currentProgress.progress = 100;
    }
    throw e;
  } finally {
    try {
      fs.rmSync(tmp, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }
}
