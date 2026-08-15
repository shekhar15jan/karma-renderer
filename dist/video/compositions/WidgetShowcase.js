"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WidgetShowcase = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const HtmlWidgets_1 = require("../../components/widgets/HtmlWidgets");
require("../../styles/global.css");
const WidgetShowcase = () => {
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { className: "bg-[#020617] flex flex-col items-center justify-center font-sans overflow-hidden", children: [(0, jsx_runtime_1.jsx)(remotion_1.AbsoluteFill, { className: "bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900/80 to-slate-950 opacity-90" }), (0, jsx_runtime_1.jsx)("div", { className: "absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" }), (0, jsx_runtime_1.jsx)("div", { className: "w-full h-full p-12 flex flex-col justify-center items-center z-10 relative", children: (0, jsx_runtime_1.jsxs)(HtmlWidgets_1.KarmaGrid, { cols: 1, className: "w-full max-w-7xl gap-12", children: [(0, jsx_runtime_1.jsxs)(HtmlWidgets_1.KarmaContainer, { variant: "transparent", animationDelay: 0, children: [(0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaHeading, { text: "Karma UI Design System", level: 1, className: "text-center mb-4" }), (0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaParagraph, { text: "A fully composable, native React rendering engine for visual_spec layouts. The script agent outputs simple components, and the engine builds beautiful frames.", className: "text-center" })] }), (0, jsx_runtime_1.jsxs)(HtmlWidgets_1.KarmaGrid, { cols: 2, gap: "gap-8", className: "w-full", children: [(0, jsx_runtime_1.jsxs)(HtmlWidgets_1.KarmaContainer, { variant: "transparent", animationDelay: 10, children: [(0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaHeading, { text: "Performance Metrics", level: 3, animationDelay: 15, className: "mb-6" }), (0, jsx_runtime_1.jsxs)(HtmlWidgets_1.KarmaGrid, { cols: 2, gap: "gap-4", children: [(0, jsx_runtime_1.jsxs)(HtmlWidgets_1.KarmaCard, { color: "emerald", animationDelay: 20, children: [(0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaBadge, { text: "Uptime", color: "emerald" }), (0, jsx_runtime_1.jsx)("div", { className: "mt-4 text-5xl font-extrabold text-white", children: "99.9%" })] }), (0, jsx_runtime_1.jsxs)(HtmlWidgets_1.KarmaCard, { color: "indigo", animationDelay: 25, children: [(0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaBadge, { text: "Latency", color: "indigo" }), (0, jsx_runtime_1.jsx)("div", { className: "mt-4 text-5xl font-extrabold text-white", children: "42ms" })] })] })] }), (0, jsx_runtime_1.jsxs)(HtmlWidgets_1.KarmaContainer, { variant: "glass", animationDelay: 15, children: [(0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaBadge, { text: "Technical Explainer", color: "rose", className: "mb-6 inline-block" }), (0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaCodeBlock, { language: "json", animationDelay: 30, code: `{
  "layout": "dashboard",
  "components": [
    { "type": "card", "label": "Uptime", "data": { "value": "99.9%" } },
    { "type": "code", "data": { "text": "..." } }
  ]
}` })] })] })] }) })] }));
};
exports.WidgetShowcase = WidgetShowcase;
