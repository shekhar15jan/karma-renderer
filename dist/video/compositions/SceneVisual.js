"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SceneVisual = void 0;
exports.themeCssVars = themeCssVars;
const jsx_runtime_1 = require("react/jsx-runtime");
/** SceneVisual - renders the SHARED scene frame HTML and applies frame-accurate,
 *  narration-synced motion via per-frame DOM mutation. The final frame equals the
 *  /render still, so stills and video are pixel-identical.
 */
const react_1 = require("react");
const remotion_1 = require("remotion");
const SCENE_ENTRANCE_FRAMES = 18;
function themeCssVars(theme) {
    return {
        "--scene-bg": theme.background,
        "--scene-surface": theme.surface,
        "--scene-surface2": theme.surface2,
        "--scene-text": theme.text,
        "--scene-muted": theme.muted,
        "--scene-primary": theme.primary,
        "--scene-secondary": theme.secondary,
        "--scene-accent": theme.accent,
        "--scene-border": theme.border,
        "--scene-radius": `${theme.radius}px`,
        "--scene-spacing": `${theme.spacing}px`,
        "--scene-font": theme.font,
        "--scene-heading": theme.fontHeading,
        "--scene-code": theme.fontCode,
    };
}
const DEFAULT_ANIMATION = {
    entrance: "fade-up",
    stagger: 0.4,
    bullets: true,
    progress: true,
    drawCharts: true,
};
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}
const SceneVisual = ({ html, theme, durationFrames, fps, animation, entrance = true }) => {
    const frame = (0, remotion_1.useCurrentFrame)();
    const rootRef = (0, react_1.useRef)(null);
    const anim = { ...DEFAULT_ANIMATION, ...animation };
    const highlights = animation?.highlights ?? [];
    // Whole-scene entrance zoom (historical behaviour; disabled when per-element motion runs)
    const zoom = (0, remotion_1.interpolate)(frame, [0, SCENE_ENTRANCE_FRAMES], [1.06, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    (0, react_1.useLayoutEffect)(() => {
        const root = rootRef.current;
        if (!root)
            return;
        const t = frame / fps;
        // --- per-element entrance + bullet reveal -----------------------------------
        const elements = Array.from(root.querySelectorAll("[data-order]")).sort((a, b) => Number(a.dataset.order) - Number(b.dataset.order));
        const total = Math.max(1, elements.length);
        elements.forEach((el, i) => {
            const order = Number(el.dataset.order);
            // header (-1) animates first with the scene; positive orders stagger
            const startAt = order < 0 ? 0 : (order < total ? order : i) * anim.stagger;
            const enterDur = 0.5;
            const p = (t - startAt) / enterDur;
            if (p <= 0) {
                applyHidden(el, anim.entrance);
                return;
            }
            const k = easeOutCubic(Math.min(1, p));
            el.style.opacity = "1";
            el.style.transform = entranceTransform(anim.entrance, k);
            el.style.transition = "none";
            // bullets reveal synced to narration once the element is in
            if (anim.bullets) {
                const bullets = Array.from(el.querySelectorAll("[data-bullet]"));
                if (bullets.length) {
                    const budget = Math.max(0.6, (durationFrames / fps - startAt - 0.2) * 0.92);
                    bullets.forEach((b, bi) => {
                        const bAt = startAt + 0.15 + (bi / Math.max(1, bullets.length)) * budget;
                        b.style.opacity = t >= bAt ? "1" : "0";
                        b.style.transform = t >= bAt ? "translateY(0px)" : "translateY(14px)";
                    });
                }
            }
        });
        // --- highlights ---------------------------------------------------------------
        for (const h of highlights) {
            const target = root.querySelector(`[data-eid="${h.id}"]`);
            if (!target)
                continue;
            if (t >= h.at) {
                const color = h.color ?? theme.accent;
                if ((h.style ?? "glow") === "glow") {
                    target.style.boxShadow = `0 0 0 6px ${color}55, 0 0 34px 6px ${color}66`;
                }
                else {
                    target.style.outline = `4px solid ${color}`;
                    target.style.outlineOffset = "3px";
                }
                target.style.zIndex = "3";
            }
        }
        // --- chart draw-in --------------------------------------------------------------
        if (anim.drawCharts) {
            const bars = Array.from(root.querySelectorAll("[data-chart-bar]"));
            const line = root.querySelector("[data-chart-line]");
            const area = root.querySelector("[data-chart-area]");
            const chartStart = 0.3;
            const drawDur = 0.9;
            const kp = (t - chartStart) / drawDur;
            const k = easeOutCubic(Math.min(1, Math.max(0, kp)));
            bars.forEach((bar, i) => {
                const bh = bar.getAttribute("height") ?? "0";
                const bHeight = parseFloat(bh) || 0;
                const by = bar.getAttribute("y") ?? "0";
                const y0 = parseFloat(by) + bHeight;
                const grow = (t - chartStart - i * 0.08) / drawDur;
                const g = easeOutCubic(Math.min(1, Math.max(0, grow)));
                bar.setAttribute("height", String(bHeight * g));
                bar.setAttribute("y", String(y0 - bHeight * g));
            });
            if (line) {
                const totalLen = line.getTotalLength?.() ?? 0;
                if (totalLen > 0) {
                    line.style.strokeDasharray = `${totalLen}`;
                    line.style.strokeDashoffset = String(totalLen * (1 - k));
                }
            }
            if (area && line) {
                const totalLen = line.getTotalLength?.() ?? 0;
                if (totalLen > 0) {
                    area.style.opacity = String(0.4 * k);
                }
            }
        }
        // --- branding is part of the frame HTML (unchanged) -----------------------------
    }, [frame, fps, durationFrames, highlights, anim, theme.accent]);
    const progressPct = anim.progress ? Math.min(100, (frame / Math.max(1, durationFrames)) * 100) : null;
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: { background: theme.background, ...themeCssVars(theme) }, children: [theme.gridBg ? ((0, jsx_runtime_1.jsx)(remotion_1.AbsoluteFill, { style: {
                    backgroundImage: `radial-gradient(circle, ${theme.border}66 1px, transparent 1px)`,
                    backgroundSize: "36px 36px",
                } })) : null, (0, jsx_runtime_1.jsx)(remotion_1.AbsoluteFill, { style: { transform: `scale(${zoom})`, transformOrigin: "center center", overflow: "hidden" }, children: (0, jsx_runtime_1.jsx)("div", { ref: rootRef, style: { width: "100%", height: "100%", position: "relative" }, dangerouslySetInnerHTML: { __html: html } }) }), progressPct !== null ? ((0, jsx_runtime_1.jsx)("div", { style: {
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: 6,
                    background: `${theme.border}55`,
                    zIndex: 10,
                }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                        height: "100%",
                        width: `${progressPct}%`,
                        background: theme.accent,
                        boxShadow: `0 0 12px ${theme.accent}88`,
                    } }) })) : null] }));
};
exports.SceneVisual = SceneVisual;
function applyHidden(el, entrance) {
    el.style.opacity = "0";
    el.style.transform = entranceTransform(entrance, 0);
}
function entranceTransform(entrance, k) {
    switch (entrance) {
        case "fade-in":
            return `translateY(0px)`;
        case "slide-left":
            return `translateX(${(1 - k) * 80}px)`;
        case "slide-right":
            return `translateX(${-(1 - k) * 80}px)`;
        case "zoom-in":
            return `scale(${1.12 - 0.12 * k})`;
        case "none":
            return "";
        case "fade-up":
        default:
            return `translateY(${(1 - k) * 40}px)`;
    }
}
