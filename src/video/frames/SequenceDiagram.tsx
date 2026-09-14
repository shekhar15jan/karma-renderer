/**
 * sequence-diagram — lifelines across the top, messages as horizontal arrows
 * stepping down between them. Lifeline x-position is computed from even spacing
 * (not a real UML layout engine), but message routing between the correct two
 * lifelines, with direction and label, is accurate — this is the part that carries
 * the information.
 */
import React from "react";
import { KarmaSlideHeader } from "../../components/widgets/HtmlWidgets";
import type { FrameFC } from "./types";

export const SequenceDiagram: FrameFC = ({ spec, slots, render }) => {
  const lifelines = slots.lifelines ?? [];
  const messages = slots.messages ?? [];
  const n = Math.max(lifelines.length, 1);
  const xOf = (idx: number) => (n === 1 ? 50 : (idx / (n - 1)) * 100);

  const indexOf = (ref: unknown, fallback: number) => {
    if (typeof ref === "number") return Math.min(Math.max(ref, 0), n - 1);
    if (typeof ref === "string") {
      const byId = lifelines.findIndex((l) => l.id === ref);
      if (byId >= 0) return byId;
      const byLabel = lifelines.findIndex((l) => l.label === ref);
      if (byLabel >= 0) return byLabel;
    }
    return fallback;
  };

  return (
    <div className="w-full h-full p-16 flex flex-col z-10 relative">
      <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
      <div className="flex-grow w-full max-w-[1400px] mx-auto flex flex-col min-h-0">
        <div className="relative flex shrink-0" style={{ height: 56 }}>
          {lifelines.map((c, i) => (
            <div key={c.id ?? i} className="absolute -translate-x-1/2 text-center" style={{ left: `${xOf(i)}%` }}>
              {render(c, i)}
            </div>
          ))}
        </div>
        <div className="relative flex-grow min-h-0">
          {lifelines.map((c, i) => (
            <div key={c.id ?? i} className="absolute top-0 bottom-0 w-px -translate-x-1/2"
                 style={{ left: `${xOf(i)}%`, background: "var(--scene-border)", opacity: 0.5 }} />
          ))}
          {messages.map((c, i) => {
            const from = indexOf(c.data?.from, i % n);
            const to = indexOf(c.data?.to, (i + 1) % n);
            const left = Math.min(xOf(from), xOf(to));
            const width = Math.abs(xOf(to) - xOf(from));
            const rowTop = messages.length === 1 ? 50 : (i / Math.max(messages.length - 1, 1)) * 84 + 6;
            const pointsRight = to > from;
            return (
              <div key={c.id ?? i} className="absolute" style={{ left: `${left}%`, width: `${width}%`, top: `${rowTop}%` }}>
                <div className="relative">
                  <div className="text-[10px] font-mono text-center mb-1" style={{ color: "var(--scene-muted)" }}>
                    {render(c, i)}
                  </div>
                  <div className="h-px w-full" style={{ background: "var(--scene-primary)" }} />
                  <div className="absolute -top-[3px]" style={pointsRight ? { right: -1 } : { left: -1 }}>
                    <div style={{
                      width: 0, height: 0, borderTop: "4px solid transparent", borderBottom: "4px solid transparent",
                      ...(pointsRight
                        ? { borderLeft: "6px solid var(--scene-primary)" }
                        : { borderRight: "6px solid var(--scene-primary)" }),
                    }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
