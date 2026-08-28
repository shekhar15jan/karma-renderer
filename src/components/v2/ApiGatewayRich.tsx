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
        background: "#ffffff",
        border: `2px solid ${highlight ? "#6366f1" : "#e2e8f0"}`,
        boxShadow: highlight
          ? "0 20px 50px rgba(99,102,241,0.25), 0 0 0 1px rgba(99,102,241,0.15), 0 0 30px rgba(99,102,241,0.2)"
          : "0 12px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
        overflow: "hidden",
        transform: highlight ? "scale(1.02)" : "scale(1)",
        transition: "transform 0.3s, box-shadow 0.3s, border-color 0.3s",
      }}
    >
      <div
        style={{
          height: 48,
          background: highlight ? "#6366f1" : "#0f172a",
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
              background: it.active ? "#eef2ff" : it.done ? "#f0fdf4" : "#f8fafc",
              border: `1.5px solid ${it.active ? "#c7d2fe" : it.done ? "#bbf7d0" : "#e2e8f0"}`,
              opacity: it.done || it.active ? 1 : 0.85,
              transform: it.active ? "translateX(4px) scale(1.02)" : "translateX(0)",
              transition: "all 0.3s",
              boxShadow: it.active ? "0 4px 12px rgba(99,102,241,0.15)" : it.done ? "0 2px 8px rgba(16,185,129,0.08)" : "none",
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                background: it.done ? (it.active ? "#6366f1" : "#10b981") : "#f1f5f9",
                border: `2px solid ${it.done ? (it.active ? "#818cf8" : "#6ee7b7") : "#e2e8f0"}`,
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
            <span style={{ fontSize: 12, fontWeight: it.active ? 700 : 600, color: it.active ? "#4338ca" : it.done ? "#0f172a" : "#64748b" }}>
              {it.label}
            </span>
            {it.active && <span style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: 4, background: "#6366f1", boxShadow: "0 0 8px #6366f1" }} />}
          </div>
        ))}
      </div>
    </div>
  );
};
