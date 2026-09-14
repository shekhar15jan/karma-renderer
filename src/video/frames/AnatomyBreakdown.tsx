/**
 * anatomy-breakdown — a code (or text) subject on one side, its parts explained
 * as a numbered list on the other. Pragmatic simplification: parts are not wired
 * to specific line numbers in the subject (that wants source-position metadata
 * the atom doesn't carry yet) — order in the list is the only correspondence.
 */
import React from "react";
import { KarmaSlideHeader } from "../../components/widgets/HtmlWidgets";
import type { FrameFC } from "./types";

export const AnatomyBreakdown: FrameFC = ({ spec, slots, render }) => {
  const subject = slots.subject?.[0];
  const parts = slots.parts ?? [];
  return (
    <div className="w-full h-full p-16 flex flex-col z-10 relative">
      <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
      <div className="flex-grow w-full flex gap-8 min-h-0">
        <div className="flex-[3] min-w-0 flex flex-col justify-center">
          {subject && render(subject, 0)}
        </div>
        <div className="flex-[2] min-w-0 flex flex-col justify-center gap-3 overflow-y-auto">
          {parts.map((c, i) => (
            <div key={c.id ?? i} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                    style={{ background: "var(--scene-primary)" }}>
                {i + 1}
              </span>
              <div className="text-sm min-w-0">{render(c, 1 + i)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
