/**
 * terminal-walkthrough — a CLI session, commands revealed in order.
 *
 * Unlike most frames, this one doesn't call render() per component — it extracts raw
 * text/type from each slotted component and feeds them into a single
 * KarmaTerminalWindow, matching the legacy behaviour exactly. No recorded defect;
 * parity migration.
 */
import React from "react";
import { KarmaSlideHeader, KarmaTerminalWindow } from "../../components/widgets/HtmlWidgets";
import type { FrameFC } from "./types";

export const TerminalWalkthrough: FrameFC = ({ spec, slots }) => {
  const lines = slots.lines ?? [];
  const commands = lines.map((c) => ({
    text: c.data?.body || c.data?.text || c.label || "",
    type: (c.type === "code" || c.type === "command" ? "command" : "output") as any,
  }));
  // Header pinned at the top; the terminal takes the remaining height. With justify-center a
  // tall terminal pushed the header above the frame edge.
  return (
    <div className="w-full h-full px-24 pt-16 pb-12 flex flex-col items-center z-10 relative">
      <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} className="w-full max-w-[1600px]" />
      <div className="w-full max-w-[1600px] flex-grow min-h-0 pb-12">
        <KarmaTerminalWindow commands={commands} />
      </div>
    </div>
  );
};
