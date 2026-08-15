"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KarmaVideo = exports.karmaVideoCalculateMetadata = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const prepare_1 = require("../prepare");
const IntroCard_1 = require("./IntroCard");
const SceneVisual_1 = require("./SceneVisual");
const Branding_1 = require("./Branding");
const Captions_1 = require("./Captions");
const EndScreen_1 = require("./EndScreen");
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
const SceneBlock = ({ scene, transition, isLast, theme, fps, defaultTransition, }) => {
    const frame = (0, remotion_1.useCurrentFrame)();
    const fadeIn = transition > 0 ? (0, remotion_1.interpolate)(frame, [0, transition], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
    const fadeOut = !isLast && transition > 0 ? (0, remotion_1.interpolate)(frame, [scene.durationFrames, scene.durationFrames + transition], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
    const opacity = Math.min(fadeIn, fadeOut);
    const animStyle = transitionStyle(scene.transition ?? defaultTransition, frame, transition, scene.durationFrames);
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: { opacity }, children: [(0, jsx_runtime_1.jsx)(remotion_1.AbsoluteFill, { style: animStyle, children: (0, jsx_runtime_1.jsx)(SceneVisual_1.SceneVisual, { spec: scene.spec, theme: theme, durationFrames: scene.durationFrames, fps: fps, animation: scene.animation, timelineEvents: scene.timelineEvents }) }), scene.audio ? (0, jsx_runtime_1.jsx)(remotion_1.Audio, { src: scene.audio }) : null] }));
};
/** Music ducking - reduces music volume when narration is active. */
const MusicDucking = ({ src, loop, baseVolume, scenes, fps, duckVolume = 0.05 }) => {
    const frame = (0, remotion_1.useCurrentFrame)();
    const currentTime = frame / fps;
    // Check if any scene narration is active at current time
    const isNarrationActive = scenes.some(s => s.audio && currentTime >= s.startFrame / fps && currentTime < (s.startFrame + s.durationFrames) / fps);
    const volume = isNarrationActive ? duckVolume : baseVolume;
    return ((0, jsx_runtime_1.jsx)(remotion_1.Audio, { src: src, loop: loop, volume: volume, playbackRate: 1 }));
};
const allCues = (scenes, fps) => {
    const cues = [];
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
const KarmaVideo = ({ video, prepared }) => {
    if (!prepared)
        return null;
    const p = prepared;
    const theme = p.theme;
    const cues = allCues(p.scenes, p.fps);
    // End screen starts after last scene + transition + padding
    const lastScene = p.scenes[p.scenes.length - 1];
    const endScreenStartFrame = lastScene.startFrame + lastScene.durationFrames + p.transition;
    const endScreenDurationFrames = Math.min(p.endPaddingFrames ?? 60, 180); // max 6 seconds at 30fps
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: { background: theme.background, fontFamily: theme.font }, children: [(0, jsx_runtime_1.jsx)("style", { dangerouslySetInnerHTML: { __html: styles_1.SCENE_CSS } }), p.introFrames > 0 ? ((0, jsx_runtime_1.jsx)(remotion_1.Sequence, { from: 0, durationInFrames: p.introFrames, children: (0, jsx_runtime_1.jsx)(IntroCard_1.IntroCard, { video: video, accent: theme.accent, heading: theme.fontHeading }) })) : null, p.scenes.map((s, i) => ((0, jsx_runtime_1.jsx)(remotion_1.Sequence, { from: s.startFrame, durationInFrames: s.durationFrames + p.transition, children: (0, jsx_runtime_1.jsx)(SceneBlock, { scene: s, transition: p.transition, isLast: i === p.scenes.length - 1, theme: theme, fps: p.fps, defaultTransition: video.transition }) }, s.index))), (0, jsx_runtime_1.jsx)(Branding_1.Branding, { branding: p.scenes[0]?.spec?.branding ?? video.scenes[0]?.visualSpec?.branding, theme: theme }), p.music ? ((0, jsx_runtime_1.jsx)(MusicDucking, { src: p.music, loop: true, baseVolume: p.musicVolume, scenes: p.scenes, fps: p.fps, duckVolume: 0.05 })) : null, p.captions?.burnIn && cues.length > 0 && ((0, jsx_runtime_1.jsx)(Captions_1.Captions, { cues: cues, fps: p.fps, width: p.width, height: p.height, preset: p.captions.preset, position: p.captions.position, fontSize: p.captions.fontSize, maxCharsPerLine: p.captions.maxCharsPerLine })), video.enableIntro !== false && ((0, jsx_runtime_1.jsx)(remotion_1.Sequence, { from: endScreenStartFrame, durationInFrames: endScreenDurationFrames, children: (0, jsx_runtime_1.jsx)(EndScreen_1.EndScreen, { theme: theme, channelName: video.introTitle, videoTitle: video.introSubtitle }) }))] }));
};
exports.KarmaVideo = KarmaVideo;
