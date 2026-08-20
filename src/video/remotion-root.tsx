/** Remotion root - registers the Karma video composition. */
import "../styles/global.css";

import React from "react";
import { Composition, registerRoot } from "remotion";
import { KarmaVideo, karmaVideoCalculateMetadata } from "./compositions/KarmaVideo";
import { WidgetShowcase } from "./compositions/WidgetShowcase";
import type { ValidatedVideoRequest } from "./video-schema";

import testSpec from './mock_specs/terminal_test.json';

const DEFAULT_VIDEO: ValidatedVideoRequest = {
  fps: 30,
  resolution: { width: 1920, height: 1080 },
  sceneMotion: "animated",
  transitionDuration: 15,
  transition: "fade",
  backgroundPattern: "grid",
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
