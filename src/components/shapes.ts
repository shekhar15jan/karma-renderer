/** Shape renderers - SVG builders for every UML/flow shape type. */

import type { VisualComponent } from "../core/types";
import type { Theme } from "../theme/themes";
import { iconSvg } from "../icons/icons";
import { estimateNodeSize } from "../layout/layout";

export interface ShapeRenderContext {
  theme: Theme;
  index: number;
  width: number;
  height: number;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Deterministic color fallback using theme palette by index. */
export function shapeColors(c: VisualComponent, ctx: ShapeRenderContext) {
  const paletteIdx = ctx.index % ctx.theme.palette.length;
  const fill = c.fill ?? ctx.theme.palette[paletteIdx];
  const line = c.line ?? ctx.theme.shapeLine[paletteIdx];
  const textColor = c.textColor ?? ctx.theme.text;
  return { fill, line, textColor };
}

export function shapeSizes(c: VisualComponent, defaultW: number, defaultH: number) {
  const w = c.width ?? defaultW;
  const h = c.height ?? defaultH;
  return { w, h };
}

function wrapLabel(label: string, maxChars: number): string[] {
  if (!label) return [];
  const words = label.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length <= maxChars) {
      line = (line + " " + w).trim();
    } else {
      if (line) lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function labelMarkup(label: string | undefined, maxChars: number, fontSize: number, fill: string, centerX: number, centerY: number, weight: "bold" | "normal" = "bold", lineHeight = 1.25): string {
  if (!label) return "";
  const lines = wrapLabel(label, maxChars);
  const startY = centerY - ((lines.length - 1) * fontSize * lineHeight) / 2;
  const tspans = lines
    .map((l, i) => {
      const dy = i === 0 ? startY : startY + i * fontSize * lineHeight;
      return `<text x="${centerX}" y="${dy}" text-anchor="middle" dominant-baseline="middle" font-size="${fontSize}" font-weight="${weight}" fill="${escapeXml(fill)}">${escapeXml(l)}</text>`;
    })
    .join("");
  return tspans;
}

/** Renders a single shape as SVG element(s). Returns <g> markup. */
export function renderShape(c: VisualComponent, ctx: ShapeRenderContext): string {
  const type = (c.type ?? "box").toLowerCase();
  const { fill, line, textColor } = shapeColors(c, ctx);
  const { w, h } = shapeSizes(c, ctx.width, ctx.height);
  const cx = ctx.width / 2;
  const cy = ctx.height / 2;
  const fontBold = Math.min(30, Math.max(18, h / 4));
  const fontReg = Math.max(14, fontBold - 4);

  let body = "";
  let labelW = w - 40;
  let labelMaxH = h - 30;
  let labelFont = fontBold;

  switch (type) {
    case "diamond":
    case "decision": {
      body = `<polygon points="${w / 2},0 ${w},${h / 2} ${w / 2},${h} 0,${h / 2}" fill="${fill}" stroke="${line}" stroke-width="2.5" stroke-linejoin="round"/>`;
      labelW = w * 0.66;
      labelMaxH = h * 0.6;
      labelFont = Math.min(26, Math.max(15, h / 4.5));
      break;
    }
    case "oval":
    case "ellipse":
    case "circle":
    case "start":
    case "end": {
      body = `<ellipse cx="${cx}" cy="${cy}" rx="${w / 2}" ry="${h / 2}" fill="${fill}" stroke="${line}" stroke-width="2.5"/>`;
      break;
    }
    case "parallelogram":
    case "input":
    case "output": {
      const skew = Math.max(18, w / 5);
      body = `<polygon points="${skew},0 ${w},0 ${w - skew},${h} 0,${h}" fill="${fill}" stroke="${line}" stroke-width="2.5" stroke-linejoin="round"/>`;
      break;
    }
    case "cylinder":
    case "database": {
      const arcH = Math.min(34, h / 3);
      body =
        `<path d="M0,${arcH} L0,${h - arcH} A${w / 2},${arcH} 0 0 0 ${w},${h - arcH} L${w},${arcH} A${w / 2},${arcH} 0 0 1 0,${arcH} Z" fill="${fill}" stroke="${line}" stroke-width="2.5"/>` +
        `<ellipse cx="${cx}" cy="${arcH}" rx="${w / 2}" ry="${arcH}" fill="${fill}" stroke="${line}" stroke-width="2.5"/>`;
      labelMaxH = h - 60;
      break;
    }
    case "hexagon":
    case "process": {
      body = `<polygon points="${w * 0.25},0 ${w * 0.75},0 ${w},${h / 2} ${w * 0.75},${h} ${w * 0.25},${h} 0,${h / 2}" fill="${fill}" stroke="${line}" stroke-width="2.5" stroke-linejoin="round"/>`;
      break;
    }
    case "class": {
      const headerH = Math.min(54, h * 0.32);
      const attrs = (c.data?.attributes as string[]) ?? (c.data?.fields as string[]) ?? [];
      const methods = (c.data?.methods as string[]) ?? [];
      const attrY = headerH + 18;
      const methodsY = headerH + (attrs.length ? attrs.length * 20 + 22 : 22);
      body =
        `<rect x="0" y="0" width="${w}" height="${h}" rx="4" fill="${fill}" stroke="${line}" stroke-width="2.5"/>` +
        `<rect x="0" y="0" width="${w}" height="${headerH}" fill="${fill}" stroke="${line}" stroke-width="2.5"/>` +
        `<line x1="0" y1="${headerH}" x2="${w}" y2="${headerH}" stroke="${line}" stroke-width="1.5"/>` +
        `<line x1="0" y1="${headerH + (attrs.length ? attrs.length * 20 + 16 : 16)}" x2="${w}" y2="${headerH + (attrs.length ? attrs.length * 20 + 16 : 16)}" stroke="${line}" stroke-width="1.5"/>` +
        labelMarkup(c.label, Math.floor(w / 9), 16, textColor, cx, headerH / 2, "bold") +
        attrs
          .map((a, i) => `<text x="12" y="${attrY + i * 20}" font-size="13" fill="${textColor}">${escapeXml(a)}</text>`)
          .join("") +
        methods
          .map((m, i) => `<text x="12" y="${methodsY + i * 20}" font-size="13" fill="${textColor}">${escapeXml(m)}</text>`)
          .join("");
      return `<g>${body}</g>`;
    }
    case "actor": {
      // UML stick figure with a name plate
      const headR = 14;
      const headY = h * 0.22;
      const torsoY = headY + headR * 2;
      const armsY = torsoY + headR;
      const legsY = torsoY + headR + 6;
      body =
        `<circle cx="${cx}" cy="${headY}" r="${headR}" fill="${fill}" stroke="${line}" stroke-width="2.5"/>` +
        `<line x1="${cx}" y1="${torsoY}" x2="${cx}" y2="${torsoY + headR * 2}" stroke="${line}" stroke-width="2.5"/>` +
        `<line x1="${cx - headR * 1.4}" y1="${armsY}" x2="${cx + headR * 1.4}" y2="${armsY}" stroke="${line}" stroke-width="2.5"/>` +
        `<line x1="${cx}" y1="${legsY}" x2="${cx - headR}" y2="${legsY + headR * 1.4}" stroke="${line}" stroke-width="2.5"/>` +
        `<line x1="${cx}" y1="${legsY}" x2="${cx + headR}" y2="${legsY + headR * 1.4}" stroke="${line}" stroke-width="2.5"/>`;
      return `<g>${body}${labelMarkup(c.label, Math.floor(w / 9), 15, textColor, cx, h - 12, "bold")}</g>`;
    }
    case "cloud": {
      const d = `M ${w * 0.28},${h * 0.85} A ${w * 0.22},${h * 0.22} 0 0 1 ${w * 0.34},${h * 0.34} A ${w * 0.28},${h * 0.28} 0 0 1 ${w * 0.78},${h * 0.3} A ${w * 0.2},${h * 0.2} 0 0 1 ${w * 0.86},${h * 0.6} A ${w * 0.18},${h * 0.18} 0 0 1 ${w * 0.72},${h * 0.85} Z`;
      body = `<path d="${d}" fill="${fill}" stroke="${line}" stroke-width="2.5" stroke-linejoin="round"/>`;
      break;
    }
    case "note": {
      body =
        `<path d="M0,0 L${w * 0.72},0 L${w},${h * 0.28} L${w},${h} L0,${h} Z" fill="${fill}" stroke="${line}" stroke-width="2.5" stroke-linejoin="round"/>` +
        `<path d="M${w * 0.72},0 L${w * 0.72},${h * 0.28} L${w},${h * 0.28}" fill="#fff" stroke="${line}" stroke-width="1.5" stroke-linejoin="round"/>`;
      break;
    }
    case "box":
    case "rect":
    default: {
      const radius = Math.min(16, h / 4);
      body = `<rect x="0" y="0" width="${w}" height="${h}" rx="${radius}" fill="${fill}" stroke="${line}" stroke-width="2.5"/>`;
      break;
    }
  }

  // icon support for boxes/rects
  let iconMarkup = "";
  if ((type === "box" || type === "rect") && c.icon) {
    const iconSize = Math.min(34, h / 2.2);
    const hasLabel = !!c.label;
    iconMarkup = `<g transform="translate(${hasLabel ? 22 : cx - iconSize / 2}, ${cy - iconSize / 2})">${iconSvg(c.icon, iconSize, "shape-icon")}</g>`;
    // push label to the right of the icon if present
    body = body + iconMarkup;
    if (hasLabel) {
      labelW = w - 70;
      return `<g>${body}${labelMarkup(c.label, Math.floor(labelW / 10), labelFont, textColor, cx + 24, cy, "bold")}${c.sublabel ? labelMarkup(c.sublabel, Math.floor(labelW / 9), fontReg, textColor, cx + 24, cy + labelFont + 6, "normal") : ""}</g>`;
    }
    return `<g>${body}</g>`;
  }

  return `<g>${body}${labelMarkup(c.label, Math.floor(labelW / 10), labelFont, textColor, cx, cy, "bold")}${c.sublabel ? labelMarkup(c.sublabel, Math.floor(labelW / 9), fontReg, textColor, cx, cy + labelFont + 4, "normal") : ""}</g>`;
}

export { estimateNodeSize };
