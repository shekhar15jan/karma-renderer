/** Video prep - computes scene timeline + pre-renders each scene's visual HTML. */

import { getAudioDurationInSeconds } from "@remotion/media-utils";
import type { ValidatedVideoRequest } from "./video-schema";
import type { ValidatedSpec } from "../core/schema";
import type { ThemeId, LayoutType, VisualComponent, VisualConnection, SceneAnimation, TransitionType } from "../core/types";
import type { Theme } from "../theme/themes";
import { getTheme } from "../theme/themes";

export interface CaptionCue {
  start: number;
  end: number;
  text: string;
}

export interface PreparedScene {
  index: number;
  startFrame: number;
  durationFrames: number;
  audio?: string;
  spec: ValidatedSpec;
  animation?: SceneAnimation;
  transition?: TransitionType;
  timelineEvents?: Array<{
    timestamp_ms: number;
    action: string;
    target_element_id?: string;
    // Ken Burns properties
    zoom_start?: number;
    zoom_end?: number;
    duration_ms?: number;
    transform_origin?: string;
    pan_x_start?: number;
    pan_x_end?: number;
    pan_y_start?: number;
    pan_y_end?: number;
  }>;
  captions?: CaptionCue[];
}

export interface ChapterMarker {
  title: string;
  startTime: number;
}

export interface PreparedVideo {
  fps: number;
  width: number;
  height: number;
  sceneMotion: "animated" | "static";
  introFrames: number;
  transition: number;
  totalFrames: number;
  endPaddingFrames: number;
  scenes: PreparedScene[];
  music?: string;
  musicVolume: number;
  theme: Theme;
  backgroundPattern: "grid" | "dots" | "plain";
  captions?: { burnIn: boolean; preset: string; position: number; fontSize: number; maxCharsPerLine: number };
  chapters?: ChapterMarker[];
}

const MIN_SCENE_SECONDS = 10;
const MAX_SCENE_SECONDS = 25;

/** Heuristic narration seconds when a scene has no audio artifact. */
export function estimateSceneSeconds(spec: ValidatedSpec): number {
  let chars = (spec.title ?? "").length + (spec.subtitle ?? "").length;
  for (const c of spec.components ?? []) {
    chars += (c.label ?? "").length + (c.sublabel ?? "").length;
    for (const it of c.items ?? []) chars += (typeof it === "string" ? it : (it.label ?? "")).length;
    for (const col of c.columns ?? []) {
      chars += (col.header ?? "").length;
      for (const cell of col.cells ?? []) chars += cell.length;
    }
  }
  if (spec.instructions) for (const ins of spec.instructions) chars += ins.length;
  const secs = Math.max(MIN_SCENE_SECONDS, Math.min(MAX_SCENE_SECONDS, chars / 14));
  return secs;
}

/** Builds the scene visual frame through the SHARED frame builder so that
 *  video frames are pixel-identical to the /render stills. */

function introFramesFor(video: ValidatedVideoRequest): number {
  if (!video.enableIntro) return 0;
  const titleLen = (video.introTitle ?? "Karma OS").length;
  const secs = Math.min(6, Math.max(2.2, 2 + titleLen / 12));
  return Math.round(secs * video.fps);
}

const CAPTION_MAX_WORDS = 7;

/** Splits narration into short phrases and times them proportionally to their length
 *  across the scene's (audio-derived) duration. */
export function captionsFromNarration(narration: string, durationSeconds: number): CaptionCue[] {
  const words = narration.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  if (words.length === 0 || durationSeconds <= 0) return [];
  const phrases: string[] = [];
  let current: string[] = [];
  for (const word of words) {
    current.push(word);
    const endsClause = /[.!?;:,]$/.test(word);
    if (current.length >= CAPTION_MAX_WORDS || (endsClause && current.length >= 3)) {
      phrases.push(current.join(" "));
      current = [];
    }
  }
  if (current.length) {
    // Never flash a one- or two-word caption ("points."): fold a short tail into the previous phrase.
    if (current.length < 3 && phrases.length > 0) phrases[phrases.length - 1] += " " + current.join(" ");
    else phrases.push(current.join(" "));
  }

  const totalChars = phrases.reduce((n, p) => n + p.length, 0);
  const cues: CaptionCue[] = [];
  let cursor = 0;
  for (const phrase of phrases) {
    const span = (phrase.length / totalChars) * durationSeconds;
    cues.push({ start: cursor, end: cursor + span, text: phrase });
    cursor += span;
  }
  return cues;
}

export async function prepareVideo(video: ValidatedVideoRequest): Promise<PreparedVideo> {
  const fps = video.fps;
  const width = video.resolution.width;
  const height = video.resolution.height;
  const transition = video.transitionDuration;
  const theme = getTheme(video.scenes[0]?.visualSpec.theme);

  const introFrames = introFramesFor(video);

  const scenes: PreparedScene[] = [];
  let cursor = introFrames;

  for (let i = 0; i < video.scenes.length; i++) {
    const scene = video.scenes[i];
    const animation = (scene.visualSpec as never as { animation?: SceneAnimation }).animation;
    const transition = scene.transition;

    let durationFrames: number;
    if (scene.audio) {
      const secs = await getAudioDurationInSeconds(scene.audio);
      durationFrames = Math.max(1, Math.round(secs * fps));
    } else {
      durationFrames = Math.max(1, Math.round(estimateSceneSeconds(scene.visualSpec) * fps));
    }

    const timelineEvents = scene.timelineEvents;
    const captions = scene.captions && scene.captions.length > 0
      ? scene.captions
      : scene.narration
        ? captionsFromNarration(scene.narration, durationFrames / fps)
        : undefined;

    scenes.push({ index: i, startFrame: cursor, durationFrames, audio: scene.audio, spec: scene.visualSpec, animation, transition, timelineEvents, captions });
    cursor += durationFrames;
  }

  // The end screen starts one transition after the last scene and runs for endPaddingFrames.
  const totalFrames = cursor + (video.enableIntro ? transition : 0) + video.endPaddingFrames;
  
  const captionsConfig = video.captions ? {
    burnIn: video.captions.burnIn ?? true,
    preset: video.captions.preset ?? "youtube",
    position: video.captions.position ?? 0.85,
    fontSize: video.captions.fontSize ?? 28,
    maxCharsPerLine: video.captions.maxCharsPerLine ?? 42,
  } : undefined;

  // "hybrid" is a render-orchestration strategy handled entirely in render-video.ts
  // (renderHybridSlideVideo never calls prepareVideo/this function) — the composition
  // itself only ever needs to know "animated" vs "static" per-frame behavior, so treat
  // hybrid as animated here as a safe fallback in case this path is ever reached.
  const compositionSceneMotion: "animated" | "static" = video.sceneMotion === "static" ? "static" : "animated";
  return { fps, width, height, sceneMotion: compositionSceneMotion, introFrames, transition, totalFrames, endPaddingFrames: video.endPaddingFrames, scenes, music: video.music, musicVolume: video.musicVolume, theme, backgroundPattern: video.backgroundPattern, captions: captionsConfig, chapters: video.chapters };
}
