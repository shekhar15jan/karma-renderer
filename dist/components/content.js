"use strict";
/** Content components - cards, charts, tables, timelines, containers (React SSR). */
Object.defineProperty(exports, "__esModule", { value: true });
exports.codeComponent = codeComponent;
exports.instructionsComponent = instructionsComponent;
exports.renderContentScene = renderContentScene;
exports.iconMarkup = iconMarkup;
const themes_1 = require("../theme/themes");
const icons_1 = require("../icons/icons");
const layout_1 = require("../layout/layout");
function cx(...parts) {
    return parts.filter(Boolean).join(" ");
}
function esc(s) {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
function iconMarkup(name, size, color) {
    return `<span style="color:${color};display:inline-flex;width:${size}px;height:${size}px;">${(0, icons_1.iconSvg)(name, size)}</span>`;
}
function paletteStyle(theme, index, fill, line) {
    const p = (0, themes_1.paletteFor)(theme, index);
    const bg = fill ?? p.fill;
    const border = line ?? p.line;
    return `background:${bg};border:2px solid ${border};`;
}
// ---------------------------------------------------------------- cards
function cardComponent(c, ctx, index) {
    const theme = ctx.theme;
    const kind = (c.type ?? "card").replace("-card", "");
    const label = c.label ?? "";
    const items = (c.items ?? []).map((it) => (typeof it === "string" ? { label: it } : it));
    const stat = c.data?.value != null ? String(c.data.value) : c.data?.stat != null ? String(c.data.stat) : "";
    const statLabel = c.data?.unit ? String(c.data.unit) : "";
    const quote = c.data?.quote ? String(c.data.quote) : "";
    const author = c.data?.author ? String(c.data.author) : "";
    const summary = c.data?.summary ? String(c.data.summary) : "";
    const color = c.fill ?? (0, themes_1.paletteFor)(theme, index).line;
    const headIcon = c.icon ? iconMarkup(c.icon, 22, color) : "";
    const body = () => {
        switch (kind) {
            case "stat":
                return `<div class="stat-value" style="color:${color}">${esc(stat)} <span class="stat-unit">${esc(statLabel)}</span></div>` +
                    (label ? `<div class="stat-label">${esc(label)}</div>` : "");
            case "quote":
                return `<div class="quote-text">${esc(quote)}</div>` + (author ? `<div class="quote-author">— ${esc(author)}</div>` : "");
            case "bullet":
                return `<div class="bullet-head">${headIcon}<span>${esc(label)}</span></div><ul class="bullet-list">` +
                    items.map((it) => `<li>${esc(it.label)}${it.sublabel ? `<span class="sub">${esc(it.sublabel)}</span>` : ""}</li>`).join("") + `</ul>`;
            case "warning":
                return `<div class="warn-head">${iconMarkup("warning", 22, "#dc2626")}<span>${esc(label)}</span></div><div class="warn-body">${esc(c.data?.message ? String(c.data.message) : "")}</div>`;
            case "summary":
                return `<div class="summary-head">${headIcon}<span>${esc(label)}</span></div><div class="summary-body">${esc(summary)}</div>`;
            case "comparison": {
                const cols = c.columns ?? [];
                return `<div class="comparison-head">${esc(label)}</div><table class="comparison-table"><tbody>` +
                    cols
                        .map((col) => `<tr><td class="cmp-key">${esc(col.header ?? "")}</td>` +
                        (col.cells ?? []).map((cell) => `<td>${esc(cell)}</td>`).join("") +
                        `</tr>`)
                        .join("") +
                    `</tbody></table>`;
            }
            case "title":
                return `<div class="title-card-title">${esc(label)}</div>` + (c.sublabel ? `<div class="title-card-sub">${esc(c.sublabel)}</div>` : "");
            case "info":
            default:
                return `<div class="info-head">${headIcon}<span>${esc(label)}</span></div><div class="info-body">${esc(c.data?.body ? String(c.data.body) : (c.sublabel ?? ""))}</div>`;
        }
    };
    return `<div class="card card-${esc(kind)}" style="${paletteStyle(theme, index, c.fill, c.line)}border-radius:${theme.radius}px;box-shadow:${theme.shadow}">${body()}</div>`;
}
// ---------------------------------------------------------------- containers
function containerComponent(c, ctx, index) {
    const theme = ctx.theme;
    const label = c.label ?? "";
    const items = (c.items ?? []).map((it) => (typeof it === "string" ? { label: it } : it));
    const isGlass = c.type === "glass-container";
    const isGradient = c.type === "gradient-container";
    const isShadow = c.type === "shadow-container";
    const isOutlined = c.type === "outlined-container";
    const isModern = c.type === "modern-card";
    const isMinimal = c.type === "minimal-card";
    const fill = c.fill ?? (isGlass ? "rgba(255,255,255,0.55)" : theme.surface);
    const style = `background:${isGradient ? `linear-gradient(135deg, ${fill}, ${theme.surface2})` : fill};` +
        `border:${isOutlined ? "3px solid" : "2px dashed"};border-color:${c.line ?? theme.border};` +
        `border-radius:${theme.radius}px;box-shadow:${isShadow || isModern ? theme.shadow : "none"};backdrop-filter:${isGlass ? "blur(10px)" : "none"};`;
    return (`<div class="container" style="${style}">` +
        (label ? `<div class="container-label" style="color:${c.line ?? theme.primary}">${esc(label)}</div>` : "") +
        `<div class="container-items">` +
        items.map((it) => `<div class="chip" style="border-color:${c.line ?? (0, themes_1.paletteFor)(theme, index).line}">${it.icon ? iconMarkup(it.icon, 16, theme.text) : ""}${esc(it.label)}${it.value ? `<span class="chip-value">${esc(it.value)}</span>` : ""}</div>`).join("") +
        `</div></div>`);
}
// ---------------------------------------------------------------- timeline / roadmap
function timelineComponent(c, ctx, index) {
    const theme = ctx.theme;
    const items = (c.items ?? []).map((it) => (typeof it === "string" ? { label: it } : it));
    const horizontal = c.type === "horizontal-timeline" || ctx.layout === "roadmap";
    const lineColor = (0, themes_1.paletteFor)(theme, index).line;
    const nodes = items
        .map((it, i) => {
        const chip = `<div class="tl-node" style="background:${lineColor}"><span>${i + 1}</span></div>`;
        return (`<div class="tl-item">${chip}<div class="tl-content"><div class="tl-label">${esc(it.label)}</div>${it.sublabel ? `<div class="tl-sub">${esc(it.sublabel)}</div>` : ""}</div></div>`);
    })
        .join("");
    return (`<div class="timeline ${horizontal ? "tl-horizontal" : "tl-vertical"}" style="--tl-line:${lineColor}">` +
        (c.label ? `<div class="tl-title" style="color:${theme.headingColor}">${esc(c.label)}</div>` : "") +
        `<div class="tl-track">${nodes}</div></div>`);
}
// ---------------------------------------------------------------- charts
function chartSvg(c, ctx) {
    const theme = ctx.theme;
    const data = c.data;
    const values = Array.isArray(data?.values) ? data.values : (c.items ?? []).map((_, i) => i + 1);
    const labels = (c.items ?? []).map((it) => (typeof it === "string" ? it : it.label));
    const W = ctx.width - 80;
    const H = Math.min(ctx.height - 120, 460);
    const padL = 50, padB = 44, padT = 30, padR = 20;
    const cw = W - padL - padR;
    const ch = H - padT - padB;
    const max = Math.max(...values, 1);
    const kind = (c.type ?? "bar-chart").replace("-chart", "");
    let inner = "";
    if (kind === "pie" || kind === "donut") {
        const total = values.reduce((a, b) => a + b, 0) || 1;
        const cx = padL + cw / 2;
        const cy = padT + ch / 2 + 10;
        const r = Math.min(cw, ch) / 2 - 8;
        let angle = -90;
        const rInner = kind === "donut" ? r * 0.55 : 0;
        let arcIndex = 0;
        for (let i = 0; i < values.length; i++) {
            const sweep = (values[i] / total) * 360;
            const p = (0, themes_1.paletteFor)(theme, i);
            const large = sweep > 180 ? 1 : 0;
            const a1 = ((angle) * Math.PI) / 180;
            const a2 = ((angle + sweep) * Math.PI) / 180;
            const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
            const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
            if (rInner === 0) {
                inner += `<path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z" fill="${p.fill}" stroke="${theme.background}" stroke-width="2"/>`;
            }
            else {
                const x1i = cx + rInner * Math.cos(a1), y1i = cy + rInner * Math.sin(a1);
                const x2i = cx + rInner * Math.cos(a2), y2i = cy + rInner * Math.sin(a2);
                inner += `<path d="M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} L${x2i},${y2i} A${rInner},${rInner} 0 ${large} 0 ${x1i},${y1i} Z" fill="${p.fill}" stroke="${theme.background}" stroke-width="2"/>`;
            }
            const mid = ((angle + sweep / 2) * Math.PI) / 180;
            const lr = r * 0.72;
            inner += `<text x="${cx + lr * Math.cos(mid)}" y="${cy + lr * Math.sin(mid)}" text-anchor="middle" dominant-baseline="middle" font-size="12" fill="${theme.text}">${esc(labels[i] ?? "")}</text>`;
            angle += sweep;
            arcIndex++;
        }
        inner += `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" font-size="22" font-weight="700" fill="${theme.headingColor}">${esc(c.label ?? "")}</text>`;
    }
    else if (kind === "gauge" || kind === "progress") {
        const value = values[0] ?? 50;
        const pct = Math.max(0, Math.min(100, (value / max) * 100));
        const cx = padL + cw / 2;
        const cy = padT + ch * 0.62;
        const r = Math.min(cw, ch) / 2 - 10;
        if (kind === "gauge") {
            const a0 = Math.PI;
            const a1 = Math.PI * 2;
            const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
            const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
            const xv = cx + r * Math.cos(a0 + (a1 - a0) * (pct / 100)), yv = cy + r * Math.sin(a0 + (a1 - a0) * (pct / 100));
            inner =
                `<path d="M${x0},${y0} A${r},${r} 0 1 1 ${x1},${y1}" fill="none" stroke="${theme.surface2}" stroke-width="18" stroke-linecap="round"/>` +
                    `<path d="M${x0},${y0} A${r},${r} 0 ${pct > 50 ? 1 : 0} 1 ${xv},${yv}" fill="none" stroke="${(0, themes_1.paletteFor)(theme, 0).line}" stroke-width="18" stroke-linecap="round"/>` +
                    `<text x="${cx}" y="${cy + 6}" text-anchor="middle" dominant-baseline="middle" font-size="34" font-weight="700" fill="${theme.headingColor}">${value}%</text>` +
                    `<text x="${cx}" y="${cy + 40}" text-anchor="middle" dominant-baseline="middle" font-size="14" fill="${theme.muted}">${esc(c.label ?? "")}</text>`;
        }
        else {
            const bw = cw * 0.8;
            const bx = padL + (cw - bw) / 2;
            const by = cy - 14;
            inner =
                `<rect x="${bx}" y="${by}" width="${bw}" height="28" rx="14" fill="${theme.surface2}"/>` +
                    `<rect x="${bx}" y="${by}" width="${bw * (pct / 100)}" height="28" rx="14" fill="${(0, themes_1.paletteFor)(theme, 0).line}"/>` +
                    `<text x="${bx + bw / 2}" y="${by + 18}" text-anchor="middle" dominant-baseline="middle" font-size="14" font-weight="700" fill="${theme.text}">${value}/${max}</text>` +
                    `<text x="${padL + cw / 2}" y="${by + 52}" text-anchor="middle" dominant-baseline="middle" font-size="14" fill="${theme.muted}">${esc(c.label ?? "")}</text>`;
        }
    }
    else if (kind === "radar") {
        const n = values.length;
        const cx = padL + cw / 2, cy = padT + ch / 2 + 10;
        const r = Math.min(cw, ch) / 2 - 24;
        const rings = 4;
        for (let ri = 1; ri <= rings; ri++) {
            const rr = (r * ri) / rings;
            let pts = "";
            for (let i = 0; i < n; i++) {
                const a = (Math.PI * 2 * i) / n - Math.PI / 2;
                pts += `${i === 0 ? "M" : "L"}${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`;
            }
            inner += `<path d="${pts}Z" fill="none" stroke="${theme.border}" stroke-width="1"/>`;
        }
        for (let i = 0; i < n; i++) {
            const a = (Math.PI * 2 * i) / n - Math.PI / 2;
            inner += `<line x1="${cx}" y1="${cy}" x2="${cx + r * Math.cos(a)}" y2="${cy + r * Math.sin(a)}" stroke="${theme.border}" stroke-width="1"/>`;
        }
        let pts = "";
        for (let i = 0; i < n; i++) {
            const a = (Math.PI * 2 * i) / n - Math.PI / 2;
            const rr = (Math.min(1, (values[i] ?? 0) / max) * r);
            pts += `${i === 0 ? "M" : "L"}${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`;
        }
        const p = (0, themes_1.paletteFor)(theme, 0);
        inner += `<path d="${pts}Z" fill="${p.fill}" fill-opacity="0.5" stroke="${p.line}" stroke-width="2"/>`;
        for (let i = 0; i < n; i++) {
            const a = (Math.PI * 2 * i) / n - Math.PI / 2;
            const lx = cx + (r + 16) * Math.cos(a), ly = cy + (r + 16) * Math.sin(a);
            inner += `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" font-size="11" fill="${theme.text}">${esc(labels[i] ?? "")}</text>`;
        }
    }
    else if (kind === "line" || kind === "area") {
        const stepX = values.length > 1 ? cw / (values.length - 1) : cw;
        const px = (i) => padL + i * stepX;
        const py = (v) => padT + ch - (v / max) * ch;
        let linePts = "";
        values.forEach((v, i) => (linePts += `${i === 0 ? "M" : "L"}${px(i)},${py(v)} `));
        for (let g = 0; g <= 4; g++) {
            const gy = padT + (ch * g) / 4;
            const gv = Math.round(max - (max * g) / 4);
            inner += `<line x1="${padL}" y1="${gy}" x2="${padL + cw}" y2="${gy}" stroke="${theme.surface2}" stroke-width="1"/>`;
            inner += `<text x="${padL - 8}" y="${gy + 4}" text-anchor="end" font-size="11" fill="${theme.muted}">${gv}</text>`;
        }
        const p = (0, themes_1.paletteFor)(theme, 0);
        if (kind === "area") {
            inner += `<polygon points="${linePts}${padL + cw},${padT + ch} ${padL},${padT + ch}" fill="${p.fill}" opacity="0.4"/>`;
        }
        inner += `<polyline points="${linePts}" fill="none" stroke="${p.line}" stroke-width="3"/>`;
        values.forEach((v, i) => {
            inner += `<circle cx="${px(i)}" cy="${py(v)}" r="4.5" fill="${theme.background}" stroke="${p.line}" stroke-width="2.5"/>`;
        });
        values.forEach((v, i) => {
            inner += `<text x="${px(i)}" y="${padT + ch + 22}" text-anchor="middle" font-size="11" fill="${theme.muted}">${esc(labels[i] ?? "")}</text>`;
        });
    }
    else {
        // bar
        for (let g = 0; g <= 4; g++) {
            const gy = padT + (ch * g) / 4;
            const gv = Math.round(max - (max * g) / 4);
            inner += `<line x1="${padL}" y1="${gy}" x2="${padL + cw}" y2="${gy}" stroke="${theme.surface2}" stroke-width="1"/>`;
            inner += `<text x="${padL - 8}" y="${gy + 4}" text-anchor="end" font-size="11" fill="${theme.muted}">${gv}</text>`;
        }
        const bw = Math.min(64, (cw / values.length) * 0.6);
        const gap = values.length > 1 ? (cw - bw * values.length) / (values.length - 1) : 0;
        values.forEach((v, i) => {
            const bx = padL + i * (bw + gap) + gap / 2;
            const bh = (v / max) * ch;
            const by = padT + ch - bh;
            const p = (0, themes_1.paletteFor)(theme, i);
            inner += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="6" fill="${p.fill}" stroke="${p.line}" stroke-width="1.5"/>`;
            inner += `<text x="${bx + bw / 2}" y="${by - 8}" text-anchor="middle" font-size="12" font-weight="600" fill="${theme.text}">${v}</text>`;
            inner += `<text x="${bx + bw / 2}" y="${padT + ch + 22}" text-anchor="middle" font-size="11" fill="${theme.muted}">${esc(labels[i] ?? "")}</text>`;
        });
    }
    const svg = `<svg width="${ctx.width}" height="${ctx.height}" viewBox="0 0 ${ctx.width} ${ctx.height}" xmlns="http://www.w3.org/2000/svg" style="display:block">` +
        (c.label && kind !== "pie" && kind !== "donut" && kind !== "gauge" && kind !== "progress" ? `<text x="${padL}" y="26" font-size="22" font-weight="700" fill="${theme.headingColor}">${esc(c.label)}</text>` : "") +
        inner +
        `</svg>`;
    return `<div class="chart-wrap">${svg}</div>`;
}
// ---------------------------------------------------------------- tables
function tableComponent(c, ctx) {
    const theme = ctx.theme;
    const cols = c.columns ?? [];
    const rows = c.data?.rows ?? (c.items ?? []).map((it) => (typeof it === "string" ? [it] : [it.label]));
    const headers = c.data?.headers;
    const headCells = headers?.length ? headers : cols.map((x) => x.header ?? "");
    const bodyRows = rows.length ? rows : (cols[0]?.cells ?? []).map((cell) => [cell]);
    const headerHtml = headCells.length
        ? `<thead><tr>${headCells.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead>`
        : "";
    const bodyHtml = `<tbody>` + bodyRows.map((r) => `<tr>${r.map((cell) => `<td>${esc(cell)}</td>`).join("")}</tr>`).join("") + `</tbody>`;
    return (`<div class="table-wrap" style="border-radius:${theme.radius}px;box-shadow:${theme.shadow}">` +
        (c.label ? `<div class="table-title" style="color:${theme.headingColor}">${esc(c.label)}</div>` : "") +
        `<table class="data-table">${headerHtml}${bodyHtml}</table></div>`);
}
// ---------------------------------------------------------------- code / instructions
function codeComponent(code, ctx) {
    const theme = ctx.theme;
    const lang = code.lang ? `<span class="code-lang">${esc(code.lang)}</span>` : "";
    return (`<div class="code-panel" style="background:${theme.codeBg};color:${theme.codeText};border-radius:${theme.radius}px">` +
        `<div class="code-head">${lang}<span class="code-dots"><span></span><span></span><span></span></span></div>` +
        `<pre><code>${esc(code.text)}</code></pre></div>`);
}
function instructionsComponent(instructions, ctx) {
    const theme = ctx.theme;
    const items = instructions
        .map((ins, i) => `<li><span class="num" style="background:${(0, themes_1.paletteFor)(theme, i).line}">${i + 1}</span><span class="instr">${esc(ins)}</span></li>`)
        .join("");
    return `<ol class="instructions">${items}</ol>`;
}
// ---------------------------------------------------------------- content scene
function renderContentScene(components, ctx) {
    const theme = ctx.theme;
    const cols = (0, layout_1.contentColumns)(ctx.layout);
    const isTimelineLayout = ctx.layout === "timeline" || ctx.layout === "roadmap" || ctx.layout === "learning-path" || ctx.layout === "sprint";
    const sections = [];
    for (let i = 0; i < components.length; i++) {
        const c = components[i];
        const t = c.type ?? "card";
        if (t === "code" && c.data?.text) {
            sections.push(codeComponent({ lang: c.data?.lang, text: String(c.data.text) }, ctx));
        }
        else if (t === "instructions") {
            sections.push(instructionsComponent((c.items ?? []).map((x) => (typeof x === "string" ? x : x.label)), ctx));
        }
        else if (t.endsWith("-chart") || t === "gauge" || t === "progress" || t === "pie" || t === "bar" || t === "line") {
            sections.push(chartSvg(c, ctx));
        }
        else if (t.endsWith("-table") || t === "table") {
            sections.push(tableComponent(c, ctx));
        }
        else if (t.includes("timeline") || t === "roadmap" || t === "learning-path" || t === "sprint") {
            sections.push(timelineComponent(c, ctx, i));
        }
        else if (t === "container" || t.includes("container") || t === "modern-card" || t === "minimal-card") {
            sections.push(containerComponent(c, ctx, i));
        }
        else if (t === "card" || t.endsWith("-card")) {
            sections.push(cardComponent(c, ctx, i));
        }
    }
    const gridStyle = cols > 1
        ? `style="grid-template-columns:repeat(${cols}, 1fr);grid-auto-rows:minmax(${Math.max(150, ctx.height / 4)}px,auto)"`
        : isTimelineLayout
            ? `style="grid-template-columns:1fr;gap:${theme.spacing}px"`
            : `style="grid-template-columns:repeat(auto-fit,minmax(340px,1fr))"`;
    return (`<div class="content-scene ${isTimelineLayout ? "content-timeline" : ""}">` +
        (components.length ? `<div class="content-grid" ${gridStyle}>${sections.join("")}</div>` : "") +
        `</div>`);
}
