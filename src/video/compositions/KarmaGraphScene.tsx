/** KarmaGraphScene - ELK auto-layout for diagram/flow scenes in the video path.
 *  Measures its own container (the graph area below the slide header) and computes
 *  absolute node/edge coordinates via the shared layout engine (`src/layout/layout.ts`)
 *  within THAT area, so the diagram is centered and never clipped. Reuses the static
 *  path's arrow geometry (`src/components/arrows.ts`) so arrows stay pixel-consistent.
 *  Nodes render as the normal HTML widgets, absolutely positioned.
 */

import React, { useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { RevealPacingContext, RevealScheduleContext } from "../../components/widgets/HtmlWidgets";
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

/**
 * Picks a layout direction instead of always going top-to-bottom. A simple chain
 * (every node has at most one incoming and one outgoing edge, nothing branches, no
 * containers) reads naturally left-to-right and — just as importantly — actually
 * uses a 16:9 frame's width; laid out DOWN it becomes a tall, narrow strip stranded
 * in a mostly-empty canvas. Anything with branching or grouping (a real hierarchy,
 * fan-out/fan-in) keeps the DOWN layout, which reads better for that shape.
 */
function graphDirection(
  components: GraphNodeInput[],
  connections: GraphEdgeInput[],
  containers: GraphContainerInput[],
): "DOWN" | "RIGHT" {
  if (containers.length > 0 || connections.length === 0) return "DOWN";
  const outDegree = new Map<string, number>();
  const inDegree = new Map<string, number>();
  for (const e of connections) {
    outDegree.set(e.from, (outDegree.get(e.from) ?? 0) + 1);
    inDegree.set(e.to, (inDegree.get(e.to) ?? 0) + 1);
  }
  const isChain = components.every(
    (c) => (outDegree.get(c.id) ?? 0) <= 1 && (inDegree.get(c.id) ?? 0) <= 1,
  );
  return isChain ? "RIGHT" : "DOWN";
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
function buildArrowLayer(
  input: GraphSceneInput,
  laid: GraphLayoutResult,
  theme: Theme,
  edgeOpacity: (to: string) => number = () => 1,
): string {
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
        arrows += `<g opacity="${edgeOpacity(e.to).toFixed(3)}">` + renderArrow(
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
        ) + `</g>`;
      }
      continue;
    }
    arrows += `<g opacity="${edgeOpacity(e.to).toFixed(3)}">` + renderArrow(
      { points: edge.points, label: e.label, labelBox: edge.label, style: (e.style ?? undefined) as any, kind: (e.kind ?? undefined) as any },
      `${e.from}_${e.to}_${idx}`,
      theme,
    ) + `</g>`;
  }
  return arrows;
}

/** Space kept around the fitted diagram inside the graph area (px). */
const FIT_MARGIN = 40;
/** Room for edge labels, which are drawn around edge midpoints outside node boxes (px). */
const EDGE_LABEL_ALLOWANCE = 30;

/** Bounding box of everything drawn: nodes, containers and edge routes (with label room). */
function contentBounds(laid: GraphLayoutResult): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const add = (x1: number, y1: number, x2: number, y2: number) => {
    minX = Math.min(minX, x1); minY = Math.min(minY, y1);
    maxX = Math.max(maxX, x2); maxY = Math.max(maxY, y2);
  };
  for (const n of laid.nodes) add(n.x, n.y, n.x + n.width, n.y + n.height);
  for (const c of laid.containers) add(c.x, c.y, c.x + c.width, c.y + c.height);
  for (const e of laid.edges) {
    if (e.label) add(e.label.x, e.label.y, e.label.x + e.label.width, e.label.y + e.label.height);
    for (const p of e.points) {
      add(p.x - EDGE_LABEL_ALLOWANCE, p.y - EDGE_LABEL_ALLOWANCE, p.x + EDGE_LABEL_ALLOWANCE, p.y + EDGE_LABEL_ALLOWANCE);
    }
  }
  if (!isFinite(minX)) return { minX: 0, minY: 0, maxX: laid.width, maxY: laid.height };
  return { minX, minY, maxX, maxY };
}

const MAX_GRAPH_SCALE = 1.8;
/** Widest a diagram node may be before its text wraps; code and terminals need more room. */
const MAX_NODE_WIDTH = 440;
const MAX_CODE_NODE_WIDTH = 640;
const CODE_NODE_TYPES = new Set(["code", "terminal", "terminal-window", "code-block"]);

/** Scale at which the laid-out content fills the graph box (capped at MAX_GRAPH_SCALE). */
function fitScale(laid: GraphLayoutResult, box: { width: number; height: number }): number {
  const b = contentBounds(laid);
  const availW = Math.max(1, box.width - 2 * FIT_MARGIN);
  const availH = Math.max(1, box.height - 2 * FIT_MARGIN);
  return Math.min(availW / Math.max(1, b.maxX - b.minX), availH / Math.max(1, b.maxY - b.minY), MAX_GRAPH_SCALE);
}

export const KarmaGraphScene: React.FC<GraphSceneProps> = ({ spec, theme }) => {
  const activeTheme = theme ?? getTheme(spec.theme);
  const input = useMemo(() => buildGraphInput(spec), [spec]);
  const { width: videoWidth, height: videoHeight } = useVideoConfig();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ width: number; height: number } | null>(null);
  const [laid, setLaid] = useState<GraphLayoutResult | null>(null);
  // 20s timeout: some headless Chromium configurations never fire a ResizeObserver
  // callback with a nonzero size for this element (confirmed in the containerized
  // Remotion renderer, even though the same code measures fine on a host browser).
  // Without a bound here, the delayRender() below is never released and the ENTIRE
  // render hangs indefinitely with zero progress and no error — this turns that into
  // a fast, loud failure instead, and the fallback box below usually avoids it entirely.
  const [handle] = useState(() => delayRender("graph-layout", { timeoutInMilliseconds: 20000 }));
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
      // Layout size, not getBoundingClientRect(): the latter includes ancestor transforms
      // (camera zoom, overflow fit), which fed back into the layout and shrank it every frame.
      const rect = { width: el.clientWidth, height: el.clientHeight };
      if (rect.width > 0 && rect.height > 0) {
        setBox((prev) =>
          prev && Math.abs(prev.width - rect.width) < 1 && Math.abs(prev.height - rect.height) < 1 ? prev : { width: rect.width, height: rect.height },
        );
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    // Fallback: if neither the synchronous check above nor the observer ever reports
    // a real size within 1.5s, fall back to the element's own client box, and failing
    // that the composition's own dimensions — always unblocks the layout effect below.
    const fallbackTimer = window.setTimeout(() => {
      setBox((prev) => {
        if (prev) return prev;
        const w = el.clientWidth || videoWidth;
        const h = el.clientHeight || Math.round(videoHeight * 0.7);
        return { width: w, height: h };
      });
    }, 1500);
    return () => {
      ro.disconnect();
      window.clearTimeout(fallbackTimer);
    };
  }, []);

  // ELK places nodes using the sizes it is given. Per-type size estimates never matched the
  // rendered widgets (a card's body text, a YAML block), so text spilled over arrows or got
  // clipped. Render each node once, invisibly, at its natural size and lay out with that.
  const measureRef = useRef<HTMLDivElement>(null);
  const [measured, setMeasured] = useState<Map<string, { width: number; height: number }> | null>(null);
  useLayoutEffect(() => {
    if (measured) return;
    const layer = measureRef.current;
    if (!layer) return;
    // Nodes that render nothing (or before layout) read 0; layoutGraph estimates those.
    const read = () => {
      const sizes = new Map<string, { width: number; height: number }>();
      for (const el of Array.from(layer.children) as HTMLElement[]) {
        const id = el.dataset.measureId;
        // offset* ignores the entrance transforms (spring scale) the widgets start with.
        if (id && el.offsetWidth > 0 && el.offsetHeight > 0) {
          sizes.set(id, { width: Math.ceil(el.offsetWidth), height: Math.ceil(el.offsetHeight) });
        }
      }
      return sizes;
    };
    const sizes = read();
    if (sizes.size > 0) {
      setMeasured(sizes);
      return;
    }
    // Nothing laid out yet: a render worker can mount the scene before the page has layout.
    // Waiting for a resize event here held the "graph-layout" delayRender until the render
    // timed out (the measuring layer itself never changes size). Re-measure every frame
    // until layout lands, and only fall back to estimated sizes if it never does.
    let raf = 0;
    const started = performance.now();
    const poll = () => {
      const later = read();
      if (later.size > 0 || performance.now() - started > 5000) setMeasured(later);
      else raf = requestAnimationFrame(poll);
    };
    raf = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(raf);
  });

  useEffect(() => {
    if (!box || !measured) return;
    let cancelled = false;
    // The shape heuristic picks the reading direction, but a tall DOWN graph in a 16:9 box
    // (three rows of cards with labelled arrows) can end up scaled below 1. Lay out both
    // directions and switch only when the other one renders clearly larger.
    const preferred = graphDirection(input.components, input.connections, input.containers);
    const other = preferred === "DOWN" ? "RIGHT" : "DOWN";
    const sized = input.components.map((c: any) => ({ ...c, ...measured.get(c.id) }));
    const layoutIn = (direction: "DOWN" | "RIGHT") =>
      layoutGraph(sized as any, input.connections as any, input.containers as any,
        box.width, box.height, direction, "layered", GRAPH_PADDING);
    Promise.all([layoutIn(preferred), layoutIn(other).catch(() => null)])
      .then(([first, second]) =>
        second && fitScale(second, box) > fitScale(first, box) * 1.15 ? second : first)
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
  }, [input, box, measured]);

  // If the component unmounts before the async layout resolves, release the render handle.
  useEffect(
    () => () => {
      release();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Each arrow fades in with its target node (same index * 5 * pacing delay as the node's
  // entrance), so arrows no longer point at boxes that have not appeared yet.
  const frame = useCurrentFrame();
  const pacing = useContext(RevealPacingContext);
  const schedule = useContext(RevealScheduleContext);
  const indexById = new Map(input.components.map((c: any, i: number) => [c.id, i]));
  const edgeOpacity = (to: string) => {
    const i = indexById.get(to);
    if (i === undefined) return 1;
    const start = schedule?.get(to) ?? i * 5 * pacing;
    return Math.min(1, Math.max(0, (frame - start) / 15));
  };
  const arrowSvg = laid && box ? buildArrowLayer(input, laid, activeTheme, edgeOpacity) : "";

  // ELK lays out nodes at their fixed pixel sizes (e.g. 200x120 for a microservice-node)
  // with no awareness of the actual canvas — a small graph (2-4 nodes) previously
  // rendered at that natural size and just sat centered in a mostly-empty frame. This
  // scales the whole laid-out graph up (or down, for an unusually large one) to make
  // good use of the measured box, capped so a trivial 2-node graph doesn't blow up to
  // an illegible, oversized diagram.
  const fit = laid && box
    ? (() => {
        // layoutGraph() reports the canvas size (== box) and centres the nodes inside it, so
        // fitting laid.width/height always gave scale ~1 and diagrams stayed at their small
        // natural size in a mostly empty frame. Fit the actual content bounds instead.
        const b = contentBounds(laid);
        const graphW = Math.max(1, b.maxX - b.minX);
        const graphH = Math.max(1, b.maxY - b.minY);
        const scale = fitScale(laid, box);
        return {
          scale,
          offsetX: (box.width - graphW * scale) / 2 - b.minX * scale,
          offsetY: (box.height - graphH * scale) / 2 - b.minY * scale,
        };
      })()
    : null;

  return (
    <div ref={wrapRef} className="relative w-full h-full overflow-hidden" style={{ zIndex: 1 }}>
      {!measured ? (
        <div ref={measureRef} aria-hidden style={{ position: "absolute", left: 0, top: 0, visibility: "hidden" }}>
          {input.components.map((c: any, i: number) => (
            <div
              key={c.id}
              data-measure-id={c.id}
              style={{
                position: "absolute",
                width: "max-content",
                maxWidth: CODE_NODE_TYPES.has(c.type) ? MAX_CODE_NODE_WIDTH : MAX_NODE_WIDTH,
              }}
            >
              {renderComponent(c, i)}
            </div>
          ))}
        </div>
      ) : null}
      {laid && box && fit ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: laid.width,
            height: laid.height,
            transform: `translate(${fit.offsetX}px, ${fit.offsetY}px) scale(${fit.scale})`,
            transformOrigin: "0 0",
          }}
        >
          <svg
            width={laid.width}
            height={laid.height}
            viewBox={`0 0 ${laid.width} ${laid.height}`}
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
        </div>
      ) : null}
    </div>
  );
};