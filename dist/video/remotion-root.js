"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KarmaRoot = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
/** Remotion root - registers the Karma video composition. */
require("../styles/global.css");
const remotion_1 = require("remotion");
const KarmaVideo_1 = require("./compositions/KarmaVideo");
const WidgetShowcase_1 = require("./compositions/WidgetShowcase");
const terminal_test_json_1 = __importDefault(require("./mock_specs/terminal_test.json"));
const DEFAULT_VIDEO = {
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
            visualSpec: terminal_test_json_1.default,
        },
    ],
};
const KarmaRoot = () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(remotion_1.Composition, { id: "karma-video", component: KarmaVideo_1.KarmaVideo, durationInFrames: 300, fps: 30, width: 1920, height: 1080, defaultProps: { video: DEFAULT_VIDEO }, calculateMetadata: KarmaVideo_1.karmaVideoCalculateMetadata }), (0, jsx_runtime_1.jsx)(remotion_1.Composition, { id: "WidgetShowcase", component: WidgetShowcase_1.WidgetShowcase, durationInFrames: 150, fps: 30, width: 1920, height: 1080 })] }));
exports.KarmaRoot = KarmaRoot;
(0, remotion_1.registerRoot)(exports.KarmaRoot);
