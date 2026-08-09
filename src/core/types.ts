/** Karma Visual Rendering Engine - visual_spec model. */

export type ShapeType =
  | "box"
  | "rect"
  | "diamond"
  | "decision"
  | "oval"
  | "ellipse"
  | "circle"
  | "start"
  | "end"
  | "parallelogram"
  | "input"
  | "output"
  | "cylinder"
  | "database"
  | "hexagon"
  | "process"
  | "class"
  | "actor"
  | "cloud"
  | "note";

export type ComponentType =
  | ShapeType
  | "card"
  | "info-card"
  | "title-card"
  | "bullet-card"
  | "stat-card"
  | "quote-card"
  | "warning-card"
  | "summary-card"
  | "comparison-card"
  | "banner"
  | "pill-card"
  | "badge-card"
  | "pillar"
  | "container"
  | "rounded-container"
  | "glass-container"
  | "gradient-container"
  | "shadow-container"
  | "outlined-container"
  | "modern-card"
  | "minimal-card"
  | "timeline"
  | "horizontal-timeline"
  | "vertical-timeline"
  | "roadmap"
  | "learning-path"
  | "sprint"
  | "bar-chart"
  | "line-chart"
  | "pie-chart"
  | "donut-chart"
  | "gauge"
  | "progress"
  | "radar-chart"
  | "area-chart"
  | "table"
  | "comparison-table"
  | "feature-matrix"
  | "pricing-table"
  | "checklist"
  | "code"
  | "instructions";

export type LayoutType =
  | "flow"
  | "architecture"
  | "uml"
  | "grid"
  | "columns"
  | "cards"
  | "bento"
  | "timeline"
  | "roadmap"
  | "learning-path"
  | "sprint"
  | "dashboard"
  | "mindmap"
  | "poster"
  | "hero"
  | "infographic"
  | "flowchart"
  | "presentation"
  | "split_diagram_text";

export type ThemeId = "corporate" | "whiteboard" | "minimal" | "dark" | "glass" | "technical" | "codeatcloud";

export type ConnectorStyle = "straight" | "curved" | "orthogonal" | "dashed" | "double";
export type ArrowKind = "dependency" | "association" | "aggregation" | "composition" | "inheritance" | "implementation";

export interface VisualComponent {
  id: string;
  type: ComponentType;
  label?: string;
  sublabel?: string;
  fill?: string;
  line?: string;
  textColor?: string;
  icon?: string;
  group?: string;
  width?: number;
  height?: number;
  data?: Record<string, unknown>;
  items?: Array<string | { label: string; value?: string; sublabel?: string; icon?: string }>;
  columns?: Array<{ header?: string; cells?: string[] }>;
}

export interface VisualConnection {
  from: string;
  to: string;
  label?: string;
  style?: ConnectorStyle;
  kind?: ArrowKind;
}

export interface VisualContainer {
  id: string;
  label?: string;
  children: string[];
  fill?: string;
  line?: string;
  dashed?: boolean;
}

export interface CodeBlock {
  lang?: string;
  text: string;
}

export interface BrandingConfig {
  logo?: string;
  logoPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  footer?: string;
  header?: string;
  watermark?: string;
}

export type EntranceType = "fade-in" | "fade-up" | "slide-left" | "slide-right" | "zoom-in" | "none";
export type TransitionType = "fade" | "slide-left" | "slide-right" | "wipe-left" | "wipe-right" | "zoom";

export interface SceneHighlight {
  /** Component id (data-eid) to highlight. */
  id: string;
  /** Scene-relative second when the highlight appears. */
  at: number;
  /** Glow color override (defaults to theme accent). */
  color?: string;
  style?: "glow" | "ring";
}

/** Frame-accurate, narration-synced motion plan for a single scene. */
export interface SceneAnimation {
  entrance?: EntranceType;
  /** Seconds between staggered element entrances. */
  stagger?: number;
  /** Reveal bullets/list items one-by-one synced to narration. */
  bullets?: boolean;
  highlights?: SceneHighlight[];
  /** Thin progress bar under the scene that fills with narration. */
  progress?: boolean;
  /** Animate bar/line/pie/radar chart draw-in. */
  drawCharts?: boolean;
}

export interface VisualSpec {
  title?: string;
  subtitle?: string;
  layout: LayoutType;
  theme: ThemeId;
  width?: number;
  height?: number;
  components: VisualComponent[];
  connections: VisualConnection[];
  containers: VisualContainer[];
  code?: CodeBlock;
  instructions?: string[];
  content_blocks?: Array<{ heading: string; text: string }>;
  branding?: BrandingConfig;
  /** Motion plan applied by the Remotion video layer (ignored by /render stills). */
  animation?: SceneAnimation;
}

export interface RenderRequest {
  spec: VisualSpec;
  format?: "png" | "svg" | "pdf" | "html";
  width?: number;
  height?: number;
  scale?: number;
}

export interface RenderResult {
  format: string;
  mimeType: string;
  buffer: Buffer;
  width: number;
  height: number;
}
