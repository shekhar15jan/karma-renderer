"use strict";
/** Video schema - request contract for the Remotion-native Karma video renderer. */
Object.defineProperty(exports, "__esModule", { value: true });
exports.videoRequestSchema = void 0;
exports.validateVideoRequest = validateVideoRequest;
exports.safeValidateVideoRequest = safeValidateVideoRequest;
const zod_1 = require("zod");
const schema_1 = require("../core/schema");
const dataUri = zod_1.z.string().refine((v) => /^data:[a-z0-9+/-]+;base64,/i.test(v), "expected base64 data URI");
const videoSpecSchema = schema_1.specSchema.extend({
    layout: zod_1.z.string().default("flow"),
    theme: zod_1.z.string().default("whiteboard"),
});
const captionCueSchema = zod_1.z.object({
    start: zod_1.z.number(),
    end: zod_1.z.number(),
    text: zod_1.z.string(),
});
const sceneSchema = zod_1.z.object({
    /** Reuses the full visual_spec model (graph + content layouts). */
    visualSpec: videoSpecSchema,
    /** Narration for this scene, as a base64 data URI (audio/mpeg preferred). */
    audio: dataUri.optional(),
    /** Transition used to enter this scene; overrides the video-level default. */
    transition: zod_1.z.enum(["fade", "slide-left", "slide-right", "wipe-left", "wipe-right", "zoom"]).optional(),
    /** Audio markers for TTS emphasis and timing (ssml). */
    ssmlAudioMarkers: zod_1.z.array(zod_1.z.object({
        word: zod_1.z.string(),
        effect: zod_1.z.string(),
        duration: zod_1.z.string().optional()
    })).optional(),
    /** Triggers for visual transitions within the scene. */
    visualTriggerCues: zod_1.z.array(zod_1.z.string()).optional(),
    /** Timeline events for dynamic pans and zooms. */
    timelineEvents: zod_1.z.array(zod_1.z.object({
        timestamp_ms: zod_1.z.number(),
        action: zod_1.z.string(),
        target_element_id: zod_1.z.string().optional(),
        zoom_start: zod_1.z.number().optional(),
        zoom_end: zod_1.z.number().optional(),
        duration_ms: zod_1.z.number().optional(),
        transform_origin: zod_1.z.string().optional(),
        pan_x_start: zod_1.z.number().optional(),
        pan_x_end: zod_1.z.number().optional(),
        pan_y_start: zod_1.z.number().optional(),
        pan_y_end: zod_1.z.number().optional(),
    })).optional(),
    /** Per-scene captions (word-level or phrase-level). */
    captions: zod_1.z.array(captionCueSchema).optional(),
});
exports.videoRequestSchema = zod_1.z.object({
    fps: zod_1.z.number().int().min(1).max(120).default(30),
    resolution: zod_1.z
        .object({ width: zod_1.z.number().int().positive().default(1920), height: zod_1.z.number().int().positive().default(1080) })
        .default({ width: 1920, height: 1080 }),
    /** Extra frames between scenes (crossfade/wipe). */
    transitionDuration: zod_1.z.number().int().min(0).max(120).default(15),
    /** Default transition used between scenes when a scene does not override it. */
    transition: zod_1.z.enum(["fade", "slide-left", "slide-right", "wipe-left", "wipe-right", "zoom"]).default("fade"),
    /** Auto intro card shown before scene 1. Set enableIntro=false to skip. */
    enableIntro: zod_1.z.boolean().default(true),
    introTitle: zod_1.z.string().optional(),
    introSubtitle: zod_1.z.string().optional(),
    branding: zod_1.z
        .object({
        logo: zod_1.z.string().optional(),
        footer: zod_1.z.string().optional(),
        header: zod_1.z.string().optional(),
    })
        .optional(),
    scenes: zod_1.z.array(sceneSchema).min(1),
    /** Optional background music as a base64 data URI. */
    music: dataUri.optional(),
    /** 0..1 volume for the music bed. */
    musicVolume: zod_1.z.number().min(0).max(1).default(0.2),
    /** Padding in frames added after the final scene. */
    endPaddingFrames: zod_1.z.number().int().min(0).max(300).default(20),
    /** Caption settings. */
    captions: zod_1.z.object({
        /** Burn captions into video (true) or return SRT/VTT separately (false). */
        burnIn: zod_1.z.boolean().default(true),
        /** Caption style preset. */
        preset: zod_1.z.enum(["youtube", "clean", "bold", "minimal"]).default("youtube"),
        /** Vertical position: 0=top, 1=bottom. */
        position: zod_1.z.number().min(0).max(1).default(0.85),
        /** Font size in px (at 1080p). */
        fontSize: zod_1.z.number().int().positive().default(28),
        /** Max chars per line. */
        maxCharsPerLine: zod_1.z.number().int().positive().default(42),
    }).optional(),
    /** Chapter markers for YouTube. */
    chapters: zod_1.z.array(zod_1.z.object({
        title: zod_1.z.string(),
        startTime: zod_1.z.number(), // seconds from video start
    })).optional(),
});
function validateVideoRequest(input) {
    return exports.videoRequestSchema.parse(input);
}
function safeValidateVideoRequest(input) {
    try {
        return { ok: true, data: validateVideoRequest(input) };
    }
    catch (e) {
        if (e instanceof zod_1.z.ZodError) {
            return { ok: false, error: "Validation failed: " + e.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ") };
        }
        return { ok: false, error: String(e) };
    }
}
