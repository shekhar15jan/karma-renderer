/** quote — one attributed quotation, centred. No recorded defect; parity migration. */
import React from "react";
import type { FrameFC } from "./types";

export const Quote: FrameFC = ({ slots, render }) => (
  <div className="w-full h-full p-24 flex flex-col justify-center items-center text-center z-10 relative">
    <div className="text-8xl text-[var(--scene-primary)] opacity-30 mb-4 font-serif">"</div>
    <div className="max-w-5xl">
      {(slots.quote ?? []).map((c, i) => render(c, i))}
    </div>
  </div>
);
