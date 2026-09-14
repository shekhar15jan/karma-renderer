/**
 * title-slide — the opening hero frame. spec.title/spec.subtitle ARE the heading;
 * any heading/title-type component is filtered out here (not just exact
 * duplicates — isTitleOrSubtitleDuplicate upstream only catches EXACT text matches,
 * this additionally prevents a second, different heading from appearing on a slide
 * that's supposed to have exactly one hero title). No recorded defect — this is a
 * parity migration, not a fix.
 */
import React from "react";
import { KarmaHeading, KarmaParagraph } from "../../components/widgets/HtmlWidgets";
import type { FrameFC } from "./types";

export const TitleSlide: FrameFC = ({ spec, slots, render }) => {
  const support = (slots.support ?? []).filter((c) => c.type !== "heading" && c.type !== "title");
  return (
    <div className="w-full h-full p-20 flex flex-col justify-center items-center text-center z-10 relative">
      <div className="max-w-5xl space-y-8 flex flex-col items-center">
        {spec.title && <KarmaHeading text={spec.title} level={1} animationDelay={0} />}
        {spec.subtitle && <KarmaParagraph text={spec.subtitle} animationDelay={2} className="mt-4" />}
        {support.map((c, i) => render(c, i))}
      </div>
    </div>
  );
};
