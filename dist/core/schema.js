"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.specSchema = void 0;
exports.validateRenderRequest = validateRenderRequest;
exports.safeValidateRenderRequest = safeValidateRenderRequest;
const zod_1 = require("zod");
const hexColor = zod_1.z.string().regex(/^#[0-9a-fA-F]{6}$|^#[0-9a-fA-F]{3}$/, "expected hex color");
const componentSchema = zod_1.z
    .object({
    id: zod_1.z.string().min(1).optional(),
    type: zod_1.z.string().min(1).optional(),
    label: zod_1.z.string().optional(),
    sublabel: zod_1.z.string().optional(),
    fill: hexColor.optional(),
    line: hexColor.optional(),
    textColor: hexColor.optional(),
    icon: zod_1.z.string().optional(),
    group: zod_1.z.string().optional(),
    width: zod_1.z.number().positive().optional(),
    height: zod_1.z.number().positive().optional(),
    data: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
    items: zod_1.z.array(zod_1.z.union([zod_1.z.string(), zod_1.z.object({ label: zod_1.z.string(), value: zod_1.z.string().optional(), sublabel: zod_1.z.string().optional(), icon: zod_1.z.string().optional() })])).optional(),
    columns: zod_1.z.array(zod_1.z.object({ header: zod_1.z.string().optional(), cells: zod_1.z.array(zod_1.z.string()).optional() })).optional(),
})
    .passthrough();
const connectionSchema = zod_1.z.object({
    from: zod_1.z.string().min(1),
    to: zod_1.z.string().min(1),
    label: zod_1.z.string().optional(),
    style: zod_1.z.enum(["straight", "curved", "orthogonal", "dashed", "double"]).optional(),
    kind: zod_1.z
        .enum(["dependency", "association", "aggregation", "composition", "inheritance", "implementation", "default", "open", "triangle", "double"])
        .optional(),
});
const containerSchema = zod_1.z
    .object({
    id: zod_1.z.string().min(1),
    label: zod_1.z.string().optional(),
    children: zod_1.z.array(zod_1.z.string()).default([]),
    componentIds: zod_1.z.array(zod_1.z.string()).optional(),
    fill: hexColor.optional(),
    line: hexColor.optional(),
    dashed: zod_1.z.boolean().optional(),
})
    .passthrough()
    .transform((c) => ({
    id: c.id,
    label: c.label,
    children: c.componentIds && c.componentIds.length > 0 ? c.componentIds : c.children,
    fill: c.fill,
    line: c.line,
    dashed: c.dashed,
}));
const codeSchema = zod_1.z.object({
    lang: zod_1.z.string().optional(),
    text: zod_1.z.string().optional().default(""),
});
const brandingSchema = zod_1.z.object({
    logo: zod_1.z.string().optional(),
    logoPosition: zod_1.z.enum(["top-left", "top-right", "bottom-left", "bottom-right", "center"]).optional(),
    footer: zod_1.z.string().optional(),
    header: zod_1.z.string().optional(),
    watermark: zod_1.z.string().optional(),
});
const highlightSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    at: zod_1.z.number().nonnegative().default(0),
    color: zod_1.z.string().optional(),
    style: zod_1.z.enum(["glow", "ring"]).optional(),
});
const animationSchema = zod_1.z.object({
    entrance: zod_1.z.enum(["fade-in", "fade-up", "slide-left", "slide-right", "zoom-in", "none"]).optional(),
    stagger: zod_1.z.number().nonnegative().optional(),
    bullets: zod_1.z.boolean().optional(),
    highlights: zod_1.z.array(highlightSchema).optional(),
    progress: zod_1.z.boolean().optional(),
    drawCharts: zod_1.z.boolean().optional(),
});
exports.specSchema = zod_1.z.object({
    title: zod_1.z.string().optional(),
    subtitle: zod_1.z.string().optional(),
    layout: zod_1.z.string().default("flow"),
    theme: zod_1.z.string().default("whiteboard"),
    width: zod_1.z.number().int().positive().optional(),
    height: zod_1.z.number().int().positive().optional(),
    components: zod_1.z.array(componentSchema).default([]),
    connections: zod_1.z.array(connectionSchema).default([]),
    containers: zod_1.z.array(containerSchema).default([]),
    code: codeSchema.optional(),
    instructions: zod_1.z.array(zod_1.z.string()).optional(),
    content_blocks: zod_1.z.array(zod_1.z.object({ heading: zod_1.z.string(), text: zod_1.z.string() })).optional(),
    branding: brandingSchema.optional(),
    animation: animationSchema.optional(),
});
const renderRequestSchema = zod_1.z.object({
    spec: exports.specSchema,
    format: zod_1.z.enum(["png", "svg", "pdf", "html"]).default("png"),
    width: zod_1.z.number().int().positive().optional(),
    height: zod_1.z.number().int().positive().optional(),
    scale: zod_1.z.number().positive().default(1),
});
function validateRenderRequest(input) {
    return renderRequestSchema.parse(input);
}
function safeValidateRenderRequest(input) {
    try {
        return { ok: true, data: validateRenderRequest(input) };
    }
    catch (e) {
        if (e instanceof zod_1.z.ZodError) {
            return { ok: false, error: "Validation failed: " + e.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ") };
        }
        return { ok: false, error: String(e) };
    }
}
