/** KarmaVideo - top-level Remotion composition. Scenes are frame-accurate Sequences sized from real audio. */

import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, useCurrentFrame } from "remotion";
import type { CalculateMetadataFunction } from "remotion";
import type { ValidatedVideoRequest } from "../video-schema";
import { prepareVideo, type PreparedScene, type PreparedVideo } from "../prepare";
import { IntroCard } from "./IntroCard";
import { SceneVisual } from "./SceneVisual";
import { Branding } from "./Branding";
import { Captions, type CaptionCue } from "./Captions";
import { EndScreen } from "./EndScreen";
import { SCENE_CSS } from "../../renderer/styles";
import type { Theme } from "../../theme/themes";
import type { TransitionType } from "../../core/types";

export interface KarmaVideoProps {
  video: ValidatedVideoRequest;
  prepared?: PreparedVideo;
  [key: string]: unknown;
}

export const karmaVideoCalculateMetadata: CalculateMetadataFunction<KarmaVideoProps> = async ({ props }) => {
  const prepared = await prepareVideo(props.video);
  return {
    durationInFrames: prepared.totalFrames,
    fps: prepared.fps,
    width: prepared.width,
    height: prepared.height,
    props: { ...props, prepared },
  };
};

const transitionStyle = (type: TransitionType | undefined, frame: number, transition: number, sceneDurationFrames: number): React.CSSProperties => {
  const t = type ?? "fade";
  if (transition <= 0) return {};
  const p = Math.min(1, frame / transition); // 0 to 1 during transition
  
  // Use easeOut cubic for smoother motion
  const easeOut = 1 - Math.pow(1 - p, 3);
  
  switch (t) {
    case "slide-left":
      return { transform: `translateX(${(1 - easeOut) * 100}%)`, opacity: 1 };
    case "slide-right":
      return { transform: `translateX(${-(1 - easeOut) * 100}%)`, opacity: 1 };
    case "slide-up":
      return { transform: `translateY(${(1 - easeOut) * 100}%)`, opacity: 1 };
    case "slide-down":
      return { transform: `translateY(${-(1 - easeOut) * 100}%)`, opacity: 1 };
    case "wipe-left":
      return { clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`, opacity: 1 };
    case "wipe-right":
      return { clipPath: `inset(0 0 0 ${(1 - p) * 100}%)`, opacity: 1 };
    case "zoom":
      return { transform: `scale(${0.5 + 0.5 * easeOut})`, opacity: p };
    case "flip":
      return { transform: `perspective(1000px) rotateY(${90 - (90 * easeOut)}deg)`, opacity: p };
    case "fade":
    default:
      return {}; // Opacity fade is handled by the parent AbsoluteFill
  }
};

const SceneBlock: React.FC<{ scene: PreparedScene; transition: number; isLast: boolean; theme: Theme; fps: number; defaultTransition: TransitionType; sceneMotion: "animated" | "static"; backgroundPattern: "grid" | "dots" | "plain"; bottomSafeArea?: number }> = ({
  bottomSafeArea = 0,
  scene,
  transition,
  isLast,
  theme,
  fps,
  defaultTransition,
  sceneMotion,
  backgroundPattern,
}) => {
  const frame = useCurrentFrame();
  const fadeIn = transition > 0 ? interpolate(frame, [0, transition], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  const fadeOut = !isLast && transition > 0 ? interpolate(frame, [scene.durationFrames, scene.durationFrames + transition], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  const opacity = Math.min(fadeIn, fadeOut);
  const animStyle = transitionStyle(scene.transition ?? defaultTransition, frame, transition, scene.durationFrames);

  return (
    <AbsoluteFill style={{ opacity }}>
      <AbsoluteFill style={animStyle}>
        <SceneVisual
          spec={scene.spec}
          theme={theme}
          durationFrames={scene.durationFrames}
          fps={fps}
          animation={scene.animation}
          timelineEvents={scene.timelineEvents}
          sceneMotion={sceneMotion}
          backgroundPattern={backgroundPattern}
          bottomSafeArea={bottomSafeArea}
        />
      </AbsoluteFill>
      {scene.audio ? <Audio src={scene.audio} /> : null}
    </AbsoluteFill>
  );
};

/** Seconds the music takes to dip under narration or come back up. */
const DUCK_RAMP_SECONDS = 0.6;
/** Share of the bed volume kept under narration (~-4 dB): with the -18 LUFS bed at 0.3 that
 *  sits ~15 dB under the voice, the usual level for an explainer. 0.05 was ~25 dB under: inaudible. */
const DUCK_RATIO = 0.65;

/**
 * Background music that dips under narration. It used to drop to a fixed 0.05 (inaudible, and
 * narration covers nearly the whole video) the instant a narrated scene began; now it ramps
 * between bed and ducked levels, fades in at the start and out over the final seconds.
 */
const MusicDucking: React.FC<{
  src: string;
  baseVolume: number;
  scenes: PreparedScene[];
  fps: number;
  totalFrames: number;
}> = ({ src, baseVolume, scenes, fps, totalFrames }) => {
  const ramp = DUCK_RAMP_SECONDS * fps;
  const narrated = scenes.filter((s) => s.audio).map((s) => [s.startFrame, s.startFrame + s.durationFrames] as const);
  // 0 outside narration, 1 inside, ramping across each boundary.
  const duckAmount = (f: number) => {
    let amount = 0;
    for (const [start, end] of narrated) {
      const into = Math.min(f - (start - ramp), end + ramp - f) / ramp;
      amount = Math.max(amount, Math.min(1, Math.max(0, into)));
    }
    return amount;
  };
  const volume = (f: number) => {
    const fadeIn = Math.min(1, f / fps);
    const fadeOut = Math.min(1, Math.max(0, (totalFrames - f) / (3 * fps)));
    return baseVolume * (1 - (1 - DUCK_RATIO) * duckAmount(f)) * fadeIn * fadeOut;
  };
  return <Audio src={src} loop volume={volume} />;
};

const allCues = (scenes: PreparedScene[], fps: number): CaptionCue[] => {
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
};

import { hydrate } from "../objects/objectRegistry";

export const KarmaVideo: React.FC<KarmaVideoProps> = ({ video, prepared }) => {
  if (!prepared) return null;
  const p = prepared;
  const theme = p.theme;
  // Slice 5: Hydrate object registry across all scenes for continuity (§12)
  useMemo(() => {
    const registry: Record<string, any> = {};
    for (const s of p.scenes) {
      const objs = (s.spec as any)?.semanticObjects ?? (s.spec as any)?.objects ?? [];
      for (const o of objs) {
        if (o?.id && !registry[o.id]) registry[o.id] = { type: o.type ?? "SERVICE", visualIdentity: o.visualIdentity ?? `${String(o.type ?? "service").toLowerCase()}-01` };
      }
      const reg = (s.spec as any)?.registry;
      if (reg) Object.assign(registry, reg);
    }
    hydrate(registry);
  }, [p.scenes]);

  const cues = allCues(p.scenes, p.fps);
  // Height kept free under scene content for one caption line plus its bottom offset.
  const captionSafeArea = p.captions
    ? Math.round(p.height * (1 - p.captions.position) + p.captions.fontSize * 1.35 + 16)
    : 0;
  
  // End screen starts after last scene + transition + padding
  const lastScene = p.scenes[p.scenes.length - 1];
  const endScreenStartFrame = lastScene.startFrame + lastScene.durationFrames + p.transition;
  const endScreenDurationFrames = Math.max(1, p.endPaddingFrames ?? 60);

  return (
    <AbsoluteFill style={{ background: theme.background, fontFamily: theme.font }}>
      <style dangerouslySetInnerHTML={{ __html: SCENE_CSS }} />
      {p.introFrames > 0 ? (
        <Sequence from={0} durationInFrames={p.introFrames}>
          <IntroCard video={video} theme={theme} backgroundPattern={p.backgroundPattern} />
        </Sequence>
      ) : null}
      {p.scenes.map((s, i) => (
        <Sequence key={s.index} from={s.startFrame} durationInFrames={s.durationFrames + p.transition}>
          <SceneBlock scene={s} transition={p.transition} isLast={i === p.scenes.length - 1} theme={theme} fps={p.fps} defaultTransition={video.transition} sceneMotion={p.sceneMotion} backgroundPattern={p.backgroundPattern}
            bottomSafeArea={p.captions?.burnIn && s.captions && s.captions.length > 0 ? captionSafeArea : 0} />
        </Sequence>
      ))}
      <Branding branding={p.scenes[0]?.spec?.branding ?? video.scenes[0]?.visualSpec?.branding} theme={theme} />
      {p.music ? (
        <MusicDucking src={p.music} baseVolume={p.musicVolume} scenes={p.scenes} fps={p.fps} totalFrames={p.totalFrames} />
      ) : null}
      {p.captions?.burnIn && cues.length > 0 && (
        <Captions
          cues={cues}
          fps={p.fps}
          width={p.width}
          height={p.height}
          preset={p.captions.preset as "youtube" | "clean" | "bold" | "minimal"}
          position={p.captions.position}
          fontSize={p.captions.fontSize}
          maxCharsPerLine={p.captions.maxCharsPerLine}
        />
      )}
      {video.enableIntro !== false && (() => {
        // Extract chapter titles from scene specs for the dynamic recap
        const recapItems = p.scenes
          .map(s => {
            const spec = s.spec as any;
            return spec?.chapter_title || spec?.title || '';
          })
          .filter((t: string) => t.length > 0);
        return (
          <Sequence from={endScreenStartFrame} durationInFrames={endScreenDurationFrames}>
            <EndScreen
              theme={theme}
              channelName={video.channelName ?? "Karma OS"}
              videoTitle={video.introTitle}
              durationFrames={endScreenDurationFrames}
              recapItems={recapItems.length > 0 ? recapItems : undefined}
            />
          </Sequence>
        );
      })()}
    </AbsoluteFill>
  );
};
