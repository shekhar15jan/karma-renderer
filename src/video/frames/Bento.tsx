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
  const tall = slots.tall ?? [];
  const small = slots.small ?? [];
  let cursor = 0;

  return (
    <div className="w-full h-full p-16 flex flex-col z-10 relative">
      <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
      <div className="flex-grow grid grid-cols-4 grid-rows-3 gap-6 w-full max-w-[1600px] mx-auto">
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
