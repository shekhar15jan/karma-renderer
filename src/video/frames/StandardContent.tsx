/**
 * standard-content — the universal fallback frame.
 *
 * Fixes the recorded defect: the legacy branch was an unbounded single-column
 * stack, so a scene with many body items just ran past the bottom of the frame —
 * nothing capped it, and nothing reflowed it. The catalogue's rule is explicit:
 * past 6 items, break into two balanced columns instead of one tall one.
 */
import React from "react";
import { KarmaSlideHeader } from "../../components/widgets/HtmlWidgets";
import type { FrameFC } from "./types";

const TWO_COLUMN_THRESHOLD = 6;

export const StandardContent: FrameFC = ({ spec, slots, render }) => {
  const body = slots.body ?? [];
  const useTwoColumns = body.length > TWO_COLUMN_THRESHOLD;

  if (!useTwoColumns) {
    return (
      <div className="w-full h-full p-16 flex flex-col z-10 relative">
        <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
        <div className="flex-grow w-full max-w-5xl flex flex-col gap-6 min-h-0">
          {body.map((c, i) => render(c, i))}
        </div>
      </div>
    );
  }

  const mid = Math.ceil(body.length / 2);
  const left = body.slice(0, mid);
  const right = body.slice(mid);
  return (
    <div className="w-full h-full p-16 flex flex-col z-10 relative">
      <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
      <div className="flex-grow w-full max-w-6xl mx-auto flex gap-12 min-h-0">
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          {left.map((c, i) => render(c, i))}
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          {right.map((c, i) => render(c, mid + i))}
        </div>
      </div>
    </div>
  );
};
