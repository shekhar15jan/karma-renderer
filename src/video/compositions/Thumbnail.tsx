/** Thumbnail - 1280x720 YouTube thumbnail still: bold hook text, tech badges, channel mark. */

import React from "react";
import { AbsoluteFill } from "remotion";
import { lookupTechIcon } from "../../icons/techIcons.generated";
import { TechMark } from "../../components/widgets/TechIcon";

export interface ThumbnailProps {
  title: string;
  subtitle?: string;
  badges?: string[];
  channelName?: string;
  [key: string]: unknown;
}

const BADGE_COLORS = ["#00E5FF", "#00E676", "#FFC400", "#D500F9", "#FF1744"];

/** Picks a font size so the hook fills the left two-thirds without overflowing. */
function titleFontSize(title: string): number {
  const len = title.length;
  if (len <= 14) return 132;
  if (len <= 24) return 112;
  if (len <= 36) return 92;
  return 76;
}

/** First technology named in the title ("Docker Explained..." -> docker), for the hero logo. */
function techFromTitle(title: string): string | null {
  for (const w of title.toLowerCase().split(/[^a-z0-9.+#-]+/)) {
    if (w.length >= 3 && w !== "node" && lookupTechIcon(w)) return w;
  }
  return null;
}

export const Thumbnail: React.FC<ThumbnailProps> = ({ title, subtitle, badges = [], channelName }) => {
  // A big recognisable logo is what makes a tech thumbnail readable at phone size;
  // plain text alone was lost in the feed.
  const heroTech = badges.length === 0 ? techFromTitle(title) : null;
  const heroDef = heroTech ? lookupTechIcon(heroTech) : null;
  const words = title.trim().split(/\s+/);
  // Highlight the last word (usually the key noun) in the accent colour.
  const lead = words.slice(0, -1).join(" ");
  const last = words[words.length - 1] ?? "";

  return (
    <AbsoluteFill
      style={{
        background: "#0A0F1C",
        backgroundImage:
          "radial-gradient(circle at 85% 20%, rgba(213,0,249,0.45) 0%, transparent 45%), radial-gradient(circle at 10% 90%, rgba(0,229,255,0.35) 0%, transparent 50%)",
        fontFamily: "'Poppins', 'Inter', system-ui, sans-serif",
        padding: 64,
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(rgba(148,163,184,0.18) 1.5px, transparent 1.5px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div style={{ position: "relative", maxWidth: heroDef ? 760 : 900 }}>
        <div
          style={{
            fontSize: titleFontSize(title),
            fontWeight: 900,
            lineHeight: 1.02,
            letterSpacing: -2,
            color: "#FFFFFF",
            textTransform: "uppercase",
            textShadow: "0 8px 0 rgba(0,0,0,0.55), 0 0 40px rgba(0,229,255,0.35)",
          }}
        >
          {lead ? <span>{lead} </span> : null}
          <span style={{ color: "#FFEB3B" }}>{last}</span>
        </div>
        {subtitle ? (
          <div
            style={{
              marginTop: 28,
              display: "inline-block",
              background: "#FF1744",
              color: "#FFFFFF",
              fontSize: 40,
              fontWeight: 800,
              padding: "10px 24px",
              borderRadius: 12,
              boxShadow: "0 10px 30px rgba(255,23,68,0.45)",
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>

      {heroDef && heroTech ? (
        <div style={{ position: "absolute", right: 70, top: 0, bottom: 0, display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 330,
              height: 330,
              borderRadius: 72,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(18,26,47,0.92)",
              border: `6px solid #${heroDef.hex}`,
              boxShadow: `0 0 80px #${heroDef.hex}88`,
              transform: "rotate(6deg)",
            }}
          >
            <TechMark tech={heroTech} size={220} tint={`#${heroDef.hex}`} />
          </div>
        </div>
      ) : null}

      {badges.length > 0 ? (
        <div style={{ position: "absolute", right: 56, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 22 }}>
          {badges.slice(0, 4).map((badge, i) => (
            <div
              key={badge + i}
              style={{
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
              }}
            >
              {badge}
            </div>
          ))}
        </div>
      ) : null}

      {channelName ? (
        <div style={{ position: "absolute", left: 64, bottom: 40, color: "#94a3b8", fontSize: 28, fontWeight: 800, letterSpacing: 4, textTransform: "uppercase" }}>
          {channelName}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
