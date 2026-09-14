/**
 * code-diff — the fix reveal, removed code left, added code right.
 * The `code` widget itself doesn't know about diff line-marking (that's a proposed
 * "diff-block" widget, not yet built) — this frame provides the removed/added FRAME
 * around two plain code blocks so the contrast reads even without per-line marks.
 */
import React from "react";
import { KarmaSlideHeader } from "../../components/widgets/HtmlWidgets";
import type { FrameFC } from "./types";

export const CodeDiff: FrameFC = ({ spec, slots, render }) => {
  const before = slots.before?.[0];
  const after = slots.after?.[0];
  return (
    <div className="w-full h-full p-16 flex flex-col z-10 relative">
      <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
      <div className="flex-grow w-full flex gap-6 min-h-0">
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: "#dc2626" }}>
            <span className="material-symbols-outlined text-[14px]">remove</span> Removed
          </div>
          <div className="flex-1 min-h-0" style={{ filter: "saturate(0.7)" }}>{before && render(before, 0)}</div>
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: "#0f8a5f" }}>
            <span className="material-symbols-outlined text-[14px]">add</span> Added
          </div>
          <div className="flex-1 min-h-0">{after && render(after, 1)}</div>
        </div>
      </div>
    </div>
  );
};
