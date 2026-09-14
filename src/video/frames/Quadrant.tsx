/**
 * quadrant — trade-off positioning on two axes. Points place via data.x/data.y
 * (0–1 normalized); when absent, data.quadrant (1–4) auto-spaces within that quadrant.
 */
import React from "react";
import { KarmaSlideHeader } from "../../components/widgets/HtmlWidgets";
import type { FrameFC } from "./types";

const QUADRANT_CENTERS: Record<number, [number, number]> = {
  1: [0.75, 0.25], 2: [0.25, 0.25], 3: [0.25, 0.75], 4: [0.75, 0.75],
};

export const Quadrant: FrameFC = ({ spec, slots, render }) => {
  const points = slots.points ?? [];
  const xLabel = spec?.data?.xLabel ?? "→";
  const yLabel = spec?.data?.yLabel ?? "↑";
  const seenInQuadrant: Record<number, number> = {};

  return (
    <div className="w-full h-full p-16 flex flex-col z-10 relative">
      <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
      <div className="flex-grow w-full max-w-[1100px] mx-auto flex items-center justify-center min-h-0">
        <div className="relative w-full aspect-square max-h-full" style={{ border: "1px solid var(--scene-border)" }}>
          <div className="absolute left-1/2 top-0 bottom-0 w-px" style={{ background: "var(--scene-border)" }} />
          <div className="absolute top-1/2 left-0 right-0 h-px" style={{ background: "var(--scene-border)" }} />
          <span className="absolute bottom-1 right-2 text-[10px]" style={{ color: "var(--scene-muted)" }}>{xLabel}</span>
          <span className="absolute top-1 left-2 text-[10px]" style={{ color: "var(--scene-muted)" }}>{yLabel}</span>

          {points.map((c, i) => {
            let x: number, y: number;
            if (typeof c.data?.x === "number" && typeof c.data?.y === "number") {
              x = c.data.x; y = c.data.y;
            } else {
              const q = c.data?.quadrant ?? 1;
              const [cx, cy] = QUADRANT_CENTERS[q] ?? QUADRANT_CENTERS[1];
              const n = (seenInQuadrant[q] = (seenInQuadrant[q] ?? 0) + 1);
              const jitter = ((n - 1) % 3) * 0.08 - 0.08;
              x = cx + jitter; y = cy + jitter;
            }
            return (
              <div
                key={c.id ?? i}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${x * 100}%`, top: `${(1 - y) * 100}%` }}
              >
                {render(c, i)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
