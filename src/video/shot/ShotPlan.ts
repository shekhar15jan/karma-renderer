export interface Shot {
  shotId: string;
  start: number; // seconds
  duration: number;
  camera: { mode: "ESTABLISH" | "FOCUS" | "FOLLOW" | "PUSH_IN" | "PULL_OUT" | "REVEAL"; target?: string };
  focus: "mobile" | "request" | "gateway" | "system";
  events: Array<{ at: number; action: "CREATE" | "TRAVEL" | "HIGHLIGHT" | "TAP" | "REVEAL"; target?: string; from?: string; to?: string }>;
}

export const FIRST_SLICE_SHOTS: Shot[] = [
  { shotId: "establish", start: 0.0, duration: 1.5, camera: { mode: "ESTABLISH" }, focus: "system", events: [] },
  { shotId: "mobile-focus", start: 1.5, duration: 1.5, camera: { mode: "FOCUS", target: "mobile-app" }, focus: "mobile", events: [] },
  { shotId: "pay-action", start: 3.0, duration: 1.0, camera: { mode: "FOCUS", target: "mobile-app" }, focus: "mobile", events: [{ at: 3.2, action: "TAP", target: "pay-now" }] },
  { shotId: "request-creation", start: 4.0, duration: 0.5, camera: { mode: "FOCUS", target: "mobile-app" }, focus: "request", events: [{ at: 4.0, action: "CREATE", target: "payment-request" }] },
  { shotId: "request-travel", start: 4.5, duration: 2.0, camera: { mode: "FOLLOW", target: "payment-request" }, focus: "request", events: [{ at: 4.5, action: "TRAVEL", target: "payment-request", from: "mobile-app", to: "api-gateway" }] },
  { shotId: "gateway-arrival", start: 6.5, duration: 0.7, camera: { mode: "FOCUS", target: "api-gateway" }, focus: "gateway", events: [{ at: 6.5, action: "HIGHLIGHT", target: "api-gateway" }] },
  { shotId: "gateway-processing", start: 7.2, duration: 3.3, camera: { mode: "PUSH_IN", target: "api-gateway" }, focus: "gateway", events: [{ at: 7.2, action: "REVEAL", target: "gateway-stage-1" }, { at: 8.0, action: "REVEAL", target: "gateway-stage-2" }, { at: 8.8, action: "REVEAL", target: "gateway-stage-3" }, { at: 9.5, action: "REVEAL", target: "gateway-stage-4" }] },
  { shotId: "resolve", start: 9.5, duration: 1.0, camera: { mode: "PULL_OUT", target: "api-gateway" }, focus: "gateway", events: [] },
];

export function shotAt(t: number): Shot | null {
  for (const s of FIRST_SLICE_SHOTS) if (t >= s.start && t < s.start + s.duration) return s;
  return FIRST_SLICE_SHOTS[FIRST_SLICE_SHOTS.length - 1];
}
export function primaryFocusAt(t: number): Shot["focus"] {
  return shotAt(t)?.focus ?? "system";
}
