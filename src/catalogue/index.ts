/**
 * Assembled catalogue + integrity checks.
 *
 * The checks run at import so a contract that references a widget or fallback that
 * doesn't exist fails immediately rather than at render time — the catalogue is only
 * useful as a DTD if it is itself consistent.
 */
import type { Atom, Catalogue } from "./types";
import { WIDGETS, WIDGETS_BY_ID, WIDGET_ALIASES, lookupWidget } from "./widgets";
import { FRAMES, FRAMES_BY_ID, lookupFrame } from "./frames";

export const ATOMS: Atom[] = [
  "prose", "list", "code", "output", "metric", "entity",
  "relation", "state", "step", "media", "callout", "phase", "group",
];

export const CATALOGUE: Catalogue = {
  version: 1,
  atoms: ATOMS,
  widgets: WIDGETS,
  frames: FRAMES,
};

/** Widgets whose atom a slot accepts. Drives the Director skill's per-slot lists. */
export function widgetsForSlot(accepts: Atom[], acceptsWidgets?: string[]) {
  if (acceptsWidgets?.length) {
    return acceptsWidgets.map((id) => WIDGETS_BY_ID[id]).filter(Boolean);
  }
  if (!accepts.length) return WIDGETS;
  return WIDGETS.filter((w) => accepts.includes(w.atom));
}

export interface CatalogueIssue {
  where: string;
  problem: string;
}

/** Self-consistency check — unresolvable fallbacks, empty slots, orphan atoms. */
export function verifyCatalogue(): CatalogueIssue[] {
  const issues: CatalogueIssue[] = [];
  const atomSet = new Set<string>(ATOMS);

  for (const w of WIDGETS) {
    if (!atomSet.has(w.atom)) issues.push({ where: `widget:${w.id}`, problem: `unknown atom "${w.atom}"` });
  }

  for (const f of FRAMES) {
    if (f.fallback && !FRAMES_BY_ID[f.fallback]) {
      issues.push({ where: `frame:${f.id}`, problem: `fallback "${f.fallback}" does not exist` });
    }
    if (f.fallback === f.id) {
      issues.push({ where: `frame:${f.id}`, problem: "fallback points at itself" });
    }
    if (!f.slots.length) {
      issues.push({ where: `frame:${f.id}`, problem: "declares no slots" });
    }
    for (const s of f.slots) {
      for (const a of s.accepts) {
        if (!atomSet.has(a)) issues.push({ where: `frame:${f.id}.${s.id}`, problem: `unknown atom "${a}"` });
      }
      for (const id of s.acceptsWidgets ?? []) {
        if (!WIDGETS_BY_ID[id]) issues.push({ where: `frame:${f.id}.${s.id}`, problem: `unknown widget "${id}"` });
      }
      if (s.min > s.max) issues.push({ where: `frame:${f.id}.${s.id}`, problem: `min ${s.min} exceeds max ${s.max}` });
      if (s.min > 0 && s.droppable) issues.push({ where: `frame:${f.id}.${s.id}`, problem: "required slot marked droppable" });
      if (widgetsForSlot(s.accepts, s.acceptsWidgets).length === 0) {
        issues.push({ where: `frame:${f.id}.${s.id}`, problem: "no widget can satisfy this slot" });
      }
    }
  }

  // A live frame must not fall back to something unbuilt.
  for (const f of FRAMES) {
    if (f.status === "live" && f.fallback) {
      const fb = FRAMES_BY_ID[f.fallback];
      if (fb && fb.status === "proposed") {
        issues.push({ where: `frame:${f.id}`, problem: `live frame falls back to proposed "${f.fallback}"` });
      }
    }
  }

  return issues;
}

export { WIDGETS, WIDGETS_BY_ID, WIDGET_ALIASES, lookupWidget, FRAMES, FRAMES_BY_ID, lookupFrame };
export type { Catalogue };
export * from "./types";
