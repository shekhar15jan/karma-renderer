/**
 * RequestFlowSimulation — reusable §14
 * Mobile App → API Gateway → Payment Service (+ auth highlight)
 */
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

export const RequestFlowSimulation: React.FC<{ progress?: number }> = ({ progress }) => {
  const frame = useCurrentFrame();
  const p = progress ?? interpolate(frame, [0, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const requestX = interpolate(p, [0, 0.5, 1], [5, 50, 85]);
  const gatewayGlow = p > 0.4 && p < 0.7;
  const serviceGlow = p > 0.8;
  return (
    <div className="relative w-full h-48 flex items-center justify-between px-8 bg-[var(--scene-surface)]/40 rounded-xl border border-[var(--scene-border)]">
      <div className={`p-4 rounded-lg border-2 ${gatewayGlow ? "border-amber-500 bg-amber-500/20" : "border-slate-300 bg-white"} transition-colors`}>📱 App</div>
      <div className={`p-4 rounded-lg border-2 ${gatewayGlow ? "border-indigo-500 bg-indigo-500/20 shadow-lg" : "border-slate-300 bg-white"}`}>Gateway</div>
      <div className={`p-4 rounded-lg border-2 ${serviceGlow ? "border-emerald-500 bg-emerald-500/20" : "border-slate-300 bg-white"}`}>Payment</div>
      <div className="absolute top-1/2 w-3 h-3 rounded-full bg-indigo-600" style={{ left: `${requestX}%`, transform: "translateY(-50%)", opacity: p < 0.95 ? 1 : 0 }} />
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <line x1="20%" y1="50%" x2="80%" y2="50%" stroke="#94a3b8" strokeWidth={2} strokeDasharray="6,4" opacity={0.6} />
      </svg>
    </div>
  );
};
