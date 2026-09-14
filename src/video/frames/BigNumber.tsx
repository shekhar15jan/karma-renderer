/**
 * big-number — one metric that carries the whole scene.
 *
 * Fixes the recorded defect: the legacy branch took components[0] as the value and
 * components[1] as the caption by raw array position — wrong whenever the script
 * ordered them differently (a caption first, or a heading/paragraph placed before
 * the metric). The catalogue's "metric" slot only accepts the metric atom, so
 * assignSlots has already found the actual value-bearing component regardless of
 * where it sits in the authored array.
 */
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { KarmaSlideHeader } from "../../components/widgets/HtmlWidgets";
import type { FrameFC } from "./types";

export const BigNumber: FrameFC = ({ spec, slots, render }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const metricComponent = slots.metric?.[0];
  const captionComponent = slots.caption?.[0];

  const rawValue = metricComponent?.data?.value ?? metricComponent?.label ?? "0";
  const numericMatch = String(rawValue).match(/^([\d,.]+)(.*)$/);

  // Count from 0 to target over the first 60% of the scene, ease-out cubic.
  const countFrames = Math.floor(durationInFrames * 0.6);
  const progress = Math.min(1, frame / Math.max(1, countFrames));
  const eased = 1 - Math.pow(1 - progress, 3);

  let displayValue: string;
  if (numericMatch) {
    const target = parseFloat(numericMatch[1].replace(/,/g, ""));
    const suffix = numericMatch[2] || "";
    const current = Math.floor(target * eased);
    const formatted = String(rawValue).includes(",") ? current.toLocaleString() : String(current);
    displayValue = formatted + suffix;
  } else {
    displayValue = String(rawValue);
  }

  return (
    <div className="w-full h-full p-16 flex flex-col z-10 relative">
      <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
      <div
        className="flex-grow w-full flex flex-col items-center justify-center"
        style={{ opacity: Math.min(1, eased + 0.1) }}
      >
        <div
          className="font-black text-transparent bg-clip-text bg-gradient-to-br from-[var(--scene-primary)] to-[var(--scene-accent)] leading-none tabular-nums"
          style={{ fontFamily: "var(--scene-heading)", fontSize: "clamp(80px, 18vw, 200px)" }}
        >
          {displayValue}
        </div>
        {captionComponent && <div className="mt-8">{render(captionComponent, 1)}</div>}
      </div>
    </div>
  );
};
