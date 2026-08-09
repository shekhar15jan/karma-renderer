"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Branding = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const Branding = ({ branding, theme }) => {
    if (!branding)
        return null;
    return ((0, jsx_runtime_1.jsx)(remotion_1.AbsoluteFill, { children: branding.logo && ((0, jsx_runtime_1.jsx)("div", { style: {
                position: "absolute",
                bottom: "24px",
                right: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000
            }, children: branding.logo.startsWith("data:") || branding.logo.includes("/") ? ((0, jsx_runtime_1.jsx)("img", { src: branding.logo, style: { width: "120px" } })) : ((0, jsx_runtime_1.jsx)("div", { style: {
                    background: `linear-gradient(45deg, ${theme.primary}, ${theme.accent})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontSize: "32px",
                    fontWeight: 800,
                    fontFamily: theme.fontHeading,
                    textShadow: `0 0 20px ${theme.primary}55`
                }, children: branding.logo })) })) }));
};
exports.Branding = Branding;
