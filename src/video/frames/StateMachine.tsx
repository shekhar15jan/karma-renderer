/**
 * state-machine — states with labelled transitions.
 *
 * PRAGMATIC FIRST PASS: states wrap in a flex row rather than a true ring layout with
 * routed edges (that needs a real graph-layout pass, like architecture-diagram's ELK
 * integration — out of scope for this pass). Transitions list underneath as labelled
 * from→to pairs instead of drawn curves. This is honest about what it is: correct
 * information, simplified presentation. Upgrade path is wiring this frame through
 * the same ELK engine architecture-diagram already uses.
 */
import React from "react";
import { KarmaSlideHeader } from "../../components/widgets/HtmlWidgets";
import type { FrameFC } from "./types";

export const StateMachine: FrameFC = ({ spec, slots, render }) => {
  const states = slots.states ?? [];
  const transitions = slots.transitions ?? [];
  return (
    <div className="w-full h-full p-16 flex flex-col z-10 relative">
      <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
      <div className="flex-grow w-full flex flex-col items-center justify-center gap-8 min-h-0">
        <div className="flex flex-wrap items-center justify-center gap-6">
          {states.map((c, i) => {
            const isActive = c.data?.status === "active";
            return (
              <div key={c.id ?? i} className="rounded-full px-5 py-3"
                   style={isActive ? { border: "2px solid var(--scene-primary)", boxShadow: "0 0 0 4px var(--scene-primary)22" } : { border: "1px solid var(--scene-border)" }}>
                {render(c, i)}
              </div>
            );
          })}
        </div>
        {transitions.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center max-w-3xl">
            {transitions.map((c, i) => {
              const from = c.data?.from ?? c.label?.split("→")[0]?.trim();
              const to = c.data?.to ?? c.label?.split("→")[1]?.trim();
              const trigger = c.data?.trigger ?? c.label;
              return (
                <span key={c.id ?? i} className="text-[10px] font-mono px-2 py-1 rounded" style={{ background: "var(--scene-surface2)", color: "var(--scene-muted)" }}>
                  {from && to ? `${from} → ${to}` : trigger}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
