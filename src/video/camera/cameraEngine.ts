/**
 * CameraEngine — semantic intents → transforms (§14)
 * Supports: ESTABLISH / FOLLOW / FOCUS / PUSH_IN / PULL_OUT / PAN / REVEAL / TRACK / COMPARE / OVERVIEW
 * Easing: Easing.out(Easing.cubic) with accel/decel, safe framing, viewport-relative units, interpolation.
 */
import { interpolate, Easing } from "remotion";
import type { CameraIntent } from "../schema/semanticSceneSpec";

// 1080p viewport — Remotion compositions are 1920x1080 (§23)
const VIEWPORT_W = 1920;
const VIEWPORT_H = 1080;

// Safe framing limits — prevents clipping & motion sickness (§15, §22)
const MIN_SCALE = 0.75;
const MAX_SCALE = 2.0;
const MAX_PAN_X = VIEWPORT_W * 0.22; // ~422px max pan
const MAX_PAN_Y = VIEWPORT_H * 0.18; // ~194px max pan
const SAFE_MARGIN_X = VIEWPORT_W * 0.125;
const SAFE_MARGIN_Y = VIEWPORT_H * 0.125;

export interface CameraTransform {
  scale: number;
  x: number;
  y: number;
  rotation?: number;
  blur?: number;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/** Viewport-relative pan: factor is proportion of viewport (e.g. 0.06 => 6vw). */
function vw(factor: number): number {
  return VIEWPORT_W * factor;
}
function vh(factor: number): number {
  return VIEWPORT_H * factor;
}

function easedOutCubic(p: number): number {
  return Easing.out(Easing.cubic)(clamp(p, 0, 1));
}
function easedInOutCubic(p: number): number {
  return Easing.inOut(Easing.cubic)(clamp(p, 0, 1));
}
function easedInCubic(p: number): number {
  return Easing.in(Easing.cubic)(clamp(p, 0, 1));
}

/** Clamp scale + pan to safe framing marigns. */
function safeFraming(t: CameraTransform): CameraTransform {
  return {
    scale: clamp(t.scale, MIN_SCALE, MAX_SCALE),
    x: clamp(t.x, -MAX_PAN_X, MAX_PAN_X),
    y: clamp(t.y, -MAX_PAN_Y, MAX_PAN_Y),
    rotation: t.rotation ? clamp(t.rotation, -2, 2) : 0,
    blur: t.blur ? clamp(t.blur, 0, 6) : 0,
  };
}

/** Resolve start/end scale with per-mode defaults when intent doesn't specify. */
function resolveScales(
  mode: CameraIntent["mode"],
  intent?: CameraIntent
): { s0: number; s1: number } {
  const s0 = intent?.start?.scale;
  const s1 = intent?.end?.scale;
  switch (mode) {
    case "ESTABLISH":
      return { s0: s0 ?? 1.04, s1: s1 ?? 1.0 };
    case "OVERVIEW":
      return { s0: s0 ?? 1.0, s1: s1 ?? 0.86 };
    case "PUSH_IN":
      return { s0: s0 ?? 1.0, s1: s1 ?? 1.35 };
    case "PULL_OUT":
      return { s0: s0 ?? 1.35, s1: s1 ?? 1.0 };
    case "FOCUS":
      return { s0: s0 ?? 1.0, s1: s1 ?? 1.42 };
    case "FOLLOW":
      return { s0: s0 ?? 1.0, s1: s1 ?? 1.18 };
    case "TRACK":
      return { s0: s0 ?? 1.0, s1: s1 ?? 1.22 };
    case "PAN":
      return { s0: s0 ?? 1.0, s1: s1 ?? 1.02 };
    case "REVEAL":
      return { s0: s0 ?? 1.0, s1: s1 ?? 1.06 };
    case "COMPARE":
      return { s0: s0 ?? 0.92, s1: s1 ?? 0.92 };
    default:
      return { s0: s0 ?? 1, s1: s1 ?? 1 };
  }
}

function resolveXY(
  mode: CameraIntent["mode"],
  intent?: CameraIntent,
  eased: number = 0
): { x: number; y: number } {
  // Intent-provided viewport-relative coordinates: if |x| <=2 treat as vw proportion, else px.
  // This allows both "x:960" (px focal) and "x:0.05" (5vw) conventions.
  const toPxX = (v?: number) => {
    if (v === undefined) return undefined;
    return Math.abs(v) <= 2 ? v * VIEWPORT_W : v - VIEWPORT_W / 2;
  };
  const toPxY = (v?: number) => {
    if (v === undefined) return undefined;
    return Math.abs(v) <= 2 ? v * VIEWPORT_H : v - VIEWPORT_H / 2;
  };

  const sx = toPxX(intent?.start?.x);
  const ex = toPxX(intent?.end?.x);
  const sy = toPxY(intent?.start?.y);
  const ey = toPxY(intent?.end?.y);

  // If explicit start/end supplied, interpolate them viewport-relative.
  if (sx !== undefined || ex !== undefined || sy !== undefined || ey !== undefined) {
    const x0 = sx ?? 0;
    const x1 = ex !== undefined ? ex : sx ?? 0;
    const y0 = sy ?? 0;
    const y1 = ey !== undefined ? ey : sy ?? 0;
    return {
      x: interpolate(eased, [0, 1], [x0, x1]),
      y: interpolate(eased, [0, 1], [y0, y1]),
    };
  }

  // Mode defaults — viewport-relative units (not fixed -100px)
  switch (mode) {
    case "PAN":
      // Horizontal pan: 6–8vw travel
      return { x: interpolate(eased, [0, 1], [0, -vw(0.07)]), y: 0 };
    case "REVEAL":
      // Vertical reveal: pan up ~7vh
      return { x: 0, y: interpolate(eased, [0, 1], [vh(0.05), -vh(0.06)]) };
    case "FOLLOW":
      // Follow lateral drift + slight y
      return { x: interpolate(eased, [0, 1], [0, -vw(0.06)]), y: interpolate(eased, [0, 1], [0, -vh(0.02)]) };
    case "TRACK":
      // Tracking: longer pan with accel/decel
      return { x: interpolate(eased, [0, 1], [vw(0.04), -vw(0.08)]), y: 0 };
    case "COMPARE":
      return { x: 0, y: 0 };
    case "ESTABLISH":
    case "OVERVIEW":
      // Subtle centering pan
      return { x: interpolate(eased, [0, 1], [vw(0.015), 0]), y: interpolate(eased, [0, 1], [vh(0.01), 0]) };
    case "FOCUS":
      // Focus: micro-pan to center target (center-biased)
      return { x: interpolate(eased, [0, 1], [0, 0]), y: interpolate(eased, [0, 1], [0, 0]) };
    case "PUSH_IN":
    case "PULL_OUT":
    default:
      return { x: 0, y: 0 };
  }
}

/**
 * Core: frame → transform for a single CameraIntent.
 * Uses Easing.out(cubic) for natural deceleration; TRACK/PAN/COMPARE use inOut for accel/decel.
 */
export function cameraTransform(
  frame: number,
  fps: number,
  durationInFrames: number,
  intent?: CameraIntent
): CameraTransform {
  if (!intent) return { scale: 1, x: 0, y: 0 };

  const durationSec = durationInFrames / Math.max(1, fps);
  // Support intent.duration to segment progress (interpolation between events §23).
  const effectiveDuration = intent.duration && intent.duration < durationSec ? intent.duration : durationSec;
  const progressRaw = durationInFrames > 0 ? frame / durationInFrames : 0;
  // If intent.duration shorter than scene, spread its progress over its own window, then hold.
  const p = intent.duration
    ? clamp(frame / Math.max(1, fps) / effectiveDuration, 0, 1)
    : clamp(progressRaw, 0, 1);

  let eased: number;
  switch (intent.mode) {
    case "TRACK":
    case "PAN":
    case "COMPARE":
      eased = easedInOutCubic(p);
      break;
    case "PUSH_IN":
      // Accelerate then decelerate softly: inOut cubic feels like dolly.
      eased = easedOutCubic(p);
      // Add subtle ease-in bias for first 20% (acceleration)
      if (p < 0.2) eased = easedInCubic(p / 0.2) * 0.15 + eased * 0.85;
      break;
    case "PULL_OUT":
    case "FOCUS":
    case "FOLLOW":
    case "REVEAL":
    case "ESTABLISH":
    case "OVERVIEW":
    default:
      eased = easedOutCubic(p);
      break;
  }

  const { s0, s1 } = resolveScales(intent.mode, intent);
  const scale = interpolate(eased, [0, 1], [s0, s1]);
  const { x, y } = resolveXY(intent.mode, intent, eased);

  // Apply safe framing after interpolation.
  return safeFraming({ scale, x, y });
}

/** Time-based overload (seconds) — convenient for narration sync. */
export function cameraTransformAtTime(
  timeSec: number,
  durationSec: number,
  intent?: CameraIntent,
  fps: number = 30
): CameraTransform {
  const frame = Math.round(timeSec * fps);
  const durationInFrames = Math.round(durationSec * fps);
  return cameraTransform(frame, fps, durationInFrames, intent);
}

/** Interpolate between two transforms (e.g. between camera events). */
export function interpolateCameraTransforms(
  a: CameraTransform,
  b: CameraTransform,
  t: number,
  easing: (p: number) => number = easedOutCubic
): CameraTransform {
  const k = easing(clamp(t, 0, 1));
  return safeFraming({
    scale: interpolate(k, [0, 1], [a.scale, b.scale]),
    x: interpolate(k, [0, 1], [a.x, b.x]),
    y: interpolate(k, [0, 1], [a.y, b.y]),
  });
}

/**
 * Sequence: interpolate between multiple CameraIntents over scene duration.
 * Each intent's fractional window is equal unless intent.duration specified.
 * Provides smooth interpolation between events (§14).
 */
export function cameraSequenceTransform(
  frame: number,
  fps: number,
  durationInFrames: number,
  intents: CameraIntent[]
): CameraTransform {
  if (!intents.length) return { scale: 1, x: 0, y: 0 };
  if (intents.length === 1) return cameraTransform(frame, fps, durationInFrames, intents[0]);

  const totalFrames = Math.max(1, durationInFrames);
  const segmentFrames = totalFrames / intents.length;
  const idx = clamp(Math.floor(frame / segmentFrames), 0, intents.length - 1);
  const nextIdx = clamp(idx + 1, 0, intents.length - 1);
  if (idx === nextIdx) return cameraTransform(frame - idx * segmentFrames, fps, segmentFrames, intents[idx]);

  const localFrame = frame - idx * segmentFrames;
  const t = clamp(localFrame / segmentFrames, 0, 1);
  const a = cameraTransform(segmentFrames, fps, segmentFrames, intents[idx]);
  const b = cameraTransform(0, fps, segmentFrames, intents[nextIdx]);
  return interpolateCameraTransforms(a, b, t);
}

export function cameraTransformToCss(t: CameraTransform): string {
  const parts = [`scale(${t.scale.toFixed(4)})`, `translate(${t.x.toFixed(1)}px, ${t.y.toFixed(1)}px)`];
  if (t.rotation) parts.push(`rotate(${t.rotation.toFixed(2)}deg)`);
  return parts.join(" ");
}

export function cameraTransformStyle(t: CameraTransform): React.CSSProperties {
  return {
    transform: cameraTransformToCss(t),
    transformOrigin: "center center",
    willChange: "transform",
  };
}

// Viewport helpers exposed for testing/safe framing consumers.
export const CameraViewport = { width: VIEWPORT_W, height: VIEWPORT_H, safeMarginX: SAFE_MARGIN_X, safeMarginY: SAFE_MARGIN_Y, marginFactor: 1.25 };
