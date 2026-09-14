/** layered-stack — horizontal bands stacked top to bottom (OSI-model style). */
import React from "react";
import { KarmaSlideHeader } from "../../components/widgets/HtmlWidgets";
import type { FrameFC } from "./types";

export const LayeredStack: FrameFC = ({ spec, slots, render }) => {
  const bands = slots.bands ?? [];
  return (
    <div className="w-full h-full p-16 flex flex-col z-10 relative">
      <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
      <div className="flex-grow w-full max-w-3xl mx-auto flex flex-col gap-2 justify-center min-h-0">
        {bands.map((c, i) => (
          <div key={c.id ?? i} className="w-full rounded-lg px-6 py-4"
               style={{
                 background: "var(--scene-surface)",
                 border: "1px solid var(--scene-border)",
                 borderLeft: "4px solid var(--scene-primary)",
                 opacity: 1 - i * (0.5 / Math.max(bands.length - 1, 1)) * 0.4,
               }}>
            {render(c, i)}
          </div>
        ))}
      </div>
    </div>
  );
};
