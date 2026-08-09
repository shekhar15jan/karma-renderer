"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntroCard = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const IntroCard = ({ video, accent, heading }) => {
    const frame = (0, remotion_1.useCurrentFrame)();
    const title = video.introTitle ?? "Karma OS";
    const subtitle = video.introSubtitle ?? video.branding?.header ?? "";
    const footer = video.branding?.footer ?? "";
    const fade = (0, remotion_1.interpolate)(frame, [0, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const scale = (0, remotion_1.interpolate)(frame, [0, 30], [0.9, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const titleFade = (0, remotion_1.interpolate)(frame, [16, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const titleSlide = (0, remotion_1.interpolate)(frame, [16, 56], [28, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: {
            justifyContent: "center",
            alignItems: "center",
            background: "#091325",
            backgroundImage: "radial-gradient(circle at 22% 30%, rgba(56,189,248,0.14) 0%, transparent 40%), radial-gradient(circle at 78% 70%, rgba(243,75,34,0.12) 0%, transparent 40%)",
            opacity: fade,
            transform: `scale(${scale})`,
            fontFamily: heading,
        }, children: [(0, jsx_runtime_1.jsx)("div", { style: { position: "absolute", top: 44, textAlign: "center", opacity: titleFade, transform: `translateY(${titleSlide}px)` }, children: (0, jsx_runtime_1.jsx)("div", { style: { color: "#f34b22", fontSize: 30, fontWeight: 900, letterSpacing: 6, textTransform: "uppercase" }, children: "KARMA OS" }) }), (0, jsx_runtime_1.jsxs)("div", { style: { textAlign: "center", transform: `translateY(${titleSlide}px)`, opacity: titleFade }, children: [(0, jsx_runtime_1.jsx)("div", { style: { color: accent, fontSize: 96, fontWeight: 900, lineHeight: 1, letterSpacing: -1 }, children: title }), subtitle ? ((0, jsx_runtime_1.jsx)("div", { style: { color: "#ffffff", fontSize: 40, fontWeight: 700, letterSpacing: 0.5, marginTop: 18 }, children: subtitle })) : null] }), footer ? ((0, jsx_runtime_1.jsx)("div", { style: { position: "absolute", bottom: 36, left: 0, right: 0, textAlign: "center", color: "#64748b", fontSize: 20, opacity: titleFade }, children: footer })) : null] }));
};
exports.IntroCard = IntroCard;
