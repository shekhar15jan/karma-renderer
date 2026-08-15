import React from 'react';
import { KarmaHeading, KarmaParagraph, KarmaContainer, KarmaGrid, KarmaSplitLayout, KarmaArchitecturePipeline, KarmaCard, KarmaBadge, KarmaCodeBlock, KarmaText, KarmaBulletList, KarmaUmlClassNode, KarmaUmlActorNode, KarmaUmlUseCaseNode, KarmaUmlLifeline, KarmaUmlMessageArrow, KarmaUmlDecisionNode, KarmaUmlComponentNode, KarmaUmlPackageNode, KarmaUmlDatabaseNode, KarmaUmlNoteNode, KarmaFlowTerminalNode, KarmaFlowProcessNode, KarmaFlowIONode, KarmaFlowDocumentNode, KarmaUmlCloudNode, KarmaUmlDeploymentNode, KarmaUmlInterfaceNode, KarmaUmlSyncBarNode, KarmaMicroserviceNode, KarmaApiGatewayNode, KarmaMessageQueueNode, KarmaDockerNode, KarmaKubernetesNode, KarmaLoggingNode, KarmaBrowserNode, KarmaAwsNode, KarmaAzureNode, KarmaGcpNode, KarmaLanguageNode, KarmaConnector, KarmaSlideHeader, KarmaTerminalWindow, KarmaRoadmapTimeline } from '../../components/widgets/HtmlWidgets';

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
    return (
      <KarmaCard key={index} animationDelay={delay} color={c.data?.tone || 'slate'}>
        {c.label && <KarmaHeading text={c.label} level={4} animationDelay={delay} />}
        {c.sublabel && <KarmaParagraph text={c.sublabel} className="mt-2 text-lg" animationDelay={delay + 2} />}
        {c.data?.value && <div className="mt-4 text-5xl font-extrabold text-white">{c.data.value}</div>}
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

export const KarmaComponentRenderer: React.FC<{ spec: any, animationDelayOverride?: number }> = ({ spec, animationDelayOverride }) => {
  const layout = spec.layout || 'standard-content';
  const components = spec.components || [];

  // Helper to split components smartly if needed
  const textComponents = components.filter((c: any) => c.type === 'heading' || c.type === 'paragraph' || c.type === 'title' || c.type === 'text');
  const mediaComponents = components.filter((c: any) => c.type !== 'heading' && c.type !== 'paragraph' && c.type !== 'title' && c.type !== 'text');
  
  // 1. title-slide
  if (layout === 'title-slide') {
    return (
      <div className="w-full h-full p-20 flex flex-col justify-center items-center text-center z-10 relative">
        <div className="max-w-5xl space-y-8 flex flex-col items-center">
          {components.map((c: any, i: number) => renderComponent(c, i))}
        </div>
      </div>
    );
  }

  // 2. section-header
  if (layout === 'section-header') {
    return (
      <div className="w-full h-full bg-indigo-900/40 p-20 flex flex-col justify-center items-start border-l-8 border-indigo-500 z-10 relative pl-32">
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
        <div className="text-8xl text-indigo-500 opacity-50 mb-4">"</div>
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
      <div className="w-full h-full p-16 flex items-center justify-center z-10 relative bg-[#0d1117]">
        <KarmaSplitLayout 
          leftRatio={2} rightRatio={3}
          left={
            <div className="pr-12">
              <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
              {explanationComponents.map((c: any, i: number) => renderComponent(c, i))}
            </div>
          }
          right={
            <div className="w-full shadow-2xl rounded-xl overflow-hidden border border-slate-700">
              <div className="bg-[#161b22] px-4 py-3 flex items-center gap-2 border-b border-slate-700">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div><div className="w-3 h-3 rounded-full bg-amber-500"></div><div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              </div>
              <div className="bg-[#0d1117] p-8 h-[600px] overflow-auto">
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
      <div className="w-full h-full p-16 flex flex-col justify-center items-center z-10 relative bg-black">
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
       let status = 'pending';
       if (index === 0) status = 'completed';
       if (index === 1) status = 'active';
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

        {/* 6. architecture-diagram */}
        {layout === 'architecture-diagram' && (
          <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-slate-900/50 rounded-2xl border border-slate-700 p-12 shadow-inner">
             <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px]"></div>
             <div className="relative z-10 w-full h-full flex items-center justify-center">
                <KarmaArchitecturePipeline className="scale-150">
                  {components.map((c: any, i: number) => renderComponent(c, i))}
                </KarmaArchitecturePipeline>
             </div>
          </div>
        )}

        {/* 7. feature-grid */}
        {layout === 'feature-grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-[1600px] mx-auto auto-rows-fr">
            {components.map((c: any, i: number) => renderComponent(c, i))}
          </div>
        )}

        {/* 8. big-number */}
        {layout === 'big-number' && (
          <div className="w-full h-full flex flex-col items-center justify-center">
             <div className="text-[200px] font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-blue-500 leading-none">
                {components[0]?.data?.value || components[0]?.label || '0'}
             </div>
             {components[1] && <div className="mt-8">{renderComponent(components[1], 1)}</div>}
          </div>
        )}

      </div>
    </div>
  );
};
