/** Frame builder - the SINGLE source of truth for a scene's visual frame.
 *  Used by both the /render stills path (Puppeteer) and the /video path (Remotion)
 *  so that stills and video frames are pixel-identical.
 */

import type { VisualSpec, VisualComponent, VisualConnection, VisualContainer, BrandingConfig, ThemeId, LayoutType } from "../core/types";
import type { Theme } from "../theme/themes";
import { getTheme } from "../theme/themes";
import { renderContentScene, codeComponent, instructionsComponent, type ContentContext } from "../components/content";
import { renderShape } from "../components/shapes";
import { renderArrow } from "../components/arrows";
import { layoutGraph, isGraphLayout, type GraphLayoutResult } from "../layout/layout";
import { SCENE_CSS } from "./styles";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export interface FrameOptions {
  width: number;
  height: number;
  isForRemotion?: boolean;
}

/** Emits the theme CSS variables as inline declarations (used on the PNG page root). */
export function themeVarsCss(theme: Theme): string {
  return (
    `--scene-bg:${theme.background};--scene-surface:${theme.surface};--scene-surface2:${theme.surface2};` +
    `--scene-text:${theme.text};--scene-muted:${theme.muted};--scene-primary:${theme.primary};` +
    `--scene-secondary:${theme.secondary};--scene-accent:${theme.accent};--scene-border:${theme.border};` +
    `--scene-radius:${theme.radius}px;--scene-spacing:${theme.spacing}px;` +
    `--scene-font:${theme.font};--scene-heading:${theme.fontHeading};--scene-code:${theme.fontCode};`
  );
}

/**
 * Builds the full scene frame markup (the inner .page contents): title band
 * (or hero), the scene visual, optional instructions/code band, and branding.
 * THIS IS THE SHARED MARKUP for stills and video.
 */
export async function buildSceneFrame(spec: VisualSpec, opts: FrameOptions): Promise<string> {
  const theme = getTheme(spec.theme);
  const width = spec.width ?? opts.width ?? 1920;
  const height = spec.height ?? opts.height ?? 1080;
  const graphLayout = isGraphLayout((spec.layout ?? "flow") as LayoutType);
  const components: VisualComponent[] = (spec.components ?? []).map((c, i) => ({ ...{ type: "card" }, ...c, id: c.id ?? `c${i}` }));
  const idByLabel = new Map<string, string>();
  for (const c of components) {
    if (c.label && c.label.trim()) idByLabel.set(c.label.trim(), c.id!);
  }
  const resolveId = (ref: string | undefined): string | undefined => {
    if (!ref) return undefined;
    if (components.some((c) => c.id === ref)) return ref;
    return idByLabel.get(ref.trim());
  };
  const connections: VisualConnection[] = (spec.connections ?? [])
    .map((e) => ({ ...e, from: resolveId(e.from) ?? e.from, to: resolveId(e.to) ?? e.to }))
    .filter((e) => e.from !== undefined && e.to !== undefined && components.some((c) => c.id === e.from) && components.some((c) => c.id === e.to));
  const containers = spec.containers ?? [];

  let sceneHtml = "";

  // If this is a presentation layout, we ONLY want the raw diagram SVG if rendering for Remotion React.
  if (spec.layout === "presentation") {
    if (opts.isForRemotion) {
      return sceneHtml;
    } else {
      // Puppeteer Still-Image Fallback for presentation layout
      const blocks = (spec as any).content_blocks || [];
      const blocksHtml = blocks.map((b: any) => `
        <div style="background: ${theme.surface}; border: 2px solid ${theme.border}; border-radius: ${theme.radius}px; padding: 24px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 12px 0; color: ${theme.headingColor}; font-size: 28px;">${b.heading}</h3>
          <p style="margin: 0; color: ${theme.muted}; font-size: 24px;">${b.text}</p>
        </div>
      `).join("");

      sceneHtml = `
        <div style="display: flex; width: 100%; height: 100%;">
          <div style="flex: 0 0 55%; display: flex; align-items: center; justify-content: center; overflow: hidden; transform: scale(0.9);">
             ${sceneHtml}
          </div>
          <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; padding-left: 40px;">
             ${blocksHtml}
          </div>
        </div>
      `;
    }
  } else if (spec.layout === "split_diagram_text") {
    sceneHtml = renderPresentationScene(spec, components, {
      theme,
      themeId: spec.theme as ThemeId,
      layout: spec.layout as LayoutType,
      width,
      height,
    });
  } else if (graphLayout) {
    const laid = await layoutGraph(components, connections, containers, width, height, "DOWN", "layered");
    sceneHtml = renderGraphScene(components, connections, containers, laid, theme, width, height);
  } else {
    sceneHtml = renderContentScene(components, {
      theme,
      themeId: spec.theme as ThemeId,
      layout: spec.layout as LayoutType,
      width,
      height,
    });
  }

  // bottom band: instructions + code
  let bottomHtml = "";
  if (spec.instructions?.length || spec.code) {
    bottomHtml = `<div class="bottom-band">`;
    if (spec.instructions?.length) {
      bottomHtml += `<div class="bottom-instr">${instructionsComponent(spec.instructions, { theme, themeId: spec.theme as ThemeId, layout: spec.layout as LayoutType, width, height })}</div>`;
    }
    if (spec.code && spec.code.text) {
      bottomHtml += `<div class="bottom-code">${codeComponent(spec.code, { theme, themeId: spec.theme as ThemeId, layout: spec.layout as LayoutType, width, height })}</div>`;
    }
    bottomHtml += `</div>`;
  }

  // title header
  let headerHtml = "";
  if (spec.title || spec.subtitle) {
    if (isHeroLayout(spec.layout as LayoutType)) {
      headerHtml = heroHtml(spec, theme);
    } else {
      headerHtml = `<div class="title-band" data-type="header" data-order="-1"><div class="title-main">${esc(spec.title ?? "")}</div>${spec.subtitle ? `<div class="title-sub">${esc(spec.subtitle)}</div>` : ""}</div>`;
    }
  }

  // branding
  const branding = brandingHtml(spec.branding, theme);

  return (
    `<div class="page">` +
    `${branding.watermark}` +
    `${headerHtml}` +
    `<div class="scene-wrap">` +
    `<div class="scene-svg">${sceneHtml}</div>` +
    `${branding.logo}` +
    `</div>` +
    `${bottomHtml}` +
    `${branding.header}` +
    `${branding.footer}` +
    `</div>`
  );
}

/** Full standalone HTML document for the /render stills path. */
export async function buildDocument(spec: VisualSpec, opts: FrameOptions): Promise<string> {
  const theme = getTheme(spec.theme);
  const vars = themeVarsCss(theme);
  const frame = await buildSceneFrame(spec, opts);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<style>
:root { ${vars} }
${SCENE_CSS}
</style>
</head>
<body>
${frame}
</body>
</html>`;
}

function brandingHtml(b: BrandingConfig | undefined, theme: Theme): { logo: string; footer: string; header: string; watermark: string } {
  if (!b) return { logo: "", footer: "", header: "", watermark: "" };
  let logo = "";
  if (b.logo) {
    const pos = b.logoPosition ?? "bottom-right";
    const placement =
      pos === "top-left" ? "top:20px;left:24px" :
      pos === "top-right" ? "top:20px;right:24px" :
      pos === "bottom-left" ? "bottom:24px;left:24px" :
      pos === "center" ? "top:50%;left:50%;transform:translate(-50%,-50%)" :
      "bottom:24px;right:24px";
    const img = b.logo.toLowerCase().startsWith("data:") || b.logo.includes("/")
      ? `<img src="${esc(b.logo)}" style="width:120px"/>`
      : `<span style="font-size:26px;font-weight:800;color:${theme.primary}">${esc(b.logo)}</span>`;
    logo = `<div class="brand-logo" style="${placement}">${img}</div>`;
  }
  const footer = b.footer ? `<div class="brand-footer">${esc(b.footer)}</div>` : "";
  const header = b.header ? `<div class="brand-header">${esc(b.header)}</div>` : "";
  const watermark = b.watermark ? `<div class="brand-watermark">${esc(b.watermark)}</div>` : "";
  return { logo, footer, header, watermark };
}

export function renderGraphScene(
  components: VisualComponent[],
  connections: VisualConnection[],
  containers: VisualContainer[],
  laid: GraphLayoutResult,
  theme: Theme,
  width: number,
  height: number,
): string {
  const byId = new Map(components.map((c) => [c.id, c]));

  // collect all unique marker ids first so defs are emitted once
  const markerKeys = new Set<string>();
  for (const e of connections) {
    markerKeys.add(`${e.style ?? "orthogonal"}-${e.kind ?? "default"}`);
  }
  const markerDefs = Array.from(markerKeys)
    .map((k) => {
      const [style, kind] = k.split("-");
      const key = `${style}-${kind}`;
      // rebuild defs inline via a tiny fake arrow to reuse marker logic
      return markerDefsFor(key, theme.arrowColor, kind === "default" ? undefined : (kind as any));
    })
    .join("");

  let shapes = "";
  const placedById = new Map(laid.nodes.map((n) => [n.id, n]));
  for (const n of laid.nodes) {
    const c = byId.get(n.id);
    if (!c) continue;
    shapes += `<g data-eid="${esc(c.id)}" data-order="${n.index}" data-type="node" transform="translate(${n.x},${n.y})">${renderShape(c, {
      theme,
      index: n.index,
      width: n.width,
      height: n.height,
    })}</g>`;
  }

  // containers (drawn behind shapes)
  let containerMarkup = "";
  for (const con of laid.containers) {
    const cdef = containers.find((x) => x.id === con.id);
    const fill = cdef?.fill ?? "transparent";
    const line = cdef?.line ?? theme.shapeLine[con.index % theme.shapeLine.length];
    const dashed = cdef?.dashed ? `stroke-dasharray="10,8"` : "";
    const label = cdef?.label ?? con.id;
    containerMarkup +=
      `<g data-eid="${esc(con.id)}" data-order="${con.index}" data-type="container"><rect x="${con.x}" y="${con.y}" width="${con.width}" height="${con.height}" rx="18" fill="${fill}" stroke="${line}" stroke-width="2.5" ${dashed}/>` +
      `<rect x="${con.x}" y="${con.y}" width="${Math.max(60, label.length * 13 + 44)}" height="34" rx="17" fill="${line}"/>` +
      `<text x="${con.x + Math.max(60, label.length * 13 + 44) / 2}" y="${con.y + 18}" text-anchor="middle" dominant-baseline="middle" font-size="16" font-weight="700" fill="#fff">${esc(label)}</text></g>`;
  }

  // arrows
  let arrows = "";
  const connByKey = new Map<string, number>();
  for (const e of connections) {
    const key = `${e.from}|${e.to}`;
    const idx = connByKey.get(key) ?? 0;
    connByKey.set(key, idx + 1);
    const edge = laid.edges.filter((x) => x.from === e.from && x.to === e.to)[idx];
    if (!edge || edge.points.length < 2) {
      // fallback: straight line between centers
      const f = placedById.get(e.from);
      const t = placedById.get(e.to);
      if (f && t) {
        arrows += renderArrow(
          {
            points: [{ x: f.x + f.width / 2, y: f.y + f.height / 2 }, { x: t.x + t.width / 2, y: t.y + t.height / 2 }],
            label: e.label,
            style: e.style,
            kind: e.kind,
          },
          `${e.from}_${e.to}_${idx}`,
          theme,
        );
      }
      continue;
    }
    arrows += renderArrow({ points: edge.points, label: e.label, style: e.style, kind: e.kind }, `${e.from}_${e.to}_${idx}`, theme);
  }

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">${markerDefs}${containerMarkup}${arrows}${shapes}</svg>`;
}

import { markerDefsFor } from "../components/arrows";

function isHeroLayout(layout: LayoutType): boolean {
  return layout === "hero" || layout === "poster";
}

function heroHtml(spec: VisualSpec, theme: Theme): string {
  const logo = spec.branding?.logo ? `<div class="hero-logo">${esc(spec.branding.logo)}</div>` : "";
  const kicker = spec.subtitle && spec.title
    ? ""
    : spec.subtitle
      ? `<div class="hero-kicker">${esc(spec.subtitle)}</div>`
      : "";
  const mainTitle = spec.title ? `<div class="hero-main">${esc(spec.title)}</div>` : "";
  const sub = spec.subtitle && spec.title ? `<div class="hero-sub">${esc(spec.subtitle)}</div>` : "";
  return (
    `<div class="hero-band"><div class="hero-inner">${logo}${kicker}${mainTitle}${sub}` +
    (mainTitle ? `<div class="hero-divider"></div>` : "") +
    `</div></div>`
  );
}

/** Presentation layout: split screen between a central visual core and
 *  explanatory content blocks that reveal/highlight in sync with narration.
 *  Data-attrs let the shared motion engine (SceneVisual) animate both stills & video. */
function renderPresentationScene(
  spec: VisualSpec,
  components: VisualComponent[],
  ctx: ContentContext,
): string {
  const theme = ctx.theme;
  const blocks = spec.content_blocks ?? [];
  const visualCore = components.length
    ? renderContentScene(components, ctx)
    : `<div class="pres-visual-empty" data-order="0" data-type="pres-empty">
         <div class="pres-empty-mark" style="color:${theme.primary};border-color:${theme.primary}">◈</div>
       </div>`;

  const blocksHtml = blocks
    .map(
      (b, i) =>
        `<div class="pres-block" data-eid="pres-block-${i}" data-order="${i + (components.length ? 0 : 1)}" data-bullet="${i}" data-type="pres-block" style="background:${theme.surface};border:2px solid ${theme.border};border-radius:${theme.radius}px;box-shadow:${theme.shadow}">` +
        `<div class="pres-heading" style="color:${theme.headingColor};font-family:${theme.fontHeading}">${esc(b.heading ?? "")}</div>` +
        `<div class="pres-text" style="color:${theme.muted}">${esc(b.text ?? "")}</div>` +
        `</div>`,
    )
    .join("");

  return (
    `<div class="presentation-scene" data-type="presentation">` +
    `<div class="pres-visual">${visualCore}</div>` +
    `<div class="pres-blocks">${blocksHtml || `<div class="pres-block" data-order="1" data-bullet="0" data-type="pres-block" style="background:${theme.surface};border:2px solid ${theme.border};border-radius:${theme.radius}px"><div class="pres-text" style="color:${theme.muted}">${esc(spec.subtitle ?? "")}</div></div>`}</div>` +
    `</div>`
  );
}
