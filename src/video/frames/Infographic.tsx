/** infographic — vertical numbered flow. No recorded defect; parity migration. */
import React from "react";
import { KarmaSlideHeader } from "../../components/widgets/HtmlWidgets";
import type { FrameFC } from "./types";

export const Infographic: FrameFC = ({ spec, slots, render }) => {
  const steps = slots.steps ?? [];
  return (
    <div className="w-full h-full p-16 flex flex-col z-10 relative">
      <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
      <div className="flex-grow w-full max-w-4xl mx-auto flex flex-col items-center pb-16 overflow-y-auto">
        {steps.map((c, i) => (
          <div key={c.id ?? i} className="flex flex-col items-center w-full">
            {i > 0 && (
              <div className="w-1 h-12 bg-gradient-to-b from-[var(--scene-primary)] to-[var(--scene-accent)] my-4 opacity-50" />
            )}
            <div className="w-full bg-[var(--scene-surface)]/80 p-8 rounded-2xl border border-[var(--scene-border)] shadow-xl relative">
              <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[var(--scene-primary)] text-white flex items-center justify-center font-bold text-xl shadow-lg border-4 border-[var(--scene-bg)]">
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
