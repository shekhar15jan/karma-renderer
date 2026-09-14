/** acronym-breakdown — each letter of an acronym expanded, stacked vertically. */
import React from "react";
import { KarmaSlideHeader } from "../../components/widgets/HtmlWidgets";
import type { FrameFC } from "./types";

export const AcronymBreakdown: FrameFC = ({ spec, slots, render }) => {
  const letters = slots.letters ?? [];
  return (
    <div className="w-full h-full p-16 flex flex-col z-10 relative">
      <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
      <div className="flex-grow w-full max-w-3xl mx-auto flex flex-col gap-3 justify-center min-h-0">
        {letters.map((c, i) => {
          const letter = (c.data?.letter ?? c.label ?? "").toString().charAt(0).toUpperCase();
          return (
            <div key={c.id ?? i} className="flex items-center gap-5 rounded-lg px-5 py-3"
                 style={{ background: "var(--scene-surface)", border: "1px solid var(--scene-border)" }}>
              <span className="text-4xl font-black shrink-0" style={{ color: "var(--scene-primary)" }}>
                {letter}
              </span>
              <div className="min-w-0 flex-1">{render(c, i)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
