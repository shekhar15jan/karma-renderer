/**
 * Frame registry — the new dispatch path.
 *
 * KarmaComponentRendererInner checks this first and falls through to its legacy
 * if-chain when a frame is absent. Frames migrate one at a time: add the component
 * here, render-verify it, then delete its legacy branch. New frames go straight in
 * and never touch the chain at all.
 */
import type { FrameFC } from "./types";
import { TwoColumn } from "./TwoColumn";
import { Comparison } from "./Comparison";
import { SplitImage } from "./SplitImage";
import { BigNumber } from "./BigNumber";
import { Dashboard } from "./Dashboard";
import { Bento } from "./Bento";
import { TitleSlide } from "./TitleSlide";
import { SectionHeader } from "./SectionHeader";
import { Quote } from "./Quote";
import { CodeExplainer } from "./CodeExplainer";
import { TerminalWalkthrough } from "./TerminalWalkthrough";
import { RoadmapTimeline } from "./RoadmapTimeline";
import { FeatureGrid } from "./FeatureGrid";
import { Infographic } from "./Infographic";
import { StandardContent } from "./StandardContent";
import { BeforeAfter } from "./BeforeAfter";
import { CodeDiff } from "./CodeDiff";
import { ApiExchange } from "./ApiExchange";
import { DoDont } from "./DoDont";
import { MythFact } from "./MythFact";
import { SequenceFlow } from "./SequenceFlow";
import { TimelineChronology } from "./TimelineChronology";
import { Statement } from "./Statement";
import { MetricTrio } from "./MetricTrio";
import { TrendChart } from "./TrendChart";
import { BenchmarkBars } from "./BenchmarkBars";
import { Matrix } from "./Matrix";
import { Quadrant } from "./Quadrant";
import { MemoryGrid } from "./MemoryGrid";
import { CheatSheet } from "./CheatSheet";
import { StateMachine } from "./StateMachine";
import { HierarchyTree } from "./HierarchyTree";
import { FileTree } from "./FileTree";
import { ParallelLanes } from "./ParallelLanes";
import { SequenceDiagram } from "./SequenceDiagram";
import { AnnotatedDiagram } from "./AnnotatedDiagram";
import { LayeredStack } from "./LayeredStack";
import { AnatomyBreakdown } from "./AnatomyBreakdown";
import { AcronymBreakdown } from "./AcronymBreakdown";
import { ChecklistRecap } from "./ChecklistRecap";
import { DefinitionCard } from "./DefinitionCard";
import { EndCard } from "./EndCard";

export const FRAME_COMPONENTS: Record<string, FrameFC> = {
  "two-column": TwoColumn,
  "comparison": Comparison,
  "split-image": SplitImage,
  "big-number": BigNumber,
  "dashboard": Dashboard,
  "bento": Bento,
  "title-slide": TitleSlide,
  "section-header": SectionHeader,
  "quote": Quote,
  "code-explainer": CodeExplainer,
  "terminal-walkthrough": TerminalWalkthrough,
  "roadmap-timeline": RoadmapTimeline,
  "feature-grid": FeatureGrid,
  "infographic": Infographic,
  "standard-content": StandardContent,
  // Proposed frames, newly built on the catalogue slot-assignment path.
  "before-after": BeforeAfter,
  "code-diff": CodeDiff,
  "api-exchange": ApiExchange,
  "do-dont": DoDont,
  "myth-fact": MythFact,
  "sequence-flow": SequenceFlow,
  "timeline-chronology": TimelineChronology,
  "statement": Statement,
  "metric-trio": MetricTrio,
  "trend-chart": TrendChart,
  "benchmark-bars": BenchmarkBars,
  "matrix": Matrix,
  "quadrant": Quadrant,
  "memory-grid": MemoryGrid,
  "cheat-sheet": CheatSheet,
  "state-machine": StateMachine,
  "hierarchy-tree": HierarchyTree,
  "file-tree": FileTree,
  "parallel-lanes": ParallelLanes,
  "sequence-diagram": SequenceDiagram,
  "annotated-diagram": AnnotatedDiagram,
  "layered-stack": LayeredStack,
  "anatomy-breakdown": AnatomyBreakdown,
  "acronym-breakdown": AcronymBreakdown,
  "checklist-recap": ChecklistRecap,
  "definition-card": DefinitionCard,
  "end-card": EndCard,
};

export function lookupFrameComponent(id?: string | null): FrameFC | null {
  if (!id) return null;
  return FRAME_COMPONENTS[String(id).trim().toLowerCase()] ?? null;
}

export type { FrameFC };
