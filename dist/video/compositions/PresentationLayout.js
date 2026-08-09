"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PresentationLayout = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const PresentationLayout = ({ scene, theme }) => {
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    // Animation values
    const titleY = (0, remotion_1.spring)({ frame, fps, config: { damping: 12 }, from: -100, to: 0 });
    const contentOpacity = (0, remotion_1.interpolate)(frame, [15, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const spec = scene.spec;
    const blocks = spec.content_blocks || [];
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: { backgroundColor: theme.background, color: theme.text, fontFamily: theme.font }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                    position: "absolute",
                    top: 0, left: 0, right: 0,
                    height: "15%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    transform: `translateY(${titleY}px)`,
                    paddingTop: "20px"
                }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: "52px", fontWeight: 800, color: theme.headingColor, letterSpacing: "2px", fontFamily: theme.fontHeading, textTransform: "uppercase" }, children: spec.title }), spec.subtitle && ((0, jsx_runtime_1.jsx)("div", { style: { fontSize: "32px", color: theme.primary, marginTop: "12px", fontWeight: 600 }, children: spec.subtitle }))] }), (0, jsx_runtime_1.jsxs)("div", { style: {
                    position: "absolute",
                    top: "15%", bottom: "10%", left: "5%", right: "5%",
                    display: "flex",
                    flexDirection: "row",
                    opacity: contentOpacity
                }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                            flex: "0 0 55%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            position: "relative",
                            overflow: "hidden"
                        }, children: [(0, jsx_runtime_1.jsx)("style", { children: `
             .presentation-diagram svg {
               width: 100% !important;
               height: auto !important;
               max-height: 100% !important;
               transform: scale(0.9);
               transform-origin: center center;
             }
           ` }), (0, jsx_runtime_1.jsx)("div", { className: "presentation-diagram", dangerouslySetInnerHTML: { __html: scene.visualHtml || "" }, style: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" } })] }), (0, jsx_runtime_1.jsx)("div", { style: {
                            flex: "1",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            paddingLeft: "40px",
                            gap: "24px"
                        }, children: blocks.map((b, i) => {
                            // Calculate when this block should appear based on audio length
                            const totalDuration = scene.durationFrames;
                            const blockSpace = (totalDuration - 60) / Math.max(blocks.length, 1);
                            const revealFrame = 30 + (i * blockSpace);
                            const blockOpacity = (0, remotion_1.interpolate)(frame, [revealFrame, revealFrame + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                            // Highlight the active block while the voiceover is reading it
                            const isHighlighted = frame >= revealFrame && frame < (revealFrame + blockSpace);
                            return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                    background: theme.surface,
                                    border: `2px solid ${isHighlighted ? theme.secondary : theme.border}`,
                                    borderRadius: `${theme.radius}px`,
                                    padding: "24px",
                                    opacity: blockOpacity,
                                    boxShadow: isHighlighted ? `0 0 20px ${theme.secondary}66` : theme.shadow,
                                    transition: "border 0.3s, box-shadow 0.3s"
                                }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { margin: "0 0 12px 0", color: theme.headingColor, fontSize: "28px", fontFamily: theme.fontHeading }, children: b.heading }), (0, jsx_runtime_1.jsx)("p", { style: { margin: 0, color: theme.muted, fontSize: "24px", lineHeight: "1.5" }, children: b.text })] }, i));
                        }) })] })] }));
};
exports.PresentationLayout = PresentationLayout;
