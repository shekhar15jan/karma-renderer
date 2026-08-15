"use strict";
/** render-still - bundles the composition and renders one settled PNG frame of a scene spec.
 *  Reuses the SAME Remotion bundle and widget stack as /video, so stills and video are
 *  pixel-identical (Stack B - widgets are the single source of truth).
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderStillBuffer = renderStillBuffer;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const bundler_1 = require("@remotion/bundler");
const renderer_1 = require("@remotion/renderer");
const tailwind_1 = require("@remotion/tailwind");
const render_video_1 = require("./render-video");
const KarmaStill_1 = require("./compositions/KarmaStill");
const COMPOSITION_ID = "karma-still";
async function renderStillBuffer(request) {
    const entryPoint = (0, render_video_1.resolveRemotionEntry)();
    const inputProps = { spec: request.spec };
    const width = request.width ?? request.spec.width ?? 1920;
    const height = request.height ?? request.spec.height ?? 1080;
    const scale = request.scale ?? 1;
    const serveUrl = await (0, bundler_1.bundle)({ entryPoint, webpackOverride: tailwind_1.enableTailwind, onProgress: (p) => p });
    const composition = await (0, renderer_1.selectComposition)({ serveUrl, id: COMPOSITION_ID, inputProps });
    const outputLocation = path_1.default.join(os_1.default.tmpdir(), `karma-still-${process.pid}-${Date.now()}.png`);
    try {
        await (0, renderer_1.renderStill)({
            composition,
            serveUrl,
            output: outputLocation,
            frame: KarmaStill_1.STILL_SETTLE_FRAME,
            inputProps,
            imageFormat: "png",
            scale,
            chromiumOptions: { gl: "swangle" },
            logLevel: "error",
        });
        const buffer = await fs_1.default.promises.readFile(outputLocation);
        return { buffer, width: Math.round(width * scale), height: Math.round(height * scale) };
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
