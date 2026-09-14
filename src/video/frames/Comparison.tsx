/**
 * comparison — two alternatives weighed against each other.
 *
 * Fixes the recorded defect: this layout was sharing two-column's blind type split
 * (text vs everything else), which is semantically wrong for a comparison — A and B
 * are split by WHICH OPTION they describe, never by component type. A scene with two
 * code blocks (comparing two implementations) needs one block on each side, not both
 * crammed into whichever slot happened to catch "media" first.
 *
 * assignSlots already balances evenly-eligible items across sibling slots (the fix
 * that made a real 4-component comparison scene split 2/2 instead of 4/0 — see
 * catalogue/assign.ts), so this component only needs to render what it's given.
 */
import React from "react";
import { KarmaSlideHeader } from "../../components/widgets/HtmlWidgets";
import type { FrameFC } from "./types";

export const Comparison: FrameFC = ({ spec, slots, render }) => {
  const a = slots.a ?? [];
  const b = slots.b ?? [];
  return (
    <div className="w-full h-full p-16 flex flex-col z-10 relative">
      <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
      <div className="flex-grow w-full flex items-center min-h-0 relative">
        <div className="flex-1 min-w-0 flex flex-col gap-6 justify-center items-center px-8">
          {a.map((c, i) => render(c, i))}
        </div>

        {/* A quiet divider, not a heavy VS badge — the content itself should carry
            the contrast; this just marks where one option ends and the other begins. */}
        <div
          className="w-px self-stretch mx-2 shrink-0"
          style={{ background: "var(--scene-border)" }}
        />

        <div className="flex-1 min-w-0 flex flex-col gap-6 justify-center items-center px-8">
          {b.map((c, i) => render(c, a.length + i))}
        </div>
      </div>
    </div>
  );
};
