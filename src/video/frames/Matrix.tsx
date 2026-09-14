/** matrix — three or more options scored across criteria. Backing widget: table (already live). */
import React from "react";
import { KarmaSlideHeader } from "../../components/widgets/HtmlWidgets";
import type { FrameFC } from "./types";

export const Matrix: FrameFC = ({ spec, slots, render }) => {
  const table = slots.table?.[0];
  return (
    <div className="w-full h-full p-16 flex flex-col z-10 relative">
      <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
      <div className="flex-grow w-full flex items-center justify-center min-h-0">
        {table && <div className="w-full max-w-[1600px]">{render(table, 0)}</div>}
      </div>
    </div>
  );
};
