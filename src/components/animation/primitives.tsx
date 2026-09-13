/** Reusable animation primitives for professional technical YouTube refinement.
 * Preserves CodeAtCloudAI visual identity: white background, dark code panels, blue accent, clean diagrams.
 */
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

// --- Configuration ---
export const AnimationConfig = {
  enabled: true,
  intensity: "subtle" as "subtle" | "medium",
  focusDuration: 18, // frames at 30fps = 0.6s
  transitionDuration: 15, // 0.5s
  highlightDuration: 30, // 1s
  microAnimationInterval: 90, // 3s at 30fps
  codeLineHighlightDuration: 45, // 1.5s
};

// --- AnimatedSectionTitle ---
export const AnimatedSectionTitle: React.FC<{ title: string; subtitle?: string; frame: number }> = ({ title, subtitle, frame }) => {
  const fade = interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const slide = interpolate(frame, [0, 24], [24, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = interpolate(frame, [0, 20], [0.92, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ opacity: fade, transform: `translateY(${slide}px) scale(${scale})`, textAlign: "center" }}>
      <div style={{ fontSize: 64, fontWeight: 900, color: "#0A0F1C", letterSpacing: -1 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 28, color: "#64748b", marginTop: 12 }}>{subtitle}</div>}
    </div>
  );
};

// --- FocusZoom ---
export const FocusZoom: React.FC<{ children: React.ReactNode; frame: number; startFrame: number; targetId?: string }> = ({ children, frame, startFrame, targetId }) => {
  const t = frame - startFrame;
  if (t < 0) return <>{children}</>;
  const scale = interpolate(t, [0, 18], [1, 1.08], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = t < 18 ? 1 : 1;
  return <div style={{ transform: `scale(${scale})`, opacity, transformOrigin: "center", transition: "transform 0.3s ease-out" }}>{children}</div>;
};

// --- ElementHighlight ---
export const ElementHighlight: React.FC<{ highlight: boolean; color?: string; style?: "glow" | "ring"; children: React.ReactNode }> = ({ highlight, color = "#4f6ef7", style = "glow", children }) => {
  const shadow = style === "glow" ? `0 0 0 6px ${color}33, 0 0 24px ${color}66` : `0 0 0 3px ${color}, inset 0 0 0 1px ${color}`;
  return <div style={{ boxShadow: highlight ? shadow : "none", borderRadius: 8, transition: "box-shadow 0.4s ease" }}>{children}</div>;
};

// --- CodeLineHighlight ---
export const CodeLineHighlight: React.FC<{ code: string; lang?: string; highlightLine?: number; frame: number }> = ({ code, highlightLine, frame }) => {
  const lines = code.split("\n");
  return (
    <pre style={{ background: "#0f172a", color: "#e2e8f0", padding: 24, borderRadius: 12, fontSize: 22, lineHeight: 1.6, fontFamily: "JetBrains Mono, monospace", overflow: "hidden" }}>
      {lines.map((line, idx) => {
        const isHighlight = highlightLine !== undefined && idx + 1 === highlightLine;
        const lineOpacity = interpolate(frame, [idx * 6, idx * 6 + 12], [0.3, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div
            key={idx}
            style={{
              background: isHighlight ? "rgba(79, 110, 247, 0.25)" : "transparent",
              borderLeft: isHighlight ? "3px solid #4f6ef7" : "3px solid transparent",
              paddingLeft: 12,
              marginLeft: -12,
              opacity: lineOpacity,
              transition: "background 0.3s ease",
              fontWeight: isHighlight ? 700 : 400,
            }}
          >
            {line || " "}
          </div>
        );
      })}
    </pre>
  );
};

// --- AnimatedArrow ---
export const AnimatedArrow: React.FC<{ from: string; to: string; progress: number }> = ({ from, to, progress }) => {
  const dash = interpolate(progress, [0, 1], [400, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
      <line x1={0} y1={0} x2={100} y2={100} stroke="#4f6ef7" strokeWidth={2} strokeDasharray="8 4" strokeDashoffset={dash} markerEnd="url(#arrowhead)" />
      <defs>
        <marker id="arrowhead" markerWidth={10} markerHeight={7} refX={10} refY={3.5} orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#4f6ef7" />
        </marker>
      </defs>
    </svg>
  );
};

// --- ProgressiveDiagram ---
export const ProgressiveDiagram: React.FC<{ nodes: string[]; frame: number; fps: number }> = ({ nodes, frame, fps }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
      {nodes.map((node, idx) => {
        const revealFrame = idx * AnimationConfig.microAnimationInterval;
        const opacity = interpolate(frame, [revealFrame, revealFrame + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const y = interpolate(frame, [revealFrame, revealFrame + 18], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const isActive = frame >= revealFrame && frame < revealFrame + 90;
        return (
          <div
            key={idx}
            style={{
              opacity,
              transform: `translateY(${y}px)`,
              background: isActive ? "#4f6ef7" : "white",
              color: isActive ? "white" : "#0A0F1C",
              padding: "16px 24px",
              borderRadius: 12,
              border: "2px solid #e2e8f0",
              boxShadow: isActive ? "0 8px 24px rgba(79,110,247,0.3)" : "0 2px 8px rgba(0,0,0,0.08)",
              fontWeight: 700,
              minWidth: 200,
              textAlign: "center",
              transition: "all 0.4s ease",
            }}
          >
            {node}
          </div>
        );
      })}
    </div>
  );
};

// --- KeyTakeaway ---
export const KeyTakeaway: React.FC<{ text: string; frame: number; index: number }> = ({ text, frame, index }) => {
  const reveal = index * 20;
  const opacity = interpolate(frame, [reveal, reveal + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const x = interpolate(frame, [reveal, reveal + 15], [-30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const checkScale = interpolate(frame, [reveal + 10, reveal + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ opacity, transform: `translateX(${x}px)`, display: "flex", alignItems: "center", gap: 16, padding: "12px 20px", background: "white", borderRadius: 10, border: "1px solid #e2e8f0" }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${checkScale})` }}>
        <span style={{ color: "white", fontSize: 16 }}>✓</span>
      </div>
      <span style={{ fontSize: 20, fontWeight: 600, color: "#0A0F1C" }}>{text}</span>
    </div>
  );
};

// --- RecapItem ---
export const RecapItem: React.FC<{ title: string; done: boolean; frame: number; index: number }> = ({ title, done, frame, index }) => {
  const appear = index * 18;
  const opacity = interpolate(frame, [appear, appear + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ opacity, display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", background: done ? "#f0fdf4" : "white", borderRadius: 8, border: `1px solid ${done ? "#bbf7d0" : "#e2e8f0"}` }}>
      <span style={{ color: done ? "#10b981" : "#94a3b8" }}>{done ? "✓" : "○"}</span>
      <span style={{ fontWeight: done ? 700 : 400, color: "#0A0F1C" }}>{title}</span>
    </div>
  );
};

// --- SceneTransition ---
export const SceneTransition: React.FC<{ type: "section" | "concept" | "code" | "takeaway"; frame: number }> = ({ type, frame }) => {
  const progress = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const styles: Record<string, React.CSSProperties> = {
    section: { height: 4, background: "linear-gradient(90deg, #4f6ef7, #00E5FF)", transform: `scaleX(${progress})`, transformOrigin: "left" },
    concept: { opacity: progress, transform: `scale(${0.95 + progress * 0.05})` },
    code: { borderLeft: `4px solid #4f6ef7`, opacity: progress },
    takeaway: { background: `rgba(79,110,247,${progress * 0.1})` },
  };
  return <div style={styles[type] || { opacity: progress }} />;
};
