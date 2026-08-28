/**
 * NarrationSync — maps narration timestamp → semantic event → visual action (§23)
 * Input: narration {text, start, end} + word-level cues + semanticAnimations [{type, target, at}]
 * Output: function getActiveAnimationsAt(timeSec) → active semantic animations at that narration timestamp.
 * Syncs important semantic moments (e.g. "request reaches gateway" → travel + highlight), not every word.
 */
import type { SemanticAnimation } from "../schema/semanticSceneSpec";

// Narrowed narration types for sync
export interface NarrationMeta {
  text?: string;
  start?: number; // scene-local seconds, optional
  end?: number;
}

export interface WordCue {
  word: string;
  start: number; // seconds (scene-local or absolute)
  end: number;
  index?: number;
}

// Internal: enrich animation with timing metadata
export interface SyncedAnimation extends SemanticAnimation {
  _resolvedAt: number; // resolved trigger time (sec)
  _duration: number;
  _importance: number; // 0..1 semantic importance
}

const DEFAULT_ANIM_DURATION = 1.2;

// Importance map — sync only important semantic moments, not every word.
// High importance = will sync; low = ambient / decorative.
const IMPORTANCE: Record<string, number> = {
  travel: 1.0,
  publish: 1.0,
  consume: 1.0,
  highlight: 0.95,
  focus: 0.95,
  process: 0.9,
  connect: 0.9,
  disconnect: 0.85,
  store: 0.85,
  retrieve: 0.8,
  authenticate: 0.9,
  validate: 0.85,
  encrypt: 0.8,
  queue: 0.75,
  fail: 1.0,
  recover: 1.0,
  retry: 0.9,
  timeout: 0.85,
  split: 0.7,
  merge: 0.7,
  transform: 0.75,
  appear: 0.35,
  reveal: 0.4,
  draw: 0.4,
  expand: 0.5,
  collapse: 0.5,
};

function importanceOf(a: SemanticAnimation): number {
  return IMPORTANCE[a.type] ?? 0.5;
}

/** Find word cue whose text best matches animation target keywords. */
function findWordCueForAnimation(
  anim: SemanticAnimation,
  wordCues: WordCue[]
): WordCue | undefined {
  const target = (anim.object ?? anim.to ?? anim.from ?? anim.type).toLowerCase();
  // Prefer exact word match
  for (const wc of wordCues) {
    if (wc.word.toLowerCase() === target) return wc;
  }
  // Substring match: "gateway" in "gateway-01" or "apiGateway"
  for (const wc of wordCues) {
    const w = wc.word.toLowerCase();
    if (target.includes(w) || w.includes(target) || target.includes(w.replace(/[-_]/g, ""))) return wc;
  }
  // Fallback: no cue
  return undefined;
}

/** Snap animation trigger time to nearest relevant word boundary when cues available. */
function resolveAtWithWordCues(
  rawAt: number,
  anim: SemanticAnimation,
  wordCues?: WordCue[]
): number {
  if (!wordCues?.length) return rawAt;
  // Only snap high-importance semantic beats; low importance stays as-is (not every word)
  if (importanceOf(anim) < 0.6) return rawAt;
  const cue = findWordCueForAnimation(anim, wordCues);
  if (!cue) return rawAt;
  // Snap if within ~1.5s of cue start — prevents drift when LLM at is approximate.
  const drift = Math.abs(cue.start - rawAt);
  if (drift <= 1.5) return cue.start;
  // Also support semantic coupling: e.g. "request reaches gateway" at ~mid-sentence; travel uses cue.start, highlight slightly after.
  if (anim.type === "highlight" || anim.type === "focus") {
    // highlight a bit after the word (150ms lead as visual anticipation)
    if (drift <= 2.0) return cue.start + 0.12;
  }
  return rawAt;
}

function prepareSynced(
  animations: SemanticAnimation[],
  wordCues?: WordCue[]
): SyncedAnimation[] {
  return animations.map((a) => {
    const rawAt = a.at ?? 0;
    const resolvedAt = resolveAtWithWordCues(rawAt, a, wordCues);
    const duration = a.duration ?? DEFAULT_ANIM_DURATION;
    return {
      ...a,
      _resolvedAt: Math.max(0, resolvedAt),
      _duration: duration,
      _importance: importanceOf(a),
    };
  });
}

export interface NarrationSyncOptions {
  narration?: NarrationMeta;
  wordCues?: WordCue[];
  semanticAnimations: SemanticAnimation[];
  /** Lead-in window before trigger to pre-warm (e.g. travel starts 0.15s before highlight). */
  leadInSec?: number;
  /** Minimum importance threshold to be considered (default 0.3). */
  importanceThreshold?: number;
}

export interface NarrationSync {
  /** Return animations active at scene-local timeSec. */
  getActiveAnimationsAt(timeSec: number): SemanticAnimation[];
  /** Return animations that fire within next `windowSec` from timeSec. */
  getUpcomingAnimations(timeSec: number, windowSec?: number): SemanticAnimation[];
  /** Progress 0..1 through narration (clamped). */
  getNarrationProgress(timeSec: number): number;
  /** All synced animations sorted by resolved time. */
  getAllSynced(): SyncedAnimation[];
  /** Resolve mapping for debugging. */
  debugMap(): Array<{ type: string; at: number; resolvedAt: number; importance: number }>;
}

/**
 * Factory: build a sync helper bound to a scene's narration + animations.
 * Usage:
 *   const sync = createNarrationSync({ narration, wordCues, semanticAnimations });
 *   const active = sync.getActiveAnimationsAt(currentTimeSec);
 */
export function createNarrationSync(options: NarrationSyncOptions): NarrationSync {
  const {
    narration,
    wordCues,
    semanticAnimations,
    leadInSec = 0,
    importanceThreshold = 0.0,
  } = options;

  const synced = prepareSynced(semanticAnimations, wordCues).filter(
    (a) => a._importance >= importanceThreshold
  );
  // Sort by trigger time for deterministic order
  synced.sort((a, b) => a._resolvedAt - b._resolvedAt);

  // Optional: narration bounds for progress; not strictly needed for active check.
  const narrationStart = narration?.start ?? 0;
  const narrationEnd = narration?.end;

  function isActiveAt(s: SyncedAnimation, t: number): boolean {
    const start = s._resolvedAt - leadInSec;
    const end = s._resolvedAt + s._duration;
    // Inclusive start, exclusive end — matches Remotion frame boundary.
    return t >= start && t < end;
  }

  return {
    getActiveAnimationsAt(timeSec: number): SemanticAnimation[] {
      // Narration sync: if time is before narration start, nothing active.
      // If narration.end exists and time beyond, still allow out-of-narration animations (e.g. summary).
      if (narration && timeSec < narrationStart - 0.2) return [];
      const active = synced.filter((s) => isActiveAt(s, timeSec));
      // If multiple coupled beats overlap (travel + highlight within 0.5s), return both — they are intentional pairing
      // e.g. "request reaches gateway → travel + highlight". We return sorted by importance descending then at.
      active.sort((a, b) => b._importance - a._importance || a._resolvedAt - b._resolvedAt);
      // Return as plain SemanticAnimation (strip internal fields)
      return active.map(({ _resolvedAt, _duration, _importance, ...rest }) => rest);
    },

    getUpcomingAnimations(timeSec: number, windowSec: number = 1.2): SemanticAnimation[] {
      const upcoming = synced.filter(
        (s) => s._resolvedAt > timeSec && s._resolvedAt <= timeSec + windowSec
      );
      return upcoming.map(({ _resolvedAt, _duration, _importance, ...rest }) => rest);
    },

    getNarrationProgress(timeSec: number): number {
      if (!narrationEnd || narrationEnd <= narrationStart) {
        // fallback: progress relative to last animation end
        const lastEnd = synced.length
          ? Math.max(...synced.map((s) => s._resolvedAt + s._duration))
          : 1;
        if (lastEnd <= 0) return 0;
        return Math.max(0, Math.min(1, timeSec / lastEnd));
      }
      const span = narrationEnd - narrationStart;
      return Math.max(0, Math.min(1, (timeSec - narrationStart) / span));
    },

    getAllSynced(): SyncedAnimation[] {
      return [...synced];
    },

    debugMap() {
      return synced.map((s) => ({
        type: s.type,
        at: s.at ?? 0,
        resolvedAt: s._resolvedAt,
        importance: s._importance,
      }));
    },
  };
}

/**
 * Stateless helper when you just need one lookup without creating a factory.
 * Filters to important semantic moments (importance >= threshold).
 */
export function getActiveAnimationsAt(
  timeSec: number,
  semanticAnimations: SemanticAnimation[],
  narration?: NarrationMeta,
  wordCues?: WordCue[],
  opts?: { leadInSec?: number; importanceThreshold?: number }
): SemanticAnimation[] {
  const sync = createNarrationSync({
    narration,
    wordCues,
    semanticAnimations,
    leadInSec: opts?.leadInSec ?? 0,
    importanceThreshold: opts?.importanceThreshold ?? 0,
  });
  return sync.getActiveAnimationsAt(timeSec);
}

/**
 * Group coupled semantic events (e.g. travel → highlight) that fire within `coupleWindowSec`.
 * Useful for deciding "this narration beat should trigger both travel + highlight together".
 */
export function getCoupledAnimations(
  animations: SemanticAnimation[],
  coupleWindowSec: number = 0.6
): SemanticAnimation[][] {
  const sorted = [...animations].sort((a, b) => (a.at ?? 0) - (b.at ?? 0));
  const groups: SemanticAnimation[][] = [];
  let current: SemanticAnimation[] = [];
  let lastAt: number | null = null;
  for (const a of sorted) {
    const at = a.at ?? 0;
    if (lastAt !== null && at - lastAt > coupleWindowSec) {
      if (current.length) groups.push(current);
      current = [];
    }
    current.push(a);
    lastAt = at;
  }
  if (current.length) groups.push(current);
  return groups;
}
