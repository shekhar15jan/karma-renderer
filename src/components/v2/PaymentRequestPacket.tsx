import React from "react";
import { interpolate, Easing, useCurrentFrame } from "remotion";

export const PaymentRequestPacket: React.FC<{ progress: number; visible: boolean }> = ({ progress, visible }) => {
  if (!visible) return null;
  const eased = Easing.out(Easing.cubic)(progress);
  const trailOpacity = interpolate(progress, [0, 0.3, 1], [0, 0.6, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        opacity: interpolate(progress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]),
        transform: `scale(${0.9 + eased * 0.1})`,
        filter: `drop-shadow(0 8px 20px rgba(14,165,233,0.5))`,
      }}
    >
      <div
        style={{
          width: 14,
          height: 14,
          borderRadius: 7,
          background: "#0ea5e9",
          border: "3px solid #fff",
          boxShadow: "0 0 16px rgba(14,165,233,0.9), 0 0 32px rgba(14,165,233,0.4)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: -6,
            borderRadius: 999,
            border: "2px solid rgba(14,165,233,0.3)",
            transform: `scale(${0.8 + progress * 0.4})`,
            opacity: 1 - progress * 0.5,
          }}
        />
      </div>
      <div
        style={{
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(8px)",
          color: "#fff",
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: 0.6,
          padding: "5px 10px",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.2)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.4), 0 0 0 1px rgba(14,165,233,0.3)",
          whiteSpace: "nowrap",
        }}
      >
        PAYMENT REQUEST
      </div>
      <div
        style={{
          width: 80,
          height: 2,
          background: `linear-gradient(90deg, transparent, rgba(14,165,233,${trailOpacity}), transparent)`,
          borderRadius: 1,
          transform: `scaleX(${0.5 + progress * 0.5})`,
        }}
      />
    </div>
  );
};
