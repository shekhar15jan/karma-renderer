"use strict";
/** Video prep - computes scene timeline + pre-renders each scene's visual HTML. */
Object.defineProperty(exports, "__esModule", { value: true });
exports.estimateSceneSeconds = estimateSceneSeconds;
exports.buildSceneHtml = buildSceneHtml;
exports.prepareVideo = prepareVideo;
const media_utils_1 = require("@remotion/media-utils");
const themes_1 = require("../theme/themes");
const frame_1 = require("../renderer/frame");
const MIN_SCENE_SECONDS = 2.5;
const MAX_SCENE_SECONDS = 25;
/** Heuristic narration seconds when a scene has no audio artifact. */
function estimateSceneSeconds(spec) {
    let chars = (spec.title ?? "").length + (spec.subtitle ?? "").length;
    for (const c of spec.components ?? []) {
        chars += (c.label ?? "").length + (c.sublabel ?? "").length;
        for (const it of c.items ?? [])
            chars += (typeof it === "string" ? it : (it.label ?? "")).length;
        for (const col of c.columns ?? []) {
            chars += (col.header ?? "").length;
            for (const cell of col.cells ?? [])
                chars += cell.length;
        }
    }
    if (spec.instructions)
        for (const ins of spec.instructions)
            chars += ins.length;
    const secs = Math.max(MIN_SCENE_SECONDS, Math.min(MAX_SCENE_SECONDS, chars / 14));
    return secs;
}
/** Builds the scene visual frame through the SHARED frame builder so that
 *  video frames are pixel-identical to the /render stills. */
async function buildSceneHtml(spec, width, height) {
    return (0, frame_1.buildSceneFrame)(spec, { width, height });
}
function introFramesFor(video) {
    if (!video.enableIntro)
        return 0;
    const titleLen = (video.introTitle ?? "Karma OS").length;
    const secs = Math.min(6, Math.max(2.2, 2 + titleLen / 12));
    return Math.round(secs * video.fps);
}
async function prepareVideo(video) {
    const fps = video.fps;
    const width = video.resolution.width;
    const height = video.resolution.height;
    const transition = video.transitionDuration;
    const theme = (0, themes_1.getTheme)(video.scenes[0]?.visualSpec.theme);
    const introFrames = introFramesFor(video);
    const scenes = [];
    let cursor = introFrames;
    for (let i = 0; i < video.scenes.length; i++) {
        const scene = video.scenes[i];
        const visualHtml = await buildSceneHtml(scene.visualSpec, width, height);
        const animation = scene.visualSpec.animation;
        const transition = scene.transition;
        let durationFrames;
        if (scene.audio) {
            const secs = await (0, media_utils_1.getAudioDurationInSeconds)(scene.audio);
            durationFrames = Math.max(1, Math.round(secs * fps));
        }
        else {
            durationFrames = Math.max(1, Math.round(estimateSceneSeconds(scene.visualSpec) * fps));
        }
        scenes.push({ index: i, startFrame: cursor, durationFrames, audio: scene.audio, visualHtml, spec: scene.visualSpec, animation, transition });
        cursor += durationFrames;
    }
    const totalFrames = cursor + video.endPaddingFrames;
    return { fps, width, height, introFrames, transition, totalFrames, scenes, music: video.music, musicVolume: video.musicVolume, theme };
}
