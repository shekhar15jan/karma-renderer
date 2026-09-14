/**
 * file-tree — directory structure as an indented path list. Straightforward:
 * this frame's real UX already is an indented tree, so no simplification note needed.
 */
import React from "react";
import { KarmaSlideHeader } from "../../components/widgets/HtmlWidgets";
import type { FrameFC } from "./types";

function depthOf(path: string): number {
  return path.replace(/\/+$/, "").split("/").filter(Boolean).length - 1;
}

function leafName(path: string): string {
  const parts = path.replace(/\/+$/, "").split("/").filter(Boolean);
  return parts[parts.length - 1] ?? path;
}

export const FileTree: FrameFC = ({ spec, slots, render }) => {
  const paths = slots.paths ?? [];
  return (
    <div className="w-full h-full p-16 flex flex-col z-10 relative">
      <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
      <div className="flex-grow w-full max-w-2xl mx-auto flex flex-col justify-center gap-1 min-h-0 overflow-y-auto font-mono text-sm">
        {paths.map((c, i) => {
          const raw = c.data?.body ?? c.label ?? "";
          const depth = raw.includes("/") ? depthOf(raw) : 0;
          const isDir = raw.endsWith("/");
          return (
            <div key={c.id ?? i} style={{ marginLeft: depth * 24 }} className="flex items-center gap-2">
              <span style={{ color: "var(--scene-border)" }}>{depth > 0 ? "├─" : ""}</span>
              <span style={{ color: isDir ? "var(--scene-primary)" : "var(--scene-fg)" }}>
                {render(c, i) ?? leafName(raw)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
