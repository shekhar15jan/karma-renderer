/**
 * KafkaSimulation — §15 Producer → Kafka → Consumers
 */
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

export const KafkaSimulation: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const hasPublished = p > 0.3;
  const queued = p > 0.5 && p < 0.85;
  const consumedA = p > 0.85;
  const consumedB = p > 0.9;
  return (
    <div className="relative w-full h-64 flex flex-col items-center justify-center bg-[var(--scene-surface)]/40 rounded-xl border border-[var(--scene-border)] p-6">
      <div className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-bold">Producer</div>
      <div className={`mt-3 px-8 py-4 rounded-xl border-2 flex gap-1 ${queued ? "border-amber-500 bg-amber-50" : "border-slate-400 bg-white"}`}>
        <span className="font-bold">Kafka</span>
        {[0,1,2,3].map(i => <div key={i} className={`w-3 h-6 rounded ${hasPublished && i < 3 ? "bg-amber-500" : "bg-slate-200"} transition-colors`} />)}
      </div>
      <div className="flex gap-12 mt-4">
        <div className={`px-4 py-2 rounded-lg border-2 ${consumedA ? "border-emerald-500 bg-emerald-50" : "border-slate-300"}`}>Consumer A</div>
        <div className={`px-4 py-2 rounded-lg border-2 ${consumedB ? "border-emerald-500 bg-emerald-50" : "border-slate-300"}`}>Consumer B</div>
      </div>
      {hasPublished && <div className="absolute top-[42%] w-2 h-2 rounded-full bg-amber-500 animate-pulse" style={{ left: "50%" }} />}
    </div>
  );
};
