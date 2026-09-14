/**
 * two-column — narrative beside the thing it refers to.
 *
 * Fixes the recorded defect: the legacy branch split components by type alone
 * (text vs everything else), which misfiled bullet-list as media and left a whole
 * column empty when only one component existed. Slots arrive pre-filled here, and
 * assignWithFallback has already routed single-sided scenes to standard-content,
 * so this component can assume both columns have content.
 */
import React from "react";
import { KarmaSlideHeader } from "../../components/widgets/HtmlWidgets";
import type { FrameFC } from "./types";

export const TwoColumn: FrameFC = ({ spec, slots, render }) => {
  const left = slots.left ?? [];
  const right = slots.right ?? [];
  return (
    <div className="w-full h-full p-16 flex flex-col z-10 relative">
      <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
      <div className="flex-grow w-full flex gap-12 items-center min-h-0">
        {/* min-w-0 on both tracks: without it a long code line or unbroken label
            refuses to shrink and pushes the sibling column off the frame. */}
        <div className="flex-1 min-w-0 flex flex-col gap-6 justify-center">
          {left.map((c, i) => render(c, i))}
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-6 items-center justify-center">
          {right.map((c, i) => render(c, left.length + i))}
        </div>
      </div>
    </div>
  );
};
