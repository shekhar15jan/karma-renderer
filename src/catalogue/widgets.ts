/**
 * Widget catalogue — the inline elements a slot may contain.
 *
 * `requires` / `optional` were extracted from the actual field reads in
 * renderComponentRaw (KarmaComponentRenderer.tsx), not authored from memory, so a
 * widget listed here as requiring `data.text` genuinely renders empty without it.
 */
import type { WidgetDef } from "./types";

export const WIDGETS: WidgetDef[] = [
  // ---- text -------------------------------------------------------------
  { id: "heading", atom: "prose", title: "Heading", status: "live",
    requires: ["label"], optional: [], aliases: ["title"],
    use: "A short line of emphasis inside a slot. Not the frame title." },
  { id: "paragraph", atom: "prose", title: "Paragraph", status: "live",
    requires: ["data.body"], optional: ["sublabel"], aliases: ["text"],
    use: "Condensed supporting sentence. Never the narration verbatim." },
  { id: "bullet-list", atom: "list", title: "Bullet list", status: "live",
    requires: ["data.items"], optional: [],
    use: "Three to six short items. Items are labels, not sentences." },

  // ---- code & streams ---------------------------------------------------
  { id: "code", atom: "code", title: "Code block", status: "live",
    requires: ["data.text"], optional: ["data.lang"], aliases: ["command"],
    use: "Source with syntax highlighting. Keep to what fits without scrolling." },

  // ---- cards ------------------------------------------------------------
  { id: "card", atom: "callout", title: "Card", status: "live",
    requires: [], optional: ["label", "sublabel", "data.body", "data.message", "data.value", "data.unit", "data.tone", "items"],
    aliases: ["comparison", "banner", "pillar"],
    use: "Generic labelled block. Prefer a more specific card when one fits." },
  { id: "info-card", atom: "callout", title: "Info card", status: "live",
    requires: ["label"], optional: ["data.body", "sublabel"],
    use: "Neutral aside or definition." },
  { id: "warning-card", atom: "callout", title: "Warning card", status: "live",
    requires: ["label"], optional: ["data.body", "data.value"],
    use: "A hazard, pitfall, or failure condition. Carries the warning icon." },
  { id: "stat-card", atom: "metric", title: "Stat card", status: "live",
    requires: ["data.value"], optional: ["label", "data.unit", "sublabel"],
    use: "A single number with its label." },
  { id: "quote-card", atom: "callout", title: "Quote card", status: "live",
    requires: ["data.quote"], optional: ["data.author"],
    use: "An attributed quotation." },
  { id: "profile-card", atom: "entity", title: "Profile card", status: "live",
    requires: ["label"], optional: ["data.role", "data.avatar", "sublabel"],
    use: "A person or persona." },

  // ---- data -------------------------------------------------------------
  { id: "bar-chart", atom: "media", title: "Bar chart", status: "live",
    requires: ["data.items"], optional: ["data.max"], aliases: ["line-chart"],
    use: "Compare magnitudes. Items need label and value." },
  { id: "donut-chart", atom: "media", title: "Donut chart", status: "live",
    requires: ["data.items"], optional: [], aliases: ["gauge", "radar", "pie-chart"],
    use: "Parts of a whole. Four segments maximum stays readable." },
  { id: "progress-bar", atom: "metric", title: "Progress bar", status: "live",
    requires: ["data.value"], optional: ["label", "data.color"], aliases: ["progress"],
    use: "Completion or utilisation, 0 to 100." },
  { id: "table", atom: "media", title: "Table", status: "live",
    requires: ["columns"], optional: ["items", "data.items"],
    use: "Structured rows and columns. Backing widget for the matrix frame." },
  { id: "badge", atom: "callout", title: "Badge", status: "live",
    requires: ["label"], optional: ["data.tone"],
    use: "A short status or tag chip." },

  // ---- technology marks -------------------------------------------------
  { id: "tech-node", atom: "entity", title: "Technology node", status: "live",
    requires: ["data.tech"], optional: ["label", "sublabel", "data.size"], aliases: ["tech"],
    use: "A named service or component carrying its real brand mark." },
  { id: "tech-icon", atom: "entity", title: "Technology icon", status: "live",
    requires: ["data.tech"], optional: ["data.size"],
    use: "The brand mark alone, no label." },
  { id: "tech-stack", atom: "entity", title: "Technology stack", status: "live",
    requires: ["data.items"], optional: ["data.size", "data.showLabels"],
    use: "A row of marks — 'here is the stack' in one line." },

  // ---- architecture nodes ----------------------------------------------
  { id: "microservice-node", atom: "entity", title: "Microservice", status: "live",
    requires: ["label"], optional: ["data.stack", "data.tech"], use: "A service in a topology." },
  { id: "api-gateway", atom: "entity", title: "API gateway", status: "live",
    requires: ["label"], optional: ["data.tech"], use: "Edge entry point." },
  { id: "message-queue", atom: "entity", title: "Message queue", status: "live",
    requires: ["label"], optional: ["data.tech"], use: "Broker or topic." },
  { id: "docker-node", atom: "entity", title: "Container", status: "live",
    requires: ["label"], optional: ["data.tech"], use: "A container instance." },
  { id: "kubernetes-node", atom: "entity", title: "Kubernetes", status: "live",
    requires: ["label"], optional: ["data.pods", "data.tech"], use: "A cluster or pod group." },
  { id: "logging-node", atom: "entity", title: "Logging", status: "live",
    requires: ["label"], optional: ["data.tech"], use: "Log sink or observability stop." },
  { id: "browser-node", atom: "entity", title: "Client", status: "live",
    requires: ["label"], optional: ["data.tech"], use: "Browser or mobile client." },
  { id: "aws-node", atom: "entity", title: "AWS service", status: "live",
    requires: ["label"], optional: ["data.service"], use: "An AWS service node." },
  { id: "azure-node", atom: "entity", title: "Azure service", status: "live",
    requires: ["label"], optional: ["data.service"], use: "An Azure service node." },
  { id: "gcp-node", atom: "entity", title: "Google Cloud service", status: "live",
    requires: ["label"], optional: ["data.service"], use: "A GCP service node." },
  { id: "language-node", atom: "entity", title: "Language", status: "live",
    requires: ["data.language"], optional: ["label"], use: "A programming language mark." },
  { id: "connector", atom: "relation", title: "Connector", status: "live",
    requires: [], optional: ["label", "data.direction", "data.lineType", "data.arrows", "data.length"],
    use: "A standalone arrow between two placed components." },

  // ---- UML (implemented, currently not exposed to the script writer) ----
  { id: "uml-class-node", atom: "entity", title: "UML class", status: "live",
    requires: ["label"], optional: ["data.attributes", "data.methods"], use: "A class with attributes and methods." },
  { id: "uml-actor-node", atom: "entity", title: "UML actor", status: "live",
    requires: ["label"], optional: [], use: "An external actor." },
  { id: "uml-usecase-node", atom: "entity", title: "UML use case", status: "live",
    requires: ["label"], optional: [], use: "A use-case ellipse." },
  { id: "uml-lifeline", atom: "entity", title: "Lifeline", status: "live",
    requires: ["label"], optional: ["data.height"], use: "A participant column in a sequence diagram." },
  { id: "uml-arrow", atom: "relation", title: "Message arrow", status: "live",
    requires: ["label"], optional: ["data.direction", "data.width"], use: "A message between lifelines." },
  { id: "uml-syncbar", atom: "relation", title: "Activation bar", status: "live",
    requires: [], optional: ["data.orientation", "data.length"], use: "Activation or synchronisation bar." },
  { id: "uml-decision", atom: "state", title: "Decision", status: "live",
    requires: ["label"], optional: [], use: "A branch point." },
  { id: "uml-component", atom: "entity", title: "UML component", status: "live", requires: ["label"], optional: [] },
  { id: "uml-package", atom: "group", title: "UML package", status: "live", requires: ["label"], optional: [] },
  { id: "uml-database", atom: "entity", title: "Database", status: "live", requires: ["label"], optional: [] },
  { id: "uml-note", atom: "callout", title: "UML note", status: "live", requires: ["label"], optional: ["data.text"] },
  { id: "uml-cloud", atom: "entity", title: "Cloud boundary", status: "live", requires: ["label"], optional: [] },
  { id: "uml-deployment", atom: "entity", title: "Deployment node", status: "live", requires: ["label"], optional: [] },
  { id: "uml-interface", atom: "entity", title: "Interface", status: "live", requires: ["label"], optional: [] },

  // ---- flowchart (implemented, not exposed) -----------------------------
  { id: "flow-diagram", atom: "media", title: "Flow diagram", status: "live",
    requires: ["data.nodes"], optional: [], use: "A complete flowchart from node data." },
  { id: "flow-terminal", atom: "state", title: "Start / end", status: "live", requires: ["label"], optional: [] },
  { id: "flow-process", atom: "step", title: "Process step", status: "live", requires: ["label"], optional: [] },
  { id: "flow-io", atom: "step", title: "Input / output", status: "live", requires: ["label"], optional: [] },
  { id: "flow-document", atom: "step", title: "Document", status: "live", requires: ["label"], optional: [] },

  // ---- layout primitives ------------------------------------------------
  { id: "container", atom: "group", title: "Container", status: "live",
    requires: [], optional: ["label", "items", "data.variant"], aliases: ["glass-container", "gradient-container", "shadow-container", "outlined-container"],
    use: "Groups components under one label." },
  { id: "grid", atom: "group", title: "Grid", status: "live",
    requires: ["items"], optional: ["data.cols", "columns"], use: "Even grid of child components." },
  { id: "split-layout", atom: "group", title: "Split", status: "live",
    requires: [], optional: ["data.left", "data.right", "data.leftRatio", "data.rightRatio"],
    use: "Two-column group nested inside a slot." },
  { id: "architecture-pipeline", atom: "group", title: "Pipeline", status: "live",
    requires: ["data.stages"], optional: ["data.connectorStyle", "data.connectorArrows"],
    use: "Stages with arrows inserted automatically between them." },
  { id: "roadmap-component", atom: "step", title: "Roadmap steps", status: "live",
    requires: ["items"], optional: ["data.items"], aliases: ["timeline", "horizontal-timeline", "roadmap", "learning-path", "sprint"],
    use: "Ordered steps with completed / active / pending status." },

  // ---- proposed ---------------------------------------------------------
  { id: "console-output", atom: "output", title: "Console output", status: "proposed",
    requires: ["data.text"], optional: ["data.unexpected", "data.stream"],
    use: "Program output beneath its code. Mark the surprising line." },
  { id: "stack-trace", atom: "output", title: "Stack trace", status: "proposed",
    requires: ["data.frames"], optional: ["data.focus", "data.exception"],
    use: "An exception with the relevant frame highlighted." },
  { id: "diff-block", atom: "code", title: "Diff block", status: "proposed",
    requires: ["data.text"], optional: ["data.added", "data.removed", "data.side"],
    use: "Code with added and removed lines marked." },
  { id: "trend-chart", atom: "media", title: "Trend chart", status: "proposed",
    requires: ["data.points"], optional: ["data.marks", "data.xLabel", "data.yLabel"],
    use: "A value over time with annotated thresholds. Today line-chart falls back to bars." },
  { id: "cell-grid", atom: "media", title: "Cell grid", status: "proposed",
    requires: ["data.cells"], optional: ["data.highlight", "data.legend"],
    use: "Indexed cells — arrays, cache lines, heap regions." },
  { id: "state-node", atom: "state", title: "State", status: "proposed",
    requires: ["label"], optional: ["data.status"],
    use: "A named state in a machine, optionally the active one." },
  { id: "lane", atom: "group", title: "Lane", status: "proposed",
    requires: ["label"], optional: ["data.lane", "items"],
    use: "One actor's track in a parallel-execution frame." },
  { id: "annotation-pin", atom: "callout", title: "Annotation pin", status: "proposed",
    requires: ["label"], optional: ["data.anchor"],
    use: "A numbered callout anchored to part of a diagram." },
  { id: "span", atom: "prose", title: "Labelled span", status: "proposed",
    requires: ["label"], optional: ["data.range"],
    use: "A labelled segment of a dissected string or signature." },
  { id: "checklist-item", atom: "step", title: "Checklist item", status: "proposed",
    requires: ["label"], optional: ["data.done"],
    use: "A numbered, ticked item in the closing recap." },
];

export const WIDGETS_BY_ID: Record<string, WidgetDef> = Object.fromEntries(
  WIDGETS.map((w) => [w.id, w]),
);

export const WIDGET_ALIASES: Record<string, string> = Object.fromEntries(
  WIDGETS.flatMap((w) => (w.aliases ?? []).map((a) => [a, w.id])),
);

export function lookupWidget(type?: string | null): WidgetDef | null {
  if (!type) return null;
  const k = String(type).trim().toLowerCase();
  return WIDGETS_BY_ID[k] ?? WIDGETS_BY_ID[WIDGET_ALIASES[k]] ?? null;
}
