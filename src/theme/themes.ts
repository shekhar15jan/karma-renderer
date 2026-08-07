/** ThemeEngine - design tokens per theme (colors, fonts, radius, shadow, spacing). */

export interface Theme {
  id: string;
  name: string;
  background: string;
  surface: string;
  surface2: string;
  text: string;
  muted: string;
  primary: string;
  secondary: string;
  accent: string;
  border: string;
  shadow: string;
  radius: number;
  spacing: number;
  font: string;
  fontHeading: string;
  fontCode: string;
  headingColor: string;
  codeBg: string;
  codeText: string;
  arrowColor: string;
  /** default palette used to derive shape fills when component has no explicit fill */
  palette: string[];
  shapeLine: string[];
  gridBg?: boolean;
}

const fonts = {
  sans: "'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
  heading: "'Inter', 'Segoe UI', 'Poppins', 'Helvetica Neue', Arial, sans-serif",
  mono: "'JetBrains Mono', 'Cascadia Code', 'Consolas', 'Courier New', monospace",
};

export const THEMES: Record<string, Theme> = {
  whiteboard: {
    id: "whiteboard",
    name: "Whiteboard",
    background: "#ffffff",
    surface: "#f5f7fa",
    surface2: "#eef1f6",
    text: "#33363d",
    muted: "#6b7280",
    primary: "#4f6ef7",
    secondary: "#10b981",
    accent: "#f59e0b",
    border: "#c9d3e0",
    shadow: "0 4px 16px rgba(31, 41, 55, 0.10)",
    radius: 12,
    spacing: 24,
    font: fonts.sans,
    fontHeading: fonts.heading,
    fontCode: fonts.mono,
    headingColor: "#1f2937",
    codeBg: "#1e2430",
    codeText: "#e5e7eb",
    arrowColor: "#4b5563",
    gridBg: true,
    palette: [
      "#dbe7fd", "#d1fae5", "#fef3c7", "#fce7f3", "#e0e7ff",
      "#ffe4e6", "#dcfce7", "#f1f5f9", "#ede9fe", "#cffafe",
    ],
    shapeLine: ["#5b7bd5", "#0e9f6e", "#d97706", "#db2777", "#6366f1", "#ef4444", "#059669", "#94a3b8", "#7c3aed", "#06b6d4"],
  },
  corporate: {
    id: "corporate",
    name: "Corporate",
    background: "#f8fafc",
    surface: "#ffffff",
    surface2: "#eef2f7",
    text: "#0f172a",
    muted: "#475569",
    primary: "#2563eb",
    secondary: "#15803d",
    accent: "#ca8a04",
    border: "#e2e8f0",
    shadow: "0 2px 6px rgba(15, 23, 42, 0.06)",
    radius: 8,
    spacing: 20,
    font: fonts.sans,
    fontHeading: fonts.heading,
    fontCode: fonts.mono,
    headingColor: "#0f172a",
    codeBg: "#0f172a",
    codeText: "#e2e8f0",
    arrowColor: "#334155",
    palette: [
      "#eff6ff", "#f0fdf4", "#fef2f2", "#fff7ed", "#faf5ff", "#fefce8",
      "#e0e7ff", "#ecfeff", "#f8fafc", "#f1f5f9",
    ],
    shapeLine: ["#2563eb", "#15803d", "#dc2626", "#ea580c", "#9333ea", "#ca8a04", "#3b82f6", "#0e7490", "#64748b", "#16a34a"],
  },
  minimal: {
    id: "minimal",
    name: "Minimal",
    background: "#ffffff",
    surface: "#fafafa",
    surface2: "#f0f0f0",
    text: "#171717",
    muted: "#737373",
    primary: "#171717",
    secondary: "#525252",
    accent: "#000000",
    border: "#d4d4d4",
    shadow: "0 1px 2px rgba(0,0,0,0.06)",
    radius: 4,
    spacing: 16,
    font: fonts.sans,
    fontHeading: fonts.heading,
    fontCode: fonts.mono,
    headingColor: "#171717",
    codeBg: "#171717",
    codeText: "#f5f5f5",
    arrowColor: "#404040",
    palette: ["#e5e5e5", "#ececec", "#f0f0f0", "#e8e8e8", "#d4d4d4", "#e2e2e2", "#efefef", "#fafafa", "#ededed", "#e6e6e6"],
    shapeLine: ["#404040", "#525252", "#404040", "#525252", "#404040", "#525252", "#404040", "#737373", "#525252", "#404040"],
  },
  dark: {
    id: "dark",
    name: "Dark",
    background: "#0b1220",
    surface: "#111a2e",
    surface2: "#16213a",
    text: "#e5e7eb",
    muted: "#94a3b8",
    primary: "#60a5fa",
    secondary: "#34d399",
    accent: "#fbbf24",
    border: "#2b3a55",
    shadow: "0 8px 24px rgba(0,0,0,0.45)",
    radius: 12,
    spacing: 24,
    font: fonts.sans,
    fontHeading: fonts.heading,
    fontCode: fonts.mono,
    headingColor: "#f8fafc",
    codeBg: "#050a14",
    codeText: "#e2e8f0",
    arrowColor: "#94a3b8",
    palette: [
      "#1e3a5f", "#123f33", "#5a4512", "#4a2239", "#2d2a63",
      "#512024", "#0f4d33", "#2b3544", "#3b2a6b", "#134e59",
    ],
    shapeLine: ["#60a5fa", "#34d399", "#fbbf24", "#f472b6", "#a78bfa", "#f87171", "#34d399", "#94a3b8", "#a78bfa", "#22d3ee"],
  },
  glass: {
    id: "glass",
    name: "Glass",
    background: "linear-gradient(135deg, #e8edf5 0%, #d7e0ec 100%)",
    surface: "rgba(255,255,255,0.55)",
    surface2: "rgba(255,255,255,0.35)",
    text: "#1e293b",
    muted: "#64748b",
    primary: "#3b82f6",
    secondary: "#10b981",
    accent: "#f59e0b",
    border: "rgba(255,255,255,0.65)",
    shadow: "0 12px 40px rgba(30, 64, 175, 0.18)",
    radius: 18,
    spacing: 26,
    font: fonts.sans,
    fontHeading: fonts.heading,
    fontCode: fonts.mono,
    headingColor: "#0f172a",
    codeBg: "rgba(15,23,42,0.85)",
    codeText: "#e2e8f0",
    arrowColor: "#475569",
    palette: [
      "rgba(191,219,254,0.6)", "rgba(187,247,208,0.6)", "rgba(253,230,138,0.6)", "rgba(251,207,232,0.6)",
      "rgba(221,214,254,0.6)", "rgba(254,202,202,0.6)", "rgba(167,243,208,0.6)", "rgba(226,232,240,0.6)",
      "rgba(199,210,254,0.6)", "rgba(165,243,252,0.6)",
    ],
    shapeLine: ["#3b82f6", "#059669", "#d97706", "#db2777", "#7c3aed", "#ef4444", "#059669", "#64748b", "#6d28d9", "#0891b2"],
  },
  technical: {
    id: "technical",
    name: "Technical",
    background: "#ffffff",
    surface: "#f4f6f8",
    surface2: "#e8ecf0",
    text: "#1f2933",
    muted: "#616e7c",
    primary: "#0b69ff",
    secondary: "#13ab67",
    accent: "#f5a623",
    border: "#9aa5b1",
    shadow: "0 3px 8px rgba(31,41,51,0.12)",
    radius: 6,
    spacing: 18,
    font: fonts.sans,
    fontHeading: fonts.heading,
    fontCode: fonts.mono,
    headingColor: "#1f2933",
    codeBg: "#1c2430",
    codeText: "#d1d8e0",
    arrowColor: "#3e4c59",
    palette: [
      "#cce0ff", "#c6f0dd", "#ffe2b8", "#ffd0e4", "#d6d1ff",
      "#ffc9c9", "#c2f0e0", "#e1e8ee", "#cfd4ff", "#bff0f5",
    ],
    shapeLine: ["#0b69ff", "#0c9d5c", "#e09e19", "#c4286c", "#5e46c9", "#c2372c", "#0c9d5c", "#7b8794", "#4c3db8", "#0d86a0"],
  },
};

export function getTheme(id?: string): Theme {
  if (!id) return THEMES.whiteboard;
  const t = THEMES[id];
  return t ?? THEMES.whiteboard;
}

/** Deterministic palette picker for a component index. */
export function paletteFor(theme: Theme, index: number): { fill: string; line: string } {
  const i = ((index % theme.palette.length) + theme.palette.length) % theme.palette.length;
  return { fill: theme.palette[i], line: theme.shapeLine[i] };
}
