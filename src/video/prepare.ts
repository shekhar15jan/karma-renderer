/** Video prep - computes scene timeline + pre-renders each scene's visual HTML. */

import { getAudioDurationInSeconds } from "@remotion/media-utils";
import type { ValidatedVideoRequest } from "./video-schema";
import type { ValidatedSpec } from "../core/schema";
import type { ThemeId, LayoutType, VisualComponent, VisualConnection, SceneAnimation, TransitionType } from "../core/types";
import type { Theme } from "../theme/themes";
import { getTheme } from "../theme/themes";
import { buildSceneFrame } from "../renderer/frame";
import { isGraphLayout } from "../layout/layout";

export interface PreparedScene {
  index: number;
  startFrame: number;
  durationFrames: number;
  audio?: string;
  visualHtml: string;
  spec: ValidatedSpec;
  animation?: SceneAnimation;
  transition?: TransitionType;
}

export interface PreparedVideo {
  fps: number;
  width: number;
  height: number;
  introFrames: number;
  transition: number;
  totalFrames: number;
  scenes: PreparedScene[];
  music?: string;
  musicVolume: number;
  theme: Theme;
}

const MIN_SCENE_SECONDS = 2.5;
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
export async function buildSceneHtml(spec: ValidatedSpec, width: number, height: number): Promise<string> {
  return buildSceneFrame(spec as never, { width, height, isForRemotion: true });
}

function introFramesFor(video: ValidatedVideoRequest): number {
  if (!video.enableIntro) return 0;
  const titleLen = (video.introTitle ?? "Karma OS").length;
  const secs = Math.min(6, Math.max(2.2, 2 + titleLen / 12));
  return Math.round(secs * video.fps);
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
    const visualHtml = await buildSceneHtml(scene.visualSpec, width, height);
    const animation = (scene.visualSpec as never as { animation?: SceneAnimation }).animation;
    const transition = scene.transition;

    let durationFrames: number;
    if (scene.audio) {
      const secs = await getAudioDurationInSeconds(scene.audio);
      durationFrames = Math.max(1, Math.round(secs * fps));
    } else {
      durationFrames = Math.max(1, Math.round(estimateSceneSeconds(scene.visualSpec) * fps));
    }

    scenes.push({ index: i, startFrame: cursor, durationFrames, audio: scene.audio, visualHtml, spec: scene.visualSpec, animation, transition });
    cursor += durationFrames;
  }

  const totalFrames = cursor + video.endPaddingFrames;
  return { fps, width, height, introFrames, transition, totalFrames, scenes, music: video.music, musicVolume: video.musicVolume, theme };
}
