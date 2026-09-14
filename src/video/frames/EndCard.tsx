/** end-card — closing CTA slide, optional next-up hints. */
import React from "react";
import { KarmaSlideHeader } from "../../components/widgets/HtmlWidgets";
import type { FrameFC } from "./types";

export const EndCard: FrameFC = ({ spec, slots, render }) => {
  const cta = slots.cta?.[0];
  const next = slots.next ?? [];
  return (
    <div className="w-full h-full p-16 flex flex-col items-center justify-center z-10 relative">
      <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
      <div className="flex-grow w-full max-w-3xl flex flex-col items-center justify-center gap-8 text-center min-h-0">
        {cta && <div className="text-3xl font-bold">{render(cta, 0)}</div>}
        {next.length > 0 && (
          <div className="flex flex-wrap gap-4 justify-center">
            {next.map((c, i) => (
              <div key={c.id ?? i} className="rounded-lg px-5 py-3" style={{ background: "var(--scene-surface)", border: "1px solid var(--scene-border)" }}>
                {render(c, 1 + i)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
