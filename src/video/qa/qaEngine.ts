/**
 * Renderer-side Video QA Engine — heuristic checks without AI (§27-28)
 * Mirrors VideoQAService.java but runs in the renderer using ELK bounding boxes + live layout data.
 *
 * Pipeline: Render → Analyze → QA → PASS/FAIL → VIDEO_QA_REPORT.json
 * Scoring §28: 8 dims 0-100 + Professional Score avg, threshold 80.
 */

import type { SemanticSceneSpec } from "../schema/semanticSceneSpec";
import { estimateNodeSize } from "../../layout/layout";

export const QA_THRESHOLD = 80;
export const REPORT_FILE = "VIDEO_QA_REPORT.json";

const FRAME_W = 1920;
const FRAME_H = 1080;
const SAFE_MARGIN_X = Math.round(FRAME_W * 0.05); // 96
const SAFE_MARGIN_Y = Math.round(FRAME_H * 0.05); // 54
const MIN_FONT = 14;
const MAX_ANIMS = 6;
const DEAD_PERIOD_SEC = 3;
const SILENCE_GAP_SEC = 2;
const MAX_SCALE_JUMP = 0.3;

export type QAIssueSeverity = "error" | "warn";

export interface QAIssue {
  check: string; // layout|typography|motion|story|audio
  severity: QAIssueSeverity;
  message: string;
  sceneIndex?: number;
}

export interface QADimension {
  score: number;
  status: "PASS" | "FAIL";
  threshold: number;
  issues: string[];
}

export interface QAScores {
  storytelling: number;
  visualDesign: number;
  motion: number;
  technicalClarity: number;
  realism: number;
  audioSync: number;
  consistency: number;
  readability: number;
  professionalScore: number;
}

export interface QAReport {
  version: string;
  generatedAt: string;
  threshold: number;
  overall: "PASS" | "FAIL";
  professionalScore: number;
  sceneCount: number;
  scores: QAScores;
  dimensions: Record<string, QADimension>;
  checks: Record<string, { count: number; issues: string[] }>;
  totalIssues: number;
  summary: string;
  diagnostic: string;
}

export interface QAOptions {
  threshold?: number;
  fps?: number;
  musicVolume?: number;
  hasMusic?: boolean;
}

// ---- helpers ----

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function truncate(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n) + "…";
}

function isHex(s: string): boolean {
  return /^#[0-9a-fA-F]{3}$|^#[0-9a-fA-F]{6}$/.test(s);
}

function luminance(hex: string): number {
  let h = hex.slice(1);
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrastRatio(a: string, b: string): number {
  const l1 = luminance(a), l2 = luminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function sceneType(s: SemanticSceneSpec): string | null {
  const any = s as unknown as Record<string, unknown>;
  if (typeof any["intent"] === "string") return any["intent"] as string;
  if (typeof any["type"] === "string") return any["type"] as string;
  if (typeof (s as unknown as { layout?: string }).layout === "string") return (s as unknown as { layout?: string }).layout as string;
  return null;
}

function componentIds(s: SemanticSceneSpec): Set<string> {
  const ids = new Set<string>();
  for (const c of (s.components ?? [])) {
    if ((c as { id?: string }).id) ids.add((c as { id: string }).id);
    else if (c.label) ids.add(c.label);
  }
  for (const o of (s.semanticObjects ?? [])) ids.add(o.id);
  return ids;
}

function narrationText(s: SemanticSceneSpec): string {
  const any = s as unknown as Record<string, unknown>;
  if (any["narrationText"] && typeof any["narrationText"] === "string") return any["narrationText"] as string;
  if (s.narration?.text) return s.narration.text;
  const t = (s as unknown as { text?: string }).text;
  if (t) return t;
  if (s.title) return s.title;
  return "";
}

// -- layout overflow via ELK bounding box (estimateNodeSize + naive grid) --

export function estimateLayoutBoxes(spec: SemanticSceneSpec): Array<{ x: number; y: number; width: number; height: number; label: string }> {
  const comps = spec.components ?? [];
  const boxes: Array<{ x: number; y: number; width: number; height: number; label: string }> = [];
  const estY = SAFE_MARGIN_Y + 120;
  for (let i = 0; i < comps.length; i++) {
    const c = comps[i] as unknown as { label?: string; sublabel?: string; type?: string };
    const sz = estimateNodeSize(c as Parameters<typeof estimateNodeSize>[0]);
    const col = boxes.length % 3;
    const row = Math.floor(boxes.length / 3);
    const x = SAFE_MARGIN_X + col * (sz.width + 32);
    const y = estY + row * (sz.height + 24);
    boxes.push({ x, y, width: sz.width, height: sz.height, label: c.label ?? "" });
  }
  return boxes;
}

// ---- per-category checks ----

function checkLayout(spec: SemanticSceneSpec, idx: number, out: string[]): void {
  const boxes = estimateLayoutBoxes(spec);
  const n = boxes.length;

  if (n > 18) out.push(`scene ${idx}: layout overflow — ${n} components exceeds readable density (>18)`);
  else if (n > 12) out.push(`scene ${idx}: layout overflow risk — ${n} components is dense`);

  for (const b of boxes) {
    if (b.x + b.width > FRAME_W - SAFE_MARGIN_X) out.push(`scene ${idx}: layout clipping — component '${truncate(b.label, 20)}' x+w=${b.x + b.width} exceeds frame ${FRAME_W}`);
    if (b.y + b.height > FRAME_H - SAFE_MARGIN_Y) out.push(`scene ${idx}: layout overflow — component '${truncate(b.label, 20)}' y+h=${b.y + b.height} exceeds frame ${FRAME_H}`);
    if (b.x < SAFE_MARGIN_X) out.push(`scene ${idx}: layout safe area violation — component '${truncate(b.label,20)}' x < 5% (${SAFE_MARGIN_X}px)`);
  }

  // overlap (naive estimate)
  for (let a = 0; a < boxes.length; a++) {
    for (let b = a + 1; b < boxes.length; b++) {
      const A = boxes[a], B = boxes[b];
      const overlap = A.x < B.x + B.width && A.x + A.width > B.x && A.y < B.y + B.height && A.y + A.height > B.y;
      if (overlap) out.push(`scene ${idx}: layout overlap — components ${a} and ${b} estimated boxes intersect`);
    }
  }

  if (n > 0 && n <= 6) {
    for (let i = 0; i < boxes.length; i++) {
      if (boxes[i].x % 8 !== 0) { out.push(`scene ${idx}: layout alignment — component ${i} x=${boxes[i].x} not 8px grid aligned`); break; }
    }
  }

  const containers = (spec as unknown as { containers?: unknown[] }).containers;
  if (Array.isArray(containers) && containers.length > 6) out.push(`scene ${idx}: layout overflow — ${containers.length} containers exceeds limit (6)`);
}

function checkTypography(spec: SemanticSceneSpec, idx: number, out: string[]): void {
  for (const c of spec.components ?? []) {
    const comp = c as unknown as { label?: string; sublabel?: string; fill?: string; textColor?: string; data?: { fontSize?: number } };
    const label = comp.label ?? "";
    const sub = comp.sublabel ?? "";
    if (label.length > 80) out.push(`scene ${idx}: typography truncation — label '${truncate(label, 40)}' exceeds 80 chars`);
    if (sub.length > 120) out.push(`scene ${idx}: typography truncation — sublabel exceeds 120 chars`);
    const sz = estimateNodeSize(c as Parameters<typeof estimateNodeSize>[0]);
    if (sz.width > 420) out.push(`scene ${idx}: typography truncation risk — '${truncate(label,20)}' estimated width ${sz.width}px exceeds 420px`);
    if (comp.fill && comp.textColor && isHex(comp.fill) && isHex(comp.textColor)) {
      const ratio = contrastRatio(comp.fill, comp.textColor);
      if (ratio < 4.5) out.push(`scene ${idx}: typography contrast — '${truncate(label,20)}' fill ${comp.fill} vs ${comp.textColor} ratio ${ratio.toFixed(1)} < 4.5 (WCAG AA)`);
    }
    if (comp.data?.fontSize !== undefined && comp.data.fontSize < MIN_FONT) out.push(`scene ${idx}: typography min font — '${truncate(label,20)}' fontSize ${comp.data.fontSize} < ${MIN_FONT}`);
  }
  if (spec.title && spec.title.length > 90) out.push(`scene ${idx}: typography readability — title exceeds 90 chars (${spec.title.length})`);
  if (spec.subtitle && spec.subtitle.length > 140) out.push(`scene ${idx}: typography readability — subtitle exceeds 140 chars`);
  const code = (spec as unknown as { code?: { text?: string } }).code?.text;
  if (code) {
    for (const line of code.split("\n")) if (line.length > 100) { out.push(`scene ${idx}: typography readability — code line exceeds 100 chars`); break; }
  }
}

function checkMotion(spec: SemanticSceneSpec, idx: number, all: SemanticSceneSpec[], out: string[]): void {
  const any = spec as unknown as Record<string, unknown>;
  let duration: number | undefined = spec.duration;
  if (duration === undefined && typeof any["durationSeconds"] === "number") duration = any["durationSeconds"] as number;
  if (duration === undefined) {
    const t = narrationText(spec);
    duration = Math.max(4, Math.min(25, t.length / 14));
  }

  const highlights = (spec as unknown as { animation?: { highlights?: Array<{ at: number; id: string }> } }).animation?.highlights ?? [];
  const semAnims = spec.semanticAnimations ?? [];
  const timelineEvents = (spec as unknown as { timelineEvents?: unknown[] }).timelineEvents ?? [];
  const animCount = highlights.length + semAnims.length + timelineEvents.length;
  const animTime = animCount * 0.6;
  const dead = duration - animTime;
  if (dead > DEAD_PERIOD_SEC) out.push(`scene ${idx}: motion dead period — ${dead.toFixed(1)}s idle (>${DEAD_PERIOD_SEC}s) with only ${animCount} anims over ${duration.toFixed(1)}s`);
  if (animCount > MAX_ANIMS) out.push(`scene ${idx}: motion excessive — ${animCount} animations > ${MAX_ANIMS}`);

  if (idx > 0) {
    const prev = all[idx - 1] as unknown as { camera?: { start?: { scale?: number }; end?: { scale?: number } } };
    const cur = spec as unknown as { camera?: { start?: { scale?: number }; end?: { scale?: number } } };
    const s0 = cur.camera?.end?.scale ?? cur.camera?.start?.scale;
    const s1 = prev.camera?.end?.scale ?? prev.camera?.start?.scale;
    // note: check cur vs prev; keep NaN guard
    const ps = typeof s1 === "number" ? s1 : NaN;
    const cs = typeof s0 === "number" ? s0 : NaN;
    if (!isNaN(ps) && !isNaN(cs) && Math.abs(cs - ps) > MAX_SCALE_JUMP) {
      out.push(`scene ${idx}: motion abrupt — camera scale jump ${ps.toFixed(2)}→${cs.toFixed(2)} (>${MAX_SCALE_JUMP})`);
    }
  }

  const targetTimes = new Map<string, number[]>();
  for (const h of highlights) {
    const id = (h as { id: string }).id ?? "unknown";
    const at = (h as { at?: number }).at ?? 0;
    if (!targetTimes.has(id)) targetTimes.set(id, []);
    targetTimes.get(id)!.push(at);
  }
  for (const a of semAnims) {
    const tgt = (a.object ?? a.to ?? a.from ?? "unknown") as string;
    const at = a.at ?? 0;
    if (!targetTimes.has(tgt)) targetTimes.set(tgt, []);
    targetTimes.get(tgt)!.push(at);
  }
  for (const [tgt, times] of targetTimes) {
    if (times.length < 2) continue;
    times.sort((x, y) => x - y);
    for (let i = 1; i < times.length; i++) if (Math.abs(times[i] - times[i - 1]) < 0.35) {
      out.push(`scene ${idx}: motion collision — 2 anims on target '${tgt}' at ~${times[i]}s`); break;
    }
  }
}

function checkStory(all: SemanticSceneSpec[], out: string[]): void {
  for (let i = 2; i < all.length; i++) {
    const t0 = sceneType(all[i - 2]), t1 = sceneType(all[i - 1]), t2 = sceneType(all[i]);
    if (t0 && t0 === t1 && t1 === t2) out.push(`story repeated scene type — 3× '${t0}' at scenes ${i - 2}-${i}`);
  }
  for (let i = 1; i < all.length; i++) {
    const a = componentIds(all[i - 1]), b = componentIds(all[i]);
    if (a.size === 0 && b.size === 0) continue;
    const inter = new Set([...a].filter(x => b.has(x)));
    const union = new Set([...a, ...b]);
    const jaccard = union.size === 0 ? 0 : inter.size / union.size;
    if (jaccard > 0.9 && a.size >= 2) out.push(`story insufficient visual change — scenes ${i - 1}→${i} share ${(jaccard * 100).toFixed(0)}% component ids (<10% change)`);
    const lt0 = (all[i - 1] as unknown as { layout?: string }).layout ?? "";
    const lt1 = (all[i] as unknown as { layout?: string }).layout ?? "";
    if (lt0 && lt0 === lt1 && jaccard > 0.8) out.push(`story insufficient visual change — scenes ${i - 1}→${i} same layout '${lt0}' and >80% overlap`);
  }
  for (let i = 0; i < all.length; i++) {
    const narration = narrationText(all[i]);
    if (!narration) continue;
    const lower = narration.toLowerCase();
    const compJoined = [...componentIds(all[i])].join(" ").toLowerCase();
    const keywords = ["gateway", "kafka", "database", "cache", "queue", "mobile", "payment", "api", "service", "request"];
    for (const kw of keywords) {
      if (lower.includes(kw) && !compJoined.includes(kw)) {
        const intent = ((all[i] as unknown as { intent?: string }).intent ?? "").toLowerCase();
        if (!intent.includes(kw)) { out.push(`scene ${i}: story narration/visual mismatch — narration mentions '${kw}' but no component id contains it`); break; }
      }
    }
  }
}

function checkAudio(spec: SemanticSceneSpec, idx: number, opts: QAOptions, out: string[]): void {
  const any = spec as unknown as Record<string, unknown>;
  const hasAudio = !!(any["audioUrl"] || any["audio"] || any["hasAudio"] || narrationText(spec));
  // hasAudio heuristic: if spec has narration text but no explicit audio flag, we treat as audio expected — gap check
  const hasExplicitAudio = !!(any["audioUrl"] || any["audio"] || any["hasAudio"]);
  let duration: number | undefined = spec.duration;
  if (duration === undefined && typeof any["durationSeconds"] === "number") duration = any["durationSeconds"] as number;
  if (duration === undefined) duration = Math.max(4, Math.min(25, narrationText(spec).length / 14));
  const narration = narrationText(spec);

  if (!hasExplicitAudio && narration) out.push(`scene ${idx}: audio silence gap — no narration audio for ${duration.toFixed(1)}s scene with text`);
  if (hasExplicitAudio && narration) {
    const expected = Math.max(2, narration.length / 14);
    if (duration < expected - 2) out.push(`scene ${idx}: audio narration level — duration ${duration.toFixed(1)}s shorter than expected ${expected.toFixed(1)}s for text length`);
  }
  if (opts.hasMusic && hasExplicitAudio && idx === 0) {
    // music duck check: renderer ducks to 0.05; if opts.musicVolume >0.08 flag
    if (opts.musicVolume !== undefined && opts.musicVolume > 0.08) out.push(`audio music duck — music volume ${opts.musicVolume} > 0.08 during narration; expected -20dB duck (0.05)`);
    else if (opts.musicVolume === undefined) out.push(`audio music duck — video has music + narration; ensure music ducked to -20dB (0.05) during narration`);
  }
  const timelineEvents = (spec as unknown as { timelineEvents?: Array<{ timestamp_ms?: number; at?: number }> }).timelineEvents;
  if (Array.isArray(timelineEvents)) {
    const counts = new Map<number, number>();
    for (const e of timelineEvents) {
      const ts = e.timestamp_ms ?? (e.at !== undefined ? Math.round(e.at * 1000) : 0);
      const bucket = Math.floor(ts / 200);
      counts.set(bucket, (counts.get(bucket) ?? 0) + 1);
    }
    for (const [bucket, c] of counts) if (c > 1) out.push(`scene ${idx}: audio SFX collision — ${c} events within 200ms at ~${bucket * 200}ms`);
  }
  if (duration > 10 && !hasExplicitAudio) out.push(`scene ${idx}: audio silence gap >${SILENCE_GAP_SEC}s — ${duration.toFixed(1)}s scene without audio`);
}

// ---- scoring ----

function scoreDimensions(layout: string[], typo: string[], motion: string[], story: string[], audio: string[], sceneCount: number): Omit<QAScores, "professionalScore"> {
  const c = (v: number) => clamp(v, 0, 100);
  return {
    visualDesign: c(100 - layout.length * 12 - typo.length * 3),
    readability: c(100 - typo.length * 15 - layout.length * 2),
    technicalClarity: c(100 - typo.length * 8 - layout.length * 6 - story.length * 3),
    motion: c(100 - motion.length * 16),
    storytelling: c(100 - story.length * 14 - motion.length * 4 - audio.length * 2),
    consistency: c(100 - story.length * 10 - layout.length * 5 - typo.length * 2),
    realism: c(100 - story.length * 7 - audio.length * 4 - layout.length * 3),
    audioSync: c(100 - audio.length * 18 - motion.length * 2),
  };
}

// ---- public API ----

/**
 * Run renderer-side QA on SemanticSceneSpec list.
 * Heuristic only — no AI, no perceptual hash.
 */
export function runQA(specs: SemanticSceneSpec[], opts: QAOptions = {}): QAReport {
  const threshold = opts.threshold ?? QA_THRESHOLD;
  const layoutIssues: string[] = [];
  const typoIssues: string[] = [];
  const motionIssues: string[] = [];
  const storyIssues: string[] = [];
  const audioIssues: string[] = [];

  for (let i = 0; i < specs.length; i++) {
    checkLayout(specs[i], i, layoutIssues);
    checkTypography(specs[i], i, typoIssues);
    checkMotion(specs[i], i, specs, motionIssues);
    checkAudio(specs[i], i, opts, audioIssues);
  }
  checkStory(specs, storyIssues);

  const dims = scoreDimensions(layoutIssues, typoIssues, motionIssues, storyIssues, audioIssues, specs.length);
  const scores: QAScores = {
    ...dims,
    professionalScore: Math.round(Object.values(dims).reduce((a, b) => a + b, 0) / 8),
  };
  const overall: "PASS" | "FAIL" = scores.professionalScore >= threshold ? "PASS" : "FAIL";

  const dimensions: Record<string, QADimension> = {};
  const issueMap: Record<string, string[]> = {
    visualDesign: layoutIssues,
    readability: typoIssues,
    technicalClarity: [...typoIssues, ...layoutIssues],
    motion: motionIssues,
    storytelling: storyIssues,
    consistency: [...storyIssues, ...layoutIssues],
    realism: [...storyIssues, ...audioIssues],
    audioSync: audioIssues,
  };
  for (const [k, v] of Object.entries(dims)) {
    const issues = [...new Set(issueMap[k] ?? [])].slice(0, 8);
    dimensions[k] = { score: v, status: v >= threshold ? "PASS" : "FAIL", threshold, issues };
  }

  const checks: QAReport["checks"] = {
    layout: { count: layoutIssues.length, issues: layoutIssues },
    typography: { count: typoIssues.length, issues: typoIssues },
    motion: { count: motionIssues.length, issues: motionIssues },
    story: { count: storyIssues.length, issues: storyIssues },
    audio: { count: audioIssues.length, issues: audioIssues },
  };

  const totalIssues = layoutIssues.length + typoIssues.length + motionIssues.length + storyIssues.length + audioIssues.length;

  return {
    version: "1.0",
    generatedAt: new Date().toISOString(),
    threshold,
    overall,
    professionalScore: scores.professionalScore,
    sceneCount: specs.length,
    scores,
    dimensions,
    checks,
    totalIssues,
    summary: totalIssues === 0 ? "No QA issues detected" : `${totalIssues} issue(s) detected — see checks`,
    diagnostic: "Score is diagnostic, not a guarantee of production readiness (§28)",
  };
}

/**
 * Serialize report to VIDEO_QA_REPORT.json string.
 */
export function reportToJson(report: QAReport): string {
  return JSON.stringify(report, null, 2);
}

/**
 * Convenience: check if report passes threshold.
 */
export function isPass(report: QAReport): boolean {
  return report.overall === "PASS";
}

// Export individual checkers for testing
export const _internal = {
  checkLayout,
  checkTypography,
  checkMotion,
  checkStory,
  checkAudio,
  estimateLayoutBoxes,
};
