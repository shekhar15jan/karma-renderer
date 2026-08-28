/**
 * V2 SemanticSceneSpec — IR between AI and renderer (Slice 1).
 * Extends v1 VisualSpec with semantic intent/object/camera so AI decides WHAT,
 * renderer decides HOW (§3 P1/P2, §9-11, §29 Slice1).
 * Backward compat: v1 VisualSpec fields still valid, new fields optional.
 */
import { z } from "zod";
import { specSchema } from "../../core/schema";

// §9 Visual Intents (controlled vocab)
export const VisualIntentSchema = z.enum([
  "HOOK","ESTABLISH","EXPLAIN","COMPARE","PROCESS","ARCHITECTURE",
  "SEQUENCE","SIMULATION","CODE","EXECUTION","FAILURE","RECOVERY",
  "TRANSFORMATION","CONCEPT","REAL_WORLD","SUMMARY","CTA"
]);
export type VisualIntent = z.infer<typeof VisualIntentSchema>;

// §10 Semantic Object types
export const SemanticObjectTypeSchema = z.enum([
  "USER","MOBILE_APP","WEB_APP","API_GATEWAY","LOAD_BALANCER",
  "SERVICE","DATABASE","CACHE","KAFKA","QUEUE","MESSAGE","EVENT",
  "SERVER","CONTAINER","KUBERNETES","THREAD","PROCESS","TOKEN","REQUEST","RESPONSE"
]);
export type SemanticObjectType = z.infer<typeof SemanticObjectTypeSchema>;

export const SemanticObjectSchema = z.object({
  id: z.string().min(1),
  type: SemanticObjectTypeSchema,
  label: z.string().optional(),
  visualIdentity: z.string().optional(), // e.g. gateway-01 for continuity
  state: z.string().optional(), // idle/active/failed
  style: z.string().optional(),
  behavior: z.string().optional(),
});
export type SemanticObject = z.infer<typeof SemanticObjectSchema>;

// §12 Semantic Animation primitives (meaning-based)
export const SemanticAnimationSchema = z.object({
  type: z.enum([
    "appear","reveal","draw","travel","connect","disconnect",
    "publish","consume","queue","process","validate","authenticate",
    "encrypt","decrypt","store","retrieve","retry","timeout","fail","recover",
    "split","merge","transform","highlight","focus","expand","collapse"
  ]),
  object: z.string().optional(), // target object id
  from: z.string().optional(),
  to: z.string().optional(),
  at: z.number().nonnegative().optional(), // seconds into scene
  duration: z.number().positive().optional(),
  style: z.enum(["glow","ring"]).optional(),
  color: z.string().optional(),
});
export type SemanticAnimation = z.infer<typeof SemanticAnimationSchema>;

// §14 Camera intents
export const CameraIntentSchema = z.object({
  mode: z.enum(["ESTABLISH","FOLLOW","FOCUS","PUSH_IN","PULL_OUT","PAN","REVEAL","TRACK","COMPARE","OVERVIEW"]),
  target: z.string().optional(), // object id to follow
  start: z.object({ x: z.number().optional(), y: z.number().optional(), scale: z.number().positive().optional() }).optional(),
  end: z.object({ x: z.number().optional(), y: z.number().optional(), scale: z.number().positive().optional() }).optional(),
  duration: z.number().positive().optional(),
});
export type CameraIntent = z.infer<typeof CameraIntentSchema>;

// Object continuity registry snapshot (persisted per video)
export const ObjectRegistrySchema = z.record(z.string(), z.object({
  type: SemanticObjectTypeSchema,
  visualIdentity: z.string(),
  lastSeenScene: z.number().optional(),
}));
export type ObjectRegistry = z.infer<typeof ObjectRegistrySchema>;

// Full V2 spec = v1 VisualSpec + semantic extensions
export const semanticSceneSpecSchema = specSchema.extend({
  // v2 additions (all optional for v1 compat §27)
  intent: VisualIntentSchema.optional(),
  semanticObjects: z.array(SemanticObjectSchema).optional(),
  semanticAnimations: z.array(SemanticAnimationSchema).optional(),
  camera: CameraIntentSchema.optional(),
  transitionIntent: z.enum(["MORPH","MATCH_CUT","ZOOM_THROUGH","OBJECT_FOLLOW","DIAGRAM_BUILD","DIAGRAM_COLLAPSE","CAMERA_PUSH","CAMERA_PULL"]).optional(),
  assetClass: z.enum(["DETERMINISTIC","AI_GENERATED","HYBRID"]).optional(),
  registry: ObjectRegistrySchema.optional(),
  narration: z.object({
    start: z.number().nonnegative().optional(),
    end: z.number().nonnegative().optional(),
    text: z.string().optional(),
  }).optional(),
  duration: z.number().positive().optional(),
  sceneId: z.string().optional(),
  type: z.string().optional(), // scene library type: ArchitectureScene, SimulationScene etc
});

export type SemanticSceneSpec = z.infer<typeof semanticSceneSpecSchema>;

export function validateSemanticSpec(input: unknown): SemanticSceneSpec {
  return semanticSceneSpecSchema.parse(input);
}
export function safeValidateSemanticSpec(input: unknown): { ok: true; data: SemanticSceneSpec } | { ok: false; error: string } {
  try { return { ok: true, data: validateSemanticSpec(input)}; } catch(e:any){ if(e instanceof z.ZodError) return {ok:false, error:"Validation failed: "+e.issues.map((i:any)=>`${i.path.join(".")} ${i.message}`).join("; ")}; return {ok:false, error:String(e)}; }
}
