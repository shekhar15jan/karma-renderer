import { z } from "zod";

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$|^#[0-9a-fA-F]{3}$/, "expected hex color");

const componentSchema = z
  .object({
    id: z.string().min(1).optional(),
    type: z.string().min(1).optional(),
    label: z.string().optional(),
    sublabel: z.string().optional(),
    fill: hexColor.optional(),
    line: hexColor.optional(),
    textColor: hexColor.optional(),
    icon: z.string().optional(),
    group: z.string().optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
    data: z.record(z.string(), z.unknown()).optional(),
    items: z.array(z.union([z.string(), z.object({ label: z.string(), value: z.string().optional(), sublabel: z.string().optional(), icon: z.string().optional() })])).optional(),
    columns: z.array(z.object({ header: z.string().optional(), cells: z.array(z.string()).optional() })).optional(),
  })
  .passthrough();

const connectionSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  label: z.string().optional(),
  style: z.enum(["straight", "curved", "orthogonal", "dashed", "double"]).optional(),
  kind: z
    .enum(["dependency", "association", "aggregation", "composition", "inheritance", "implementation", "default", "open", "triangle", "double"])
    .optional(),
});

const containerSchema = z
  .object({
    id: z.string().min(1),
    label: z.string().optional(),
    children: z.array(z.string()).default([]),
    componentIds: z.array(z.string()).optional(),
    fill: hexColor.optional(),
    line: hexColor.optional(),
    dashed: z.boolean().optional(),
  })
  .passthrough()
  .transform((c: any) => ({
    id: c.id,
    label: c.label,
    children: c.componentIds && c.componentIds.length > 0 ? c.componentIds : c.children,
    fill: c.fill,
    line: c.line,
    dashed: c.dashed,
  }));

const codeSchema = z.object({
  lang: z.string().optional(),
  text: z.string().optional().default(""),
});

const brandingSchema = z.object({
  logo: z.string().optional(),
  logoPosition: z.enum(["top-left", "top-right", "bottom-left", "bottom-right", "center"]).optional(),
  footer: z.string().optional(),
  header: z.string().optional(),
  watermark: z.string().optional(),
});

const highlightSchema = z.object({
  id: z.string().min(1),
  at: z.number().nonnegative().default(0),
  color: z.string().optional(),
  style: z.enum(["glow", "ring"]).optional(),
});

const animationSchema = z.object({
  entrance: z.enum(["fade-in", "fade-up", "slide-left", "slide-right", "zoom-in", "none"]).optional(),
  stagger: z.number().nonnegative().optional(),
  bullets: z.boolean().optional(),
  highlights: z.array(highlightSchema).optional(),
  progress: z.boolean().optional(),
  drawCharts: z.boolean().optional(),
});

export const specSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  layout: z.string().default("standard-content"),
  theme: z.string().default("whiteboard"),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  components: z.array(componentSchema).default([]),
  connections: z.array(connectionSchema).default([]),
  containers: z.array(containerSchema).default([]),
  code: codeSchema.optional(),
  instructions: z.array(z.string()).optional(),
  content_blocks: z.array(z.object({ heading: z.string(), text: z.string() })).optional(),
  branding: brandingSchema.optional(),
  animation: animationSchema.optional(),
  type: z.string().optional(),
  dark_mode: z.boolean().optional(),
  elements: z.array(z.record(z.string(), z.unknown())).optional(),
});

const renderRequestSchema = z.object({
  spec: specSchema,
  format: z.enum(["png", "svg", "pdf", "html"]).default("png"),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  scale: z.number().positive().default(1),
});

export type ValidatedRenderRequest = z.infer<typeof renderRequestSchema>;
export type ValidatedSpec = z.infer<typeof specSchema>;

export function validateRenderRequest(input: unknown): ValidatedRenderRequest {
  return renderRequestSchema.parse(input);
}

export function safeValidateRenderRequest(input: unknown): { ok: true; data: ValidatedRenderRequest } | { ok: false; error: string } {
  try {
    return { ok: true, data: validateRenderRequest(input) };
  } catch (e) {
    if (e instanceof z.ZodError) {
      return { ok: false, error: "Validation failed: " + e.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ") };
    }
    return { ok: false, error: String(e) };
  }
}
