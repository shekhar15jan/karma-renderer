/** myth-fact — strike through a misconception, then state the correction. */
import React from "react";
import { KarmaSlideHeader } from "../../components/widgets/HtmlWidgets";
import type { FrameFC } from "./types";

export const MythFact: FrameFC = ({ spec, slots, render }) => {
  const myth = slots.myth ?? [];
  const fact = slots.fact ?? [];
  return (
    <div className="w-full h-full p-16 flex flex-col z-10 relative">
      <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
      <div className="flex-grow w-full max-w-4xl mx-auto flex flex-col gap-6 justify-center min-h-0">
        <div className="rounded-xl p-6" style={{ background: "color-mix(in srgb, #dc2626 8%, var(--scene-surface))", border: "1px solid #dc262640", textDecoration: "line-through", opacity: 0.85 }}>
          <span className="text-[10px] font-bold uppercase tracking-widest block mb-2" style={{ color: "#dc2626", textDecoration: "none" }}>Myth</span>
          {myth.map((c, i) => render(c, i))}
        </div>
        <div className="rounded-xl p-6" style={{ background: "color-mix(in srgb, #0f8a5f 8%, var(--scene-surface))", border: "1px solid #0f8a5f40" }}>
          <span className="text-[10px] font-bold uppercase tracking-widest block mb-2" style={{ color: "#0f8a5f" }}>Fact</span>
          {fact.map((c, i) => render(c, myth.length + i))}
        </div>
      </div>
    </div>
  );
};
