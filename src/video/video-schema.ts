/** Video schema - request contract for the Remotion-native Karma video renderer. */

import { z } from "zod";
import { specSchema } from "../core/schema";

const dataUri = z.string().refine((v) => /^data:[a-z0-9+/-]+;base64,/i.test(v), "expected base64 data URI");

const videoSpecSchema = specSchema.extend({
  layout: z.string().default("flow"),
  theme: z.string().default("whiteboard"),
});

const captionCueSchema = z.object({
  start: z.number(),
  end: z.number(),
  text: z.string(),
});

const sceneSchema = z.object({
  /** Reuses the full visual_spec model (graph + content layouts). */
  visualSpec: videoSpecSchema,
  /** Narration for this scene, as a base64 data URI (audio/mpeg preferred). */
  audio: dataUri.optional(),
  /** Transition used to enter this scene; overrides the video-level default. */
  transition: z.enum(["fade", "slide-left", "slide-right", "wipe-left", "wipe-right", "zoom"]).optional(),
  
  /** Audio markers for TTS emphasis and timing (ssml). */
  ssmlAudioMarkers: z.array(z.object({
    word: z.string(),
    effect: z.string(),
    duration: z.string().optional()
  })).optional(),
  
  /** Triggers for visual transitions within the scene. */
  visualTriggerCues: z.array(z.string()).optional(),
  
  /** Timeline events for dynamic pans and zooms. */
  timelineEvents: z.array(z.object({
    timestamp_ms: z.number(),
    action: z.string(),
    target_element_id: z.string().optional(),
    zoom_start: z.number().optional(),
    zoom_end: z.number().optional(),
    duration_ms: z.number().optional(),
    transform_origin: z.string().optional(),
    pan_x_start: z.number().optional(),
    pan_x_end: z.number().optional(),
    pan_y_start: z.number().optional(),
    pan_y_end: z.number().optional(),
  })).optional(),

  /** Per-scene captions (word-level or phrase-level). */
  captions: z.array(captionCueSchema).optional(),
});

export const videoRequestSchema = z.object({
  fps: z.number().int().min(1).max(120).default(30),
  resolution: z
    .object({ width: z.number().int().positive().default(1920), height: z.number().int().positive().default(1080) })
    .default({ width: 1920, height: 1080 }),
  /** Extra frames between scenes (crossfade/wipe). */
  transitionDuration: z.number().int().min(0).max(120).default(15),
  /** Default transition used between scenes when a scene does not override it. */
  transition: z.enum(["fade", "slide-left", "slide-right", "wipe-left", "wipe-right", "zoom"]).default("fade"),
  /** Auto intro card shown before scene 1. Set enableIntro=false to skip. */
  enableIntro: z.boolean().default(true),
  introTitle: z.string().optional(),
  introSubtitle: z.string().optional(),
  branding: z
    .object({
      logo: z.string().optional(),
      footer: z.string().optional(),
      header: z.string().optional(),
    })
    .optional(),
  scenes: z.array(sceneSchema).min(1),
  /** Optional background music as a base64 data URI. */
  music: dataUri.optional(),
  /** 0..1 volume for the music bed. */
  musicVolume: z.number().min(0).max(1).default(0.2),
  /** Padding in frames added after the final scene. */
  endPaddingFrames: z.number().int().min(0).max(300).default(20),

  /** Caption settings. */
  captions: z.object({
    /** Burn captions into video (true) or return SRT/VTT separately (false). */
    burnIn: z.boolean().default(true),
    /** Caption style preset. */
    preset: z.enum(["youtube", "clean", "bold", "minimal"]).default("youtube"),
    /** Vertical position: 0=top, 1=bottom. */
    position: z.number().min(0).max(1).default(0.85),
    /** Font size in px (at 1080p). */
    fontSize: z.number().int().positive().default(28),
    /** Max chars per line. */
    maxCharsPerLine: z.number().int().positive().default(42),
  }).optional(),

  /** Chapter markers for YouTube. */
  chapters: z.array(z.object({
    title: z.string(),
    startTime: z.number(), // seconds from video start
  })).optional(),
});

export type ValidatedVideoRequest = z.infer<typeof videoRequestSchema>;
export type VideoScene = z.infer<typeof sceneSchema>;

export function validateVideoRequest(input: unknown): ValidatedVideoRequest {
  return videoRequestSchema.parse(input);
}

export function safeValidateVideoRequest(input: unknown): { ok: true; data: ValidatedVideoRequest } | { ok: false; error: string } {
  try {
    return { ok: true, data: validateVideoRequest(input) };
  } catch (e) {
    if (e instanceof z.ZodError) {
      return { ok: false, error: "Validation failed: " + e.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ") };
    }
    return { ok: false, error: String(e) };
  }
}
