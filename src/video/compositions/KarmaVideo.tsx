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

const SceneBlock: React.FC<{ scene: PreparedScene; transition: number; isLast: boolean; theme: Theme; fps: number; defaultTransition: TransitionType; sceneMotion: "animated" | "static"; backgroundPattern: "grid" | "dots" | "plain" }> = ({
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
        />
      </AbsoluteFill>
      {scene.audio ? <Audio src={scene.audio} /> : null}
    </AbsoluteFill>
  );
};

/** Music ducking - reduces music volume when narration is active. */
const MusicDucking: React.FC<{ 
  src: string; 
  loop: boolean; 
  baseVolume: number; 
  scenes: PreparedScene[]; 
  fps: number;
  duckVolume?: number;
}> = ({ src, loop, baseVolume, scenes, fps, duckVolume = 0.05 }) => {
  const frame = useCurrentFrame();
  const currentTime = frame / fps;
  
  // Check if any scene narration is active at current time
  const isNarrationActive = scenes.some(s => 
    s.audio && currentTime >= s.startFrame / fps && currentTime < (s.startFrame + s.durationFrames) / fps
  );
  
  const volume = isNarrationActive ? duckVolume : baseVolume;

  return (
    <Audio 
      src={src} 
      loop={loop} 
      volume={volume} 
      playbackRate={1}
    />
  );
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

export const KarmaVideo: React.FC<KarmaVideoProps> = ({ video, prepared }) => {
  if (!prepared) return null;
  const p = prepared;
  const theme = p.theme;

  const cues = allCues(p.scenes, p.fps);
  
  // End screen starts after last scene + transition + padding
  const lastScene = p.scenes[p.scenes.length - 1];
  const endScreenStartFrame = lastScene.startFrame + lastScene.durationFrames + p.transition;
  const endScreenDurationFrames = Math.min(p.endPaddingFrames ?? 60, 180); // max 6 seconds at 30fps

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
          <SceneBlock scene={s} transition={p.transition} isLast={i === p.scenes.length - 1} theme={theme} fps={p.fps} defaultTransition={video.transition} sceneMotion={p.sceneMotion} backgroundPattern={p.backgroundPattern} />
        </Sequence>
      ))}
      <Branding branding={p.scenes[0]?.spec?.branding ?? video.scenes[0]?.visualSpec?.branding} theme={theme} />
      {p.music ? (
        <MusicDucking
          src={p.music}
          loop
          baseVolume={p.musicVolume}
          scenes={p.scenes}
          fps={p.fps}
          duckVolume={0.05}
        />
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
      {video.enableIntro !== false && (
        <Sequence from={endScreenStartFrame} durationInFrames={endScreenDurationFrames}>
          <EndScreen 
            theme={theme} 
            channelName={video.introTitle} 
            videoTitle={video.introSubtitle}
          />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};
