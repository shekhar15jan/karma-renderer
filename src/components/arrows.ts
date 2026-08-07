/** ArrowEngine - straight/curved/orthogonal/dashed connectors with UML markers. */

import type { ConnectorStyle, ArrowKind } from "../core/types";
import type { Theme } from "../theme/themes";

export interface ArrowPoint {
  x: number;
  y: number;
}

export interface ArrowRenderInput {
  points: ArrowPoint[];
  label?: string;
  style?: ConnectorStyle;
  kind?: ArrowKind;
  color?: string;
  width?: number;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function defaultHeadFor(kind?: ArrowKind): string {
  switch (kind) {
    case "dependency": return "open";
    case "association": return "open";
    case "aggregation": return "diamond-open";
    case "composition": return "diamond-filled";
    case "inheritance": return "triangle-open";
    case "implementation": return "triangle-open-dashed";
    default: return "filled";
  }
}

/** Emits marker definitions for a key (used by document.ts to dedupe markers). */
export function markerDefsFor(key: string, color: string, kind?: ArrowKind): string {
  const id = `arrow-${key}`;
  return `<defs>${markerDefs(id, color, kind)}</defs>`;
}

function markerDefs(id: string, color: string, kind?: ArrowKind): string {
  const size = 12;
  const hw = size / 2;
  const kindType = defaultHeadFor(kind);
  let body = "";
  switch (kindType) {
    case "open":
      body = `<path d="M0,0 L${size},${hw} L0,${size}" fill="none" stroke="${color}" stroke-width="2"/>`;
      break;
    case "diamond-open":
      body = `<polygon points="${size / 2},0 ${size},${size / 2} ${size / 2},${size} 0,${size / 2}" fill="#fff" stroke="${color}" stroke-width="2"/>`;
      break;
    case "diamond-filled":
      body = `<polygon points="${size / 2},0 ${size},${size / 2} ${size / 2},${size} 0,${size / 2}" fill="${color}" stroke="${color}" stroke-width="1"/>`;
      break;
    case "triangle-open":
      body = `<polygon points="0,0 ${size},${hw} 0,${size}" fill="#fff" stroke="${color}" stroke-width="2"/>`;
      break;
    case "triangle-open-dashed":
      body = `<polygon points="0,0 ${size},${hw} 0,${size}" fill="#fff" stroke="${color}" stroke-width="2" stroke-dasharray="3,2"/>`;
      break;
    default:
      body = `<polygon points="0,0 ${size},${hw} 0,${size}" fill="${color}" stroke="${color}" stroke-width="1"/>`;
  }
  return `<marker id="${id}" markerWidth="${size}" markerHeight="${size}" refX="${kindType === "filled" || kindType === "open" ? size - 1 : size / 2}" refY="${hw}" orient="auto" markerUnits="userSpaceOnUse"><g>${body}</g></marker>`;
}

function buildPath(points: ArrowPoint[], style: ConnectorStyle): string {
  if (points.length < 2) return "";
  if (style === "straight") {
    return `M${points[0].x},${points[0].y} L${points[points.length - 1].x},${points[points.length - 1].y}`;
  }
  if (style === "curved") {
    // cubic bezier through midpoints
    let d = `M${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const cur = points[i];
      const mx = (prev.x + cur.x) / 2;
      const my = (prev.y + cur.y) / 2;
      d += ` C${prev.x + (cur.x - prev.x) * 0.15},${prev.y} ${mx},${prev.y + (cur.y - prev.y) * 0.15} ${mx},${my}`;
    }
    // tail to last point
    const last = points[points.length - 1];
    const prev = points[points.length - 2];
    d += ` C${(prev.x + last.x) / 2},${(prev.y + last.y) / 2} ${last.x - (last.x - prev.x) * 0.15},${last.y} ${last.x},${last.y}`;
    return d;
  }
  // orthogonal by default
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const cur = points[i];
    d += ` L${cur.x},${cur.y}`;
  }
  return d;
}

function labelPosition(points: ArrowPoint[]): { x: number; y: number } {
  if (points.length < 2) return { x: 0, y: 0 };
  const a = points[Math.floor(points.length / 2) - 1] ?? points[0];
  const b = points[Math.floor(points.length / 2)] ?? points[points.length - 1];
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/** Renders an arrow (as SVG path + optional label halo). */
export function renderArrow(input: ArrowRenderInput, markerIdBase: string, theme: Theme): string {
  if (input.points.length < 2) return "";
  const color = input.color ?? theme.arrowColor;
  const style = input.style ?? "orthogonal";
  const width = input.width ?? 2.5;
  const kind = input.kind;
  const markerId = `arrow-${markerIdBase}-${style}-${kind ?? "default"}`;
  const dash = style === "dashed" ? ` stroke-dasharray="8,6"` : "";
  const path = buildPath(input.points, style);
  const isDouble = style === "double";

  const headPart = isDouble ? "" : ` marker-end="url(#${markerId})"`;
  const tailMarker = isDouble ? ` marker-start="url(#${markerId})"` : "";

  let labelMarkup = "";
  if (input.label && input.label.trim()) {
    const pos = labelPosition(input.points);
    const haloId = `halo-${markerIdBase}`;
    labelMarkup =
      `<g id="${haloId}"><rect x="${pos.x - 40}" y="${pos.y - 18}" width="80" height="30" rx="8" fill="${theme.surface}" stroke="${theme.border}" stroke-width="1" opacity="0.95"/>` +
      `<text x="${pos.x}" y="${pos.y + 4}" text-anchor="middle" dominant-baseline="middle" font-size="14" font-weight="600" fill="${theme.text}">${escapeXml(input.label)}</text></g>`;
  }

  const defs = isDouble ? "" : `<defs>${markerDefs(markerId, color, kind)}</defs>`;

  return (
    `<g>` +
    defs +
    `<path d="${path}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"${dash}${headPart}${tailMarker}/>` +
    labelMarkup +
    `</g>`
  );
}
