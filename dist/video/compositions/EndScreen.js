"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EndScreen = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const END_SCREEN_DURATION = 180; // frames at 30fps = 6 seconds
const EndScreen = ({ theme, channelName = "Karma OS", videoTitle, avatar, nextVideo, secondVideo, }) => {
    const frame = (0, remotion_1.useCurrentFrame)();
    const progress = frame / END_SCREEN_DURATION;
    // Fade in over first 0.5s, stay, fade out last 0.5s
    const fadeIn = (0, remotion_1.interpolate)(progress, [0, 0.08], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fadeOut = (0, remotion_1.interpolate)(progress, [0.92, 1], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const opacity = Math.min(fadeIn, fadeOut);
    const slideUp = (0, remotion_1.interpolate)(progress, [0, 0.15], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const transform = `translateY(${slideUp}px)`;
    const containerStyle = {
        opacity,
        transform,
        transition: "opacity 0.3s ease-out, transform 0.5s ease-out",
    };
    return ((0, jsx_runtime_1.jsx)(remotion_1.AbsoluteFill, { style: containerStyle, children: (0, jsx_runtime_1.jsxs)("div", { style: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                padding: "40px",
                background: `linear-gradient(135deg, ${theme.background} 0%, ${theme.surface} 100%)`,
            }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                        display: "flex",
                        alignItems: "center",
                        gap: "20px",
                        marginBottom: "30px",
                        padding: "20px 30px",
                        background: theme.surface2,
                        borderRadius: "16px",
                        border: `2px solid ${theme.border}`,
                        boxShadow: theme.shadow,
                    }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                width: "70px",
                                height: "70px",
                                borderRadius: "50%",
                                background: theme.primary,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "28px",
                                fontWeight: "800",
                                color: theme.background,
                                flexShrink: 0,
                            }, children: avatar ? ((0, jsx_runtime_1.jsx)("img", { src: avatar, alt: "", style: { width: "70px", height: "70px", borderRadius: "50%", objectFit: "cover" } })) : (channelName.charAt(0).toUpperCase()) }), (0, jsx_runtime_1.jsxs)("div", { style: { flex: 1 }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                        fontSize: "22px",
                                        fontWeight: "700",
                                        color: theme.text,
                                        marginBottom: "4px",
                                    }, children: channelName }), (0, jsx_runtime_1.jsx)("div", { style: {
                                        fontSize: "14px",
                                        color: theme.muted,
                                    }, children: "Subscribe for more technical content" })] }), (0, jsx_runtime_1.jsx)("button", { style: {
                                padding: "12px 28px",
                                fontSize: "16px",
                                fontWeight: "700",
                                color: theme.background,
                                background: theme.accent,
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                boxShadow: `0 4px 12px ${theme.accent}66`,
                                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                            }, children: "SUBSCRIBE" })] }), (0, jsx_runtime_1.jsxs)("div", { style: {
                        display: "flex",
                        gap: "24px",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        maxWidth: "1000px",
                    }, children: [nextVideo && ((0, jsx_runtime_1.jsx)(EndScreenVideoCard, { title: nextVideo.title, thumbnail: nextVideo.thumbnail, theme: theme })), secondVideo && ((0, jsx_runtime_1.jsx)(EndScreenVideoCard, { title: secondVideo.title, thumbnail: secondVideo.thumbnail, theme: theme })), !nextVideo && !secondVideo && ((0, jsx_runtime_1.jsxs)("div", { style: {
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "16px",
                                padding: "30px",
                                color: theme.muted,
                            }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                        fontSize: "18px",
                                        fontWeight: "600",
                                        color: theme.text,
                                    }, children: "Thanks for watching!" }), (0, jsx_runtime_1.jsx)("div", { style: {
                                        fontSize: "14px",
                                        textAlign: "center",
                                        maxWidth: "400px",
                                    }, children: videoTitle ? `You just watched: "${videoTitle}"` : "Check out more videos on our channel." })] }))] })] }) }));
};
exports.EndScreen = EndScreen;
const EndScreenVideoCard = ({ title, thumbnail, theme }) => {
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            width: "320px",
            background: theme.surface,
            borderRadius: "12px",
            overflow: "hidden",
            border: `2px solid ${theme.border}`,
            boxShadow: theme.shadow,
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                    width: "100%",
                    aspectRatio: "16/9",
                    background: thumbnail ? `url(${thumbnail}) center/cover` : theme.surface2,
                    position: "relative",
                }, children: [!thumbnail && ((0, jsx_runtime_1.jsx)("div", { style: {
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: theme.muted,
                            fontSize: "14px",
                        }, children: "No thumbnail" })), (0, jsx_runtime_1.jsx)("div", { style: {
                            position: "absolute",
                            bottom: "8px",
                            right: "8px",
                            background: "rgba(0,0,0,0.8)",
                            color: "#fff",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "600",
                        }, children: "WATCH" })] }), (0, jsx_runtime_1.jsx)("div", { style: {
                    padding: "12px 16px",
                }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                        fontSize: "15px",
                        fontWeight: "600",
                        color: theme.text,
                        lineHeight: 1.3,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }, children: title }) })] }));
};
