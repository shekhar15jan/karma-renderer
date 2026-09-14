/** definition-card — term, meaning, optional code example. Dictionary-entry layout. */
import React from "react";
import { KarmaSlideHeader } from "../../components/widgets/HtmlWidgets";
import type { FrameFC } from "./types";

export const DefinitionCard: FrameFC = ({ spec, slots, render }) => {
  const term = slots.term?.[0];
  const meaning = slots.meaning?.[0];
  const example = slots.example?.[0];
  return (
    <div className="w-full h-full p-16 flex flex-col z-10 relative">
      <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
      <div className="flex-grow w-full max-w-3xl mx-auto flex flex-col gap-6 justify-center min-h-0">
        {term && (
          <div className="text-4xl font-black" style={{ color: "var(--scene-primary)" }}>
            {render(term, 0)}
          </div>
        )}
        {meaning && (
          <div className="text-xl pl-6" style={{ borderLeft: "3px solid var(--scene-border)" }}>
            {render(meaning, 1)}
          </div>
        )}
        {example && (
          <div className="mt-2">{render(example, 2)}</div>
        )}
      </div>
    </div>
  );
};
