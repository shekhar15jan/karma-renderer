/**
 * Frame catalogue types — the DTD for scene structure.
 *
 * A scene is markup: the frame is the document type, slots are its declared child
 * elements with cardinality, widgets are the inline elements, and the theme is the
 * stylesheet. This file declares that content model so a scene can be validated the
 * way an XML document is validated against a DTD — and so the same declaration can
 * generate the Director agent's skill text instead of it being hand-maintained in a
 * SQL migration that drifts from the renderer.
 */

/** What a piece of content fundamentally *is*, independent of which widget draws it. */
export type Atom =
  | "prose"     // narrative text
  | "list"      // enumerable items
  | "code"      // source, with a language
  | "output"    // console / log / error stream
  | "metric"    // a number that carries meaning
  | "entity"    // a named thing: service, technology, actor
  | "relation"  // a link between entities
  | "state"     // a named condition, possibly active
  | "step"      // an ordered item, possibly with status
  | "media"     // chart, table, diagram, image
  | "callout"   // warning, tip, quote, emphasis
  | "phase"     // a before/after temporal half
  | "group";    // a container holding other components

/** Build state. `proposed` frames are catalogued but have no renderer implementation. */
export type FrameStatus = "live" | "proposed";

/** How the frame is drawn. `builtin` has a hand-written component; `custom` is composed. */
export type FrameKind = "builtin" | "custom";

/** Geometry families — frames in a family share a slot grammar. */
export type Family =
  | "hero" | "split" | "sequence" | "grid" | "focus"
  | "graph" | "surface" | "dissect" | "lanes" | "document";

/** Narrative beat a frame is eligible for. */
export type Intent =
  | "HOOK" | "EXPLAIN" | "COMPARE" | "SEQUENCE"
  | "DEMONSTRATE" | "DIAGNOSE" | "RESOLVE" | "RECAP";

/** Motion a frame supports being timed against. */
export type Motion = "highlight" | "zoom" | "pan" | "reveal" | "draw" | "count";

export interface WidgetDef {
  id: string;
  /** What this widget renders. Drives which slots will accept it. */
  atom: Atom;
  /** Human label for the catalogue browser. */
  title: string;
  /** Fields without which the widget renders empty or breaks. */
  requires: string[];
  /** Fields the widget reads when present. */
  optional: string[];
  /** Other type names that resolve to this widget. */
  aliases?: string[];
  status: FrameStatus;
  /** Short note for the Director skill — when to reach for it. */
  use?: string;
}

export interface SlotDef {
  /** Slot name as it appears in the resolved scene JSON. */
  id: string;
  /** What this slot is *for*, in one or two words. */
  label: string;
  /** Atoms permitted here. Empty means any. */
  accepts: Atom[];
  /** Specific widget ids permitted, when narrower than `accepts`. */
  acceptsWidgets?: string[];
  min: number;
  max: number;
  /** A slot that may be shed when the frame is over capacity. */
  droppable?: boolean;
}

export interface FrameDef {
  id: string;
  title: string;
  family: Family;
  status: FrameStatus;
  kind: FrameKind;
  /** Beats that may select this frame. */
  intent: Intent[];
  slots: SlotDef[];
  /** Frame to degrade into when the slot contract cannot be satisfied. */
  fallback: string | null;
  motion: Motion[];
  /** One line for the Director skill — when this frame is the right answer. */
  use: string;
  /** Known-wrong behaviour in the current implementation, if any. */
  defect?: string;
}

export interface Catalogue {
  version: number;
  atoms: Atom[];
  widgets: WidgetDef[];
  frames: FrameDef[];
}
