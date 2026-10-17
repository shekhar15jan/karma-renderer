/** render-video - bundles the composition, resolves metadata and renders an MP4. */

import path from "path";
import fs from "fs";
import os from "os";
import { spawn, spawnSync } from "child_process";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia, renderStill, openBrowser } from "@remotion/renderer";
import { enableTailwind } from "@remotion/tailwind";
import type { ValidatedVideoRequest } from "./video-schema";
import { estimateSceneSeconds, type CaptionCue } from "./prepare";
import { generateSRT } from "./compositions/Captions";

const COMPOSITION_ID = "karma-video";

/**
 * Process-level Remotion bundle cache.
 * bundle() compiles webpack (~10s cold start). Since the entry point never changes
 * within a process lifetime, we cache the resulting serveUrl and reuse it for all
 * subsequent requests — reducing cold-start latency from ~10s to ~0ms.
 */
const bundleCache = new Map<string, string>(); // entryPoint → serveUrl

async function getCachedBundle(entryPoint: string): Promise<string> {
  if (bundleCache.has(entryPoint)) {
    console.log(`[bundle-cache] HIT — reusing bundle for ${path.basename(entryPoint)}`);
    return bundleCache.get(entryPoint)!;
  }
  console.log(`[bundle-cache] MISS — compiling bundle for ${path.basename(entryPoint)} (first request only)`);
  const serveUrl = await bundle({
    entryPoint,
    webpackOverride: (current) => enableTailwind(current, { configLocation: resolveTailwindConfig() }),
    onProgress: (p) => p,
  });
  bundleCache.set(entryPoint, serveUrl);
  console.log(`[bundle-cache] STORED — future requests will be instant`);
  return serveUrl;
}

/**
 * Bounds a single Remotion render call so an in-page hang can never stall the whole
 * process indefinitely. Root cause this guards against: KarmaGraphScene's ELK layout
 * effect has its own in-page delayRender(..., {timeoutInMilliseconds}) safety net, but
 * that bookkeeping is scoped per-composition-load and doesn't reliably carry across
 * the many small renderMedia() calls the delta-rendering burst loop below makes on a
 * single reused puppeteerInstance — confirmed live: an architecture-diagram scene's
 * graph layout hung with zero CPU activity and no error for 15+ minutes, past its own
 * 20s in-page timeout, because nothing outside the page was bounding the call itself.
 * This is the outer bound that was missing: fail loud and fast instead of hanging.
 */
class RenderTimeoutError extends Error {
  constructor(label: string, ms: number) {
    super(`Render timed out after ${Math.round(ms / 1000)}s: ${label} — likely an in-page hang (see KarmaGraphScene delayRender safety note)`);
    this.name = "RenderTimeoutError";
  }
}

async function withRenderTimeout<T>(label: string, ms: number, work: Promise<T>): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new RenderTimeoutError(label, ms)), ms);
  });
  try {
    return await Promise.race([work, timeout]);
  } finally {
    clearTimeout(timer!);
  }
}

/**
 * Like withRenderTimeout, but for calls that report their own progress (renderMedia's
 * onProgress) over a duration that legitimately varies a lot — a flat ceiling would
 * either time out a long-but-healthy render or be too loose to catch a real stall.
 * Instead this only fires after `idleMs` with NO progress tick at all; call `resetIdle()`
 * from inside the progress callback.
 */
async function withStallTimeout<T>(label: string, idleMs: number, run: (resetIdle: () => void) => Promise<T>): Promise<T> {
  let timer: NodeJS.Timeout;
  let rejectFn: (e: Error) => void = () => {};
  const arm = () => {
    clearTimeout(timer);
    timer = setTimeout(() => rejectFn(new RenderTimeoutError(label, idleMs)), idleMs);
  };
  const guard = new Promise<never>((_, reject) => {
    rejectFn = reject;
  });
  arm();
  try {
    return await Promise.race([run(arm), guard]);
  } finally {
    clearTimeout(timer!);
  }
}

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
  // A single headless Chromium render process has been observed using 1.2-1.3GB RSS
  // under real load (confirmed via kernel OOM-killer logs), not the ~600MB this used
  // to assume — that under-estimate let this auto-detection green-light more
  // concurrent render slots than available memory could actually support, causing
  // the OOM killer to kill renderer processes (and unrelated ones sharing the same
  // memory-constrained host) mid-render.
  const memCapped = Math.max(1, Math.floor(freeMemMB / 1400));
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

  const serveUrl = await getCachedBundle(entryPoint);
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
    // Renders at composition_width*scale x composition_height*scale and ships that
    // directly — nothing downscales it back. scale:2 was quietly delivering 4K
    // (4x the pixel count) for every request regardless of the resolution actually
    // asked for, which multiplies both Chromium's per-frame rasterization cost and
    // x264's encode cost by 4x for zero requested benefit. Default to matching what
    // was actually requested; raise via env for deliberate supersampled quality.
    const outputScale = clampInt(process.env.RENDER_SCALE, 1, 4, 1);
    await withStallTimeout("full video render", 90_000, async (resetIdle) =>
      renderMedia({
        composition,
        serveUrl,
        codec: "h264",
        outputLocation,
        inputProps,
        concurrency,
        x264Preset: (x264Preset || "slow") as any,
        crf: 18,
        jpegQuality,
        pixelFormat: "yuv420p",
        scale: outputScale,
        chromiumOptions: { gl: "swangle" },
        logLevel: "error",
        onProgress: (p) => {
          resetIdle();
          if (!currentProgress) return;
          currentProgress.renderedFrames = p.renderedFrames;
          currentProgress.encodedFrames = p.encodedFrames;
          currentProgress.progress = Math.round(p.progress * 1000) / 10;
          currentProgress.stitchStage = p.stitchStage;
          if (p.renderEstimatedTime != null) currentProgress.renderEstimatedTime = p.renderEstimatedTime;
        },
      }),
    );
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

  const serveUrl = await getCachedBundle(entryPoint);
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
      await withRenderTimeout(`still ${name} (frame ${safeFrame})`, 30_000,
        renderStill({ composition, serveUrl, inputProps, frame: safeFrame, output }));
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
        "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-r", String(fps), videoOut],
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

/**
 * Estimates how long (in seconds, from scene start) a scene's scripted motion
 * actually runs before it settles into a still frame — per-widget entrance stagger,
 * architecture-diagram connector reveals, scripted highlight pulses, bar-chart
 * grow-in, and the big-number counter. Mirrors the timing constants that actually
 * drive the animation in SceneVisual.tsx / KarmaComponentRenderer.tsx / HtmlWidgets.tsx.
 *
 * Deliberately generous: this is a static estimate computed before any rendering
 * happens, so it can't know the exact settle frame. Underestimating cuts off visible
 * motion mid-way (reads as a stutter/jump when the clip freezes); overestimating just
 * costs a bit more render time. Padding errs toward the safe side.
 */
function computeMotionWindowSeconds(spec: any, durationSec: number, fps: number): number {
  const layout = String(spec?.layout ?? "").toLowerCase();
  const components: any[] = Array.isArray(spec?.components) ? spec.components : [];
  const connections: any[] = Array.isArray(spec?.connections) ? spec.connections : [];
  const highlights: any[] = Array.isArray(spec?.animation?.highlights) ? spec.animation.highlights : [];

  // Whole-scene entrance zoom — SceneVisual.tsx SCENE_ENTRANCE_FRAMES (18 frames), the floor
  // every scene gets regardless of content.
  let windowSec = 18 / fps;

  // Per-widget staggered entrance: KarmaComponentRenderer.tsx computes `delay = index * 5`
  // frames per component (some nested elements add a further +5/+10), and HtmlWidgets.tsx's
  // useEntranceAnimation runs for ~15 frames once a widget's delay elapses.
  if (components.length > 0) {
    windowSec = Math.max(windowSec, ((components.length - 1) * 5 + 10 + 15) / fps);
  }

  // Architecture-diagram connector reveal: SceneVisual.tsx staggers each connection's
  // appearance 0.5s apart starting at 1.2s, with a 0.4s draw-in per connection.
  if (connections.length > 0) {
    windowSec = Math.max(windowSec, 1.2 + (connections.length - 1) * 0.5 + 0.4);
  }

  // Scripted highlights: SceneVisual.tsx pulses for ~0.6s from each highlight's `at`.
  for (const h of highlights) {
    const at = Number(h?.at) || 0;
    windowSec = Math.max(windowSec, at + 0.6);
  }

  // Bar-chart grow-in: HtmlWidgets.tsx KarmaBarChart staggers bars 4 frames apart with a
  // 14-frame grow each, starting 6 frames after the widget's own entrance delay.
  const barChart = components.find((c) => c?.type === "bar-chart");
  const barCount = Array.isArray(barChart?.data?.items) ? barChart.data.items.length : 0;
  if (barCount > 0) {
    windowSec = Math.max(windowSec, (6 + (barCount - 1) * 4 + 14) / fps);
  }

  // Big-number counter runs across the first 60% of the scene's OWN duration
  // (KarmaComponentRenderer.tsx) — not a short head window, so give it most of the
  // scene rather than trying to shorten it.
  if (layout === "big-number") {
    windowSec = Math.max(windowSec, durationSec * 0.6);
  }

  // Small safety buffer; never exceed the scene's own duration.
  return Math.min(durationSec, windowSec + 0.5);
}

export interface StageWindow {
  /** Seconds from scene start where this burst of real Chromium rendering begins. */
  startSec: number;
  /** Seconds from scene start where the burst ends and the frame can be held. */
  endSec: number;
}

/**
 * Decomposes a scene into disjoint motion bursts instead of one continuous window.
 *
 * computeMotionWindowSeconds() above treats "when does motion stop" as a single
 * point — correct when a scene's only movement is its opening entrance, but wrong
 * once V39 made narration-synced highlights mandatory across a scene's FULL
 * duration: a highlight at 45s of a 60s scene pushed the old single-window
 * calculation to cover almost the entire scene, because everything between t=0
 * and t=45s had to be treated as "still might be animating". Nothing is actually
 * moving in that gap — the frame is static from when the entrance settles until
 * the next highlight's glow pulse begins.
 *
 * Each returned window is a burst that genuinely needs per-frame Chromium
 * rendering (component entrance, connector draw-in, bar-chart grow-in, or one
 * highlight's ~0.6s pulse from SceneVisual.tsx). Everything between windows, and
 * after the last one, is a held frame — string them together and a scene with
 * highlights at 0s/12s/45s of 60s renders roughly (entrance + 3 * ~1s pulses)
 * instead of 45+ seconds of frames, while still showing every scripted highlight
 * at the exact moment it should pulse.
 */
export function computeStageWindows(spec: any, durationSec: number, fps: number): StageWindow[] {
  const layout = String(spec?.layout ?? "").toLowerCase();
  const components: any[] = Array.isArray(spec?.components) ? spec.components : [];
  const connections: any[] = Array.isArray(spec?.connections) ? spec.connections : [];
  const highlights: any[] = Array.isArray(spec?.animation?.highlights) ? spec.animation.highlights : [];

  // The big-number counter animates continuously across 60% of the scene's own
  // duration (KarmaComponentRenderer.tsx) — there's no discrete "settled" moment to
  // split around, so it stays a single window exactly as computeMotionWindowSeconds
  // already handles it.
  if (layout === "big-number") {
    return [{ startSec: 0, endSec: computeMotionWindowSeconds(spec, durationSec, fps) }];
  }

  // Entrance burst: same constants as computeMotionWindowSeconds's floor, MINUS the
  // highlight contribution — each highlight becomes its own later window instead of
  // stretching this one to cover the gap up to it.
  let entranceEnd = 18 / fps;
  if (components.length > 0) {
    entranceEnd = Math.max(entranceEnd, ((components.length - 1) * 5 + 10 + 15) / fps);
  }
  if (connections.length > 0) {
    entranceEnd = Math.max(entranceEnd, 1.2 + (connections.length - 1) * 0.5 + 0.4);
  }
  const barChart = components.find((c) => c?.type === "bar-chart");
  const barCount = Array.isArray(barChart?.data?.items) ? barChart.data.items.length : 0;
  if (barCount > 0) {
    entranceEnd = Math.max(entranceEnd, (6 + (barCount - 1) * 4 + 14) / fps);
  }
  entranceEnd = Math.min(durationSec, entranceEnd + 0.3);

  const windows: StageWindow[] = [{ startSec: 0, endSec: entranceEnd }];

  // Each scripted highlight pulses for ~0.6s from its `at` (SceneVisual.tsx). A little
  // pre/post roll keeps the glow's own fade from starting on a frame that was
  // rendered a beat before the highlight technically began.
  const PULSE = 0.6, PRE = 0.15, POST = 0.15;
  for (const h of highlights) {
    const at = Number(h?.at) || 0;
    if (at <= 0) continue; // already covered by the entrance burst
    const start = Math.max(0, at - PRE);
    const end = Math.min(durationSec, at + PULSE + POST);
    if (end > start) windows.push({ startSec: start, endSec: end });
  }

  windows.sort((a, b) => a.startSec - b.startSec);

  // Windows that overlap or sit close enough together that holding a frame between
  // them wouldn't save anything (and would cost an extra ffmpeg segment) get merged.
  const MERGE_GAP_SEC = 0.35;
  const merged: StageWindow[] = [];
  for (const w of windows) {
    const last = merged[merged.length - 1];
    if (last && w.startSec <= last.endSec + MERGE_GAP_SEC) {
      last.endSec = Math.max(last.endSec, w.endSec);
    } else {
      merged.push({ ...w });
    }
  }
  return merged;
}

/**
 * Hybrid render: like the static path (one FFmpeg-assembled timeline, cheap to build),
 * but instead of a single frozen still per scene, renders a short *animated* clip
 * covering just that scene's scripted motion window (entrance, connector reveals,
 * highlights, chart draw-in — see computeMotionWindowSeconds), then holds its last
 * frame for the rest of the scene via ffmpeg's `tpad` filter. Keeps the actual
 * per-frame Chromium cost limited to the seconds where something is really moving —
 * typically a small fraction of a scene's full duration — instead of paying it for
 * every frame of every scene (full animated mode) or none of them (static mode).
 */
export async function renderHybridSlideVideo(request: ValidatedVideoRequest): Promise<VideoRenderResult> {
  const entryPoint = resolveRemotionEntry();
  const inputProps = { video: request };

  const serveUrl = await getCachedBundle(entryPoint);
  const composition = await selectComposition({ serveUrl, id: COMPOSITION_ID, inputProps });
  const fps = composition.fps;
  const width = composition.width;
  const height = composition.height;

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "karma-hybrid-"));
  // Stage-window rendering means many short renderMedia/renderStill calls per scene
  // instead of one long one. Each call launches its own Chromium unless handed an
  // existing instance — at several bursts per scene * 22 scenes, that relaunch
  // overhead alone could outweigh the frames saved by not rendering the held gaps.
  // One browser, reused for every call below, keeps that overhead to a single launch.
  const browser = await openBrowser("chrome", { chromiumOptions: { gl: "swangle" } });
  try {
    const ffmpeg = resolveFfmpeg();
    const concurrency = resolveConcurrency();
    const x264Preset = (process.env.X264_PRESET ?? "veryfast").trim() || "veryfast";

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

    // Progress is tracked in motion-clip frames (the only per-frame Chromium work left)
    // plus the two static stills (intro/end screen). Summed from computeStageWindows
    // (bursts only), not computeMotionWindowSeconds's single continuous window — the
    // whole point of stage windows is that they're usually far smaller, and using the
    // old estimate here would report a progress denominator several times too large.
    const totalMotionFrames = preparedScenes.reduce((sum, s, i) => {
      const windows = computeStageWindows(s.spec, sceneDurs[i], fps);
      const sceneFrames = windows.reduce((a, w) => a + Math.max(1, Math.round((w.endSec - w.startSec) * fps)), 0);
      return sum + sceneFrames;
    }, 0);
    const totalFrames = totalMotionFrames + (introFrames > 0 ? 1 : 0) + (endScreenFrames > 0 ? 1 : 0);
    currentProgress = { status: "rendering", renderedFrames: 0, encodedFrames: 0, totalFrames, progress: 0 };
    const bumpProgress = (byFrames: number) => {
      if (!currentProgress) return;
      currentProgress.renderedFrames += byFrames;
      currentProgress.progress = Math.round((currentProgress.renderedFrames / Math.max(1, currentProgress.totalFrames)) * 1000) / 10;
    };

    const stillPaths: string[] = [];
    const renderStillFrame = async (frame: number, name: string): Promise<void> => {
      const output = path.join(tmp, name);
      const maxFrame = Math.max(0, composition.durationInFrames - 1);
      const safeFrame = Math.min(Math.max(0, frame), maxFrame);
      await withRenderTimeout(`still ${name} (frame ${safeFrame})`, 30_000,
        renderStill({ composition, serveUrl, inputProps, frame: safeFrame, output, puppeteerInstance: browser }));
      bumpProgress(1);
      stillPaths.push(output);
    };

    // segDurs[j] is the target length each xfade segment must reach — for every scene
    // except the last, that's the scene's own duration PLUS the crossfade overlap with
    // the next segment (xfade needs real content in that overlap window on both sides,
    // or the filter starves and the whole chain after it comes out truncated). Computed
    // up front here so the per-scene clip loop below can pad to the right target instead
    // of the scene's raw duration alone.
    const segDursForScenes: number[] = preparedScenes.map((_s, i) =>
      sceneDurs[i] + (i === preparedScenes.length - 1 ? 0 : transitionSec),
    );

    // segClips[i] = this scene's fully-assembled clip: one or more short motion bursts
    // (computeStageWindows), each tpad-held until the next burst begins — or, for the
    // last burst, until segDursForScenes[i], which already includes the crossfade
    // overlap into the next segment. The assembled clip is therefore already exactly
    // targetSec long, so motionSec is set equal to targetSec below purely to tell the
    // outer stitching loop "this clip needs no further padding" (see its holdSec calc).
    interface SegClip { file: string; motionSec: number; targetSec: number }
    const segClips: SegClip[] = [];
    for (let i = 0; i < preparedScenes.length; i++) {
      const scene = preparedScenes[i];
      const targetSec = segDursForScenes[i];
      const windows = computeStageWindows(scene.spec, sceneDurs[i], fps);

      const partPaths: string[] = [];
      for (let w = 0; w < windows.length; w++) {
        const win = windows[w];
        const nextStart = w + 1 < windows.length ? windows[w + 1].startSec : targetSec;
        const holdSec = Math.max(0, nextStart - win.endSec);

        const fromFrame = scene.startFrame + Math.round(win.startSec * fps);
        const toFrame = Math.min(
          composition.durationInFrames - 1,
          Math.max(fromFrame, scene.startFrame + Math.round(win.endSec * fps) - 1),
        );
        const burstOut = path.join(tmp, `motion-${scene.index}-${w}.mp4`);
        const burstFrameCount = toFrame - fromFrame + 1;
        await withRenderTimeout(
          `scene ${scene.index} burst ${w} (frames ${fromFrame}-${toFrame})`,
          Math.max(45_000, burstFrameCount * 1_500),
          renderMedia({
            composition,
            serveUrl,
            codec: "h264",
            outputLocation: burstOut,
            inputProps,
            concurrency,
            x264Preset: (x264Preset || "veryfast") as any,
            crf: 18,
            pixelFormat: "yuv420p",
            scale: 1,
            chromiumOptions: { gl: "swangle" },
            logLevel: "error",
            frameRange: [fromFrame, toFrame],
            puppeteerInstance: browser,
          }),
        );
        bumpProgress(burstFrameCount);

        if (holdSec > 0.02) {
          const heldOut = path.join(tmp, `motion-${scene.index}-${w}-held.mp4`);
          await runFfmpeg(
            ffmpeg,
            ["-i", burstOut, "-vf", `tpad=stop_mode=clone:stop_duration=${holdSec}`,
              "-c:v", "libx264", "-preset", (x264Preset || "veryfast"), "-crf", "18", "-pix_fmt", "yuv420p", heldOut],
            `hold-${scene.index}-${w}`,
          );
          partPaths.push(heldOut);
        } else {
          partPaths.push(burstOut);
        }
      }

      // Stitch this scene's stage parts into one clip. A hard concat, not xfade — these
      // are the SAME scene at different timestamps, so the cut should read as "the
      // frame just changed" (a highlight landing), not as a scene transition.
      let sceneClipPath: string;
      if (partPaths.length === 1) {
        sceneClipPath = partPaths[0];
      } else {
        sceneClipPath = path.join(tmp, `motion-${scene.index}.mp4`);
        const concatInputs: string[] = [];
        partPaths.forEach((p) => concatInputs.push("-i", p));
        const concatRefs = partPaths.map((_, idx) => `[${idx}:v]`).join("");
        await runFfmpeg(
          ffmpeg,
          [...concatInputs, "-filter_complex", `${concatRefs}concat=n=${partPaths.length}:v=1:a=0[vout]`,
            "-map", "[vout]", "-c:v", "libx264", "-preset", (x264Preset || "veryfast"), "-crf", "18", "-pix_fmt", "yuv420p", sceneClipPath],
          `stitch-${scene.index}`,
        );
      }

      segClips.push({ file: sceneClipPath, motionSec: targetSec, targetSec });
    }

    if (introFrames > 0) {
      await renderStillFrame(Math.max(0, introFrames - 5), "still-intro.png");
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

    let captionsPath: string | null = null;
    if (request.captions?.burnIn) {
      const cues = buildCues(preparedScenes, fps);
      if (cues.length > 0) {
        captionsPath = path.join(tmp, "captions.srt");
        fs.writeFileSync(captionsPath, generateSRT(cues));
      }
    }

    // ---- segment layout -------------------------------------------------------
    // Video-graph inputs, in xfade order: [intro still?] [scene motion clips...] [end still?]
    // The end still is hard-concatenated (unchanged from the static path); everything
    // before it is xfaded together.
    const introPath = introFrames > 0 ? stillPaths[0] : null;
    const endPath = endScreenFrames > 0 ? stillPaths[stillPaths.length - 1] : null;

    const segDurs: number[] = [];
    if (introFrames > 0) segDurs.push(introDur);
    segDurs.push(...segDursForScenes);
    const nSegs = segDurs.length;

    // ---- input args -------------------------------------------------------------
    const inputArgs: string[] = [];
    const isMotionInput: boolean[] = [];
    if (introPath) {
      inputArgs.push("-loop", "1", "-t", String(segDurs[0]), "-i", introPath);
      isMotionInput.push(false);
    }
    segClips.forEach((seg) => {
      inputArgs.push("-i", seg.file);
      isMotionInput.push(true);
    });
    if (endPath) {
      inputArgs.push("-loop", "1", "-t", String(endDur), "-i", endPath);
      isMotionInput.push(false);
    }

    narrations.forEach((n) => inputArgs.push("-i", n.file));
    if (musicFile) inputArgs.push("-i", musicFile);

    // ---- video filter graph -------------------------------------------------------
    const vGraph: string[] = [];
    const totalVideoInputs = (introPath ? 1 : 0) + segClips.length + (endPath ? 1 : 0);
    let segClipCursor = 0;
    for (let i = 0; i < totalVideoInputs; i++) {
      if (isMotionInput[i]) {
        const seg = segClips[segClipCursor++];
        const holdSec = Math.max(0, seg.targetSec - seg.motionSec);
        // Hold the clip's last frame for the remainder of the scene, then normalize
        // fps/scale/sar exactly as the static path does for its looped stills.
        vGraph.push(
          holdSec > 0.01
            ? `[${i}:v]tpad=stop_mode=clone:stop_duration=${holdSec},fps=${fps},scale=${width}:${height},setsar=1[v${i}]`
            : `[${i}:v]fps=${fps},scale=${width}:${height},setsar=1[v${i}]`,
        );
      } else {
        vGraph.push(`[${i}:v]fps=${fps},scale=${width}:${height},setsar=1[v${i}]`);
      }
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
    if (endPath) {
      vGraph.push(`[v${totalVideoInputs - 1}]format=yuv420p,fps=${fps}[vE]`);
      vGraph.push(`[vA][vE]concat=n=2:v=1:a=0[vout]`);
    } else {
      vGraph.push(`[vA]copy[vout]`);
    }

    // Unlike the static path's final encode (looped stills — trivial for x264 regardless
    // of preset), this re-compresses real motion footage across every scene's clip. "slow"'s
    // motion estimation cost multiplies against actual motion here and previously dragged
    // this step to ~0.385x realtime, missing the default runFfmpeg timeout by a few minutes
    // on an 8-minute video. Match the per-scene clips' preset and give this step its own
    // generous ceiling instead of inheriting the 20-minute default.
    const videoOut = path.join(tmp, "video.mp4");
    await runFfmpeg(ffmpeg,
      [...inputArgs, "-filter_complex", vGraph.join(";"), "-map", "[vout]", "-an",
        "-c:v", "libx264", "-preset", x264Preset, "-crf", "18", "-pix_fmt", "yuv420p", "-r", String(fps), videoOut],
      "video", 40 * 60 * 1000);

    // ---- audio (identical to the static path: narrations at scene offsets + ducked music) ----
    const audioInputArgs: string[] = [];
    narrations.forEach((n) => audioInputArgs.push("-i", n.file));
    if (musicFile) audioInputArgs.push("-i", musicFile);
    const musicIdx = narrations.length;

    const aGraph: string[] = [];
    const narLabels: string[] = [];
    narrations.forEach((n, j) => {
      const ms = Math.round(n.offsetSec * 1000);
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
      currentProgress.progress = 95;
    }

    const finalOut = path.join(tmp, "final.mp4");
    await runFfmpeg(ffmpeg,
      ["-i", videoOut, "-i", audioOut, "-c:v", "copy", "-c:a", "copy",
        "-movflags", "+faststart", "-t", String(totalSec), finalOut],
      "mux");

    const buffer = await fs.promises.readFile(finalOut);
    if (currentProgress) {
      currentProgress.status = "done";
      currentProgress.renderedFrames = currentProgress.totalFrames;
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
      await browser.close({ silent: true });
    } catch {
      /* ignore */
    }
    try {
      fs.rmSync(tmp, { recursive: true, force: true });
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
}

/** Renders a 1280x720 YouTube thumbnail (PNG) from the karma-thumbnail composition. */
export async function renderThumbnailBuffer(request: ThumbnailRequest): Promise<Buffer> {
  const serveUrl = await getCachedBundle(resolveRemotionEntry());
  const inputProps = { ...request };
  const composition = await selectComposition({ serveUrl, id: "karma-thumbnail", inputProps });
  const outputLocation = path.join(os.tmpdir(), `karma-thumb-${process.pid}-${Date.now()}.png`);
  try {
    await renderStill({
      composition,
      serveUrl,
      output: outputLocation,
      inputProps,
      imageFormat: "png",
      chromiumOptions: { gl: "swangle" },
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
