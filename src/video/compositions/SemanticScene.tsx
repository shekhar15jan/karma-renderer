/**
 * SemanticScene — Slice 1+6+7 working scene (ARCHITECTURE + TRAVEL + FOLLOW + narration sync)
 * Uses new IR but falls back to existing KarmaGraphScene for full graph.
 * Demonstrates AI WHAT (intent TRAVEL) → renderer HOW (camera + animation + narration sync).
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { KarmaGraphScene } from "./KarmaGraphScene";
import { cameraTransform, cameraTransformToCss } from "../camera/cameraEngine";
import { createNarrationSync } from "../audio/narrationSync";
import { layoutGraph, type GraphLayoutResult } from "../../layout/layout";
import type { SemanticSceneSpec } from "../schema/semanticSceneSpec";

export const SemanticScene: React.FC<{ spec: SemanticSceneSpec }> = ({ spec }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const timeSec = frame / fps;

  // Slice 6: semantic camera — Easing.out cubic, viewport-relative, safe framing, interpolation
  const cam = cameraTransform(frame, fps, durationInFrames, spec.camera);
  const camStyle: React.CSSProperties = useMemo(
    () => ({
      transform: cameraTransformToCss(cam),
      transformOrigin: "center center",
      width: "100%",
      height: "100%",
      willChange: "transform",
    }),
    [cam.scale, cam.x, cam.y]
  );

  // Slice 7: narration → semantic event sync (§23)
  // Important moments (request reaches gateway → travel+highlight) fire together, not every word.
  const activeAnimations = useMemo(() => {
    if (!spec.semanticAnimations?.length) return [];
    const sync = createNarrationSync({
      narration: spec.narration,
      // wordCues could be passed via spec as (spec as any).wordCues if available
      wordCues: (spec as any).wordCues,
      semanticAnimations: spec.semanticAnimations,
    });
    return sync.getActiveAnimationsAt(timeSec);
  }, [spec.semanticAnimations, spec.narration, (spec as any).wordCues, timeSec]);

  // If semanticObjects present, adapt to legacy components/connections for graph
  const hasSemantic = spec.semanticObjects && spec.semanticObjects.length > 0;
  const legacySpec = useMemo(() => {
    if (!hasSemantic) return spec;
    return {
      ...spec,
      components: spec.semanticObjects!.map((o, i) => ({
        id: o.id,
        type: o.type === "API_GATEWAY" ? "api-gateway" : o.type === "KAFKA" ? "message-queue" : o.type === "MOBILE_APP" ? "browser-node" : "microservice-node",
        label: o.label ?? o.id,
        index: i,
      })),
      connections: (spec.semanticAnimations ?? [])
        .filter((a) => a.type === "travel" && a.from && a.to)
        .map((a) => ({ from: a.from!, to: a.to!, style: "orthogonal" as const })),
    };
  }, [spec, hasSemantic]);

  // V2 layout for TRAVEL dot: compute ELK positions to animate payment-request along edge
  const [laid, setLaid] = useState<GraphLayoutResult | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ width: number; height: number } | null>(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0) setBox({ width: w, height: h });
      }
    });
    ro.observe(el);
    // initial
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) setBox({ width: rect.width, height: rect.height });
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    if (!box || !hasSemantic) return;
    const comps = (legacySpec as any).components as any[];
    const conns = (legacySpec as any).connections as any[];
    layoutGraph(comps, conns, [], box.width, box.height, "DOWN", "layered", { top: 30, left: 60, right: 60, bottom: 40 }).then(setLaid).catch(() => setLaid(null));
  }, [box, hasSemantic, legacySpec]);

  // TRAVEL dot positions: for each active TRAVEL, interpolate along edge points
  const travelDots = useMemo(() => {
    if (!laid || activeAnimations.length === 0) return [];
    const nodesById = new Map(laid.nodes.map((n) => [n.id, n]));
    const dots: Array<{ key: string; x: number; y: number; anim: any }> = [];
    for (const anim of activeAnimations) {
      const t = String((anim as any).type ?? "").toLowerCase();
      if (t !== "travel") continue;
      const from = (anim as any).from;
      const to = (anim as any).to;
      if (!from || !to) continue;
      const fromNode = nodesById.get(from);
      const toNode = nodesById.get(to);
      if (!fromNode || !toNode) continue;
      const at = (anim as any).at ?? 0;
      const dur = (anim as any).duration ?? 1.2;
      const localT = Math.max(0, Math.min(1, (timeSec - at) / dur));
      if (localT <= 0 || localT >= 1) continue;
      const eased = Easing.out(Easing.cubic)(localT);
      // Use edge points if available, else straight line
      const edge = laid.edges.find((e) => e.from === from && e.to === to);
      let x: number, y: number;
      if (edge && edge.points.length >= 2) {
        // interpolate along polyline length
        const pts = edge.points;
        let total = 0;
        const segLens: number[] = [];
        for (let i = 1; i < pts.length; i++) {
          const dx = pts[i].x - pts[i - 1].x;
          const dy = pts[i].y - pts[i - 1].y;
          const len = Math.sqrt(dx * dx + dy * dy);
          segLens.push(len);
          total += len;
        }
        let target = eased * total;
        let acc = 0;
        x = pts[0].x;
        y = pts[0].y;
        for (let i = 0; i < segLens.length; i++) {
          if (target <= acc + segLens[i]) {
            const tSeg = segLens[i] === 0 ? 0 : (target - acc) / segLens[i];
            x = pts[i].x + (pts[i + 1].x - pts[i].x) * tSeg;
            y = pts[i].y + (pts[i + 1].y - pts[i].y) * tSeg;
            break;
          }
          acc += segLens[i];
        }
      } else {
        const fx = fromNode.x + fromNode.width / 2;
        const fy = fromNode.y + fromNode.height / 2;
        const tx = toNode.x + toNode.width / 2;
        const ty = toNode.y + toNode.height / 2;
        x = fx + (tx - fx) * eased;
        y = fy + (ty - fy) * eased;
      }
      dots.push({ key: `${from}-${to}-${at}`, x, y, anim });
    }
    return dots;
  }, [laid, activeAnimations, timeSec]);

  return (
    <div ref={containerRef} style={camStyle} data-camera-mode={spec.camera?.mode ?? "none"} data-active-anim={activeAnimations.map((a) => a.type).join(",")} data-testid="semantic-scene">
      <KarmaGraphScene spec={legacySpec as any} />
      {/* TRAVEL semantic animation: payment-request dot moving frame-by-frame */}
      {travelDots.map((d) => (
        <div
          key={d.key}
          data-testid="travel-dot"
          data-travel-object={(d.anim as any).object ?? "payment-request"}
          style={{
            position: "absolute",
            left: d.x - 8,
            top: d.y - 8,
            width: 16,
            height: 16,
            borderRadius: 999,
            background: "#0ea5e9",
            border: "2px solid #fff",
            boxShadow: "0 0 12px rgba(14,165,233,0.9), 0 2px 6px rgba(0,0,0,0.2)",
            zIndex: 4,
            pointerEvents: "none",
          }}
        />
      ))}
      {/* Active semantic animations overlay (debug / glow) — narration-synced */}
      {activeAnimations.length > 0 && (
        <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 6, zIndex: 5 }} data-testid="narration-sync-active">
          {activeAnimations.map((anim, i) => (
            <span
              key={`${anim.type}-${anim.object ?? anim.from ?? i}-${anim.at ?? 0}`}
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 0.6,
                padding: "4px 8px",
                borderRadius: 999,
                background: anim.type === "highlight" || anim.type === "focus" ? "rgba(99,102,241,0.9)" : "rgba(14,165,233,0.9)",
                color: "#fff",
                boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              {anim.type.toUpperCase()}
              {anim.object ? `:${anim.object}` : anim.to ? `:${anim.from}→${anim.to}` : ""}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
