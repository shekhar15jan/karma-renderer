/**
 * split-image — narrative beside exactly one dominant visual.
 *
 * Fixes the recorded defect: shared two-column's blind text/media split, so extra
 * visual components stacked into the right pane instead of there ever being exactly
 * one. The catalogue's "visual" slot has max: 1 — assignSlots enforces that at
 * placement time, shedding any additional visual components as dropped rather than
 * stacking them, so this component can render its single visual without checking.
 */
import React from "react";
import { KarmaSlideHeader } from "../../components/widgets/HtmlWidgets";
import type { FrameFC } from "./types";

export const SplitImage: FrameFC = ({ spec, slots, render }) => {
  const text = slots.text ?? [];
  const visual = slots.visual ?? [];
  return (
    <div className="w-full h-full p-16 flex flex-col z-10 relative">
      <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
      <div className="flex-grow w-full flex gap-12 items-center min-h-0">
        <div className="flex-[2] min-w-0 flex flex-col gap-6 justify-center">
          {text.map((c, i) => render(c, i))}
        </div>
        <div className="flex-[3] min-w-0 h-full flex items-center justify-center">
          {visual.map((c, i) => render(c, text.length + i))}
        </div>
      </div>
    </div>
  );
};
