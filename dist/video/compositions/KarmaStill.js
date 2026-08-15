"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KarmaStill = exports.STILL_SETTLE_FRAME = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const KarmaComponentRenderer_1 = require("./KarmaComponentRenderer");
const SceneVisual_1 = require("./SceneVisual");
const themes_1 = require("../../theme/themes");
/** Frame at which all entrance animations (max delay ~index*5 + 15) have settled. */
exports.STILL_SETTLE_FRAME = 120;
const KarmaStill = ({ spec }) => {
    const theme = (0, themes_1.getTheme)(spec?.theme ?? "codeatcloud");
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: { background: theme.background, ...(0, SceneVisual_1.themeCssVars)(theme) }, children: [theme.gridBg ? ((0, jsx_runtime_1.jsx)(remotion_1.AbsoluteFill, { style: {
                    backgroundImage: `radial-gradient(circle, ${theme.border}66 1px, transparent 1px)`,
                    backgroundSize: "36px 36px",
                } })) : null, (0, jsx_runtime_1.jsx)(remotion_1.AbsoluteFill, { style: { overflow: "hidden" }, children: spec ? (0, jsx_runtime_1.jsx)(KarmaComponentRenderer_1.KarmaComponentRenderer, { spec: spec }) : null })] }));
};
exports.KarmaStill = KarmaStill;
