import React from "react";

export const ApiGatewayRich: React.FC<{ stage: number; highlight?: boolean }> = ({ stage, highlight }) => {
  const items = [
    { label: "Request received", done: stage >= 1 },
    { label: "Authentication", done: stage >= 2, active: stage === 2 },
    { label: "Validation", done: stage >= 3, active: stage === 3 },
    { label: "Routing", done: stage >= 4, active: stage === 4 },
  ];
  return (
    <div
      style={{
        width: 320,
        borderRadius: 20,
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(12px)",
        border: `1px solid ${highlight ? "rgba(139,92,246,0.6)" : "rgba(255,255,255,0.12)"}`,
        boxShadow: highlight
          ? "0 20px 50px rgba(139,92,246,0.25), 0 0 0 1px rgba(139,92,246,0.15), 0 0 30px rgba(139,92,246,0.2)"
          : "0 12px 40px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.02)",
        overflow: "hidden",
        transform: highlight ? "scale(1.02)" : "scale(1)",
        transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s, border-color 0.3s",
      }}
    >
      <div
        style={{
          height: 48,
          background: highlight ? "rgba(139,92,246,0.8)" : "rgba(255,255,255,0.08)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 16px",
          fontWeight: 800,
          fontSize: 13,
          letterSpacing: 0.5,
        }}
      >
        <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>◈</div>
        API GATEWAY
        {highlight && <span style={{ marginLeft: "auto", fontSize: 10, background: "rgba(255,255,255,0.2)", padding: "4px 8px", borderRadius: 999, fontWeight: 700 }}>ACTIVE</span>}
      </div>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((it, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 12,
              background: it.active ? "rgba(6,182,212,0.1)" : it.done ? "rgba(16,185,129,0.05)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${it.active ? "rgba(6,182,212,0.3)" : it.done ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.06)"}`,
              opacity: it.done || it.active ? 1 : 0.85,
              transform: it.active ? "translateX(4px) scale(1.02)" : "translateX(0)",
              transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.3s, border-color 0.3s",
              boxShadow: it.active ? "0 4px 12px rgba(6,182,212,0.15)" : it.done ? "0 2px 8px rgba(16,185,129,0.08)" : "none",
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                background: it.done ? (it.active ? "#06b6d4" : "#10b981") : "rgba(255,255,255,0.05)",
                border: `2px solid ${it.done ? (it.active ? "#22d3ee" : "#34d399") : "rgba(255,255,255,0.1)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: it.done ? "#fff" : "#94a3b8",
                fontSize: 11,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {it.done ? (it.active ? "●" : "✓") : "○"}
            </div>
            <span style={{ fontSize: 12, fontWeight: it.active ? 700 : 600, color: it.active ? "#22d3ee" : it.done ? "#f8fafc" : "#94a3b8" }}>
              {it.label}
            </span>
            {it.active && <span style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: 4, background: "#06b6d4", boxShadow: "0 0 12px #06b6d4" }} />}
          </div>
        ))}
      </div>
    </div>
  );
};
