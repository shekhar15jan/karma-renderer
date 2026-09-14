/**
 * Technology marks — real brand logos resolved from assets/icon-reference.
 *
 * Design rules these enforce, which the older bespoke tech nodes broke:
 *  - Surfaces come from theme tokens, never hardcoded slate. The brand colour is
 *    an accent only (mark, hairline, tint), so a node reads correctly on the
 *    light whiteboard theme as well as on dark.
 *  - One tile size and one radius across every technology, so a row of mixed
 *    vendors keeps an even rhythm instead of each logo setting its own scale.
 *  - An unknown technology degrades to a brand-coloured monogram rather than
 *    vanishing or printing a raw slug.
 */
import React from "react";
import { lookupTechIcon, type TechIconDef } from "../../icons/techIcons.generated";
import { useEntranceAnimation } from "./HtmlWidgets";

export type TechIconSize = "sm" | "md" | "lg" | "xl";

const TILE_PX: Record<TechIconSize, number> = { sm: 32, md: 44, lg: 64, xl: 96 };
const MARK_RATIO = 0.58;

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace(/^#/, "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

function monogram(name: string): string {
  const words = name.replace(/[-_.]+/g, " ").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/** The bare mark, no tile. Use inside diagram nodes that supply their own frame. */
export const TechMark: React.FC<{ tech: string; size?: number; tint?: string }> = ({ tech, size = 24, tint }) => {
  const def = lookupTechIcon(tech);
  if (!def) {
    return (
      <span
        style={{ fontSize: size * 0.5, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1, color: tint ?? "currentColor" }}
      >
        {monogram(tech)}
      </span>
    );
  }
  // A monochrome silhouette is tinted; an override SVG keeps its own colours.
  const fill = def.monochrome ? (tint ?? `#${def.hex}`) : undefined;
  return (
    <svg
      viewBox={def.viewBox}
      width={size}
      height={size}
      role="img"
      aria-label={def.title}
      fill={fill}
      style={{ display: "block", flexShrink: 0 }}
      dangerouslySetInnerHTML={{ __html: def.body }}
    />
  );
};

/** Mark inside a neutral tile with a brand-tinted wash — the standard treatment. */
export const TechTile: React.FC<{
  tech: string;
  size?: TechIconSize;
  animationDelay?: number;
  className?: string;
}> = ({ tech, size = "md", animationDelay = 0, className = "" }) => {
  const def = lookupTechIcon(tech);
  const px = TILE_PX[size];
  const hex = def ? `#${def.hex}` : "#6B7280";
  const { opacity, scale } = useEntranceAnimation(animationDelay);
  return (
    <div
      className={`flex items-center justify-center shrink-0 ${className}`}
      style={{
        width: px,
        height: px,
        borderRadius: Math.round(px * 0.26),
        background: hexToRgba(def?.hex ?? "6B7280", 0.12),
        border: `1px solid ${hexToRgba(def?.hex ?? "6B7280", 0.38)}`,
        opacity,
        transform: `scale(${scale})`,
      }}
      title={def?.title ?? tech}
    >
      <TechMark tech={tech} size={Math.round(px * MARK_RATIO)} tint={hex} />
    </div>
  );
};

/**
 * A diagram node carrying a real technology mark. Replaces the per-vendor nodes
 * (aws/docker/kubernetes/gcp/azure/language), which each hardcoded their own
 * dark surface and drew an approximation of the logo instead of the logo.
 */
export const KarmaTechNode: React.FC<{
  tech: string;
  label?: string;
  sublabel?: string;
  size?: TechIconSize;
  animationDelay?: number;
  className?: string;
}> = ({ tech, label, sublabel, size = "md", animationDelay = 10, className = "" }) => {
  const def = lookupTechIcon(tech);
  const hex = def?.hex ?? "6B7280";
  const { opacity, scale } = useEntranceAnimation(animationDelay);
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 ${className}`}
      style={{
        background: "var(--scene-surface)",
        border: `1px solid ${hexToRgba(hex, 0.45)}`,
        borderLeft: `3px solid #${hex}`,
        borderRadius: "var(--scene-radius, 12px)",
        boxShadow: "var(--scene-shadow, 0 2px 10px rgba(0,0,0,0.06))",
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <TechTile tech={tech} size={size} animationDelay={animationDelay} />
      <div className="flex flex-col min-w-0">
        <span
          className="font-semibold truncate"
          style={{ color: "var(--scene-text)", fontSize: size === "sm" ? 14 : 18, fontFamily: "var(--scene-font)" }}
        >
          {label ?? def?.title ?? tech}
        </span>
        {sublabel && (
          <span
            className="truncate"
            style={{ color: "var(--scene-muted)", fontSize: size === "sm" ? 11 : 13, fontFamily: "var(--scene-code, var(--scene-font))" }}
          >
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};

/** Horizontal row of marks — "here is the stack" in one line. */
export const KarmaTechStack: React.FC<{
  items: Array<string | { tech: string; label?: string }>;
  size?: TechIconSize;
  showLabels?: boolean;
  animationDelay?: number;
  className?: string;
}> = ({ items, size = "lg", showLabels = true, animationDelay = 10, className = "" }) => (
  <div className={`flex flex-wrap items-start justify-center gap-8 ${className}`}>
    {items.map((raw, i) => {
      const tech = typeof raw === "string" ? raw : raw.tech;
      const def = lookupTechIcon(tech);
      const label = typeof raw === "string" ? def?.title ?? tech : raw.label ?? def?.title ?? tech;
      return (
        <div key={`${tech}-${i}`} className="flex flex-col items-center gap-2" style={{ maxWidth: 120 }}>
          <TechTile tech={tech} size={size} animationDelay={animationDelay + i * 3} />
          {showLabels && (
            <span
              className="text-center leading-tight"
              style={{ color: "var(--scene-muted)", fontSize: 13, fontFamily: "var(--scene-font)" }}
            >
              {label}
            </span>
          )}
        </div>
      );
    })}
  </div>
);

export { lookupTechIcon };
export type { TechIconDef };
