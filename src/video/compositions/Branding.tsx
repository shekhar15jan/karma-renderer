import React from "react";
import { AbsoluteFill } from "remotion";
import type { Theme } from "../../theme/themes";
import type { BrandingConfig } from "../../core/types";

export const Branding: React.FC<{ branding?: BrandingConfig; theme: Theme }> = ({ branding, theme }) => {
  if (!branding) return null;

  return (
    <AbsoluteFill>
      {/* Logo in Bottom Right */}
      {branding.logo && (
        <div style={{
          position: "absolute",
          bottom: "24px",
          right: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          {branding.logo.startsWith("data:") || branding.logo.includes("/") ? (
            <img src={branding.logo} style={{ width: "120px" }} />
          ) : (
            <div style={{
              background: `linear-gradient(45deg, ${theme.primary}, ${theme.accent})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: "32px",
              fontWeight: 800,
              fontFamily: theme.fontHeading,
              textShadow: `0 0 20px ${theme.primary}55`
            }}>
              {branding.logo}
            </div>
          )}
        </div>
      )}
    </AbsoluteFill>
  );
};
