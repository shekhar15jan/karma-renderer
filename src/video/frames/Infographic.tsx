/** infographic — numbered flow: vertical for 1-2 steps, horizontal for 3+ (fits 16:9). */
import React from "react";
import { KarmaSlideHeader } from "../../components/widgets/HtmlWidgets";
import type { FrameFC } from "./types";

export const Infographic: FrameFC = ({ spec, slots, render }) => {
  const steps = slots.steps ?? [];
  // Three or more steps stacked vertically overflowed a 16:9 frame and were clipped at the
  // bottom; lay them out left-to-right instead, which also suits the widescreen format.
  const horizontal = steps.length >= 3;
  return (
    <div className="w-full h-full px-24 pt-16 pb-12 flex flex-col z-10 relative">
      <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
      <div
        className={horizontal
          ? "flex-grow min-h-0 w-full flex flex-row items-center justify-center"
          : "flex-grow min-h-0 w-full max-w-4xl mx-auto flex flex-col items-center justify-center"}
      >
        {steps.map((c, i) => (
          <div key={c.id ?? i} className={horizontal ? "flex flex-row items-center flex-1 min-w-0" : "flex flex-col items-center w-full"}>
            {i > 0 && (
              <div
                className={horizontal
                  ? "h-1 w-10 shrink-0 bg-gradient-to-r from-[var(--scene-primary)] to-[var(--scene-accent)] mx-3 opacity-60"
                  : "w-1 h-8 bg-gradient-to-b from-[var(--scene-primary)] to-[var(--scene-accent)] my-2 opacity-60"}
              />
            )}
            <div className="w-full min-w-0 relative pl-4">
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[var(--scene-primary)] text-white flex items-center justify-center font-bold text-xl shadow-lg border-4 border-[var(--scene-bg)] z-10">
                {i + 1}
              </div>
              {render(c, i)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
