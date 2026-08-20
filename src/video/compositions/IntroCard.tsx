/** Intro card - animated mission title card rendered as scene 0.
 *  Follows the mission theme (light "whiteboard" by default). */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { ValidatedVideoRequest } from "../video-schema";
import type { Theme } from "../../theme/themes";

/** Converts a hex color like "#4f6ef7" to rgba(). Falls back to the raw color if it is not hex. */
function hexToRgba(hex: string, alpha: number): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return hex;
  const r = parseInt(m[1], 16);
  const g = parseInt(m[2], 16);
  const b = parseInt(m[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const IntroCard: React.FC<{ video: ValidatedVideoRequest; theme: Theme; backgroundPattern?: "grid" | "dots" | "plain" }> = ({ video, theme, backgroundPattern }) => {
  const frame = useCurrentFrame();
  const title = video.introTitle ?? "Karma OS";
  const subtitle = video.introSubtitle ?? video.branding?.header ?? "";
  const footer = video.branding?.footer ?? "";

  const fade = interpolate(frame, [0, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = interpolate(frame, [0, 30], [0.9, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleFade = interpolate(frame, [16, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleSlide = interpolate(frame, [16, 56], [28, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const backgroundImage = `radial-gradient(circle at 22% 30%, ${hexToRgba(theme.primary, 0.16)} 0%, transparent 40%), radial-gradient(circle at 78% 70%, ${hexToRgba(theme.accent, 0.14)} 0%, transparent 40%)`;
  const pattern = backgroundPattern ?? (theme.gridBg ? "grid" : "plain");
  const patternStyle =
    pattern === "grid"
      ? { backgroundImage: `radial-gradient(circle, ${theme.border}66 1px, transparent 1px)`, backgroundSize: "36px 36px" }
      : pattern === "dots"
        ? { backgroundImage: `radial-gradient(circle, ${theme.border}44 1px, transparent 1px)`, backgroundSize: "18px 18px" }
        : undefined;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        background: theme.background,
        backgroundImage,
        opacity: fade,
        transform: `scale(${scale})`,
        fontFamily: theme.fontHeading,
      }}
    >
      <AbsoluteFill style={patternStyle} />
      <div style={{ position: "absolute", top: 44, textAlign: "center", opacity: titleFade, transform: `translateY(${titleSlide}px)` }}>
        <div style={{ color: theme.primary, fontSize: 30, fontWeight: 900, letterSpacing: 6, textTransform: "uppercase" }}>KARMA OS</div>
      </div>

      <div style={{ textAlign: "center", transform: `translateY(${titleSlide}px)`, opacity: titleFade }}>
        <div style={{ color: theme.headingColor, fontSize: 96, fontWeight: 900, lineHeight: 1, letterSpacing: -1 }}>
          {title}
        </div>
        {subtitle ? (
          <div style={{ color: theme.text, fontSize: 40, fontWeight: 700, letterSpacing: 0.5, marginTop: 18 }}>{subtitle}</div>
        ) : null}
      </div>

      {footer ? (
        <div style={{ position: "absolute", bottom: 36, left: 0, right: 0, textAlign: "center", color: theme.muted, fontSize: 20, opacity: titleFade }}>
          {footer}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};