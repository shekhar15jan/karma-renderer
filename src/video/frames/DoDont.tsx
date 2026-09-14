/** do-dont — prescriptive right vs wrong, tick and cross. Distinct from before-after: not temporal. */
import React from "react";
import { KarmaSlideHeader } from "../../components/widgets/HtmlWidgets";
import type { FrameFC } from "./types";

export const DoDont: FrameFC = ({ spec, slots, render }) => {
  const dont = slots.dont ?? [];
  const doo = slots.do ?? [];
  return (
    <div className="w-full h-full p-16 flex flex-col z-10 relative">
      <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
      <div className="flex-grow w-full flex gap-6 min-h-0">
        <div className="flex-1 min-w-0 rounded-xl p-6 flex flex-col gap-4"
             style={{ background: "color-mix(in srgb, #dc2626 8%, var(--scene-surface))", border: "1px solid #dc262640" }}>
          <span className="material-symbols-outlined text-2xl" style={{ color: "#dc2626" }}>close</span>
          {dont.map((c, i) => render(c, i))}
        </div>
        <div className="flex-1 min-w-0 rounded-xl p-6 flex flex-col gap-4"
             style={{ background: "color-mix(in srgb, #0f8a5f 8%, var(--scene-surface))", border: "1px solid #0f8a5f40" }}>
          <span className="material-symbols-outlined text-2xl" style={{ color: "#0f8a5f" }}>check</span>
          {doo.map((c, i) => render(c, dont.length + i))}
        </div>
      </div>
    </div>
  );
};
