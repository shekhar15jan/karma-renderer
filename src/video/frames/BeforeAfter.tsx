/** before-after — the same subject in two states, with the transform named on the arrow. */
import React from "react";
import { KarmaSlideHeader } from "../../components/widgets/HtmlWidgets";
import type { FrameFC } from "./types";

export const BeforeAfter: FrameFC = ({ spec, slots, render }) => {
  const before = slots.before ?? [];
  const after = slots.after ?? [];
  const transform = spec?.animation?.transform ?? spec?.data?.transform;
  return (
    <div className="w-full h-full p-16 flex flex-col z-10 relative">
      <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
      <div className="flex-grow w-full flex items-center gap-6 min-h-0 relative">
        <div className="flex-1 min-w-0 h-full rounded-xl p-6 flex flex-col gap-4 justify-center"
             style={{ background: "color-mix(in srgb, #dc2626 8%, var(--scene-surface))", border: "1px solid #dc262640" }}>
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#dc2626" }}>Before</span>
          {before.map((c, i) => render(c, i))}
        </div>
        <div className="flex flex-col items-center gap-1 shrink-0 px-2">
          <span className="material-symbols-outlined text-3xl" style={{ color: "var(--scene-primary)" }}>arrow_forward</span>
          {transform && <span className="text-[10px] font-mono text-center max-w-[90px]" style={{ color: "var(--scene-muted)" }}>{transform}</span>}
        </div>
        <div className="flex-1 min-w-0 h-full rounded-xl p-6 flex flex-col gap-4 justify-center"
             style={{ background: "color-mix(in srgb, #0f8a5f 8%, var(--scene-surface))", border: "1px solid #0f8a5f40" }}>
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#0f8a5f" }}>After</span>
          {after.map((c, i) => render(c, before.length + i))}
        </div>
      </div>
    </div>
  );
};
