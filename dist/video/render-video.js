"use strict";
/** render-video - bundles the composition, resolves metadata and renders an MP4. */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderVideoBuffer = renderVideoBuffer;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const bundler_1 = require("@remotion/bundler");
const renderer_1 = require("@remotion/renderer");
const COMPOSITION_ID = "karma-video";
async function renderVideoBuffer(request) {
    const entryPoint = path_1.default.join(__dirname, "remotion-root.js");
    if (!fs_1.default.existsSync(entryPoint)) {
        throw new Error(`Remotion entry point not found: ${entryPoint}`);
    }
    const inputProps = { video: request };
    const serveUrl = await (0, bundler_1.bundle)({ entryPoint, onProgress: (p) => p });
    const composition = await (0, renderer_1.selectComposition)({ serveUrl, id: COMPOSITION_ID, inputProps });
    const outputLocation = path_1.default.join(os_1.default.tmpdir(), `karma-video-${process.pid}-${Date.now()}.mp4`);
    try {
        await (0, renderer_1.renderMedia)({
            composition,
            serveUrl,
            codec: "h264",
            outputLocation,
            inputProps,
            chromiumOptions: { gl: "swangle" },
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
