/**
 * Narration-synced timing. The voice provider reports when each word is spoken; this turns
 * those timings into captions and into the moment each on-screen element should appear, so
 * the picture follows the voiceover instead of a fixed reveal schedule.
 */
import type { CaptionCue } from "../prepare";

export interface SpokenWord {
  text: string;
  /** Seconds from the start of the scene's audio. */
  start: number;
  end: number;
}

const CAPTION_MAX_WORDS = 7;

/** Caption phrases (same breaking rules as the text-only path) timed to the spoken words. */
export function captionsFromWords(words: SpokenWord[], durationSeconds: number): CaptionCue[] {
  const groups: SpokenWord[][] = [];
  let current: SpokenWord[] = [];
  for (const word of words) {
    current.push(word);
    const endsClause = /[.!?;:,]$/.test(word.text);
    if (current.length >= CAPTION_MAX_WORDS || (endsClause && current.length >= 3)) {
      groups.push(current);
      current = [];
    }
  }
  if (current.length) {
    // Never flash a one- or two-word caption: fold a short tail into the previous phrase.
    if (current.length < 3 && groups.length > 0) groups[groups.length - 1].push(...current);
    else groups.push(current);
  }
  return groups.map((group, i) => {
    const next = groups[i + 1];
    const end = next ? next[0].start : Math.min(durationSeconds, group[group.length - 1].end + 0.4);
    return { start: group[0].start, end: Math.max(end, group[0].start + 0.2), text: group.map((w) => w.text).join(" ") };
  });
}

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "with", "by", "at", "from", "as", "is", "are",
  "be", "it", "its", "this", "that", "your", "you", "via", "vs", "into", "per", "our", "we", "not", "no",
]);

function normalize(token: string): string {
  const t = token.toLowerCase().replace(/[^a-z0-9]/g, "");
  return t.length > 4 && t.endsWith("s") ? t.slice(0, -1) : t;
}

/**
 * Spoken words a label token matches at position i: 1 for the word itself or a simple
 * inflection ("pod"/"pods", "deploy"/"deploying"), 2 when the label joins two spoken words
 * ("apiserver" / "API server"), 0 for no match. A bare prefix is not enough: "kube" from
 * "kube-apiserver" would match every "Kubernetes".
 */
function matchAt(token: string, spoken: string[], i: number): number {
  const w = spoken[i];
  if (w === token) return 1;
  if (token.length >= 3 && w.startsWith(token) && /^(s|es|ed|ing|er|ers)$/.test(w.slice(token.length))) return 1;
  if (i + 1 < spoken.length && w + spoken[i + 1] === token) return 2;
  return 0;
}

function labelTokens(component: any): string[] {
  // Only the label names the element; data.tech is a logo hint ("kubernetes" on a kubelet node)
  // and matched the topic word wherever it was first said.
  const label: string = typeof component?.label === "string" ? component.label : "";
  const tokens = label
    .split(/[\s/_\-().,:]+/)
    .map(normalize)
    .filter((t: string) => t.length >= 2 && !STOPWORDS.has(t));
  return [...new Set(tokens)];
}

/** Seconds at which the narration first names this component, or undefined when it never does. */
export function firstMention(component: any, spoken: string[], words: SpokenWord[]): number | undefined {
  const tokens = labelTokens(component);
  if (tokens.length === 0) return undefined;
  const matchedAt = (t: string, from: number, to: number) => {
    for (let j = from; j < Math.min(to, spoken.length); j++) if (matchAt(t, spoken, j)) return true;
    return false;
  };
  let best = 0;
  let bestAt = -1;
  for (let i = 0; i < spoken.length; i++) {
    if (!tokens.some((t) => matchAt(t, spoken, i))) continue;
    const score = tokens.filter((t) => matchedAt(t, i, i + tokens.length + 2)).length;
    if (score > best) {
      best = score;
      bestAt = i;
    }
  }
  if (bestAt < 0) return undefined;
  // A single word of a multi-word label ("Docker" for "Docker Engine") is too common to place
  // the element by; accept it only when the narration uses that word rarely.
  if (best < Math.min(2, tokens.length)) {
    const token = tokens.find((t) => matchAt(t, spoken, bestAt))!;
    const uses = spoken.filter((_, j) => matchAt(token, spoken, j)).length;
    if (uses > 2) return undefined;
  }
  return words[bestAt].start;
}

/** Lead so the entrance animation has settled as the word is spoken. */
const REVEAL_LEAD = 0.35;
/** Share of the scene over which elements the narration never names are spread. */
const UNNAMED_SPAN = 0.6;
/** Elements named at the same moment still enter one after another. */
const SAME_TIME_STAGGER = 0.15;

/**
 * Seconds into the scene at which each component (by id) should appear: just before the
 * narration first names it. Components it never names are spaced evenly between the named
 * ones around them (or over the first 60% of the scene when none is named), keeping their
 * order. Nothing appears after 85% of the scene, so late mentions still leave time to read.
 */
export function revealTimes(components: any[], words: SpokenWord[], durationSeconds: number): Map<string, number> {
  const spoken = words.map((w) => normalize(w.text));
  const latest = Math.max(0, durationSeconds * 0.85);
  const items = components.filter((c) => c?.id).map((c) => {
    const mention = firstMention(c, spoken, words);
    return { id: String(c.id), at: mention === undefined ? undefined : Math.max(0, mention - REVEAL_LEAD) };
  });

  // Fill each run of unnamed components between its named neighbours.
  for (let i = 0; i < items.length; ) {
    if (items[i].at !== undefined) { i++; continue; }
    let j = i;
    while (j < items.length && items[j].at === undefined) j++;
    const before = i > 0 ? items[i - 1].at! : undefined;
    const after = j < items.length ? items[j].at! : undefined;
    const run = j - i;
    const start = before ?? 0;
    const end = after !== undefined && after > start ? after : Math.max(start + run * 0.8, durationSeconds * UNNAMED_SPAN);
    for (let k = 0; k < run; k++) {
      // With nothing named before the run, its first element opens the scene.
      const share = before === undefined ? k / run : (k + 1) / (run + 1);
      items[i + k].at = start + (end - start) * share;
    }
    i = j;
  }

  const times = new Map<string, number>();
  const used: number[] = [];
  for (const item of items) {
    let at = Math.min(latest, Math.max(0, item.at!));
    while (used.some((u) => Math.abs(u - at) < SAME_TIME_STAGGER / 2)) at += SAME_TIME_STAGGER;
    used.push(at);
    times.set(item.id, at);
  }
  return times;
}
