"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SceneVisual = void 0;
exports.themeCssVars = themeCssVars;
const jsx_runtime_1 = require("react/jsx-runtime");
/** SceneVisual - renders the SHARED scene frame HTML and applies frame-accurate,
 *  narration-synced motion via per-frame DOM mutation. The final frame equals the
 *  /render still, so stills and video are pixel-identical.
 */
const react_1 = __importStar(require("react"));
const remotion_1 = require("remotion");
const KarmaComponentRenderer_1 = require("./KarmaComponentRenderer");
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
const prismjs_1 = __importDefault(require("prismjs"));
// prism syntax theme is a side-effect CSS import. webpack (Remotion bundle) inlines it via
// style-loader; plain Node (prod server) cannot parse CSS so we guard it at runtime.
try {
    // @ts-ignore - no types for CSS import; webpack resolves it in the bundle.
    require("prismjs/themes/prism-tomorrow.css");
}
catch {
    /* Node prod server: CSS is handled by the Remotion webpack bundle. */
}
require("prismjs/components/prism-typescript");
require("prismjs/components/prism-javascript");
require("prismjs/components/prism-java");
require("prismjs/components/prism-python");
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
function buildSceneDomCache(root, html, highlightIds) {
    const elements = Array.from(root.querySelectorAll("[data-order]")).sort((a, b) => Number(a.dataset.order) - Number(b.dataset.order));
    const bullets = new Map();
    for (const el of elements) {
        const b = el.querySelectorAll("[data-bullet]");
        if (b.length)
            bullets.set(el, Array.from(b));
    }
    const highlightTargets = new Map();
    for (const id of highlightIds) {
        highlightTargets.set(id, root.querySelector(`[data-eid="${id}"]`) ?? null);
    }
    return {
        html,
        elements,
        bullets,
        highlightTargets,
        bars: Array.from(root.querySelectorAll("[data-chart-bar]")),
        line: root.querySelector("[data-chart-line]"),
        area: root.querySelector("[data-chart-area]"),
    };
}
const SceneVisual = ({ html, theme, durationFrames, fps, animation, entrance = true, timelineEvents, spec }) => {
    const frame = (0, remotion_1.useCurrentFrame)();
    const rootRef = (0, react_1.useRef)(null);
    const cacheRef = (0, react_1.useRef)(null);
    const anim = { ...DEFAULT_ANIMATION, ...animation };
    const highlights = animation?.highlights ?? [];
    const highlightIds = (0, react_1.useMemo)(() => highlights.map((h) => h.id), [highlights]);
    // Whole-scene entrance zoom (historical behaviour; disabled when per-element motion runs)
    const zoom = (0, remotion_1.interpolate)(frame, [0, SCENE_ENTRANCE_FRAMES], [1.06, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    (0, react_1.useLayoutEffect)(() => {
        const root = rootRef.current;
        if (!root)
            return;
        if (!cacheRef.current || cacheRef.current.html !== html) {
            cacheRef.current = buildSceneDomCache(root, html ?? "", highlightIds);
        }
        const cache = cacheRef.current;
        const t = frame / fps;
        // --- per-element entrance + bullet reveal -----------------------------------
        const { elements } = cache;
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
                const bullets = cache.bullets.get(el);
                if (bullets?.length) {
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
            const target = cache.highlightTargets.get(h.id);
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
            const { bars } = cache;
            const line = cache.line;
            const area = cache.area;
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
    }, [frame, fps, durationFrames, html, highlightIds, highlights, anim, theme.accent]);
    react_1.default.useEffect(() => {
        if (rootRef.current) {
            prismjs_1.default.highlightAllUnder(rootRef.current);
        }
    }, [html]);
    const progressPct = anim.progress ? Math.min(100, (frame / Math.max(1, durationFrames)) * 100) : null;
    // Compute dynamic transform from timelineEvents + Ken Burns
    let dynamicTransform = "";
    let transformOrigin = "center center";
    if (timelineEvents && timelineEvents.length > 0) {
        const tMs = (frame / fps) * 1000;
        for (const evt of timelineEvents) {
            if (tMs >= evt.timestamp_ms) {
                if (evt.action === "zoom_in") {
                    dynamicTransform = "scale(1.2)";
                    if (evt.target_element_id && rootRef.current) {
                        const el = rootRef.current.querySelector(`#${evt.target_element_id}`) ||
                            rootRef.current.querySelector(`[data-eid="${evt.target_element_id}"]`);
                        if (el) {
                            const rect = el.getBoundingClientRect();
                            transformOrigin = `${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px`;
                        }
                    }
                }
                else if (evt.action === "pan_right") {
                    dynamicTransform = "translateX(-100px)";
                }
                else if (evt.action === "pan_left") {
                    dynamicTransform = "translateX(100px)";
                }
                else if (evt.action === "ken_burns_zoom") {
                    // Ken Burns: slow zoom over time
                    const zoomStart = evt.zoom_start ?? 1.0;
                    const zoomEnd = evt.zoom_end ?? 1.15;
                    const zoomDur = evt.duration_ms ?? durationFrames / fps * 1000;
                    const zoomProgress = Math.min(1, tMs / zoomDur);
                    const zoom = zoomStart + (zoomEnd - zoomStart) * easeOutCubic(zoomProgress);
                    dynamicTransform = `scale(${zoom})`;
                    transformOrigin = evt.transform_origin ?? "center center";
                }
                else if (evt.action === "ken_burns_pan") {
                    // Ken Burns: slow pan over time
                    const panXStart = evt.pan_x_start ?? 0;
                    const panXEnd = evt.pan_x_end ?? 0;
                    const panYStart = evt.pan_y_start ?? 0;
                    const panYEnd = evt.pan_y_end ?? 0;
                    const panDur = evt.duration_ms ?? durationFrames / fps * 1000;
                    const panProgress = Math.min(1, tMs / panDur);
                    const panX = panXStart + (panXEnd - panXStart) * easeOutCubic(panProgress);
                    const panY = panYStart + (panYEnd - panYStart) * easeOutCubic(panProgress);
                    dynamicTransform = `translate(${panX}px, ${panY}px)`;
                }
            }
        }
    }
    // Default Ken Burns if no timeline events but scene is long enough (> 5s)
    const sceneDurationSec = durationFrames / fps;
    if (!dynamicTransform && sceneDurationSec > 5) {
        const zoomProgress = Math.min(1, frame / durationFrames);
        const zoom = 1.0 + 0.08 * easeOutCubic(zoomProgress); // Subtle 8% zoom
        const panX = -20 * easeOutCubic(zoomProgress); // Slight pan left
        const panY = -10 * easeOutCubic(zoomProgress); // Slight pan up
        dynamicTransform = `scale(${zoom}) translate(${panX}px, ${panY}px)`;
        transformOrigin = "center center";
    }
    const finalTransform = dynamicTransform ? dynamicTransform : `scale(${zoom})`;
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: { background: theme.background, ...themeCssVars(theme) }, children: [theme.gridBg ? ((0, jsx_runtime_1.jsx)(remotion_1.AbsoluteFill, { style: {
                    backgroundImage: `radial-gradient(circle, ${theme.border}66 1px, transparent 1px)`,
                    backgroundSize: "36px 36px",
                } })) : null, (0, jsx_runtime_1.jsx)(remotion_1.AbsoluteFill, { style: { transform: finalTransform, transformOrigin, overflow: "hidden", transition: "transform 0.5s ease-out" }, children: spec ? ((0, jsx_runtime_1.jsx)(KarmaComponentRenderer_1.KarmaComponentRenderer, { spec: spec })) : ((0, jsx_runtime_1.jsx)("div", { ref: rootRef, className: "scene-content", dangerouslySetInnerHTML: { __html: html ?? "" } })) }), progressPct !== null ? ((0, jsx_runtime_1.jsx)("div", { style: {
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
