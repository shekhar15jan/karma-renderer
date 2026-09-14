/**
 * One-off build-time tool: generates the Director Agent's skill prompt text FROM
 * the catalogue, instead of it being hand-typed and left to drift (the same
 * problem V3/V22/V26/V30-32/V42 solved by hand for the script-writer's layout
 * list). Run with `npx tsx scripts/gen-director-prompt.ts`, paste stdout into the
 * `content = '...'` literal of a new V4x__director_skill_prompt.sql migration.
 * Not part of the runtime — re-run and re-migrate whenever frames are added.
 */
import { CATALOGUE } from "../src/catalogue/index";
import { FRAME_COMPONENTS } from "../src/video/frames/registry";

const frames = CATALOGUE.frames.filter((f) => Boolean(FRAME_COMPONENTS[f.id]));

const byIntent = new Map<string, typeof frames>();
for (const f of frames) {
  for (const intent of f.intent) {
    if (!byIntent.has(intent)) byIntent.set(intent, []);
    byIntent.get(intent)!.push(f);
  }
}

const lines: string[] = [];
lines.push("You are the Scene Director for a technical video pipeline. Your only job: for each");
lines.push("scene in the script below, pick the frame_id whose narrative intent and slot contract");
lines.push("genuinely fit that scene's content. You do not write or edit content, only choose.");
lines.push("");
lines.push("## Output contract (STRICT)");
lines.push("Return ONE valid JSON object, no markdown fences, no commentary, no chain-of-thought:");
lines.push('{"scenes":[{"sceneIndex":0,"frame_id":"<id from the catalogue below>","intent":"<matching intent>"}]}');
lines.push("Every sceneIndex from the input must appear exactly once. Use ONLY frame_id values");
lines.push("listed below — never invent one, never use a family or intent name as a frame_id.");
lines.push("");
lines.push("## Frame catalogue, grouped by narrative intent (a frame may appear under more than one)");

const intentOrder = ["HOOK", "EXPLAIN", "COMPARE", "SEQUENCE", "DEMONSTRATE", "DIAGNOSE", "RESOLVE", "RECAP"];
for (const intent of intentOrder) {
  const list = byIntent.get(intent);
  if (!list || list.length === 0) continue;
  lines.push("");
  lines.push(`### ${intent}`);
  for (const f of list) {
    const slots = f.slots
      .map((s) => `${s.id}:${s.accepts.join("/")}(${s.min}-${s.max}${s.droppable ? ",droppable" : ""})`)
      .join(", ");
    lines.push(`- ${f.id} [${f.family}] — ${f.use} Slots: ${slots}.`);
  }
}

lines.push("");
lines.push("## Selection rules");
lines.push("- Match the scene's actual content shape to a frame's slots, not just its title.");
lines.push("- Prefer a specific frame over a generic one when the scene's content clearly fits it");
lines.push("  (e.g. two states and a trigger -> state-machine, not standard-content).");
lines.push("- Do not pick the same frame for every scene unless the content genuinely repeats a shape.");
lines.push("- If nothing fits well, standard-content is always safe.");

const content = lines.join("\n");
console.log(content);
console.error(`\n\n-- ${frames.length} frames, ${content.length} chars, ~${Math.ceil(content.length / 4)} tokens --`);
