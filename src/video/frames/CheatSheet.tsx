/** cheat-sheet — dense reference grid built to be paused and screenshotted. No entrance stagger. */
import React from "react";
import { KarmaSlideHeader } from "../../components/widgets/HtmlWidgets";
import type { FrameFC } from "./types";

export const CheatSheet: FrameFC = ({ spec, slots, render }) => {
  const entries = slots.entries ?? [];
  return (
    <div className="w-full h-full p-16 flex flex-col z-10 relative">
      <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
      <div className="flex-grow w-full max-w-[1500px] mx-auto grid grid-cols-2 gap-3 content-center min-h-0 overflow-y-auto">
        {entries.map((c, i) => (
          <div key={c.id ?? i} className="rounded-lg px-4 py-3" style={{ background: "var(--scene-surface)", border: "1px solid var(--scene-border)" }}>
            {/* index 0 on every entry — deliberately no stagger, this frame is meant to
                read as fully-present-at-once, not revealed piece by piece. */}
            {render(c, 0)}
          </div>
        ))}
      </div>
    </div>
  );
};
