/**
 * Frame component contract.
 *
 * A frame receives slots that are already filled by assignSlots and never inspects
 * or filters components itself. That is the whole point — every placement defect in
 * the legacy layouts comes from each one doing its own `components.filter(...)`.
 *
 * `render` is injected rather than imported to keep frames free of a circular
 * dependency on KarmaComponentRenderer.
 */
import type React from "react";
import type { SceneComponent } from "../../catalogue/assign";
import type { Theme } from "../../theme/themes";

export interface FrameProps {
  /** The visual spec — title, subtitle, theme id, animation config. */
  spec: any;
  /** Slot id → components, already placed and capacity-checked. */
  slots: Record<string, SceneComponent[]>;
  /** Renders one component to its widget. */
  render: (c: SceneComponent, index: number) => React.ReactNode;
  theme?: Theme;
}

export type FrameFC = React.FC<FrameProps>;
