"use strict";
/** Karma Visual Rendering Engine - HTTP server. */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const schema_1 = require("../core/schema");
const document_1 = require("../renderer/document");
const exporter_1 = require("../export/exporter");
const icons_1 = require("../icons/icons");
const themes_1 = require("../theme/themes");
const video_schema_1 = require("../video/video-schema");
const render_video_1 = require("../video/render-video");
const app = (0, express_1.default)();
app.use(express_1.default.json({ limit: "50mb" }));
app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "karma-renderer", themes: Object.keys(themes_1.THEMES), icons: icons_1.KNOWN_ICONS.length });
});
app.get("/icons", (_req, res) => {
    res.json({ icons: icons_1.KNOWN_ICONS });
});
app.post("/render", async (req, res) => {
    const validated = (0, schema_1.safeValidateRenderRequest)(req.body);
    if (!validated.ok) {
        res.status(400).json({ success: false, error: validated.error });
        return;
    }
    const { spec, format = "png", width, height, scale = 1 } = validated.data;
    const finalWidth = width ?? spec.width ?? 1920;
    const finalHeight = height ?? spec.height ?? 1080;
    const finalScale = format === "png" ? Math.max(1, Math.min(scale, 4)) : 1;
    try {
        const html = await (0, document_1.buildDocument)(spec, { width: finalWidth, height: finalHeight });
        const result = await (0, exporter_1.renderHtml)(html, { format, width: finalWidth, height: finalHeight, scale: finalScale });
        res.setHeader("Content-Type", result.mimeType);
        res.setHeader("Content-Length", result.buffer.length);
        res.setHeader("X-Karma-Renderer", "visual-engine-v1");
        res.send(result.buffer);
    }
    catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error("[render] failed:", msg);
        res.status(500).json({ success: false, error: "Render failed: " + msg });
    }
});
app.post("/video", async (req, res) => {
    const validated = (0, video_schema_1.safeValidateVideoRequest)(req.body);
    if (!validated.ok) {
        res.status(400).json({ success: false, error: validated.error });
        return;
    }
    try {
        const result = await (0, render_video_1.renderVideoBuffer)(validated.data);
        res.setHeader("Content-Type", "video/mp4");
        res.setHeader("Content-Length", result.buffer.length);
        res.setHeader("X-Karma-Renderer", "remotion-video-v1");
        res.setHeader("X-Karma-Video-Fps", String(result.fps));
        res.setHeader("X-Karma-Video-Duration", String(Math.round(result.durationInFrames / result.fps)));
        res.send(result.buffer);
    }
    catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error("[video] render failed:", msg);
        res.status(500).json({ success: false, error: "Video render failed: " + msg });
    }
});
const port = Number(process.env.PORT ?? 3000);
const server = app.listen(port, () => {
    console.log(`[karma-renderer] listening on :${port}`);
});
process.on("SIGTERM", async () => {
    await (0, exporter_1.shutdownBrowser)();
    server.close(() => process.exit(0));
});
process.on("SIGINT", async () => {
    await (0, exporter_1.shutdownBrowser)();
    server.close(() => process.exit(0));
});
