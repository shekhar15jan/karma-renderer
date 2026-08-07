/** Document builder - assembles a self-contained HTML page from a rendered scene. */

import type { VisualSpec, VisualComponent, VisualConnection, VisualContainer, BrandingConfig, ThemeId, LayoutType } from "../core/types";
import type { Theme } from "../theme/themes";
import { getTheme } from "../theme/themes";
import { renderContentScene } from "../components/content";
import { codeComponent, instructionsComponent } from "../components/content";
import { renderShape } from "../components/shapes";
import { renderArrow } from "../components/arrows";
import { layoutGraph, isGraphLayout, type GraphLayoutResult } from "../layout/layout";
import { iconSvg, hasIcon } from "../icons/icons";

const BASE_FONT = "'Segoe UI','Inter','Helvetica Neue',Arial,sans-serif";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export interface DocumentOptions {
  width: number;
  height: number;
}

export async function buildDocument(spec: VisualSpec, opts: DocumentOptions): Promise<string> {
  const theme = getTheme(spec.theme);
  const width = spec.width ?? opts.width ?? 1920;
  const height = spec.height ?? opts.height ?? 1080;
  const graphLayout = isGraphLayout((spec.layout ?? "flow") as LayoutType);
  const components = (spec.components ?? []).map((c, i) => ({ ...{ type: "card" }, ...c, id: c.id ?? `c${i}` }));
  const idByLabel = new Map<string, string>();
  for (const c of components) {
    if (c.label && c.label.trim()) idByLabel.set(c.label.trim(), c.id!);
  }
  const resolveId = (ref: string | undefined): string | undefined => {
    if (!ref) return undefined;
    if (components.some((c) => c.id === ref)) return ref;
    return idByLabel.get(ref.trim());
  };
  const connections = (spec.connections ?? [])
    .map((e) => ({ ...e, from: resolveId(e.from) ?? e.from, to: resolveId(e.to) ?? e.to }))
    .filter((e) => e.from !== undefined && e.to !== undefined && components.some((c) => c.id === e.from) && components.some((c) => c.id === e.to));
  const containers = spec.containers ?? [];

  let sceneHtml = "";
  let svgDefs = "";

  if (graphLayout) {
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
      headerHtml = `<div class="title-band"><div class="title-main">${esc(spec.title ?? "")}</div>${spec.subtitle ? `<div class="title-sub">${esc(spec.subtitle)}</div>` : ""}</div>`;
    }
  }

  // branding
  const branding = brandingHtml(spec.branding, theme);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<style>
:root {
  --bg: ${theme.background};
  --surface: ${theme.surface};
  --surface2: ${theme.surface2};
  --text: ${theme.text};
  --muted: ${theme.muted};
  --primary: ${theme.primary};
  --secondary: ${theme.secondary};
  --accent: ${theme.accent};
  --border: ${theme.border};
  --radius: ${theme.radius}px;
  --spacing: ${theme.spacing}px;
  --font: ${BASE_FONT};
  --heading: ${theme.fontHeading};
  --code: ${theme.fontCode};
}
* { margin:0; padding:0; box-sizing:border-box; }
html,body { width:${width}px; height:${height}px; overflow:hidden; }
body {
  background: ${theme.background};
  color: ${theme.text};
  font-family: var(--font);
  ${theme.gridBg ? `background-image: radial-gradient(circle, ${theme.border}66 1px, transparent 1px); background-size: 36px 36px; background-position: 0 0;` : ""}
}
.page { position:relative; width:${width}px; height:${height}px; display:flex; flex-direction:column; padding:${theme.spacing}px; }
.title-band { padding: 14px ${theme.spacing}px 6px; text-align:center; }
.title-main { font-size:40px; font-weight:900; color:${theme.headingColor}; font-family:var(--heading); text-transform:uppercase; letter-spacing:0.5px; }
.title-sub { font-size:22px; color:${theme.muted}; margin-top:6px; font-weight:500; }
.scene-wrap { flex:1; position:relative; min-height:0; }
.scene-svg { position:absolute; inset:0; }

/* section label (uppercase colored kicker above a card/banner) */
.section-label {
  font-size:15px; font-weight:800; text-transform:uppercase; letter-spacing:0.08em;
}

/* reference dark hero band (matches 0.Intro.html) */
.hero-band {
  position:relative; overflow:hidden; border-bottom:2px solid #1e293b;
  background:#091325;
  background-image:
    radial-gradient(circle at right center, rgba(56,189,248,0.16) 0%, transparent 42%),
    radial-gradient(circle at left center, rgba(243,75,34,0.12) 0%, transparent 42%);
  padding:22px ${theme.spacing}px 18px; text-align:center;
}
.hero-band .hero-inner { position:relative; z-index:1; display:flex; flex-direction:column; align-items:center; }
.hero-band .hero-kicker { color:#fff; font-size:19px; font-weight:600; letter-spacing:0.18em; text-transform:uppercase; }
.hero-band .hero-main { color:${theme.accent}; font-size:62px; font-weight:900; line-height:1; letter-spacing:-0.5px; margin:10px 0 8px; }
.hero-band .hero-sub { color:#fff; font-size:30px; font-weight:700; letter-spacing:0.04em; }
.hero-band .hero-divider { width:150%; height:2px; background:${theme.accent}; margin-top:12px; }
.hero-band .hero-logo { color:#f34b22; font-size:30px; font-weight:900; margin-bottom:6px; }
.bottom-band {
  display:flex; gap:${theme.spacing}px; align-items:stretch;
  padding: ${theme.spacing}px ${theme.spacing}px 10px; min-height:132px;
}
.bottom-instr { flex:1; min-width:0; }
.bottom-code { flex:1; min-width:0; }

/* content layouts */
.content-scene { padding: 8px ${theme.spacing}px 4px; height:100%; overflow:hidden; }
.content-grid { display:grid; gap:${theme.spacing}px; height:100%; }
.content-timeline { display:flex; }
.card {
  padding:18px 20px; border-radius:var(--radius); display:flex; flex-direction:column; gap:10px;
  min-height:0; overflow:hidden;
}
.card .info-head,.card .bullet-head,.card .warn-head,.card .summary-head {
  display:flex; align-items:center; gap:10px; font-weight:700; font-size:19px;
}
.info-body,.summary-body,.warn-body { color:var(--text); font-size:16px; opacity:0.92; }
.bullet-list { list-style:none; display:flex; flex-direction:column; gap:8px; }
.bullet-list li { font-size:16px; display:flex; gap:8px; align-items:baseline; }
.bullet-list li::before { content:"•"; color:var(--primary); font-weight:800; }
.bullet-list .sub { display:block; font-size:13px; color:var(--muted); margin-left:18px; }
.stat-value { font-size:52px; font-weight:800; line-height:1.05; }
.stat-unit { font-size:22px; font-weight:600; color:var(--muted); }
.stat-label { font-size:18px; color:var(--muted); }
.quote-text { font-size:22px; font-style:italic; line-height:1.35; }
.quote-author { font-size:15px; color:var(--muted); margin-top:8px; text-align:right; }
.title-card-title { font-size:30px; font-weight:800; font-family:var(--heading); }
.title-card-sub { font-size:18px; color:var(--muted); }
.comparison-head { font-weight:700; font-size:18px; }
.comparison-table { width:100%; border-collapse:collapse; font-size:15px; }
.comparison-table td { border-bottom:1px solid var(--border); padding:6px 8px; }
.comparison-table .cmp-key { font-weight:600; color:var(--muted); width:120px; }

.container { padding:14px 16px; position:relative; display:flex; flex-direction:column; gap:10px; min-height:0; }
.container-label { font-weight:700; font-size:16px; }
.container-items { display:flex; flex-wrap:wrap; gap:8px; overflow:auto; }
.chip {
  display:inline-flex; align-items:center; gap:6px; padding:6px 12px; border-radius:999px;
  background:var(--surface); border:1.5px solid var(--border); font-size:14px; font-weight:600;
}
.chip-value { color:var(--muted); font-weight:600; }

/* reference banner (yellow takeaway / question highlight) */
.banner {
  display:flex; gap:16px; align-items:flex-start; padding:18px 22px;
}
.banner-icon {
  flex:none; width:46px; height:46px; border-radius:12px; display:flex; align-items:center; justify-content:center; margin-top:2px;
}
.banner-body { display:flex; flex-direction:column; gap:6px; min-width:0; }
.banner-label { font-weight:800; font-size:22px; }
.banner-text { font-size:17px; line-height:1.4; }
.banner-list { list-style:none; display:flex; flex-direction:column; gap:6px; }
.banner-list li { font-size:16px; display:flex; gap:8px; align-items:baseline; }
.banner-list li::before { content:"•"; font-weight:800; }
.banner-list .sub { display:block; font-size:13px; color:var(--muted); margin-left:16px; }

/* reference pill-header card (colored border + top badge) */
.pill-card { position:relative; display:flex; flex-direction:column; padding:34px 20px 18px; overflow:hidden; }
.pill-badge {
  position:absolute; top:14px; left:20px; display:inline-flex; align-items:center; gap:8px;
  color:#fff; font-weight:700; font-size:16px; padding:7px 16px; border-radius:999px;
}
.pill-num { width:22px; height:22px; border-radius:50%; background:rgba(255,255,255,0.22); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:13px; }
.pill-body { display:flex; flex-direction:column; gap:8px; }
.pill-sub { font-weight:700; font-size:19px; }
.pill-text { font-size:16px; line-height:1.45; color:var(--text); opacity:0.92; }

/* reference numbered pillar box (review grid) */
.pillar { display:flex; flex-direction:column; overflow:hidden; }
.pillar-head { display:flex; align-items:center; gap:10px; color:#fff; padding:10px 15px; }
.num-circle { width:26px; height:26px; border-radius:50%; background:rgba(255,255,255,0.22); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:15px; flex:none; }
.pillar-title { font-weight:800; font-size:16px; }
.pillar-content { padding:14px 16px; display:flex; flex-direction:column; gap:8px; }

/* reference table with dark header row */
.table-dark .data-table th { background:var(--dt-head); color:#fff; border-bottom:2px solid rgba(255,255,255,0.15); }
.table-dark { background:var(--surface); border:1px solid var(--border); }

.timeline { display:flex; flex-direction:column; gap:10px; }
.tl-title { font-size:24px; font-weight:800; font-family:var(--heading); }
.tl-track { display:flex; flex-direction:column; gap:16px; }
.tl-horizontal .tl-track { flex-direction:row; gap:12px; align-items:flex-start; }
.tl-horizontal .tl-track { position:relative; }
.tl-horizontal .tl-track::before { content:""; position:absolute; top:15px; left:0; right:0; height:3px; background:var(--tl-line); border-radius:2px; }
.tl-item { display:flex; gap:12px; align-items:flex-start; position:relative; }
.tl-horizontal .tl-item { flex-direction:column; align-items:center; text-align:center; flex:1; min-width:0; }
.tl-node { width:32px; height:32px; border-radius:50%; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:15px; box-shadow:0 2px 6px rgba(0,0,0,0.2); flex:none; }
.tl-content { display:flex; flex-direction:column; gap:2px; padding-top:4px; }
.tl-label { font-weight:700; font-size:16px; }
.tl-sub { font-size:13px; color:var(--muted); }

.chart-wrap { display:flex; align-items:center; justify-content:center; height:100%; }
.chart-wrap svg { max-width:100%; max-height:100%; }

.table-wrap { display:flex; flex-direction:column; padding:14px 16px; background:var(--surface); border:1px solid var(--border); overflow:auto; }
.table-title { font-weight:800; font-size:20px; font-family:var(--heading); margin-bottom:10px; }
.data-table { width:100%; border-collapse:collapse; font-size:15px; }
.data-table th { background:var(--surface2); text-align:left; padding:8px 10px; font-weight:700; border-bottom:2px solid var(--border); }
.data-table td { padding:8px 10px; border-bottom:1px solid var(--border); }
.data-table tr:hover td { background:var(--surface); }

.code-panel { display:flex; flex-direction:column; height:100%; min-height:110px; overflow:hidden; }
.code-head { display:flex; justify-content:space-between; align-items:center; padding:8px 14px; background:rgba(255,255,255,0.08); }
.code-lang { font-family:var(--code); font-size:12px; color:rgba(255,255,255,0.7); text-transform:uppercase; letter-spacing:0.5px; }
.code-dots span { display:inline-block; width:9px; height:9px; border-radius:50%; background:#f87171; margin-left:4px; }
.code-dots span:nth-child(2){ background:#fbbf24; } .code-dots span:nth-child(3){ background:#34d399; }
.code-panel pre { flex:1; padding:12px 14px; overflow:hidden; font-family:var(--code); font-size:15px; line-height:1.45; white-space:pre-wrap; word-break:break-word; }

.instructions { list-style:none; display:flex; flex-direction:column; gap:8px; padding:8px 4px; }
.instructions li { display:flex; align-items:center; gap:12px; font-size:17px; }
.instructions .num { width:28px; height:28px; border-radius:50%; color:#fff; font-weight:700; font-size:14px; display:flex; align-items:center; justify-content:center; flex:none; }
.instructions .instr { line-height:1.35; }

.shape-icon { color:var(--text); opacity:0.85; }

/* branding */
.brand-logo { position:absolute; z-index:5; }
.brand-logo svg, .brand-logo img { display:block; }
.brand-footer { position:absolute; bottom:8px; left:50%; transform:translateX(-50%); font-size:13px; color:var(--muted); z-index:5; }
.brand-header { position:absolute; top:8px; left:50%; transform:translateX(-50%); font-size:13px; color:var(--muted); z-index:5; }
.brand-watermark { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:120px; font-weight:900; color:rgba(0,0,0,0.04); letter-spacing:4px; z-index:0; pointer-events:none; }
</style>
</head>
<body>
<div class="page">
  ${branding.watermark}
  ${headerHtml}
  <div class="scene-wrap">
    <div class="scene-svg">${sceneHtml}</div>
    ${branding.logo}
  </div>
  ${bottomHtml}
  ${branding.header}
  ${branding.footer}
</div>
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
      ? `<img src="${b.logo}" style="width:120px"/>`
      : `<span style="font-size:26px;font-weight:800;color:${theme.primary}">${esc(b.logo)}</span>`;
    logo = `<div class="brand-logo" style="${placement}">${img}</div>`;
  }
  const footer = b.footer ? `<div class="brand-footer">${esc(b.footer)}</div>` : "";
  const header = b.header ? `<div class="brand-header">${esc(b.header)}</div>` : "";
  const watermark = b.watermark ? `<div class="brand-watermark">${esc(b.watermark)}</div>` : "";
  return { logo, footer, header, watermark };
}

function renderGraphScene(
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
    shapes += `<g transform="translate(${n.x},${n.y})">${renderShape(c, {
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
      `<g><rect x="${con.x}" y="${con.y}" width="${con.width}" height="${con.height}" rx="18" fill="${fill}" stroke="${line}" stroke-width="2.5" ${dashed}/>` +
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
