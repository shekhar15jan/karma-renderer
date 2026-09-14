/**
 * roadmap-timeline — ordered steps lighting up in turn.
 *
 * Extracts label/status from each slotted component into KarmaRoadmapTimeline's own
 * steps[] prop rather than calling render() per component, matching legacy. No
 * recorded defect; parity migration.
 */
import React from "react";
import { KarmaSlideHeader, KarmaRoadmapTimeline } from "../../components/widgets/HtmlWidgets";
import type { FrameFC } from "./types";

export const RoadmapTimeline: FrameFC = ({ spec, slots }) => {
  const steps = (slots.steps ?? []).map((c, index) => {
    const explicit = c.data?.status || (c as any).status;
    const status =
      explicit === "completed" || explicit === "active" || explicit === "pending"
        ? explicit
        : index === 0 ? "completed" : index === 1 ? "active" : "pending";
    return { label: c.label || c.data?.body || "Step", status: status as any };
  });
  return (
    <div className="w-full h-full p-16 flex flex-col z-10 relative">
      <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
      <div className="flex-grow w-full flex items-center justify-center">
        <KarmaRoadmapTimeline steps={steps} className="w-full max-w-[1400px]" />
      </div>
    </div>
  );
};
