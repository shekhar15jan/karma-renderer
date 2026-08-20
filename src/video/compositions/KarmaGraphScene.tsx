/** KarmaGraphScene - ELK auto-layout for diagram/flow scenes in the video path.
 *  Measures its own container (the graph area below the slide header) and computes
 *  absolute node/edge coordinates via the shared layout engine (`src/layout/layout.ts`)
 *  within THAT area, so the diagram is centered and never clipped. Reuses the static
 *  path's arrow geometry (`src/components/arrows.ts`) so arrows stay pixel-consistent.
 *  Nodes render as the normal HTML widgets, absolutely positioned.
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { continueRender, delayRender } from "remotion";
import type { Theme } from "../../theme/themes";
import { getTheme } from "../../theme/themes";
import { layoutGraph, type GraphLayoutResult } from "../../layout/layout";
import { renderArrow } from "../../components/arrows";
import { renderComponent } from "./KarmaComponentRenderer";

/** Margin kept between the graph and the graph-area edges (the slide header is already above). */
const GRAPH_PADDING = { top: 30, left: 60, right: 60, bottom: 40 };

interface GraphNodeInput {
  id: string;
  type: string;
  label?: string;
  sublabel?: string;
  data?: Record<string, unknown>;
  index: number;
}

interface GraphEdgeInput {
  from: string;
  to: string;
  label?: string;
  style?: string;
  kind?: string;
}

interface GraphContainerInput {
  id: string;
  label?: string;
  children: string[];
}

interface GraphSceneInput {
  components: GraphNodeInput[];
  connections: GraphEdgeInput[];
  containers: GraphContainerInput[];
}

interface GraphSceneProps {
  spec: any;
  theme?: Theme;
}

function buildGraphInput(spec: any): GraphSceneInput {
  const components: GraphNodeInput[] = (spec.components ?? []).map((c: any, i: number) => ({
    ...c,
    id: c.id ?? `c${i}`,
    index: i,
  }));
  const idByLabel = new Map<string, string>();
  for (const c of components) {
    if (c.label && String(c.label).trim()) idByLabel.set(String(c.label).trim(), c.id);
  }
  const resolveId = (ref: any): string | undefined => {
    if (ref == null) return undefined;
    const raw = String(ref);
    if (components.some((c) => c.id === raw)) return raw;
    return idByLabel.get(raw.trim());
  };
  const connections: GraphEdgeInput[] = (spec.connections ?? [])
    .map((e: any) => ({ ...e, from: resolveId(e.from) ?? e.from, to: resolveId(e.to) ?? e.to }))
    .filter(
      (e: any) =>
        e.from != null &&
        e.to != null &&
        components.some((c) => c.id === e.from) &&
        components.some((c) => c.id === e.to),
    );
  const containers: GraphContainerInput[] = (spec.containers ?? []).map((c: any) => ({
    id: c.id ?? `con${Math.random().toString(36).slice(2, 8)}`,
    label: c.label,
    children: c.children ?? c.componentIds ?? [],
  }));
  return { components, connections, containers };
}

/** Renders markers + arrows as a single SVG fragment, mirroring renderGraphScene. */
function buildArrowLayer(input: GraphSceneInput, laid: GraphLayoutResult, theme: Theme): string {
  const placedById = new Map(laid.nodes.map((n) => [n.id, n]));
  let arrows = "";
  const connByKey = new Map<string, number>();
  for (const e of input.connections) {
    const key = `${e.from}|${e.to}`;
    const idx = connByKey.get(key) ?? 0;
    connByKey.set(key, idx + 1);
    const edge = laid.edges.filter((x) => x.from === e.from && x.to === e.to)[idx];
    if (!edge || edge.points.length < 2) {
      const f = placedById.get(e.from);
      const t = placedById.get(e.to);
      if (f && t) {
        arrows += renderArrow(
          {
            points: [
              { x: f.x + f.width / 2, y: f.y + f.height / 2 },
              { x: t.x + t.width / 2, y: t.y + t.height / 2 },
            ],
            label: e.label,
            style: (e.style ?? undefined) as any,
            kind: (e.kind ?? undefined) as any,
          },
          `${e.from}_${e.to}_${idx}`,
          theme,
        );
      }
      continue;
    }
    arrows += renderArrow(
      { points: edge.points, label: e.label, style: (e.style ?? undefined) as any, kind: (e.kind ?? undefined) as any },
      `${e.from}_${e.to}_${idx}`,
      theme,
    );
  }
  return arrows;
}

export const KarmaGraphScene: React.FC<GraphSceneProps> = ({ spec, theme }) => {
  const activeTheme = theme ?? getTheme(spec.theme);
  const input = useMemo(() => buildGraphInput(spec), [spec]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ width: number; height: number } | null>(null);
  const [laid, setLaid] = useState<GraphLayoutResult | null>(null);
  const [handle] = useState(() => delayRender("graph-layout"));
  const released = useRef(false);
  const release = () => {
    if (!released.current) {
      released.current = true;
      continueRender(handle);
    }
  };

  // Measure the actual graph area (below the slide header) so ELK lays out within it.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setBox((prev) =>
          prev && Math.abs(prev.width - rect.width) < 1 && Math.abs(prev.height - rect.height) < 1 ? prev : { width: rect.width, height: rect.height },
        );
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!box) return;
    let cancelled = false;
    layoutGraph(
      input.components as any,
      input.connections as any,
      input.containers as any,
      box.width,
      box.height,
      "DOWN",
      "layered",
      GRAPH_PADDING,
    )
      .then((r) => {
        if (cancelled) return;
        setLaid(r);
        release();
      })
      .catch(() => {
        if (cancelled) return;
        setLaid(null);
        release();
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, box]);

  // If the component unmounts before the async layout resolves, release the render handle.
  useEffect(
    () => () => {
      release();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const arrowSvg = laid && box ? buildArrowLayer(input, laid, activeTheme) : "";

  return (
    <div ref={wrapRef} className="relative w-full h-full overflow-hidden" style={{ zIndex: 1 }}>
      {laid && box ? (
        <>
          <svg
            width={box.width}
            height={box.height}
            viewBox={`0 0 ${box.width} ${box.height}`}
            xmlns="http://www.w3.org/2000/svg"
            style={{ position: "absolute", left: 0, top: 0, zIndex: 1, pointerEvents: "none" }}
          >
            <g dangerouslySetInnerHTML={{ __html: arrowSvg }} />
          </svg>

          {laid.containers.map((con) => {
            const def = input.containers.find((c) => c.id === con.id);
            const label = def?.label ?? con.id;
            return (
              <div
                key={con.id}
                className="absolute rounded-2xl border-2"
                style={{
                  left: con.x,
                  top: con.y,
                  width: con.width,
                  height: con.height,
                  borderColor: activeTheme.border,
                  background: "rgba(255,255,255,0.04)",
                  zIndex: 0,
                }}
              >
                <div
                  className="px-4 py-1 text-sm font-bold rounded-full inline-block"
                  style={{ color: "#fff", background: activeTheme.primary, margin: 8 }}
                >
                  {label}
                </div>
              </div>
            );
          })}

          {laid.nodes.map((n) => {
            const c = input.components[n.index];
            if (!c) return null;
            return (
              <div
                key={n.id}
                className="absolute flex items-center justify-center"
                style={{ left: n.x, top: n.y, width: n.width, height: n.height, zIndex: 2 }}
              >
                {renderComponent(c, n.index)}
              </div>
            );
          })}
        </>
      ) : null}
    </div>
  );
};