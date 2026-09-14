/**
 * annotated-diagram — a subject with numbered callouts. When a pin carries
 * data.x/data.y (0-1 normalized), its number is overlaid directly on the subject
 * at that point; every pin always gets a numbered legend entry below regardless,
 * so the frame degrades gracefully when no coordinates are supplied.
 */
import React from "react";
import { KarmaSlideHeader } from "../../components/widgets/HtmlWidgets";
import type { FrameFC } from "./types";

export const AnnotatedDiagram: FrameFC = ({ spec, slots, render }) => {
  const subject = slots.subject?.[0];
  const pins = slots.pins ?? [];
  return (
    <div className="w-full h-full p-16 flex flex-col z-10 relative">
      <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
      <div className="flex-grow w-full flex flex-col items-center justify-center gap-6 min-h-0">
        {subject && (
          <div className="relative w-full max-w-3xl shrink-0">
            {render(subject, 0)}
            {pins.map((c, i) => {
              const x = c.data?.x;
              const y = c.data?.y;
              if (typeof x !== "number" || typeof y !== "number") return null;
              return (
                <div
                  key={c.id ?? i}
                  className="absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg"
                  style={{ left: `${x * 100}%`, top: `${y * 100}%`, background: "var(--scene-primary)", border: "2px solid var(--scene-bg)" }}
                >
                  {i + 1}
                </div>
              );
            })}
          </div>
        )}
        <div className="flex flex-wrap gap-3 justify-center max-w-3xl shrink-0">
          {pins.map((c, i) => (
            <div key={c.id ?? i} className="flex items-start gap-2 rounded-lg px-3 py-2" style={{ background: "var(--scene-surface)", border: "1px solid var(--scene-border)" }}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: "var(--scene-primary)" }}>
                {i + 1}
              </span>
              <div className="text-sm">{render(c, 1 + i)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
