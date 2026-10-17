"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Thumbnail = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const BADGE_COLORS = ["#00E5FF", "#00E676", "#FFC400", "#D500F9", "#FF1744"];
/** Picks a font size so the hook fills the left two-thirds without overflowing. */
function titleFontSize(title) {
    const len = title.length;
    if (len <= 14)
        return 132;
    if (len <= 24)
        return 112;
    if (len <= 36)
        return 92;
    return 76;
}
const Thumbnail = ({ title, subtitle, badges = [], channelName }) => {
    const words = title.trim().split(/\s+/);
    // Highlight the last word (usually the key noun) in the accent colour.
    const lead = words.slice(0, -1).join(" ");
    const last = words[words.length - 1] ?? "";
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: {
            background: "#0A0F1C",
            backgroundImage: "radial-gradient(circle at 85% 20%, rgba(213,0,249,0.45) 0%, transparent 45%), radial-gradient(circle at 10% 90%, rgba(0,229,255,0.35) 0%, transparent 50%)",
            fontFamily: "'Poppins', 'Inter', system-ui, sans-serif",
            padding: 64,
            justifyContent: "center",
        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    position: "absolute",
                    inset: 0,
                    backgroundImage: "radial-gradient(rgba(148,163,184,0.18) 1.5px, transparent 1.5px)",
                    backgroundSize: "28px 28px",
                } }), (0, jsx_runtime_1.jsxs)("div", { style: { position: "relative", maxWidth: 900 }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                            fontSize: titleFontSize(title),
                            fontWeight: 900,
                            lineHeight: 1.02,
                            letterSpacing: -2,
                            color: "#FFFFFF",
                            textTransform: "uppercase",
                            textShadow: "0 8px 0 rgba(0,0,0,0.55), 0 0 40px rgba(0,229,255,0.35)",
                        }, children: [lead ? (0, jsx_runtime_1.jsxs)("span", { children: [lead, " "] }) : null, (0, jsx_runtime_1.jsx)("span", { style: { color: "#FFEB3B" }, children: last })] }), subtitle ? ((0, jsx_runtime_1.jsx)("div", { style: {
                            marginTop: 28,
                            display: "inline-block",
                            background: "#FF1744",
                            color: "#FFFFFF",
                            fontSize: 40,
                            fontWeight: 800,
                            padding: "10px 24px",
                            borderRadius: 12,
                            boxShadow: "0 10px 30px rgba(255,23,68,0.45)",
                        }, children: subtitle })) : null] }), badges.length > 0 ? ((0, jsx_runtime_1.jsx)("div", { style: { position: "absolute", right: 56, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 22 }, children: badges.slice(0, 4).map((badge, i) => ((0, jsx_runtime_1.jsx)("div", { style: {
                        minWidth: 220,
                        textAlign: "center",
                        padding: "18px 28px",
                        borderRadius: 18,
                        background: "rgba(18,26,47,0.92)",
                        border: `4px solid ${BADGE_COLORS[i % BADGE_COLORS.length]}`,
                        color: BADGE_COLORS[i % BADGE_COLORS.length],
                        fontSize: 38,
                        fontWeight: 900,
                        boxShadow: `0 0 30px ${BADGE_COLORS[i % BADGE_COLORS.length]}55`,
                        transform: `rotate(${i % 2 === 0 ? -3 : 3}deg)`,
                    }, children: badge }, badge + i))) })) : null, channelName ? ((0, jsx_runtime_1.jsx)("div", { style: { position: "absolute", left: 64, bottom: 40, color: "#94a3b8", fontSize: 28, fontWeight: 800, letterSpacing: 4, textTransform: "uppercase" }, children: channelName })) : null] }));
};
exports.Thumbnail = Thumbnail;
