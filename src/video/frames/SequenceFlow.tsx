/** sequence-flow — a payload travelling hop to hop, one hop per narration beat. */
import React from "react";
import { KarmaSlideHeader, KarmaConnector } from "../../components/widgets/HtmlWidgets";
import type { FrameFC } from "./types";

export const SequenceFlow: FrameFC = ({ spec, slots, render }) => {
  const hops = slots.hops ?? [];
  const payload = slots.payload?.[0];
  return (
    <div className="w-full h-full p-16 flex flex-col z-10 relative">
      <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
      <div className="flex-grow w-full flex flex-col items-center justify-center gap-6 min-h-0">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {hops.map((c, i) => (
            <React.Fragment key={c.id ?? i}>
              {render(c, i)}
              {i < hops.length - 1 && <KarmaConnector direction="horizontal" type="solid" arrows="end" length={48} animationDelay={i * 4 + 6} />}
            </React.Fragment>
          ))}
        </div>
        {payload && (
          <div className="mt-2 px-4 py-2 rounded-full text-[11px] font-mono" style={{ background: "var(--scene-primary)22", color: "var(--scene-primary)", border: "1px solid var(--scene-primary)40" }}>
            {render(payload, hops.length)}
          </div>
        )}
      </div>
    </div>
  );
};
