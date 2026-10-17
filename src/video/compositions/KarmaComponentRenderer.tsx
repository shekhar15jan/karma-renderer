import React from 'react';
import { LABEL_TECH_NODE_TYPES, techFromLabel } from "../../icons/techLabel";
import type { Theme } from '../../theme/themes';
import { TechTile, KarmaTechNode, KarmaTechStack, lookupTechIcon } from '../../components/widgets/TechIcon';
import { assignWithFallback, type SceneComponent } from '../../catalogue/assign';
import { lookupFrameComponent } from '../frames/registry';
import { KarmaHeading, KarmaParagraph, KarmaContainer, KarmaGrid, KarmaSplitLayout, KarmaArchitecturePipeline, KarmaCard, KarmaBadge, KarmaCodeBlock, KarmaText, KarmaBulletList, KarmaUmlClassNode, KarmaUmlActorNode, KarmaUmlUseCaseNode, KarmaUmlLifeline, KarmaUmlMessageArrow, KarmaUmlDecisionNode, KarmaUmlComponentNode, KarmaUmlPackageNode, KarmaUmlDatabaseNode, KarmaUmlNoteNode, KarmaFlowDiagram, KarmaFlowTerminalNode, KarmaFlowProcessNode, KarmaFlowIONode, KarmaFlowDocumentNode, KarmaUmlCloudNode, KarmaUmlDeploymentNode, KarmaUmlInterfaceNode, KarmaUmlSyncBarNode, KarmaMicroserviceNode, KarmaApiGatewayNode, KarmaMessageQueueNode, KarmaDockerNode, KarmaKubernetesNode, KarmaLoggingNode, KarmaBrowserNode, KarmaAwsNode, KarmaAzureNode, KarmaGcpNode, KarmaLanguageNode, KarmaConnector, KarmaSlideHeader, KarmaRoadmapTimeline, ThemeModeContext, KarmaBarChart, KarmaDonutChart, KarmaProgressBar, KarmaProfileCard, DesignScale, RevealScheduleContext, RevealAnchorContext } from '../../components/widgets/HtmlWidgets';
import { KarmaGraphScene } from './KarmaGraphScene';

/** The exact layouts the video renderer implements (skill contract for the Script Agent). */
export const VIDEO_LAYOUTS = [
  'title-slide',
  'section-header',
  'standard-content',
  'two-column',
  'split-image',
  'architecture-diagram',
  'feature-grid',
  'big-number',
  'comparison',
  'quote',
  'code-explainer',
  'terminal-walkthrough',
  'roadmap-timeline',
  'bento',
  'dashboard',
  'infographic',
] as const;

/** Legacy / unimplemented layouts are coerced to a safe implemented layout so no scene renders blank. */
const LAYOUT_FALLBACKS: Record<string, string> = {
  flow: 'architecture-diagram',
  flowchart: 'architecture-diagram',
  architecture: 'architecture-diagram',
  uml: 'architecture-diagram',
  mindmap: 'architecture-diagram',
  presentation: 'standard-content',
  split_diagram_text: 'two-column',
  cards: 'feature-grid',
  columns: 'feature-grid',
  grid: 'feature-grid',
  timeline: 'roadmap-timeline',
  roadmap: 'roadmap-timeline',
  learning_path: 'roadmap-timeline',
  sprint: 'roadmap-timeline',
  hero: 'title-slide',
  poster: 'title-slide',
};

/** Graph layouts rendered through the shared ELK engine (absolute coordinates + arrows). */
const GRAPH_VIDEO_LAYOUTS = new Set(['architecture-diagram', 'flow', 'flowchart', 'architecture', 'uml', 'mindmap']);

export function normalizeVideoLayout(layout: string | undefined): string {
  const raw = (layout ?? 'standard-content').trim().toLowerCase();
  if ((VIDEO_LAYOUTS as readonly string[]).includes(raw)) return raw;
  const fallback = LAYOUT_FALLBACKS[raw];
  if (fallback) return fallback;
  const kebab = raw.replace(/_/g, '-');
  if ((VIDEO_LAYOUTS as readonly string[]).includes(kebab)) return kebab;
  return 'standard-content';
}

/** Renders one spec component to its widget. Wrapped below by the exported
 *  `renderComponent` so every call site (including the recursive ones inside this
 *  function) gets a `data-eid` hook for scripted highlights, at no layout cost. */
const renderComponentRaw = (c: any, index: number): React.ReactElement | null => {
  const t = c.type ?? 'card';
  const delay = index * 5; // Staggered animation delay

  // Technology marks. `tech-node` is the vendor-agnostic replacement for the
  // per-vendor nodes; `data.tech` on ANY component promotes it to a branded node,
  // so an existing api-gateway/microservice-node can carry the real Kong or Spring
  // mark without the script changing component type.
  if (t === 'tech-icon' || t === 'tech-node' || t === 'tech') {
    const tech = c.data?.tech ?? c.data?.name ?? c.label ?? '';
    if (!tech) return null;
    if (t === 'tech-icon') {
      return <TechTile key={index} tech={String(tech)} size={c.data?.size ?? 'lg'} animationDelay={delay} />;
    }
    return (
      <KarmaTechNode key={index} tech={String(tech)} label={c.label} sublabel={c.sublabel || c.data?.sublabel}
        size={c.data?.size ?? 'md'} animationDelay={delay} />
    );
  }

  if (t === 'tech-stack') {
    const items = (c.data?.items ?? c.items ?? []) as any[];
    if (items.length > 0) {
      return <KarmaTechStack key={index} items={items} size={c.data?.size ?? 'lg'}
        showLabels={c.data?.showLabels !== false} animationDelay={delay} />;
    }
  }

  // Scripts rarely set data.tech, so every diagram node rendered the same generic blue
  // boxes; detect a real technology from the node's label (e.g. "Host Linux Kernel").
  const detectedTech = !c.data?.tech && LABEL_TECH_NODE_TYPES.has(t) ? techFromLabel(c.label) : null;
  if (detectedTech) {
    return (
      <KarmaTechNode key={index} tech={detectedTech} label={c.label} sublabel={c.sublabel || c.data?.sublabel}
        size={c.data?.size ?? 'md'} animationDelay={delay} />
    );
  }

  if (c.data?.tech && lookupTechIcon(c.data.tech)) {
    return (
      <KarmaTechNode key={index} tech={String(c.data.tech)} label={c.label} sublabel={c.sublabel || c.data?.sublabel}
        size={c.data?.size ?? 'md'} animationDelay={delay} />
    );
  }

  if (t === 'heading' || t === 'title') {
    return <KarmaHeading key={index} text={c.label || ''} animationDelay={delay} />;
  }
  
  if (t === 'paragraph' || t === 'text') {
    return <KarmaParagraph key={index} text={c.data?.body || c.sublabel || ''} animationDelay={delay + 5} />;
  }

  if (t === 'bullet-list') {
    return <KarmaBulletList key={index} items={c.data?.items || []} animationDelay={delay + 5} />;
  }

  if (t === 'code') {
    return <KarmaCodeBlock key={index} code={c.data?.text || ''} language={c.data?.lang || 'bash'} animationDelay={delay + 10} />;
  }

  if (t === 'profile-card') {
    return <KarmaProfileCard key={index} name={c.label || c.data?.name || ''} role={c.data?.role || c.sublabel || ''} avatarUrl={c.data?.avatar} animationDelay={delay} />;
  }

  // NOTE: must run before the generic `-card` catch-all below, which would otherwise
  // swallow 'profile-card' first and render it without its avatar/role treatment.
  if (t === 'card' || t.includes('-card')) {
    const kind = t.replace('-card', '');
    const isWarning = kind === 'warning';
    const isStat = kind === 'stat';
    const isQuote = kind === 'quote';
    const color = (c.data?.tone as any) || (isWarning ? 'amber' : isStat ? 'indigo' : isQuote ? 'emerald' : 'slate');
    return (
      <KarmaCard key={index} animationDelay={delay} color={color} className="w-full h-full">
        <div className="flex items-start gap-3 w-full">
          {isWarning && (
            <svg className="w-7 h-7 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          )}
          {isQuote && (
            <div className="text-6xl leading-none opacity-40 select-none">"</div>
          )}
          <div className="w-full">
            {c.label && <KarmaHeading text={c.label} level={4} animationDelay={delay} />}
            {c.sublabel && <KarmaParagraph text={c.sublabel} className="mt-2 text-lg" animationDelay={delay + 2} />}
            {c.data?.body && <div className="mt-3 text-xl leading-relaxed">{String(c.data.body)}</div>}
            {c.data?.message && <div className="mt-3 text-xl leading-relaxed">{String(c.data.message)}</div>}
            {isQuote && c.data?.quote && (
              <div className="mt-3 text-2xl font-semibold italic leading-relaxed">"{String(c.data.quote)}"</div>
            )}
            {c.data?.author && isQuote && (
              <div className="mt-2 text-lg opacity-80">— {String(c.data.author)}</div>
            )}
            {c.data?.value != null && (
              <div className="mt-4 text-5xl font-extrabold" style={{ color: 'var(--scene-primary)' }}>
                {String(c.data.value)}
                {c.data?.unit ? <span className="text-3xl ml-1 opacity-80">{String(c.data.unit)}</span> : null}
              </div>
            )}
            {c.items && (c.items as any[]).map((it, ii) => {
              const label = typeof it === 'string' ? it : it.label;
              return (
                <div key={ii} className="flex items-start gap-3 mt-3">
                  <span className="text-[var(--scene-primary)] font-bold mt-1">•</span>
                  <span className="text-xl leading-relaxed">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </KarmaCard>
    );
  }

  if (t === 'split-layout') {
    const leftContent = c.data?.left ? c.data.left.map((item: any, i: number) => renderComponent(item, i)) : null;
    const rightContent = c.data?.right ? c.data.right.map((item: any, i: number) => renderComponent(item, i)) : null;
    return (
      <KarmaSplitLayout key={index} left={leftContent} right={rightContent} leftRatio={c.data?.leftRatio} rightRatio={c.data?.rightRatio} />
    );
  }

  if (t === 'architecture-pipeline') {
    const stages = c.data?.stages ? c.data.stages.map((item: any, i: number) => renderComponent(item, i)) : [];
    return (
      <KarmaArchitecturePipeline key={index} connectorStyle={c.data?.connectorStyle} connectorArrows={c.data?.connectorArrows}>
        {stages}
      </KarmaArchitecturePipeline>
    );
  }

  if (t === 'container' || t === 'grid') {
    const isGrid = t === 'grid' || (c.columns && c.columns.length > 0);
    const content = c.items ? c.items.map((item: any, i: number) => renderComponent(typeof item === 'string' ? { type: 'paragraph', data: { body: item } } : item, i)) : null;
    
    if (isGrid) {
      return (
        <KarmaGrid key={index} cols={c.data?.cols || 2} className="w-full">
          {content}
        </KarmaGrid>
      );
    }
    
    return (
      <KarmaContainer key={index} variant={c.data?.variant || 'transparent'} animationDelay={delay}>
        {c.label && <KarmaHeading text={c.label} level={3} animationDelay={delay} className="mb-6" />}
        {content}
      </KarmaContainer>
    );
  }

  if (t === 'bar-chart') {
    return <KarmaBarChart key={index} data={c.data?.items || []} max={c.data?.max} animationDelay={delay} />;
  }

  if (t === 'donut-chart') {
    return <KarmaDonutChart key={index} data={c.data?.items || []} animationDelay={delay} />;
  }

  if (t === 'progress' || t === 'progress-bar') {
    return <KarmaProgressBar key={index} label={c.label || ''} progress={c.data?.value || 0} color={c.data?.color} animationDelay={delay} />;
  }

  if (t === 'badge') {
    return <KarmaBadge key={index} text={c.label || ''} color={c.data?.tone || 'slate'} />;
  }

  if (t === 'uml-class-node') {
    return <KarmaUmlClassNode key={index} name={c.label || ''} attributes={c.data?.attributes || []} methods={c.data?.methods || []} animationDelay={delay} />;
  }

  if (t === 'uml-actor-node') {
    return <KarmaUmlActorNode key={index} name={c.label || ''} animationDelay={delay} />;
  }

  if (t === 'uml-usecase-node') {
    return <KarmaUmlUseCaseNode key={index} label={c.label || ''} animationDelay={delay} />;
  }

  if (t === 'uml-lifeline') {
    return <KarmaUmlLifeline key={index} name={c.label || ''} height={c.data?.height} animationDelay={delay} />;
  }

  if (t === 'uml-arrow') {
    return <KarmaUmlMessageArrow key={index} label={c.label || ''} direction={c.data?.direction} width={c.data?.width} animationDelay={delay} />;
  }

  if (t === 'uml-decision') {
    return <KarmaUmlDecisionNode key={index} label={c.label || ''} animationDelay={delay} />;
  }

  if (t === 'uml-component') {
    return <KarmaUmlComponentNode key={index} label={c.label || ''} animationDelay={delay} />;
  }

  if (t === 'uml-package') {
    return <KarmaUmlPackageNode key={index} label={c.label || ''} animationDelay={delay} />;
  }

  if (t === 'uml-database') {
    return <KarmaUmlDatabaseNode key={index} label={c.label || ''} animationDelay={delay} />;
  }

  if (t === 'uml-note') {
    return <KarmaUmlNoteNode key={index} text={c.label || c.data?.text || ''} animationDelay={delay} />;
  }

  if (t === 'flow-diagram') {
    return <KarmaFlowDiagram key={index} nodes={c.data?.nodes || []} animationDelay={delay} />;
  }

  if (t === 'flow-terminal') {
    return <KarmaFlowTerminalNode key={index} label={c.label || ''} animationDelay={delay} />;
  }

  if (t === 'flow-process') {
    return <KarmaFlowProcessNode key={index} label={c.label || ''} animationDelay={delay} />;
  }

  if (t === 'flow-io') {
    return <KarmaFlowIONode key={index} label={c.label || ''} animationDelay={delay} />;
  }

  if (t === 'flow-document') {
    return <KarmaFlowDocumentNode key={index} label={c.label || ''} animationDelay={delay} />;
  }

  if (t === 'uml-cloud') {
    return <KarmaUmlCloudNode key={index} label={c.label || ''} animationDelay={delay} />;
  }

  if (t === 'uml-deployment') {
    return <KarmaUmlDeploymentNode key={index} label={c.label || ''} animationDelay={delay} />;
  }

  if (t === 'uml-interface') {
    return <KarmaUmlInterfaceNode key={index} label={c.label || ''} animationDelay={delay} />;
  }

  if (t === 'uml-syncbar') {
    return <KarmaUmlSyncBarNode key={index} orientation={c.data?.orientation} length={c.data?.length} animationDelay={delay} />;
  }

  if (t === 'microservice-node') {
    return <KarmaMicroserviceNode key={index} name={c.label || ''} stack={c.data?.stack || []} animationDelay={delay} />;
  }

  if (t === 'api-gateway') {
    return <KarmaApiGatewayNode key={index} label={c.label || ''} animationDelay={delay} />;
  }

  if (t === 'message-queue') {
    return <KarmaMessageQueueNode key={index} label={c.label || ''} animationDelay={delay} />;
  }

  if (t === 'docker-node') {
    return <KarmaDockerNode key={index} label={c.label || ''} animationDelay={delay} />;
  }

  if (t === 'kubernetes-node') {
    return <KarmaKubernetesNode key={index} label={c.label || ''} pods={c.data?.pods} animationDelay={delay} />;
  }

  if (t === 'logging-node') {
    return <KarmaLoggingNode key={index} label={c.label || ''} animationDelay={delay} />;
  }

  if (t === 'browser-node') {
    return <KarmaBrowserNode key={index} title={c.label || ''} animationDelay={delay} />;
  }

  if (t === 'aws-node') {
    return <KarmaAwsNode key={index} label={c.label || ''} service={c.data?.service} animationDelay={delay} />;
  }

  if (t === 'azure-node') {
    return <KarmaAzureNode key={index} label={c.label || ''} service={c.data?.service} animationDelay={delay} />;
  }

  if (t === 'gcp-node') {
    return <KarmaGcpNode key={index} label={c.label || ''} service={c.data?.service} animationDelay={delay} />;
  }

  if (t === 'language-node') {
    return <KarmaLanguageNode key={index} language={c.data?.language || 'js'} label={c.label || ''} animationDelay={delay} />;
  }

  if (t === 'connector') {
    return <KarmaConnector key={index} direction={c.data?.direction} type={c.data?.lineType} arrows={c.data?.arrows} length={c.data?.length} label={c.label} animationDelay={delay} />;
  }

  if (t === 'table') {
    const columns: { header?: string; cells?: string[] }[] = c.columns || [];
    if (columns.length > 0) {
      const rowCount = Math.max(...columns.map((col) => col.cells?.length ?? 0), 0);
      return (
        <div key={index} className="w-full overflow-hidden rounded-xl border" style={{ borderColor: 'var(--scene-border)' }}>
          <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
            {columns.some((col) => col.header) && (
              <thead>
                <tr>
                  {columns.map((col, ci) => (
                    <th key={ci} className="px-5 py-3 text-lg font-bold" style={{ background: 'var(--scene-primary)', color: '#fff' }}>
                      {col.header ?? ''}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {Array.from({ length: rowCount }).map((_, ri) => (
                <tr key={ri} style={{ borderTop: ri > 0 ? '1px solid var(--scene-border)' : undefined }}>
                  {columns.map((col, ci) => (
                    <td key={ci} className="px-5 py-3 text-lg" style={{ background: ri % 2 === 0 ? 'var(--scene-surface)' : 'transparent' }}>
                      {col.cells?.[ri] ?? ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    // No structured columns — fall through to the generic card so the label/items still render.
  }

  // --- Semantic fallback registry (§ Root Cause 1: nothing the LLM is told is valid
  // may render as literally nothing). Each of these types is accepted by the backend
  // validator/normalizer but has no dedicated widget — reroute to the closest existing
  // one instead of vanishing. Re-dispatches through renderComponent so the target's
  // own entrance animation, theming, and (once wrapped) data-eid highlight all apply. ---
  const COMPONENT_TYPE_FALLBACKS: Record<string, string> = {
    'command': 'code',
    'comparison': 'card',
    'banner': 'card',
    'pillar': 'card',
    'table': 'card', // structured columns handled above; this covers the no-columns case
    'gauge': 'donut-chart',
    'radar': 'donut-chart',
    'pie-chart': 'donut-chart',
    'line-chart': 'bar-chart',
    'glass-container': 'container',
    'gradient-container': 'container',
    'shadow-container': 'container',
    'outlined-container': 'container',
    'timeline': 'roadmap-component',
    'horizontal-timeline': 'roadmap-component',
    'roadmap': 'roadmap-component',
    'learning-path': 'roadmap-component',
    'sprint': 'roadmap-component',
    // Allowed by the backend validator but never rendered: a "database" node (etcd in a
    // control-plane diagram) drew nothing while its arrows pointed at the empty space.
    'database': 'uml-database',
    'output': 'code',
  };
  const mapped = COMPONENT_TYPE_FALLBACKS[t];
  if (mapped === 'roadmap-component') {
    const rawSteps: any[] = c.items || c.data?.items || [];
    const steps = rawSteps.map((it: any, i: number) => ({
      label: typeof it === 'string' ? it : (it.label ?? it.value ?? `Step ${i + 1}`),
      status: (i === rawSteps.length - 1 ? 'active' : 'completed') as 'completed' | 'active' | 'pending',
    }));
    if (steps.length > 0) {
      return <KarmaRoadmapTimeline key={index} steps={steps} animationDelay={delay} />;
    }
  } else if (mapped) {
    return renderComponent({ ...c, type: mapped }, index);
  }

  // Anything else with text renders as a plain card rather than vanishing: a type the
  // renderer does not know yet must never leave a hole in the scene.
  if (c.label || c.data?.body || c.sublabel) {
    console.warn(`[render] no widget for component type "${t}"; rendering it as a card`);
    return renderComponent({ ...c, type: 'card' }, index);
  }
  return null;
};

/** Renders a component and tags its root with `data-eid` (when it has an id) so
 *  SceneVisual's per-frame effect can find and glow/ring it for a scripted
 *  `animation.highlights` entry. `display: contents` keeps the wrapper invisible
 *  to layout — it never affects flex/grid sizing of the wrapped widget. */
/** Anchors a component's entrance to the moment the narration names it, when scheduled. */
const RevealAt: React.FC<{ id: string; base: number; children: React.ReactNode }> = ({ id, base, children }) => {
  const start = React.useContext(RevealScheduleContext)?.get(id);
  if (start === undefined) return <>{children}</>;
  return <RevealAnchorContext.Provider value={{ start, base }}>{children}</RevealAnchorContext.Provider>;
};

export const renderComponent = (c: any, index: number): React.ReactElement | null => {
  const node = renderComponentRaw(c, index);
  if (node == null || !c?.id) return node;
  return (
    <div key={`eid-${index}`} data-eid={String(c.id)} style={{ display: 'contents' }}>
      <RevealAt id={String(c.id)} base={index * 5}>{node}</RevealAt>
    </div>
  );
};

/** True when a component is a redundant copy of the slide's title/subtitle, which the
 *  layouts already render (hero title-slide or KarmaSlideHeader). Prevents double headings. */
const isTitleOrSubtitleDuplicate = (c: any, spec: any): boolean => {
  const t = c.type;
  if (t === 'heading' || t === 'title') {
    return c.label != null && spec.title != null && String(c.label).trim() === String(spec.title).trim();
  }
  if (t === 'paragraph' || t === 'text') {
    const body = c.data?.body ?? c.label ?? '';
    return spec.subtitle != null && String(body).trim() === String(spec.subtitle).trim();
  }
  return false;
};

const KarmaComponentRendererInner: React.FC<{ spec: any, animationDelayOverride?: number, theme?: Theme }> = ({ spec, animationDelayOverride, theme }) => {
  // V2 production wiring: schemaVersion v2 with semantic fields → KarmaV2Scene (TRAVEL + FOLLOW) for first vertical slice
  // This is checked before any V1 layout branching to ensure V2 is actually exercised
  if ((spec as any).schemaVersion === 'v2' && ((spec as any).semanticObjects || (spec as any).semanticAnimations || (spec as any).visualIntent)) {
    const { KarmaV2Scene } = require("./KarmaV2Scene");
    return (
      <div className="w-full h-full flex flex-col z-10 relative px-24 pt-16 pb-12">
        <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
        <div className="flex-grow w-full relative min-h-0 overflow-hidden">
          <KarmaV2Scene spec={spec as any} />
        </div>
      </div>
    );
  }
  const layout = normalizeVideoLayout(spec.layout);
  const components = (spec.components || []).filter((c: any) => !isTitleOrSubtitleDuplicate(c, spec));

  // Registry dispatch (strangler-fig): frames migrated to the catalogue slot contract
  // are resolved here; everything else falls through to the legacy if-chain below.
  // assignWithFallback walks the declared fallback chain, so a frame whose contract
  // cannot be satisfied (a two-column scene with no narrative content, say) degrades
  // instead of rendering an empty column.
  // Diagrams draw every node through the graph engine below, whatever the slot contract counts.
  const assignment = assignWithFallback(layout, components, 4, !GRAPH_VIDEO_LAYOUTS.has(layout));
  const RegisteredFrame = lookupFrameComponent(assignment.frame);
  if (RegisteredFrame) {
    return (
      <DesignScale>
        <RegisteredFrame
          spec={spec}
          slots={assignment.slots}
          theme={theme}
          render={(c: SceneComponent, i: number) => renderComponent(c, i)}
        />
      </DesignScale>
    );
  }

  // The blind text/media split that used to live here (heading/paragraph/title/text
  // vs "everything else") is gone — two-column, comparison, and split-image are now
  // registered frames (src/video/frames/) that get their content pre-sorted into
  // named slots by assignSlots, based on what each component actually IS, not a
  // two-bucket type guess. That guess is what misfiled bullet-list as "media" and
  // let one component leave a whole column empty (see catalogue/frames.ts defects).
  
  // title-slide, section-header, quote, code-explainer, terminal-walkthrough, and
  // roadmap-timeline are now registered frames (src/video/frames/) — resolved by the
  // registry dispatch above this switch, never reach here.

  // Graph layouts (flow/uml/architecture + the video "architecture-diagram") use the
  // shared ELK engine: absolute coordinates for nodes + real arrow rendering.
  if (GRAPH_VIDEO_LAYOUTS.has(layout)) {
    // Slice 2/3 semantic simulations: if intent is SIMULATION/PROCESS + KAFKA, render dedicated simulation
    const intent = (spec as any).intent ?? (spec as any).visualIntent;
    const hasKafka = (spec.components ?? []).some((c:any) => (c.type ?? "").toLowerCase().includes("kafka") || (c.label ?? "").toLowerCase().includes("kafka"))
                   || JSON.stringify(spec).toLowerCase().includes("kafka");
    const isSimulation = intent === "SIMULATION" || intent === "PROCESS" || hasKafka;
    // For kafka intent, prefer KafkaSimulation; otherwise use ELK graph (covers REQUEST_FLOW with TRAVEL animations via SemanticScene)
    if (isSimulation && hasKafka) {
      const { KafkaSimulation } = require("../simulations/KafkaSimulation");
      return (
        <div className="w-full h-full flex flex-col z-10 relative px-24 pt-16 pb-12">
          <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
          <div className="flex-grow w-full flex items-center justify-center p-8">
            <KafkaSimulation />
          </div>
        </div>
      );
    }
    // V2 production path: schemaVersion v2 or semantic fields → KarmaV2Scene (TRAVEL + FOLLOW)
    if ((spec as any).schemaVersion === 'v2' || (spec as any).semanticObjects || (spec as any).semanticAnimations || (spec as any).camera || (spec as any).visualIntent) {
      const { KarmaV2Scene } = require("./KarmaV2Scene");
      return (
        <div className="w-full h-full flex flex-col z-10 relative px-24 pt-16 pb-12">
          <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
          <div className="flex-grow w-full relative min-h-0 overflow-hidden">
            <KarmaV2Scene spec={spec as any} />
          </div>
        </div>
      );
    }
    return (
      <div className="w-full h-full flex flex-col z-10 relative px-24 pt-16 pb-12">
        <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
        <div className="flex-grow w-full relative min-h-0 overflow-hidden">
          <KarmaGraphScene spec={spec} theme={theme} />
        </div>
      </div>
    );
  }

  // Unreachable safety net, kept only because TS requires an explicit return here.
  // normalizeVideoLayout() always returns one of the 16 known layout strings (its own
  // fallback for anything unrecognized IS "standard-content"), GRAPH_VIDEO_LAYOUTS
  // returns above for the ELK-based layouts, and every remaining layout — including
  // standard-content itself — is now a registered frame in src/video/frames/ that
  // returns above that. No layout value can fall through to here.
  return (
    <div className="w-full h-full p-16 flex flex-col z-10 relative">
      <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
    </div>
  );
};

export const KarmaComponentRenderer: React.FC<{ spec: any, animationDelayOverride?: number, theme?: Theme }> = ({ spec, animationDelayOverride, theme }) => (
  <ThemeModeContext.Provider value={theme?.mode ?? 'light'}>
    <KarmaComponentRendererInner spec={spec} animationDelayOverride={animationDelayOverride} theme={theme} />
  </ThemeModeContext.Provider>
);
