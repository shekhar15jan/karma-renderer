import React from "react";
import { AbsoluteFill } from "remotion";
import type { Theme } from "../../theme/themes";
import type { BrandingConfig } from "../../core/types";

const POSITIONS: Record<NonNullable<BrandingConfig["logoPosition"]>, React.CSSProperties> = {
  "top-left": { top: "20px", left: "24px" },
  "top-right": { top: "20px", right: "24px" },
  "bottom-left": { bottom: "24px", left: "24px" },
  "bottom-right": { bottom: "24px", right: "24px" },
  center: { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
};

const renderLogoContent = (logo: string, theme: Theme) =>
  logo.startsWith("data:") || logo.includes("/") ? (
    <img src={logo} style={{ width: "120px" }} />
  ) : (
    <div
      style={{
        background: `linear-gradient(45deg, ${theme.primary}, ${theme.accent})`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        fontSize: "32px",
        fontWeight: 800,
        fontFamily: theme.fontHeading,
        textShadow: `0 0 20px ${theme.primary}55`,
      }}
    >
      {logo}
    </div>
  );

export const Branding: React.FC<{ branding?: BrandingConfig; theme: Theme }> = ({ branding, theme }) => {
  if (!branding) return null;

  const logoPosition = branding.logoPosition ?? "bottom-right";

  return (
    <AbsoluteFill>
      {/* Logo, positioned per config */}
      {branding.logo && (
        <div
          style={{
            position: "absolute",
            ...POSITIONS[logoPosition],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          {renderLogoContent(branding.logo, theme)}
        </div>
      )}

      {/* Header strip */}
      {branding.header && (
        <div
          style={{
            position: "absolute",
            top: "8px",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "18px",
            color: theme.muted,
            zIndex: 1000,
            textAlign: "center",
          }}
        >
          {branding.header}
        </div>
      )}

      {/* Footer strip */}
      {branding.footer && (
        <div
          style={{
            position: "absolute",
            bottom: "8px",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "18px",
            color: theme.muted,
            zIndex: 1000,
            textAlign: "center",
          }}
        >
          {branding.footer}
        </div>
      )}

      {/* Watermark */}
      {branding.watermark && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "120px",
            fontWeight: 900,
            color: "rgba(0,0,0,0.04)",
            letterSpacing: "4px",
            zIndex: 0,
            pointerEvents: "none",
            textTransform: "uppercase",
          }}
        >
          {branding.watermark}
        </div>
      )}
    </AbsoluteFill>
  );
};