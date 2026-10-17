/**
 * bento — asymmetric grid where tile size reflects importance.
 *
 * Fixes the recorded defect: the legacy branch assigned tile spans by array index —
 * components[0] always got the 2x2 hero tile, whatever it happened to be. The
 * catalogue's hero/wide/tall/small slots are typed by atom (metric/media for hero,
 * prose/list for wide, etc.), so the biggest tile now goes to whatever actually
 * IS a metric or chart, not whatever the script listed first.
 */
import React from "react";
import { KarmaSlideHeader } from "../../components/widgets/HtmlWidgets";
import type { FrameFC } from "./types";

export const Bento: FrameFC = ({ spec, slots, render }) => {
  const hero = slots.hero ?? [];
  const wide = slots.wide ?? [];
  // A tall card that forces a mostly empty third row (hero + wide + tall + small) packs
  // better as a normal cell, leaving a full two-row grid with room for larger text.
  const cellsWithTallSpan = (span: number) =>
    hero.length * 4 + wide.length * 2 + (slots.tall ?? []).length * span + (slots.small ?? []).length;
  const demoteTall = (slots.tall ?? []).length > 0 && cellsWithTallSpan(2) > 8 && cellsWithTallSpan(1) <= 8;
  const tall = demoteTall ? [] : slots.tall ?? [];
  const small = demoteTall ? [...(slots.tall ?? []), ...(slots.small ?? [])] : slots.small ?? [];
  let cursor = 0;
  // Rows follow the content (4 columns; hero is 2x2, wide 2x1, tall 1x2): a fixed three
  // rows left an empty row on a two-row bento and squeezed every card into a third.
  const cells = hero.length * 4 + wide.length * 2 + tall.length * 2 + small.length;
  const rows = Math.min(3, Math.max(hero.length > 0 || tall.length > 0 ? 2 : 1, Math.ceil(cells / 4)));

  return (
    <div className="w-full h-full p-16 flex flex-col z-10 relative">
      <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
      <div className="flex-grow grid grid-cols-4 gap-6 w-full max-w-[1600px] mx-auto"
        style={{ gridTemplateRows: `repeat(${rows}, minmax(auto, 1fr))` }}>
        {hero.map((c) => (
          <div key={c.id ?? cursor} className="col-span-2 row-span-2 flex">
            {render(c, cursor++)}
          </div>
        ))}
        {wide.map((c) => (
          <div key={c.id ?? cursor} className="col-span-2 row-span-1 flex">
            {render(c, cursor++)}
          </div>
        ))}
        {tall.map((c) => (
          <div key={c.id ?? cursor} className="col-span-1 row-span-2 flex">
            {render(c, cursor++)}
          </div>
        ))}
        {small.map((c) => (
          <div key={c.id ?? cursor} className="col-span-1 row-span-1 flex">
            {render(c, cursor++)}
          </div>
        ))}
      </div>
    </div>
  );
};
