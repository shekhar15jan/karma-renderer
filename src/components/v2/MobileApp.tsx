import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

export const MobileApp: React.FC<{ highlightPay?: boolean; tapped?: boolean; scale?: number }> = ({ highlightPay, tapped, scale = 1 }) => {
  const frame = useCurrentFrame();
  const pulse = highlightPay ? 0.5 + 0.5 * Math.sin(frame * 0.2) : 0;
  return (
    <div
      style={{
        width: 280,
        height: 520,
        borderRadius: 36,
        background: "#0f172a",
        border: "6px solid #1e293b",
        boxShadow: `0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05), ${highlightPay ? `0 0 30px rgba(99,102,241,${0.3 + pulse * 0.3})` : ""}`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transform: `scale(${scale})`,
        transformOrigin: "center",
      }}
    >
      <div style={{ height: 28, background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <div style={{ width: 60, height: 6, borderRadius: 3, background: "#334155" }} />
      </div>
      <div style={{ flex: 1, background: "#ffffff", display: "flex", flexDirection: "column", padding: 20, gap: 16 }}>
        <div style={{ textAlign: "center", paddingTop: 8 }}>
          <div style={{ fontSize: 12, letterSpacing: 1.5, color: "#64748b", fontWeight: 700 }}>MOBILE PAYMENT</div>
          <div style={{ height: 2, width: 40, background: "#e2e8f0", margin: "8px auto", borderRadius: 1 }} />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>Amount to pay</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#0f172a", letterSpacing: -1 }}>₹ 1,500</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>to <span style={{ color: "#0f172a", fontWeight: 600 }}>Merchant • UPI</span></div>
        </div>
        <div
          style={{
            height: 52,
            borderRadius: 14,
            background: tapped ? "#4f46e5" : highlightPay ? "#6366f1" : "#0f172a",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: 14,
            letterSpacing: 0.5,
            boxShadow: highlightPay ? `0 8px 20px rgba(99,102,241,0.5), 0 0 0 1px rgba(99,102,241,${0.5 + pulse * 0.5})` : "0 4px 12px rgba(0,0,0,0.15)",
            transform: tapped ? "scale(0.96)" : highlightPay ? `scale(${1 + pulse * 0.02})` : "scale(1)",
            transition: "transform 0.15s, background 0.2s, box-shadow 0.2s",
            border: highlightPay ? "2px solid #818cf8" : "2px solid transparent",
          }}
        >
          PAY NOW
        </div>
        <div style={{ textAlign: "center", fontSize: 10, color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
          <span style={{ width: 14, height: 14, borderRadius: 7, background: "#f1f5f9", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 8 }}>🔒</span>
          Secure UPI payment
        </div>
      </div>
    </div>
  );
};
