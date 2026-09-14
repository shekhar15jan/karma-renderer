/**
 * code-explainer — explanation beside a code window.
 *
 * Defect fixed: the code slot's own container used to draw a SECOND macOS-chrome
 * title bar (dots + scene title) around the code widget — but the `code` atom's
 * widget (KarmaCodeBlock) is already a complete, self-styled window with its own
 * dots and language label. Nesting one inside the other produced two stacked
 * window headers plus doubled padding, pushing code text off the right edge.
 * The code slot now just sizes and positions the widget; the widget supplies
 * all of its own chrome.
 */
import React from "react";
import { KarmaSlideHeader } from "../../components/widgets/HtmlWidgets";
import type { FrameFC } from "./types";

export const CodeExplainer: FrameFC = ({ spec, slots, render }) => {
  const explanation = slots.explanation ?? [];
  const code = slots.code ?? [];
  return (
    <div className="w-full h-full p-16 flex items-center justify-center z-10 relative">
      <div className="w-full h-full max-w-[1600px] flex gap-12 items-center">
        <div className="flex-[2] min-w-0 pr-12 flex flex-col gap-6">
          <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
          {explanation.map((c, i) => render(c, i))}
        </div>
        <div className="flex-[3] min-w-0 h-full flex flex-col justify-center gap-4">
          {code.map((c, i) => render(c, explanation.length + i))}
        </div>
      </div>
    </div>
  );
};
