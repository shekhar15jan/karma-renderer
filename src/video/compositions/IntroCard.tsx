/** Intro card - animated mission title card rendered as scene 0. */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { ValidatedVideoRequest } from "../video-schema";

export const IntroCard: React.FC<{ video: ValidatedVideoRequest; accent: string; heading: string }> = ({ video, accent, heading }) => {
  const frame = useCurrentFrame();
  const title = video.introTitle ?? "Karma OS";
  const subtitle = video.introSubtitle ?? video.branding?.header ?? "";
  const footer = video.branding?.footer ?? "";

  const fade = interpolate(frame, [0, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = interpolate(frame, [0, 30], [0.9, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleFade = interpolate(frame, [16, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleSlide = interpolate(frame, [16, 56], [28, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        background: "#091325",
        backgroundImage:
          "radial-gradient(circle at 22% 30%, rgba(56,189,248,0.14) 0%, transparent 40%), radial-gradient(circle at 78% 70%, rgba(243,75,34,0.12) 0%, transparent 40%)",
        opacity: fade,
        transform: `scale(${scale})`,
        fontFamily: heading,
      }}
    >
      <div style={{ position: "absolute", top: 44, textAlign: "center", opacity: titleFade, transform: `translateY(${titleSlide}px)` }}>
        <div style={{ color: "#f34b22", fontSize: 30, fontWeight: 900, letterSpacing: 6, textTransform: "uppercase" }}>KARMA OS</div>
      </div>

      <div style={{ textAlign: "center", transform: `translateY(${titleSlide}px)`, opacity: titleFade }}>
        <div style={{ color: accent, fontSize: 96, fontWeight: 900, lineHeight: 1, letterSpacing: -1 }}>
          {title}
        </div>
        {subtitle ? (
          <div style={{ color: "#ffffff", fontSize: 40, fontWeight: 700, letterSpacing: 0.5, marginTop: 18 }}>{subtitle}</div>
        ) : null}
      </div>

      {footer ? (
        <div style={{ position: "absolute", bottom: 36, left: 0, right: 0, textAlign: "center", color: "#64748b", fontSize: 20, opacity: titleFade }}>
          {footer}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
