/**
 * title-slide — the opening hero frame. spec.title/spec.subtitle ARE the heading;
 * any heading/title-type component is filtered out here (not just exact
 * duplicates — isTitleOrSubtitleDuplicate upstream only catches EXACT text matches,
 * this additionally prevents a second, different heading from appearing on a slide
 * that's supposed to have exactly one hero title).
 *
 * Supporting text sits under the title; everything else (the problem card, an error
 * badge, the tool's logo, a metric) is laid out as one centred row beneath it, so an
 * opening shows its whole set-up and still reads as a hero frame.
 */
import React from "react";
import { KarmaHeading, KarmaParagraph } from "../../components/widgets/HtmlWidgets";
import type { FrameFC } from "./types";

const TEXT_TYPES = new Set(["paragraph", "text"]);

export const TitleSlide: FrameFC = ({ spec, slots, render }) => {
  const support = (slots.support ?? []).filter((c) => c.type !== "heading" && c.type !== "title");
  const text = support.filter((c) => TEXT_TYPES.has(String(c.type)));
  const visuals = support.filter((c) => !TEXT_TYPES.has(String(c.type)));
  return (
    <div className="w-full h-full p-16 flex flex-col justify-center items-center text-center z-10 relative">
      <div className="max-w-5xl space-y-6 flex flex-col items-center">
        {spec.title && <KarmaHeading text={spec.title} level={1} animationDelay={0} />}
        {spec.subtitle && <KarmaParagraph text={spec.subtitle} animationDelay={2} className="mt-2" />}
        {text.map((c) => render(c, support.indexOf(c)))}
      </div>
      {visuals.length > 0 && (
        <div className="mt-10 w-full flex flex-wrap justify-center items-stretch gap-6">
          {visuals.map((c) => (
            <div key={c.id ?? support.indexOf(c)} className="flex-1 min-w-[240px] max-w-[440px] flex justify-center text-left">
              {render(c, support.indexOf(c))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
