/** Detects the real technology named by a diagram node's label, so it can render that logo. */
import { lookupTechIcon } from "./techIcons.generated";

/** Diagram node types whose label may name a real technology worth showing as its logo. */
export const LABEL_TECH_NODE_TYPES = new Set([
  "docker-node", "microservice-node", "api-gateway", "database", "uml-database", "message-queue",
  "kubernetes-node", "logging-node", "language-node", "flow-process", "uml-component", "uml-cloud",
]);

/** Words too ambiguous to imply a technology on their own ("PID Namespace node"). */
const AMBIGUOUS_TECH_WORDS = new Set(["node", "idea", "spark", "vault", "helm", "envoy", "argo", "consul", "kong"]);

/** First technology named in a label: two-word names first ("Spring Boot"), then single words. */
export function techFromLabel(label?: string): string | null {
  if (!label) return null;
  const words = label.toLowerCase().split(/[^a-z0-9.+#-]+/).filter(Boolean);
  for (let i = 0; i + 1 < words.length; i++) {
    const pair = `${words[i]} ${words[i + 1]}`;
    if (lookupTechIcon(pair)) return pair;
  }
  for (const w of words) {
    if (w.length >= 4 && !AMBIGUOUS_TECH_WORDS.has(w) && lookupTechIcon(w)) return w;
  }
  return null;
}

/** The technology a component renders as a logo node, if any (explicit data.tech or label). */
export function renderedTech(c: { type?: string; label?: string; data?: Record<string, unknown> }): string | null {
  const explicit = c.data?.tech;
  if (typeof explicit === "string" && lookupTechIcon(explicit)) return explicit;
  if (c.type === "tech-node" || c.type === "tech") return c.label ?? null;
  return c.type && LABEL_TECH_NODE_TYPES.has(c.type) ? techFromLabel(c.label) : null;
}
