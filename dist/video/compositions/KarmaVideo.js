"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KarmaVideo = exports.karmaVideoCalculateMetadata = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const prepare_1 = require("../prepare");
const IntroCard_1 = require("./IntroCard");
const SceneVisual_1 = require("./SceneVisual");
const Branding_1 = require("./Branding");
const styles_1 = require("../../renderer/styles");
const karmaVideoCalculateMetadata = async ({ props }) => {
    const prepared = await (0, prepare_1.prepareVideo)(props.video);
    return {
        durationInFrames: prepared.totalFrames,
        fps: prepared.fps,
        width: prepared.width,
        height: prepared.height,
        props: { ...props, prepared },
    };
};
exports.karmaVideoCalculateMetadata = karmaVideoCalculateMetadata;
const transitionStyle = (type, frame, transition, sceneDurationFrames) => {
    const t = type ?? "fade";
    if (transition <= 0)
        return {};
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
const SceneBlock = ({ scene, transition, isLast, theme, fps, defaultTransition, }) => {
    const frame = (0, remotion_1.useCurrentFrame)();
    const fadeIn = transition > 0 ? (0, remotion_1.interpolate)(frame, [0, transition], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
    const fadeOut = !isLast && transition > 0 ? (0, remotion_1.interpolate)(frame, [scene.durationFrames, scene.durationFrames + transition], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
    const opacity = Math.min(fadeIn, fadeOut);
    const animStyle = transitionStyle(scene.transition ?? defaultTransition, frame, transition, scene.durationFrames);
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: { opacity }, children: [(0, jsx_runtime_1.jsx)(remotion_1.AbsoluteFill, { style: animStyle, children: (0, jsx_runtime_1.jsx)(SceneVisual_1.SceneVisual, { html: scene.visualHtml, theme: theme, durationFrames: scene.durationFrames, fps: fps, animation: scene.animation }) }), scene.audio ? (0, jsx_runtime_1.jsx)(remotion_1.Audio, { src: scene.audio }) : null] }));
};
const KarmaVideo = ({ video, prepared }) => {
    if (!prepared)
        return null;
    const p = prepared;
    const theme = p.theme;
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: { background: theme.background, fontFamily: theme.font }, children: [(0, jsx_runtime_1.jsx)("style", { dangerouslySetInnerHTML: { __html: styles_1.SCENE_CSS } }), p.introFrames > 0 ? ((0, jsx_runtime_1.jsx)(remotion_1.Sequence, { from: 0, durationInFrames: p.introFrames, children: (0, jsx_runtime_1.jsx)(IntroCard_1.IntroCard, { video: video, accent: theme.accent, heading: theme.fontHeading }) })) : null, p.scenes.map((s, i) => ((0, jsx_runtime_1.jsx)(remotion_1.Sequence, { from: s.startFrame, durationInFrames: s.durationFrames + p.transition, children: (0, jsx_runtime_1.jsx)(SceneBlock, { scene: s, transition: p.transition, isLast: i === p.scenes.length - 1, theme: theme, fps: p.fps, defaultTransition: video.transition }) }, s.index))), (0, jsx_runtime_1.jsx)(Branding_1.Branding, { branding: p.scenes[0]?.spec?.branding ?? video.scenes[0]?.visualSpec?.branding, theme: theme }), p.music ? (0, jsx_runtime_1.jsx)(remotion_1.Audio, { src: p.music, loop: true, volume: p.musicVolume }) : null] }));
};
exports.KarmaVideo = KarmaVideo;
