/** benchmark-bars — horizontal bars comparing options, winner accented, sorted by value. */
import React from "react";
import { KarmaSlideHeader } from "../../components/widgets/HtmlWidgets";
import type { FrameFC } from "./types";

function numericValue(c: any): number {
  const raw = c.data?.value ?? c.label ?? 0;
  const n = parseFloat(String(raw).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export const BenchmarkBars: FrameFC = ({ spec, slots, render }) => {
  const bars = [...(slots.bars ?? [])].sort((a, b) => numericValue(b) - numericValue(a));
  const max = Math.max(1, ...bars.map(numericValue));
  return (
    <div className="w-full h-full p-16 flex flex-col z-10 relative">
      <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
      <div className="flex-grow w-full max-w-4xl mx-auto flex flex-col justify-center gap-5 min-h-0">
        {bars.map((c, i) => {
          const v = numericValue(c);
          const pct = Math.max(4, (v / max) * 100);
          const isWinner = i === 0;
          return (
            <div key={c.id ?? i} className="flex items-center gap-4">
              <span className="w-32 shrink-0 text-right text-[12px]" style={{ color: "var(--scene-muted)" }}>
                {c.label ?? c.data?.label ?? ""}
              </span>
              <div className="flex-grow h-8 rounded relative overflow-hidden" style={{ background: "var(--scene-surface2)" }}>
                <div
                  className="h-full rounded flex items-center justify-end px-2 transition-all"
                  style={{
                    width: `${pct}%`,
                    background: isWinner ? "var(--scene-primary)" : "var(--scene-border)",
                  }}
                >
                  <span className="text-[11px] font-bold font-mono" style={{ color: isWinner ? "#fff" : "var(--scene-text)" }}>
                    {c.data?.value ?? v}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
