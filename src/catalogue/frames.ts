/**
 * Frame catalogue — 45 frames, each declaring its slot content model.
 *
 * Slot contracts describe what the frame SHOULD accept. Where the shipped
 * implementation disagrees, `defect` records it — those are the seven frames that
 * currently place content by array index rather than by type, which is what produces
 * the dead space and overlaps.
 */
import type { FrameDef } from "./types";

export const FRAMES: FrameDef[] = [
  // ══════════════════════════════════════ HERO ══════════════════════════
  { id: "title-slide", title: "Title slide", family: "hero", status: "live", kind: "builtin",
    intent: ["HOOK"], fallback: "standard-content", motion: ["reveal", "zoom"],
    use: "Opening frame only. The frame title carries the message; components are supporting at most.",
    slots: [
      { id: "support", label: "supporting", accepts: ["prose", "metric", "callout"], min: 0, max: 2, droppable: true },
    ] },

  { id: "section-header", title: "Section header", family: "hero", status: "live", kind: "builtin",
    intent: ["EXPLAIN", "SEQUENCE"], fallback: "standard-content", motion: ["reveal"],
    use: "A divider between acts. Not for hooks — it renders too small to land a punchline.",
    slots: [
      { id: "support", label: "supporting", accepts: ["prose"], min: 0, max: 2, droppable: true },
    ] },

  { id: "end-card", title: "End card", family: "hero", status: "proposed", kind: "builtin",
    intent: ["RECAP"], fallback: "checklist-recap", motion: ["reveal"],
    use: "Closing call to action with up to two suggested next videos.",
    slots: [
      { id: "cta", label: "call to action", accepts: ["prose", "callout"], min: 1, max: 1 },
      { id: "next", label: "suggested next", accepts: ["prose", "media"], min: 0, max: 2, droppable: true },
    ] },

  // ══════════════════════════════════════ SPLIT ═════════════════════════
  { id: "two-column", title: "Two column", family: "split", status: "live", kind: "builtin",
    intent: ["EXPLAIN", "DEMONSTRATE"], fallback: "standard-content", motion: ["highlight", "reveal", "zoom"],
    use: "Narrative on the left, the thing it refers to on the right. Needs content on both sides.",
    defect: "Splits by type only (text vs everything else); bullet-list is misfiled as media, and one component leaves a whole column empty.",
    slots: [
      { id: "left", label: "narrative", accepts: ["prose", "list", "callout"], min: 1, max: 4 },
      { id: "right", label: "evidence", accepts: ["code", "media", "callout", "entity", "metric"], min: 1, max: 3 },
    ] },

  { id: "split-image", title: "Split image", family: "split", status: "live", kind: "builtin",
    intent: ["EXPLAIN"], fallback: "two-column", motion: ["highlight", "zoom"],
    use: "Text beside one dominant visual. Exactly one visual — extra ones belong in a grid.",
    defect: "Shares two-column's blind split, so the visual pane can receive four stacked items.",
    slots: [
      { id: "text", label: "narrative", accepts: ["prose", "list"], min: 1, max: 3 },
      { id: "visual", label: "single visual", accepts: ["media", "entity"], min: 1, max: 1 },
    ] },

  { id: "comparison", title: "Comparison", family: "split", status: "live", kind: "builtin",
    intent: ["COMPARE"], fallback: "standard-content", motion: ["highlight", "reveal"],
    use: "Two alternatives weighed against each other. Three or more belongs in a matrix.",
    defect: "Inherits two-column's text/media split; a comparison is A-versus-B by meaning, never by component type.",
    slots: [
      { id: "a", label: "option A", accepts: ["prose", "list", "code", "media", "callout", "metric"], min: 1, max: 4 },
      { id: "b", label: "option B", accepts: ["prose", "list", "code", "media", "callout", "metric"], min: 1, max: 4 },
    ] },

  { id: "before-after", title: "Before / after", family: "split", status: "proposed", kind: "builtin",
    intent: ["RESOLVE"], fallback: "comparison", motion: ["highlight", "reveal"],
    use: "The same subject in two states with the transform named on the arrow. Not two alternatives.",
    slots: [
      { id: "before", label: "before", accepts: ["prose", "list", "code", "media", "entity"], min: 1, max: 3 },
      { id: "after", label: "after", accepts: ["prose", "list", "code", "media", "entity"], min: 1, max: 3 },
    ] },

  { id: "code-diff", title: "Code diff", family: "split", status: "proposed", kind: "builtin",
    intent: ["RESOLVE", "DEMONSTRATE"], fallback: "code-explainer", motion: ["highlight"],
    use: "The fix reveal — removed lines left, added lines right.",
    slots: [
      { id: "before", label: "before", accepts: ["code"], min: 1, max: 1 },
      { id: "after", label: "after", accepts: ["code"], min: 1, max: 1 },
    ] },

  { id: "api-exchange", title: "API exchange", family: "split", status: "proposed", kind: "builtin",
    intent: ["DEMONSTRATE", "EXPLAIN"], fallback: "code-diff", motion: ["highlight", "reveal"],
    use: "A request and its response with the status code. Not a diff, not console output.",
    slots: [
      { id: "request", label: "request", accepts: ["code"], min: 1, max: 1 },
      { id: "response", label: "response", accepts: ["code"], min: 1, max: 1 },
    ] },

  { id: "do-dont", title: "Do / don't", family: "split", status: "proposed", kind: "builtin",
    intent: ["RESOLVE", "COMPARE"], fallback: "comparison", motion: ["reveal"],
    use: "Prescriptive right versus wrong, with tick and cross. Temporal cases use before-after.",
    slots: [
      { id: "dont", label: "incorrect", accepts: ["code", "prose", "list", "media"], min: 1, max: 3 },
      { id: "do", label: "correct", accepts: ["code", "prose", "list", "media"], min: 1, max: 3 },
    ] },

  { id: "myth-fact", title: "Myth / fact", family: "split", status: "proposed", kind: "builtin",
    intent: ["DIAGNOSE", "EXPLAIN"], fallback: "before-after", motion: ["reveal", "highlight"],
    use: "Strike through a common misconception, then state the correction.",
    slots: [
      { id: "myth", label: "myth", accepts: ["prose", "callout"], min: 1, max: 1 },
      { id: "fact", label: "fact", accepts: ["prose", "callout", "code"], min: 1, max: 2 },
    ] },

  // ═══════════════════════════════════ SEQUENCE ═════════════════════════
  { id: "roadmap-timeline", title: "Roadmap timeline", family: "sequence", status: "live", kind: "builtin",
    intent: ["SEQUENCE", "RECAP"], fallback: "standard-content", motion: ["reveal", "highlight"],
    use: "Ordered steps lighting up in turn. Status drives each marker.",
    slots: [
      { id: "steps", label: "steps", accepts: ["step", "prose", "callout"], min: 2, max: 5 },
    ] },

  { id: "infographic", title: "Infographic", family: "sequence", status: "live", kind: "builtin",
    intent: ["SEQUENCE", "EXPLAIN"], fallback: "standard-content", motion: ["reveal"],
    use: "Vertical numbered flow, top to bottom.",
    slots: [
      { id: "steps", label: "steps", accepts: ["step", "prose", "callout", "media"], min: 2, max: 5 },
    ] },

  { id: "sequence-flow", title: "Sequence flow", family: "sequence", status: "proposed", kind: "builtin",
    intent: ["SEQUENCE", "EXPLAIN"], fallback: "architecture-diagram", motion: ["reveal", "highlight", "pan"],
    use: "A payload travelling hop to hop, one hop per narration beat.",
    slots: [
      { id: "hops", label: "hops", accepts: ["entity"], min: 2, max: 5 },
      { id: "payload", label: "payload", accepts: ["callout", "prose"], min: 0, max: 1, droppable: true },
    ] },

  { id: "timeline-chronology", title: "Chronology", family: "sequence", status: "proposed", kind: "builtin",
    intent: ["EXPLAIN", "SEQUENCE"], fallback: "roadmap-timeline", motion: ["reveal", "highlight"],
    use: "Dated milestones spaced proportionally, not evenly. Version histories.",
    slots: [
      { id: "marks", label: "milestones", accepts: ["step", "prose", "metric"], min: 2, max: 6 },
    ] },

  // ═══════════════════════════════════ SURFACE ══════════════════════════
  { id: "code-explainer", title: "Code explainer", family: "surface", status: "live", kind: "builtin",
    intent: ["DEMONSTRATE", "EXPLAIN"], fallback: "two-column", motion: ["highlight", "zoom"],
    use: "Explanation beside a code window. The reference implementation of a correct slot rule.",
    slots: [
      { id: "explanation", label: "explanation", accepts: ["prose", "list", "callout"], min: 0, max: 4 },
      { id: "code", label: "code", accepts: ["code"], min: 1, max: 2 },
    ] },

  { id: "terminal-walkthrough", title: "Terminal walkthrough", family: "surface", status: "live", kind: "builtin",
    intent: ["DEMONSTRATE"], fallback: "code-explainer", motion: ["reveal"],
    use: "CLI session, commands revealed in order.",
    slots: [
      { id: "lines", label: "commands", accepts: ["code", "output", "prose"], min: 1, max: 10 },
    ] },

  { id: "code-output", title: "Code and output", family: "surface", status: "proposed", kind: "builtin",
    intent: ["DEMONSTRATE", "DIAGNOSE"], fallback: "code-explainer", motion: ["highlight", "reveal"],
    use: "Run it and show the result — the surprising line gets marked.",
    slots: [
      { id: "code", label: "code", accepts: ["code"], min: 1, max: 1 },
      { id: "output", label: "output", accepts: ["output"], min: 1, max: 1 },
    ] },

  // ═══════════════════════════════════ FOCUS ════════════════════════════
  { id: "big-number", title: "Big number", family: "focus", status: "live", kind: "builtin",
    intent: ["HOOK", "RESOLVE"], fallback: "standard-content", motion: ["count", "zoom"],
    use: "One metric that carries the whole scene.",
    defect: "Takes components[0] as the value and [1] as the caption — wrong whenever the script orders them differently.",
    slots: [
      { id: "metric", label: "metric", accepts: ["metric"], min: 1, max: 1 },
      { id: "caption", label: "caption", accepts: ["prose"], min: 0, max: 1, droppable: true },
    ] },

  { id: "quote", title: "Quote", family: "focus", status: "live", kind: "builtin",
    intent: ["HOOK", "EXPLAIN"], fallback: "standard-content", motion: ["reveal"],
    use: "One attributed quotation, centred.",
    slots: [
      { id: "quote", label: "quote", accepts: ["callout", "prose"], min: 1, max: 1 },
    ] },

  { id: "statement", title: "Statement", family: "focus", status: "proposed", kind: "builtin",
    intent: ["HOOK", "DIAGNOSE"], fallback: "section-header", motion: ["reveal", "zoom"],
    use: "A full-bleed punchline, twelve words or fewer. The frame that actually lands a hook.",
    slots: [
      { id: "statement", label: "statement", accepts: ["prose"], min: 1, max: 1 },
      { id: "sub", label: "sub-line", accepts: ["prose"], min: 0, max: 1, droppable: true },
    ] },

  { id: "metric-trio", title: "Metric trio", family: "focus", status: "proposed", kind: "builtin",
    intent: ["RESOLVE", "RECAP"], fallback: "big-number", motion: ["count", "reveal"],
    use: "Two or three headline numbers side by side.",
    slots: [
      { id: "metrics", label: "metrics", accepts: ["metric"], min: 2, max: 3 },
    ] },

  { id: "trend-chart", title: "Trend chart", family: "focus", status: "proposed", kind: "builtin",
    intent: ["EXPLAIN", "DIAGNOSE"], fallback: "big-number", motion: ["draw", "highlight"],
    use: "A value over time with annotated thresholds. Today line-chart degrades to bars, so trends cannot be drawn.",
    slots: [
      { id: "series", label: "series", accepts: ["media"], min: 1, max: 2 },
      { id: "marks", label: "annotations", accepts: ["callout"], min: 0, max: 3, droppable: true },
    ] },

  { id: "benchmark-bars", title: "Benchmark bars", family: "focus", status: "proposed", kind: "builtin",
    intent: ["COMPARE", "RESOLVE"], fallback: "metric-trio", motion: ["draw", "highlight"],
    use: "Horizontal bars comparing options, winner accented.",
    slots: [
      { id: "bars", label: "results", accepts: ["metric", "media"], min: 2, max: 5 },
    ] },

  { id: "error-focus", title: "Error focus", family: "focus", status: "proposed", kind: "builtin",
    intent: ["DIAGNOSE"], fallback: "code-output", motion: ["highlight", "zoom"],
    use: "A stack trace with the relevant frame highlighted and library frames dimmed.",
    slots: [
      { id: "trace", label: "stack trace", accepts: ["output"], min: 1, max: 1 },
      { id: "note", label: "diagnosis", accepts: ["prose", "callout"], min: 0, max: 1, droppable: true },
    ] },

  // ════════════════════════════════════ GRID ════════════════════════════
  { id: "feature-grid", title: "Feature grid", family: "grid", status: "live", kind: "builtin",
    intent: ["EXPLAIN", "RECAP"], fallback: "standard-content", motion: ["reveal", "highlight"],
    use: "Even grid of cards; column count adapts to how many there are. Already correct.",
    slots: [
      { id: "cells", label: "cards", accepts: ["callout", "metric", "entity", "prose"], min: 2, max: 8 },
    ] },

  { id: "bento", title: "Bento", family: "grid", status: "live", kind: "builtin",
    intent: ["RECAP", "EXPLAIN"], fallback: "feature-grid", motion: ["reveal"],
    use: "Asymmetric grid where tile size reflects importance.",
    defect: "Assigns tile spans by array index — components[0] gets the 2x2 hero tile whatever it happens to be.",
    slots: [
      { id: "hero", label: "hero tile", accepts: ["metric", "media"], min: 1, max: 1 },
      { id: "wide", label: "wide tile", accepts: ["prose", "list", "callout"], min: 0, max: 1, droppable: true },
      { id: "tall", label: "tall tile", accepts: ["list", "callout"], min: 0, max: 1, droppable: true },
      { id: "small", label: "small tiles", accepts: ["callout", "metric", "entity"], min: 0, max: 4, droppable: true },
    ] },

  { id: "dashboard", title: "Dashboard", family: "grid", status: "live", kind: "builtin",
    intent: ["EXPLAIN", "RESOLVE"], fallback: "feature-grid", motion: ["reveal", "count"],
    use: "Metrics rail beside charts and a main panel.",
    defect: "Routes components to the sidebar with i % 3 === 0 — arbitrary modulo with no relation to what the component is.",
    slots: [
      { id: "rail", label: "metrics rail", accepts: ["metric", "callout"], min: 1, max: 4 },
      { id: "kpi", label: "KPI row", accepts: ["media", "metric"], min: 0, max: 2, droppable: true },
      { id: "main", label: "main panel", accepts: ["media", "prose", "list", "entity", "code"], min: 1, max: 4 },
    ] },

  { id: "matrix", title: "Matrix", family: "grid", status: "proposed", kind: "builtin",
    intent: ["COMPARE"], fallback: "comparison", motion: ["reveal", "highlight"],
    use: "Three or more options scored across criteria. Uses the table widget, which already exists unused.",
    slots: [
      { id: "table", label: "decision table", accepts: ["media"], min: 1, max: 1 },
    ] },

  { id: "quadrant", title: "Quadrant", family: "grid", status: "proposed", kind: "builtin",
    intent: ["COMPARE", "EXPLAIN"], fallback: "feature-grid", motion: ["reveal", "highlight"],
    use: "Trade-off positioning on two axes.",
    slots: [
      { id: "points", label: "plotted items", accepts: ["entity", "callout", "metric"], min: 2, max: 8 },
    ] },

  { id: "memory-grid", title: "Memory grid", family: "grid", status: "proposed", kind: "builtin",
    intent: ["EXPLAIN", "DIAGNOSE"], fallback: "feature-grid", motion: ["highlight", "reveal"],
    use: "Indexed cells — arrays, cache lines, heap regions. Position is the point.",
    slots: [
      { id: "cells", label: "cells", accepts: ["media"], min: 1, max: 1 },
      { id: "legend", label: "legend", accepts: ["callout", "prose"], min: 0, max: 2, droppable: true },
    ] },

  { id: "cheat-sheet", title: "Cheat sheet", family: "grid", status: "proposed", kind: "builtin",
    intent: ["RECAP", "EXPLAIN"], fallback: "feature-grid", motion: ["reveal"],
    use: "Dense reference grid built to be paused and screenshotted. No entrance stagger.",
    slots: [
      { id: "entries", label: "entries", accepts: ["prose", "code", "callout"], min: 4, max: 12 },
    ] },

  // ═══════════════════════════════════ GRAPH ════════════════════════════
  { id: "architecture-diagram", title: "Architecture diagram", family: "graph", status: "live", kind: "builtin",
    intent: ["EXPLAIN", "SEQUENCE"], fallback: "feature-grid", motion: ["draw", "highlight", "pan"],
    use: "Nodes and edges positioned by the ELK layout engine. The one frame with real adaptive layout.",
    slots: [
      { id: "nodes", label: "nodes", accepts: ["entity"], min: 2, max: 8 },
      { id: "edges", label: "connections", accepts: ["relation"], min: 0, max: 12, droppable: true },
    ] },

  { id: "state-machine", title: "State machine", family: "graph", status: "proposed", kind: "builtin",
    intent: ["EXPLAIN", "SEQUENCE"], fallback: "architecture-diagram", motion: ["highlight", "draw"],
    use: "States in a ring with labelled transitions. Thread lifecycle cycles, so a linear timeline misrepresents it.",
    slots: [
      { id: "states", label: "states", accepts: ["state", "entity"], min: 3, max: 7 },
      { id: "transitions", label: "transitions", accepts: ["relation"], min: 0, max: 12, droppable: true },
    ] },

  { id: "hierarchy-tree", title: "Hierarchy tree", family: "graph", status: "proposed", kind: "builtin",
    intent: ["EXPLAIN"], fallback: "architecture-diagram", motion: ["reveal", "highlight"],
    use: "Parent-child structure — inheritance, exception hierarchies, decision trees.",
    slots: [
      { id: "nodes", label: "nodes", accepts: ["entity", "state"], min: 2, max: 12 },
    ] },

  { id: "file-tree", title: "File tree", family: "graph", status: "proposed", kind: "builtin",
    intent: ["EXPLAIN", "DEMONSTRATE"], fallback: "standard-content", motion: ["reveal", "highlight"],
    use: "Project structure, indented, with the file under discussion highlighted.",
    slots: [
      { id: "paths", label: "paths", accepts: ["prose", "entity"], min: 2, max: 12 },
    ] },

  // ═══════════════════════════════════ LANES ════════════════════════════
  { id: "parallel-lanes", title: "Parallel lanes", family: "lanes", status: "proposed", kind: "builtin",
    intent: ["EXPLAIN", "DIAGNOSE"], fallback: "comparison", motion: ["reveal", "highlight"],
    use: "Two actors executing simultaneously over a shared resource — the actual explanation of a race condition.",
    slots: [
      { id: "lanes", label: "lanes", accepts: ["group", "step", "entity"], min: 2, max: 3 },
      { id: "shared", label: "shared resource", accepts: ["metric", "entity", "callout"], min: 0, max: 1, droppable: true },
    ] },

  { id: "sequence-diagram", title: "Sequence diagram", family: "lanes", status: "proposed", kind: "builtin",
    intent: ["SEQUENCE", "EXPLAIN"], fallback: "sequence-flow", motion: ["reveal", "highlight"],
    use: "Lifelines with messages between them. All three widgets already exist and are unreachable.",
    slots: [
      { id: "lifelines", label: "participants", accepts: ["entity"], min: 2, max: 5 },
      { id: "messages", label: "messages", accepts: ["relation"], min: 1, max: 10 },
    ] },

  // ══════════════════════════════════ DISSECT ═══════════════════════════
  { id: "annotated-diagram", title: "Annotated diagram", family: "dissect", status: "proposed", kind: "builtin",
    intent: ["EXPLAIN"], fallback: "infographic", motion: ["highlight", "reveal", "zoom"],
    use: "One visual dissected part by part with numbered pins — the closest thing to a presenter pointing.",
    slots: [
      { id: "subject", label: "central visual", accepts: ["media", "entity"], min: 1, max: 1 },
      { id: "pins", label: "annotations", accepts: ["callout", "prose"], min: 1, max: 6 },
    ] },

  { id: "layered-stack", title: "Layered stack", family: "dissect", status: "proposed", kind: "builtin",
    intent: ["EXPLAIN"], fallback: "infographic", motion: ["reveal", "highlight"],
    use: "Horizontal bands — JVM memory areas, cache hierarchy, network layers.",
    slots: [
      { id: "bands", label: "layers", accepts: ["entity", "prose", "callout"], min: 2, max: 6 },
    ] },

  { id: "anatomy-breakdown", title: "Anatomy breakdown", family: "dissect", status: "proposed", kind: "builtin",
    intent: ["EXPLAIN"], fallback: "code-explainer", motion: ["highlight", "reveal"],
    use: "Dissect one line, signature, URL or command with labelled brackets under each segment.",
    slots: [
      { id: "subject", label: "subject", accepts: ["code", "prose"], min: 1, max: 1 },
      { id: "parts", label: "labelled parts", accepts: ["prose", "callout"], min: 2, max: 6 },
    ] },

  { id: "acronym-breakdown", title: "Acronym breakdown", family: "dissect", status: "proposed", kind: "builtin",
    intent: ["EXPLAIN", "RECAP"], fallback: "infographic", motion: ["reveal", "highlight"],
    use: "ACID, SOLID, CAP — each letter expanding into what it stands for, one per beat.",
    slots: [
      { id: "letters", label: "letters", accepts: ["prose", "callout"], min: 3, max: 6 },
    ] },

  // ═════════════════════════════════ DOCUMENT ═══════════════════════════
  { id: "standard-content", title: "Standard content", family: "document", status: "live", kind: "builtin",
    intent: ["EXPLAIN", "RECAP"], fallback: null, motion: ["reveal", "highlight"],
    use: "The universal fallback. A single readable column; splits to two past six items.",
    defect: "Unbounded single stack — long scenes run past the bottom of the frame.",
    slots: [
      { id: "body", label: "body", accepts: ["prose", "list", "code", "media", "callout", "metric", "entity", "step"], min: 1, max: 12 },
    ] },

  { id: "checklist-recap", title: "Checklist recap", family: "document", status: "proposed", kind: "builtin",
    intent: ["RECAP"], fallback: "standard-content", motion: ["reveal", "highlight"],
    use: "The mandated closing beat — numbered solved items ticking off, then the call to action.",
    slots: [
      { id: "items", label: "solved items", accepts: ["step", "prose", "callout"], min: 2, max: 6 },
      { id: "cta", label: "call to action", accepts: ["prose", "callout"], min: 0, max: 1, droppable: true },
    ] },

  { id: "definition-card", title: "Definition card", family: "document", status: "proposed", kind: "builtin",
    intent: ["EXPLAIN"], fallback: "standard-content", motion: ["reveal", "highlight"],
    use: "Introduce a term precisely — term, meaning, then a minimal example.",
    slots: [
      { id: "term", label: "term", accepts: ["prose"], min: 1, max: 1 },
      { id: "meaning", label: "meaning", accepts: ["prose"], min: 1, max: 1 },
      { id: "example", label: "example", accepts: ["code"], min: 0, max: 1, droppable: true },
    ] },
];

export const FRAMES_BY_ID: Record<string, FrameDef> = Object.fromEntries(
  FRAMES.map((f) => [f.id, f]),
);

export function lookupFrame(id?: string | null) {
  if (!id) return null;
  return FRAMES_BY_ID[String(id).trim().toLowerCase()] ?? null;
}
