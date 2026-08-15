"use strict";
/** render-video - bundles the composition, resolves metadata and renders an MP4. */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveRemotionEntry = resolveRemotionEntry;
exports.renderVideoBuffer = renderVideoBuffer;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const bundler_1 = require("@remotion/bundler");
const renderer_1 = require("@remotion/renderer");
const tailwind_1 = require("@remotion/tailwind");
const COMPOSITION_ID = "karma-video";
/** Resolves the Remotion entry point for both dev (tsx, src/*.tsx) and prod (dist/*.js). */
function resolveRemotionEntry() {
    const candidates = [
        path_1.default.join(__dirname, "remotion-root.js"),
        path_1.default.join(__dirname, "remotion-root.tsx"),
    ];
    for (const c of candidates) {
        if (fs_1.default.existsSync(c))
            return c;
    }
    throw new Error(`Remotion entry point not found (tried: ${candidates.join(", ")})`);
}
function resolveConcurrency() {
    const env = Number(process.env.CONCURRENCY);
    if (Number.isInteger(env) && env > 0) {
        return env;
    }
    const cpus = Math.max(1, os_1.default.availableParallelism?.() ?? os_1.default.cpus().length);
    const freeMemMB = Math.floor(os_1.default.freemem() / 1024 / 1024);
    const memCapped = Math.max(1, Math.floor(freeMemMB / 600));
    return Math.max(1, Math.min(cpus, memCapped));
}
function clampInt(raw, min, max, fallback) {
    const value = Number(raw);
    if (!Number.isFinite(value)) {
        return fallback;
    }
    return Math.min(max, Math.max(min, Math.trunc(value)));
}
async function renderVideoBuffer(request) {
    const entryPoint = resolveRemotionEntry();
    const inputProps = { video: request };
    const serveUrl = await (0, bundler_1.bundle)({ entryPoint, webpackOverride: tailwind_1.enableTailwind, onProgress: (p) => p });
    const composition = await (0, renderer_1.selectComposition)({ serveUrl, id: COMPOSITION_ID, inputProps });
    const outputLocation = path_1.default.join(os_1.default.tmpdir(), `karma-video-${process.pid}-${Date.now()}.mp4`);
    try {
        const concurrency = resolveConcurrency();
        const x264Preset = (process.env.X264_PRESET ?? "veryfast").trim() || "veryfast";
        const jpegQuality = clampInt(process.env.JPEG_QUALITY, 1, 100, 70);
        await (0, renderer_1.renderMedia)({
            composition,
            serveUrl,
            codec: "h264",
            outputLocation,
            inputProps,
            chromiumOptions: { gl: "swangle" },
            concurrency,
            x264Preset: x264Preset,
            jpegQuality,
            logLevel: "error",
        });
        const buffer = await fs_1.default.promises.readFile(outputLocation);
        return {
            buffer,
            width: composition.width,
            height: composition.height,
            fps: composition.fps,
            durationInFrames: composition.durationInFrames,
        };
    }
    finally {
        try {
            await fs_1.default.promises.unlink(outputLocation);
        }
        catch {
            /* ignore */
        }
    }
}
