/** checklist-recap — end-of-section recap, items with checkmarks, optional CTA line. */
import React from "react";
import { KarmaSlideHeader } from "../../components/widgets/HtmlWidgets";
import type { FrameFC } from "./types";

export const ChecklistRecap: FrameFC = ({ spec, slots, render }) => {
  const items = slots.items ?? [];
  const cta = slots.cta?.[0];
  return (
    <div className="w-full h-full p-16 flex flex-col z-10 relative">
      <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
      <div className="flex-grow w-full max-w-2xl mx-auto flex flex-col gap-6 justify-center min-h-0">
        <div className="flex flex-col gap-3">
          {items.map((c, i) => (
            <div key={c.id ?? i} className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-white"
                    style={{ background: "var(--scene-success, #22c55e)" }}>
                <span className="material-symbols-outlined text-[16px]">check</span>
              </span>
              <div className="text-base">{render(c, i)}</div>
            </div>
          ))}
        </div>
        {cta && (
          <div className="text-center pt-4 mt-2 text-lg font-semibold" style={{ borderTop: "1px solid var(--scene-border)", color: "var(--scene-primary)" }}>
            {render(cta, items.length)}
          </div>
        )}
      </div>
    </div>
  );
};
