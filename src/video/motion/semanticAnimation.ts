/**
 * SemanticAnimation → Remotion interpolation (§12)
 * AI emits {type:TRAVEL, from, to, at}, renderer computes path.
 */
import { interpolate } from "remotion";
import type { SemanticAnimation } from "../schema/semanticSceneSpec";

export interface AnimationFrame { opacity: number; x: number; y: number; scale: number; glow: boolean; }

export function animationFor(frame: number, fps: number, anim: SemanticAnimation): Partial<AnimationFrame> {
  const t = frame / fps;
  const at = anim.at ?? 0;
  const dur = anim.duration ?? 1.2;
  if (t < at) return { opacity: 0 };
  if (t > at + dur) return { opacity: 1, glow: false };
  const p = (t - at) / dur;
  switch (anim.type) {
    case "travel":
    case "publish":
    case "queue":
      return { opacity: interpolate(p, [0,1], [0,1]), x: interpolate(p, [0,1], [-40,0]), glow: p > 0.8 };
    case "highlight":
    case "focus":
      return { opacity: 1, glow: p < 0.5 };
    case "fail":
      return { opacity: 1, glow: true };
    case "appear":
    case "reveal":
    default:
      return { opacity: interpolate(p, [0,1], [0,1]) };
  }
}

export function isActive(frame: number, fps: number, anim: SemanticAnimation): boolean {
  const t = frame / fps; const at = anim.at ?? 0; const dur = anim.duration ?? 1.2;
  return t >= at && t <= at + dur;
}
