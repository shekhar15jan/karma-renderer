/** Remotion root - registers the Karma video composition. */
import "../styles/global.css";

import React from "react";
import { Composition, registerRoot } from "remotion";
import { KarmaVideo, karmaVideoCalculateMetadata } from "./compositions/KarmaVideo";
import { WidgetShowcase } from "./compositions/WidgetShowcase";
import { Thumbnail } from "./compositions/Thumbnail";
import type { ValidatedVideoRequest } from "./video-schema";

import testSpec from './mock_specs/terminal_test.json';

const DEFAULT_VIDEO: ValidatedVideoRequest = {
  fps: 30,
  resolution: { width: 1920, height: 1080 },
  transitionDuration: 15,
  transition: "fade",
  enableIntro: true,
  introTitle: "Karma OS",
  introSubtitle: "Test Environment",
  musicVolume: 0.2,
  endPaddingFrames: 20,
  scenes: [
    {
      visualSpec: testSpec as any,
    },
  ],
};

export const KarmaRoot: React.FC = () => (
  <>
    <Composition
      id="karma-video"
      component={KarmaVideo}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ video: DEFAULT_VIDEO }}
      calculateMetadata={karmaVideoCalculateMetadata}
    />
    <Composition
      id="karma-thumbnail"
      component={Thumbnail}
      durationInFrames={1}
      fps={30}
      width={1280}
      height={720}
      defaultProps={{ title: "Karma OS Explained", subtitle: "in 5 minutes", badges: ["API", "AI"], channelName: "Karma OS" }}
      calculateMetadata={({ props }) => ({
        width: typeof props.width === "number" ? props.width : 1280,
        height: typeof props.height === "number" ? props.height : 720,
      })}
    />
    <Composition
      id="WidgetShowcase"
      component={WidgetShowcase}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);

registerRoot(KarmaRoot);
