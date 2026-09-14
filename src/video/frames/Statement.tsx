/** statement — a full-bleed punchline, twelve words or fewer. Lands a hook; title-slide can't. */
import React from "react";
import { KarmaParagraph } from "../../components/widgets/HtmlWidgets";
import type { FrameFC } from "./types";

export const Statement: FrameFC = ({ slots }) => {
  const statement = slots.statement?.[0];
  const sub = slots.sub?.[0];
  const statementText = statement?.label ?? statement?.data?.body ?? "";
  const subText = sub?.label ?? sub?.data?.body ?? "";
  return (
    <div className="w-full h-full p-24 flex flex-col items-center justify-center text-center z-10 relative">
      <div className="max-w-6xl flex flex-col items-center gap-6">
        {statementText && (
          <div className="text-[clamp(36px,6vw,72px)] font-black leading-[1.1]" style={{ fontFamily: "var(--scene-heading)", color: "var(--scene-heading-color)" }}>
            {statementText}
          </div>
        )}
        {subText && <KarmaParagraph text={subText} animationDelay={6} className="text-xl" />}
      </div>
    </div>
  );
};
