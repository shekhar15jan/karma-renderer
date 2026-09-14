/** section-header — divider between acts. No recorded defect; parity migration. */
import React from "react";
import { KarmaSlideHeader } from "../../components/widgets/HtmlWidgets";
import type { FrameFC } from "./types";

export const SectionHeader: FrameFC = ({ spec, slots, render }) => (
  <div className="w-full h-full bg-[var(--scene-surface)]/50 p-20 flex flex-col justify-center items-start border-l-8 border-[var(--scene-primary)] z-10 relative pl-32">
    <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} className="!border-b-0 mb-4" />
    <div className="max-w-4xl space-y-6">
      {(slots.support ?? []).map((c, i) => render(c, i))}
    </div>
  </div>
);
