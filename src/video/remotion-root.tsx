/** Remotion root - registers the Karma video composition. */

import React from "react";
import { Composition, registerRoot } from "remotion";
import { KarmaVideo, karmaVideoCalculateMetadata } from "./compositions/KarmaVideo";
import type { ValidatedVideoRequest } from "./video-schema";

const DEFAULT_VIDEO: ValidatedVideoRequest = {
  fps: 30,
  resolution: { width: 1920, height: 1080 },
  transitionDuration: 15,
  transition: "fade",
  enableIntro: true,
  introTitle: "Karma OS",
  musicVolume: 0.2,
  endPaddingFrames: 20,
  scenes: [
    {
      visualSpec: { layout: "flow", theme: "whiteboard", components: [], connections: [], containers: [] },
    },
  ],
};

export const KarmaRoot: React.FC = () => (
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
);

registerRoot(KarmaRoot);
