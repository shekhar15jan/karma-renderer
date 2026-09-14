/** api-exchange — a paired request and response, not a diff, not console output. */
import React from "react";
import { KarmaSlideHeader } from "../../components/widgets/HtmlWidgets";
import type { FrameFC } from "./types";

export const ApiExchange: FrameFC = ({ spec, slots, render }) => {
  const request = slots.request?.[0];
  const response = slots.response?.[0];
  const status = spec?.data?.status;
  return (
    <div className="w-full h-full p-16 flex flex-col z-10 relative">
      <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
      <div className="flex-grow w-full flex items-center gap-6 min-h-0">
        <div className="flex-1 min-w-0 flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--scene-primary)" }}>Request</span>
          <div className="flex-1 min-h-0">{request && render(request, 0)}</div>
        </div>
        <span className="material-symbols-outlined text-2xl shrink-0" style={{ color: "var(--scene-muted)" }}>sync_alt</span>
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--scene-primary)" }}>Response</span>
            {status && (
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                    style={{ background: "#0f8a5f22", color: "#0f8a5f" }}>{status}</span>
            )}
          </div>
          <div className="flex-1 min-h-0">{response && render(response, 1)}</div>
        </div>
      </div>
    </div>
  );
};
