"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KarmaRoot = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const KarmaVideo_1 = require("./compositions/KarmaVideo");
const DEFAULT_VIDEO = {
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
const KarmaRoot = () => ((0, jsx_runtime_1.jsx)(remotion_1.Composition, { id: "karma-video", component: KarmaVideo_1.KarmaVideo, durationInFrames: 300, fps: 30, width: 1920, height: 1080, defaultProps: { video: DEFAULT_VIDEO }, calculateMetadata: KarmaVideo_1.karmaVideoCalculateMetadata }));
exports.KarmaRoot = KarmaRoot;
(0, remotion_1.registerRoot)(exports.KarmaRoot);
