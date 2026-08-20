import React from 'react';
import type { Theme } from '../../theme/themes';
import { KarmaHeading, KarmaParagraph, KarmaContainer, KarmaGrid, KarmaSplitLayout, KarmaArchitecturePipeline, KarmaCard, KarmaBadge, KarmaCodeBlock, KarmaText, KarmaBulletList, KarmaUmlClassNode, KarmaUmlActorNode, KarmaUmlUseCaseNode, KarmaUmlLifeline, KarmaUmlMessageArrow, KarmaUmlDecisionNode, KarmaUmlComponentNode, KarmaUmlPackageNode, KarmaUmlDatabaseNode, KarmaUmlNoteNode, KarmaFlowDiagram, KarmaFlowTerminalNode, KarmaFlowProcessNode, KarmaFlowIONode, KarmaFlowDocumentNode, KarmaUmlCloudNode, KarmaUmlDeploymentNode, KarmaUmlInterfaceNode, KarmaUmlSyncBarNode, KarmaMicroserviceNode, KarmaApiGatewayNode, KarmaMessageQueueNode, KarmaDockerNode, KarmaKubernetesNode, KarmaLoggingNode, KarmaBrowserNode, KarmaAwsNode, KarmaAzureNode, KarmaGcpNode, KarmaLanguageNode, KarmaConnector, KarmaSlideHeader, KarmaTerminalWindow, KarmaRoadmapTimeline, ThemeModeContext, KarmaBarChart, KarmaDonutChart, KarmaProgressBar, KarmaProfileCard } from '../../components/widgets/HtmlWidgets';
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

/** Adaptive grid column count for feature-grid / card clusters based on component count. */
function adaptiveGridCols(count: number): string {
  if (count <= 1) return 'grid-cols-1';
  if (count <= 3) return 'grid-cols-1 md:grid-cols-2';
  if (count <= 6) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
}

export const renderComponent = (c: any, index: number) => {
  const t = c.type ?? 'card';
  const delay = index * 5; // Staggered animation delay

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

  if (t === 'profile-card') {
    return <KarmaProfileCard key={index} name={c.label || c.data?.name || ''} role={c.data?.role || c.sublabel || ''} avatarUrl={c.data?.avatar} animationDelay={delay} />;
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

  // Fallback for primitive rendering
  return null;
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
  const layout = normalizeVideoLayout(spec.layout);
  const components = (spec.components || []).filter((c: any) => !isTitleOrSubtitleDuplicate(c, spec));

  // Helper to split components smartly if needed
  const textComponents = components.filter((c: any) => c.type === 'heading' || c.type === 'paragraph' || c.type === 'title' || c.type === 'text');
  const mediaComponents = components.filter((c: any) => c.type !== 'heading' && c.type !== 'paragraph' && c.type !== 'title' && c.type !== 'text');
  
  // 1. title-slide
  if (layout === 'title-slide') {
    // Hero slide: the title/subtitle ARE the heading. Drop heading/title components so
    // the slide can never show a second/duplicated title (spec.title renders it once).
    const heroComponents = components.filter((c: any) => c.type !== 'heading' && c.type !== 'title');
    return (
      <div className="w-full h-full p-20 flex flex-col justify-center items-center text-center z-10 relative">
        <div className="max-w-5xl space-y-8 flex flex-col items-center">
          {spec.title && <KarmaHeading text={spec.title} level={1} animationDelay={0} />}
          {spec.subtitle && <KarmaParagraph text={spec.subtitle} animationDelay={2} className="mt-4" />}
          {heroComponents.map((c: any, i: number) => renderComponent(c, i))}
        </div>
      </div>
    );
  }

  // 2. section-header
  if (layout === 'section-header') {
    return (
      <div className="w-full h-full bg-[var(--scene-surface)]/50 p-20 flex flex-col justify-center items-start border-l-8 border-[var(--scene-primary)] z-10 relative pl-32">
        <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} className="!border-b-0 mb-4" />
        <div className="max-w-4xl space-y-6">
          {components.map((c: any, i: number) => renderComponent(c, i))}
        </div>
      </div>
    );
  }

  // 10. quote
  if (layout === 'quote') {
    return (
      <div className="w-full h-full p-24 flex flex-col justify-center items-center text-center z-10 relative">
        <div className="text-8xl text-[var(--scene-primary)] opacity-30 mb-4 font-serif">"</div>
        <div className="max-w-5xl">
          {components.map((c: any, i: number) => renderComponent(c, i))}
        </div>
      </div>
    );
  }

  // 11. code-explainer
  if (layout === 'code-explainer') {
    const codeComponents = components.filter((c: any) => c.type === 'code');
    const explanationComponents = components.filter((c: any) => c.type !== 'code');
    return (
      <div className="w-full h-full p-16 flex items-center justify-center z-10 relative">
        <KarmaSplitLayout 
          leftRatio={2} rightRatio={3}
          left={
            <div className="pr-12">
              <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
              {explanationComponents.map((c: any, i: number) => renderComponent(c, i))}
            </div>
          }
          right={
            <div className="w-full shadow-2xl rounded-xl overflow-hidden border border-[var(--scene-border)] bg-[#0d1117]">
              <div className="bg-[#161b22] px-4 py-3 flex items-center gap-2 border-b border-[#30363d]">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div><div className="w-3 h-3 rounded-full bg-amber-500"></div><div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              </div>
              <div className="p-8 h-[600px] overflow-auto">
                {codeComponents.map((c: any, i: number) => renderComponent(c, i))}
              </div>
            </div>
          }
          className="w-full h-full max-w-[1600px]"
        />
      </div>
    );
  }

  // 12. terminal-walkthrough
  if (layout === 'terminal-walkthrough') {
    const commands = components.map((c: any) => ({
      text: c.data?.body || c.data?.text || c.label || '',
      type: (c.type === 'code' || c.type === 'command') ? 'command' : 'output' as any
    }));
    return (
      <div className="w-full h-full p-16 flex flex-col justify-center items-center z-10 relative">
        <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} className="w-full max-w-[1600px]" />
        <div className="w-full max-w-[1600px] flex-grow pb-12">
           <KarmaTerminalWindow commands={commands} />
        </div>
      </div>
    );
  }

  // 13. roadmap-timeline
  if (layout === 'roadmap-timeline') {
    const steps = components.map((c: any, index: number) => {
       const explicit = c.data?.status || c.status;
       let status = explicit === 'completed' || explicit === 'active' || explicit === 'pending'
         ? explicit
         : index === 0 ? 'completed' : index === 1 ? 'active' : 'pending';
       return { label: c.label || c.data?.body || 'Step', status: status as any };
    });
    return (
      <div className="w-full h-full p-16 flex flex-col z-10 relative">
        <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
        <div className="flex-grow w-full flex items-center justify-center">
           <KarmaRoadmapTimeline steps={steps} className="w-full max-w-[1400px]" />
        </div>
      </div>
    );
  }

  // Graph layouts (flow/uml/architecture + the video "architecture-diagram") use the
  // shared ELK engine: absolute coordinates for nodes + real arrow rendering.
  if (GRAPH_VIDEO_LAYOUTS.has(layout)) {
    return (
      <div className="w-full h-full flex flex-col z-10 relative">
        <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
        <div className="flex-grow w-full relative min-h-0 overflow-hidden">
          <KarmaGraphScene spec={spec} theme={theme} />
        </div>
      </div>
    );
  }

  // ALL OTHER STANDARD SLIDES (Require Header)
  return (
    <div className="w-full h-full p-16 flex flex-col z-10 relative">
      <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
      
      <div className="flex-grow w-full flex relative">
        
        {/* 3. standard-content */}
        {layout === 'standard-content' && (
          <div className="w-full max-w-5xl flex flex-col gap-6">
            {components.map((c: any, i: number) => renderComponent(c, i))}
          </div>
        )}

        {/* 4. two-column & 9. comparison */}
        {(layout === 'two-column' || layout === 'comparison') && (
          <KarmaSplitLayout 
            leftRatio={1} rightRatio={1}
            left={textComponents.map((c: any, i: number) => renderComponent(c, i))}
            right={mediaComponents.map((c: any, i: number) => renderComponent(c, i))}
            className="w-full h-full max-w-[1600px] mx-auto"
          />
        )}

        {/* 5. split-image */}
        {layout === 'split-image' && (
          <KarmaSplitLayout 
            leftRatio={2} rightRatio={3}
            left={textComponents.map((c: any, i: number) => renderComponent(c, i))}
            right={mediaComponents.map((c: any, i: number) => renderComponent(c, i))}
            className="w-full h-full max-w-[1600px] mx-auto"
          />
        )}

        {/* 7. feature-grid (adaptive columns by count, honors explicit data.order) */}
        {layout === 'feature-grid' && (
          <div className={`grid ${adaptiveGridCols(components.length)} gap-8 w-full max-w-[1600px] mx-auto auto-rows-fr`}>
            {[...components]
              .sort((a: any, b: any) => {
                const ao = a.data?.order ?? Number.MAX_SAFE_INTEGER;
                const bo = b.data?.order ?? Number.MAX_SAFE_INTEGER;
                return ao - bo;
              })
              .map((c: any, i: number) => renderComponent(c, i))}
          </div>
        )}

        {/* 8. big-number */}
        {layout === 'big-number' && (
          <div className="w-full h-full flex flex-col items-center justify-center">
             <div className="text-[200px] font-black text-transparent bg-clip-text bg-gradient-to-br from-[var(--scene-primary)] to-[var(--scene-accent)] leading-none" style={{ fontFamily: "var(--scene-heading)" }}>
                {components[0]?.data?.value || components[0]?.label || '0'}
             </div>
             {components[1] && <div className="mt-8">{renderComponent(components[1], 1)}</div>}
          </div>
        )}

        {/* 14. bento (Modern asymmetric grid) */}
        {layout === 'bento' && (
          <div className="grid grid-cols-4 grid-rows-3 gap-6 w-full max-w-[1600px] mx-auto h-[600px]">
            {components.map((c: any, i: number) => {
              // Create an asymmetric grid structure for bento boxes
              let spanClass = "col-span-1 row-span-1";
              if (i === 0) spanClass = "col-span-2 row-span-2";
              else if (i === 1) spanClass = "col-span-2 row-span-1";
              else if (i === 2) spanClass = "col-span-1 row-span-2";
              return (
                <div key={i} className={`${spanClass} flex`}>
                  {renderComponent(c, i)}
                </div>
              );
            })}
          </div>
        )}

        {/* 15. dashboard (Sidebar + Main content layout) */}
        {layout === 'dashboard' && (
          <div className="flex gap-8 w-full max-w-[1600px] mx-auto h-full pb-8">
            <div className="w-1/4 h-full bg-[var(--scene-surface)]/40 rounded-xl border border-[var(--scene-border)] p-6 flex flex-col gap-4 shadow-lg">
              {components.filter((_: any, i: number) => i % 3 === 0).map((c: any, i: number) => renderComponent(c, i))}
            </div>
            <div className="w-3/4 flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-6">
                {components.filter((_: any, i: number) => i % 3 !== 0 && i < 3).map((c: any, i: number) => renderComponent(c, i))}
              </div>
              <div className="flex-1 bg-[var(--scene-surface)]/20 rounded-xl border border-[var(--scene-border)] p-8">
                {components.filter((_: any, i: number) => i % 3 !== 0 && i >= 3).map((c: any, i: number) => renderComponent(c, i))}
              </div>
            </div>
          </div>
        )}

        {/* 16. infographic (Vertical flow) */}
        {layout === 'infographic' && (
          <div className="w-full max-w-4xl mx-auto flex flex-col items-center pb-16">
            {components.map((c: any, i: number) => (
              <div key={i} className="flex flex-col items-center w-full">
                {i > 0 && <div className="w-1 h-12 bg-gradient-to-b from-[var(--scene-primary)] to-[var(--scene-accent)] my-4 opacity-50"></div>}
                <div className="w-full bg-[var(--scene-surface)]/80 p-8 rounded-2xl border border-[var(--scene-border)] shadow-xl relative">
                   <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[var(--scene-primary)] text-white flex items-center justify-center font-bold text-xl shadow-lg border-4 border-[var(--scene-bg)]">
                     {i + 1}
                   </div>
                   {renderComponent(c, i)}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export const KarmaComponentRenderer: React.FC<{ spec: any, animationDelayOverride?: number, theme?: Theme }> = ({ spec, animationDelayOverride, theme }) => (
  <ThemeModeContext.Provider value={theme?.mode ?? 'light'}>
    <KarmaComponentRendererInner spec={spec} animationDelayOverride={animationDelayOverride} theme={theme} />
  </ThemeModeContext.Provider>
);
