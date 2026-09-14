/**
 * dashboard — metrics rail beside a KPI row and a main panel.
 *
 * Fixes the recorded defect: the legacy branch routed components to the sidebar
 * with `i % 3 === 0` — an arbitrary modulo with no relation to what a component
 * actually was. The catalogue's rail/kpi/main slots are typed by atom (metric/
 * callout for the rail, media/metric for the KPI row, everything else in main), so
 * assignSlots places components by what they ARE, not by their index mod 3.
 */
import React from "react";
import { KarmaSlideHeader } from "../../components/widgets/HtmlWidgets";
import type { FrameFC } from "./types";

export const Dashboard: FrameFC = ({ spec, slots, render }) => {
  const rail = slots.rail ?? [];
  const kpi = slots.kpi ?? [];
  const main = slots.main ?? [];
  let cursor = 0;

  return (
    <div className="w-full h-full p-16 flex flex-col z-10 relative">
      <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
      <div className="flex-grow flex gap-8 w-full max-w-[1600px] mx-auto min-h-0 pb-8">
        <div className="w-1/4 h-full bg-[var(--scene-surface)]/40 rounded-xl border border-[var(--scene-border)] p-6 flex flex-col gap-4 shadow-lg">
          {rail.map((c) => render(c, cursor++))}
        </div>
        <div className="w-3/4 flex flex-col gap-6 min-h-0">
          {kpi.length > 0 && (
            <div className="grid grid-cols-2 gap-6">
              {kpi.map((c) => render(c, cursor++))}
            </div>
          )}
          <div className="flex-1 bg-[var(--scene-surface)]/20 rounded-xl border border-[var(--scene-border)] p-8 min-h-0">
            {main.map((c) => render(c, cursor++))}
          </div>
        </div>
      </div>
    </div>
  );
};
