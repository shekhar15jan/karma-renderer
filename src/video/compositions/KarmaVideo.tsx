/** KarmaVideo - top-level Remotion composition. Scenes are frame-accurate Sequences sized from real audio. */

import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, useCurrentFrame } from "remotion";
import type { CalculateMetadataFunction } from "remotion";
import type { ValidatedVideoRequest } from "../video-schema";
import { prepareVideo, type PreparedScene, type PreparedVideo } from "../prepare";
import { IntroCard } from "./IntroCard";
import { SceneVisual } from "./SceneVisual";
import { Branding } from "./Branding";
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
  const p = Math.min(1, frame / transition);
  switch (t) {
    case "slide-left":
      return { transform: `translateX(${Math.min(0, -(1 - p) * 160)}px)`, opacity: 1 };
    case "slide-right":
      return { transform: `translateX(${Math.max(0, (1 - p) * 160)}px)`, opacity: 1 };
    case "wipe-left":
      return { clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`, opacity: 1 };
    case "wipe-right":
      return { clipPath: `inset(0 0 0 ${(1 - p) * 100}%)`, opacity: 1 };
    case "zoom":
      return { transform: `scale(${1.1 - 0.1 * p})`, opacity: 1 };
    case "fade":
    default:
      return {};
  }
};

const SceneBlock: React.FC<{ scene: PreparedScene; transition: number; isLast: boolean; theme: Theme; fps: number; defaultTransition: TransitionType }> = ({
  scene,
  transition,
  isLast,
  theme,
  fps,
  defaultTransition,
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
          html={scene.visualHtml}
          theme={theme}
          durationFrames={scene.durationFrames}
          fps={fps}
          animation={scene.animation}
        />
      </AbsoluteFill>
      {scene.audio ? <Audio src={scene.audio} /> : null}
    </AbsoluteFill>
  );
};

export const KarmaVideo: React.FC<KarmaVideoProps> = ({ video, prepared }) => {
  if (!prepared) return null;
  const p = prepared;
  const theme = p.theme;

  return (
    <AbsoluteFill style={{ background: theme.background, fontFamily: theme.font }}>
      <style dangerouslySetInnerHTML={{ __html: SCENE_CSS }} />
      {p.introFrames > 0 ? (
        <Sequence from={0} durationInFrames={p.introFrames}>
          <IntroCard video={video} accent={theme.accent} heading={theme.fontHeading} />
        </Sequence>
      ) : null}
      {p.scenes.map((s, i) => (
        <Sequence key={s.index} from={s.startFrame} durationInFrames={s.durationFrames + p.transition}>
          <SceneBlock scene={s} transition={p.transition} isLast={i === p.scenes.length - 1} theme={theme} fps={p.fps} defaultTransition={video.transition} />
        </Sequence>
      ))}
      <Branding branding={p.scenes[0]?.spec?.branding ?? video.scenes[0]?.visualSpec?.branding} theme={theme} />
      {p.music ? <Audio src={p.music} loop volume={p.musicVolume} /> : null}
    </AbsoluteFill>
  );
};
