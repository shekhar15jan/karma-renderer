"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Captions = void 0;
exports.generateSRT = generateSRT;
exports.generateVTT = generateVTT;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const PRESETS = {
    youtube: {
        fontFamily: "Inter, system-ui, sans-serif",
        fontWeight: 600,
        color: "#fff",
        textShadow: "0 2px 8px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,0.9)",
        background: "rgba(0,0,0,0.6)",
        borderRadius: "8px",
        padding: "8px 16px",
        backdropFilter: "blur(4px)",
    },
    clean: {
        fontFamily: "Inter, system-ui, sans-serif",
        fontWeight: 500,
        color: "#fff",
        textShadow: "0 1px 4px rgba(0,0,0,0.8)",
        background: "transparent",
        padding: "6px 12px",
    },
    bold: {
        fontFamily: "Inter, system-ui, sans-serif",
        fontWeight: 800,
        color: "#fff",
        textShadow: "0 0 8px #000, 0 2px 12px rgba(0,0,0,0.9)",
        background: "rgba(0,0,0,0.7)",
        borderRadius: "6px",
        padding: "10px 20px",
    },
    minimal: {
        fontFamily: "Inter, system-ui, sans-serif",
        fontWeight: 400,
        color: "#eee",
        textShadow: "0 1px 3px rgba(0,0,0,0.7)",
        background: "transparent",
        padding: "4px 10px",
    },
};
function wrapText(text, maxChars) {
    const words = text.split(" ");
    const lines = [];
    let current = "";
    for (const word of words) {
        if ((current + " " + word).trim().length > maxChars) {
            if (current)
                lines.push(current.trim());
            current = word;
        }
        else {
            current = (current + " " + word).trim();
        }
    }
    if (current)
        lines.push(current.trim());
    return lines.join("<br/>");
}
const Captions = ({ cues, fps, width, height, preset = "youtube", position = 0.85, fontSize = 28, maxCharsPerLine = 42, }) => {
    const frame = (0, remotion_1.useCurrentFrame)();
    const currentTime = frame / fps;
    const activeCue = cues.find((c) => currentTime >= c.start && currentTime < c.end);
    if (!activeCue)
        return null;
    const style = PRESETS[preset] ?? PRESETS.youtube;
    const y = height * position;
    const wrapped = wrapText(activeCue.text, maxCharsPerLine);
    const fadeIn = 0.15;
    const fadeOut = 0.15;
    const cueProgress = (currentTime - activeCue.start) / (activeCue.end - activeCue.start);
    let opacity = 1;
    if (cueProgress < fadeIn / (activeCue.end - activeCue.start)) {
        opacity = cueProgress * (activeCue.end - activeCue.start) / fadeIn;
    }
    else if (cueProgress > 1 - fadeOut / (activeCue.end - activeCue.start)) {
        opacity = (1 - cueProgress) * (activeCue.end - activeCue.start) / fadeOut;
    }
    return ((0, jsx_runtime_1.jsx)(remotion_1.AbsoluteFill, { children: (0, jsx_runtime_1.jsx)("div", { style: {
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-end",
                paddingBottom: height * (1 - position) + 40,
                pointerEvents: "none",
            }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                    ...style,
                    fontSize: `${fontSize}px`,
                    lineHeight: 1.35,
                    maxWidth: `${width * 0.9}px`,
                    textAlign: "center",
                    opacity,
                    transform: `translateY(${opacity < 1 ? (1 - opacity) * 20 : 0}px)`,
                    transition: "opacity 0.1s ease-out, transform 0.1s ease-out",
                    whiteSpace: "pre-line",
                }, dangerouslySetInnerHTML: { __html: wrapped } }) }) }));
};
exports.Captions = Captions;
function generateSRT(cues) {
    return cues
        .map((cue, i) => {
        const formatTime = (t) => {
            const h = Math.floor(t / 3600).toString().padStart(2, "0");
            const m = Math.floor((t % 3600) / 60).toString().padStart(2, "0");
            const s = Math.floor(t % 60).toString().padStart(2, "0");
            const ms = Math.round((t % 1) * 1000).toString().padStart(3, "0");
            return `${h}:${m}:${s},${ms}`;
        };
        return `${i + 1}\n${formatTime(cue.start)} --> ${formatTime(cue.end)}\n${cue.text}\n`;
    })
        .join("\n");
}
function generateVTT(cues) {
    const header = "WEBVTT\n\n";
    const body = cues
        .map((cue, i) => {
        const formatTime = (t) => {
            const h = Math.floor(t / 3600).toString().padStart(2, "0");
            const m = Math.floor((t % 3600) / 60).toString().padStart(2, "0");
            const s = Math.floor(t % 60).toString().padStart(2, "0");
            const ms = Math.round((t % 1) * 1000).toString().padStart(3, "0");
            return `${h}:${m}:${s}.${ms}`;
        };
        return `${i + 1}\n${formatTime(cue.start)} --> ${formatTime(cue.end)}\n${cue.text}\n`;
    })
        .join("\n\n");
    return header + body;
}
