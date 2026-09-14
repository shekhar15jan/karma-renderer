/**
 * Slot assignment — the one place content is placed into a frame.
 *
 * Every layout today does its own `components.filter(...)`, which is where the seven
 * placement defects live (two-column's blind text/media split, dashboard's `i % 3`,
 * bento's index-based tile spans, big-number's positional value). Centralising it
 * means a frame component receives `slots` already filled and never decides anything.
 *
 * Nothing here is aware of any specific frame — it reads the contract.
 */
import type { Atom, FrameDef, SlotDef, WidgetDef } from "./types";
import { lookupWidget } from "./widgets";
import { lookupFrame } from "./frames";

export interface SceneComponent {
  id?: string;
  type?: string;
  label?: string;
  sublabel?: string;
  data?: Record<string, any>;
  items?: any[];
  columns?: any[];
  /** Declared by the Director; inferred when absent. */
  role?: string;
  [k: string]: any;
}

export interface AssignmentIssue {
  slot?: string;
  component?: string;
  problem: string;
}

export interface Assignment {
  frame: string;
  /** Slot id → components placed there, in authored order. */
  slots: Record<string, SceneComponent[]>;
  /** Components that could not be placed and were shed. */
  dropped: Array<{ component: SceneComponent; why: string }>;
  issues: AssignmentIssue[];
  /** True when the contract could not be satisfied and the caller should fall back. */
  unsatisfied: boolean;
}

/** Data-shape classification — used when a component's type is unknown or absent. */
export function inferAtom(c: SceneComponent): Atom {
  const w = lookupWidget(c.type);
  if (w) return w.atom;
  const d = c.data ?? {};
  if (d.text && d.lang) return "code";
  if (d.stream === "output" || d.frames) return "output";
  if (d.value !== undefined) return "metric";
  if (Array.isArray(d.items) || Array.isArray(c.items)) return "list";
  if (Array.isArray(c.columns) || Array.isArray(d.points) || Array.isArray(d.cells)) return "media";
  if (d.status) return "step";
  if (d.tech || d.service || d.language) return "entity";
  if (d.body || d.quote || d.message) return "callout";
  return "prose";
}

function slotAccepts(slot: SlotDef, c: SceneComponent): boolean {
  if (slot.acceptsWidgets?.length) {
    const w = lookupWidget(c.type);
    return !!w && slot.acceptsWidgets.includes(w.id);
  }
  if (!slot.accepts.length) return true;
  return slot.accepts.includes(inferAtom(c));
}

/** Explicit role → slot, when the Director declared one. */
function slotForRole(frame: FrameDef, role?: string): SlotDef | null {
  if (!role) return null;
  const r = role.trim().toLowerCase();
  const direct = frame.slots.find((s) => s.id === r);
  if (direct) return direct;
  // Common role vocabulary mapped onto conventional slot names.
  const synonyms: Record<string, string[]> = {
    subject: ["subject", "left", "text", "code", "term", "statement", "hero"],
    evidence: ["right", "evidence", "code", "visual", "main"],
    "option-a": ["a", "before", "dont", "myth", "request", "left"],
    "option-b": ["b", "after", "do", "fact", "response", "right"],
    before: ["before", "a", "dont"],
    after: ["after", "b", "do"],
    step: ["steps", "hops", "marks", "items", "bands", "letters"],
    metric: ["metric", "metrics", "rail", "bars", "hero"],
    callout: ["note", "pins", "legend", "sub", "caption", "marks"],
    aside: ["support", "sub", "caption", "legend", "next"],
  };
  for (const cand of synonyms[r] ?? []) {
    const s = frame.slots.find((x) => x.id === cand);
    if (s) return s;
  }
  return null;
}

/**
 * Places components into a frame's slots.
 *
 * Order of authority: an explicitly declared role wins; otherwise the component goes
 * to the first slot that accepts its atom and still has capacity. Overflow is shed
 * from droppable slots first, which is how overflow is prevented structurally rather
 * than being patched per layout.
 */
export function assignSlots(frameId: string, components: SceneComponent[]): Assignment {
  const frame = lookupFrame(frameId);
  if (!frame) {
    return {
      frame: frameId,
      slots: {},
      dropped: components.map((c) => ({ component: c, why: `unknown frame "${frameId}"` })),
      issues: [{ problem: `frame "${frameId}" is not in the catalogue` }],
      unsatisfied: true,
    };
  }

  const slots: Record<string, SceneComponent[]> = {};
  for (const s of frame.slots) slots[s.id] = [];
  const dropped: Assignment["dropped"] = [];
  const issues: AssignmentIssue[] = [];

  const pending: SceneComponent[] = [];

  // Pass 1 — an explicitly declared role is honoured before anything else.
  for (const c of components) {
    const declared = slotForRole(frame, c.role);
    if (declared && slotAccepts(declared, c) && slots[declared.id].length < declared.max) {
      slots[declared.id].push(c);
      continue;
    }
    if (declared) {
      issues.push({ slot: declared.id, component: c.id, problem: `role "${c.role}" could not be honoured` });
    }
    pending.push(c);
  }

  // Pass 2 — satisfy every slot's minimum before any slot takes a second item.
  // Without this, sibling slots that accept the same atoms (comparison's a/b,
  // before-after, do-dont) let the first slot swallow everything and the second
  // fails its minimum, collapsing a valid frame to its fallback.
  for (const s of frame.slots) {
    while (slots[s.id].length < s.min) {
      const idx = pending.findIndex((c) => slotAccepts(s, c));
      if (idx === -1) break;
      slots[s.id].push(pending.splice(idx, 1)[0]);
    }
  }

  // Pass 3 — distribute the remainder to the least-filled slot that accepts it,
  // so four items across two equal slots land 2/2 rather than 4/0.
  for (const c of pending) {
    const candidates = frame.slots.filter((s) => slots[s.id].length < s.max && slotAccepts(s, c));
    if (candidates.length === 0) {
      dropped.push({ component: c, why: `no slot accepts atom "${inferAtom(c)}" with capacity left` });
      continue;
    }
    candidates.sort((x, y) => slots[x.id].length / x.max - slots[y.id].length / y.max);
    slots[candidates[0].id].push(c);
  }

  // A required slot left empty means the frame cannot honour its contract.
  let unsatisfied = false;
  for (const s of frame.slots) {
    if (slots[s.id].length < s.min) {
      issues.push({ slot: s.id, problem: `needs ${s.min}, has ${slots[s.id].length}` });
      unsatisfied = true;
    }
  }

  return { frame: frame.id, slots, dropped, issues, unsatisfied };
}

/**
 * Assigns against a frame, walking the declared fallback chain when the contract
 * cannot be met. Returns the first frame that fits, so "two-column with one
 * component" resolves to standard-content instead of rendering an empty column.
 */
export function assignWithFallback(frameId: string, components: SceneComponent[], maxHops = 4) {
  const tried: string[] = [];
  let current: string | null = frameId;
  let last: Assignment | null = null;

  for (let i = 0; i < maxHops && current; i++) {
    tried.push(current);
    const a = assignSlots(current, components);
    last = a;
    if (!a.unsatisfied) return { ...a, tried };
    const f = lookupFrame(current);
    current = f?.fallback ?? null;
    if (current && tried.includes(current)) break;
  }
  return { ...(last as Assignment), tried };
}

export type { WidgetDef };
