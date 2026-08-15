"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KarmaComponentRenderer = exports.renderComponent = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const HtmlWidgets_1 = require("../../components/widgets/HtmlWidgets");
const renderComponent = (c, index) => {
    const t = c.type ?? 'card';
    const delay = index * 5; // Staggered animation delay
    if (t === 'heading' || t === 'title') {
        return (0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaHeading, { text: c.label || '', animationDelay: delay }, index);
    }
    if (t === 'paragraph' || t === 'text') {
        return (0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaParagraph, { text: c.data?.body || c.sublabel || '', animationDelay: delay + 5 }, index);
    }
    if (t === 'bullet-list') {
        return (0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaBulletList, { items: c.data?.items || [], animationDelay: delay + 5 }, index);
    }
    if (t === 'code') {
        return (0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaCodeBlock, { code: c.data?.text || '', language: c.data?.lang || 'bash', animationDelay: delay + 10 }, index);
    }
    if (t === 'card' || t.includes('-card')) {
        return ((0, jsx_runtime_1.jsxs)(HtmlWidgets_1.KarmaCard, { animationDelay: delay, color: c.data?.tone || 'slate', children: [c.label && (0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaHeading, { text: c.label, level: 4, animationDelay: delay }), c.sublabel && (0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaParagraph, { text: c.sublabel, className: "mt-2 text-lg", animationDelay: delay + 2 }), c.data?.value && (0, jsx_runtime_1.jsx)("div", { className: "mt-4 text-5xl font-extrabold text-white", children: c.data.value })] }, index));
    }
    if (t === 'split-layout') {
        const leftContent = c.data?.left ? c.data.left.map((item, i) => (0, exports.renderComponent)(item, i)) : null;
        const rightContent = c.data?.right ? c.data.right.map((item, i) => (0, exports.renderComponent)(item, i)) : null;
        return ((0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaSplitLayout, { left: leftContent, right: rightContent, leftRatio: c.data?.leftRatio, rightRatio: c.data?.rightRatio }, index));
    }
    if (t === 'architecture-pipeline') {
        const stages = c.data?.stages ? c.data.stages.map((item, i) => (0, exports.renderComponent)(item, i)) : [];
        return ((0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaArchitecturePipeline, { connectorStyle: c.data?.connectorStyle, connectorArrows: c.data?.connectorArrows, children: stages }, index));
    }
    if (t === 'container' || t === 'grid') {
        const isGrid = t === 'grid' || (c.columns && c.columns.length > 0);
        const content = c.items ? c.items.map((item, i) => (0, exports.renderComponent)(typeof item === 'string' ? { type: 'paragraph', data: { body: item } } : item, i)) : null;
        if (isGrid) {
            return ((0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaGrid, { cols: c.data?.cols || 2, className: "w-full", children: content }, index));
        }
        return ((0, jsx_runtime_1.jsxs)(HtmlWidgets_1.KarmaContainer, { variant: c.data?.variant || 'transparent', animationDelay: delay, children: [c.label && (0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaHeading, { text: c.label, level: 3, animationDelay: delay, className: "mb-6" }), content] }, index));
    }
    if (t === 'badge') {
        return (0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaBadge, { text: c.label || '', color: c.data?.tone || 'slate' }, index);
    }
    if (t === 'uml-class-node') {
        return (0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaUmlClassNode, { name: c.label || '', attributes: c.data?.attributes || [], methods: c.data?.methods || [], animationDelay: delay }, index);
    }
    if (t === 'uml-actor-node') {
        return (0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaUmlActorNode, { name: c.label || '', animationDelay: delay }, index);
    }
    if (t === 'uml-usecase-node') {
        return (0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaUmlUseCaseNode, { label: c.label || '', animationDelay: delay }, index);
    }
    if (t === 'uml-lifeline') {
        return (0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaUmlLifeline, { name: c.label || '', height: c.data?.height, animationDelay: delay }, index);
    }
    if (t === 'uml-arrow') {
        return (0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaUmlMessageArrow, { label: c.label || '', direction: c.data?.direction, width: c.data?.width, animationDelay: delay }, index);
    }
    if (t === 'uml-decision') {
        return (0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaUmlDecisionNode, { label: c.label || '', animationDelay: delay }, index);
    }
    if (t === 'uml-component') {
        return (0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaUmlComponentNode, { label: c.label || '', animationDelay: delay }, index);
    }
    if (t === 'uml-package') {
        return (0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaUmlPackageNode, { label: c.label || '', animationDelay: delay }, index);
    }
    if (t === 'uml-database') {
        return (0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaUmlDatabaseNode, { label: c.label || '', animationDelay: delay }, index);
    }
    if (t === 'flow-terminal') {
        return (0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaFlowTerminalNode, { label: c.label || '', animationDelay: delay }, index);
    }
    if (t === 'flow-process') {
        return (0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaFlowProcessNode, { label: c.label || '', animationDelay: delay }, index);
    }
    if (t === 'flow-io') {
        return (0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaFlowIONode, { label: c.label || '', animationDelay: delay }, index);
    }
    if (t === 'flow-document') {
        return (0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaFlowDocumentNode, { label: c.label || '', animationDelay: delay }, index);
    }
    if (t === 'uml-cloud') {
        return (0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaUmlCloudNode, { label: c.label || '', animationDelay: delay }, index);
    }
    if (t === 'uml-deployment') {
        return (0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaUmlDeploymentNode, { label: c.label || '', animationDelay: delay }, index);
    }
    if (t === 'uml-interface') {
        return (0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaUmlInterfaceNode, { label: c.label || '', animationDelay: delay }, index);
    }
    if (t === 'uml-syncbar') {
        return (0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaUmlSyncBarNode, { orientation: c.data?.orientation, length: c.data?.length, animationDelay: delay }, index);
    }
    if (t === 'microservice-node') {
        return (0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaMicroserviceNode, { name: c.label || '', stack: c.data?.stack || [], animationDelay: delay }, index);
    }
    if (t === 'api-gateway') {
        return (0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaApiGatewayNode, { label: c.label || '', animationDelay: delay }, index);
    }
    if (t === 'message-queue') {
        return (0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaMessageQueueNode, { label: c.label || '', animationDelay: delay }, index);
    }
    if (t === 'docker-node') {
        return (0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaDockerNode, { label: c.label || '', animationDelay: delay }, index);
    }
    if (t === 'kubernetes-node') {
        return (0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaKubernetesNode, { label: c.label || '', pods: c.data?.pods, animationDelay: delay }, index);
    }
    if (t === 'logging-node') {
        return (0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaLoggingNode, { label: c.label || '', animationDelay: delay }, index);
    }
    if (t === 'browser-node') {
        return (0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaBrowserNode, { title: c.label || '', animationDelay: delay }, index);
    }
    if (t === 'aws-node') {
        return (0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaAwsNode, { label: c.label || '', service: c.data?.service, animationDelay: delay }, index);
    }
    if (t === 'azure-node') {
        return (0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaAzureNode, { label: c.label || '', service: c.data?.service, animationDelay: delay }, index);
    }
    if (t === 'gcp-node') {
        return (0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaGcpNode, { label: c.label || '', service: c.data?.service, animationDelay: delay }, index);
    }
    if (t === 'language-node') {
        return (0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaLanguageNode, { language: c.data?.language || 'js', label: c.label || '', animationDelay: delay }, index);
    }
    if (t === 'connector') {
        return (0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaConnector, { direction: c.data?.direction, type: c.data?.lineType, arrows: c.data?.arrows, length: c.data?.length, label: c.label, animationDelay: delay }, index);
    }
    // Fallback for primitive rendering
    return null;
};
exports.renderComponent = renderComponent;
const KarmaComponentRenderer = ({ spec, animationDelayOverride }) => {
    const layout = spec.layout || 'standard-content';
    const components = spec.components || [];
    // Helper to split components smartly if needed
    const textComponents = components.filter((c) => c.type === 'heading' || c.type === 'paragraph' || c.type === 'title' || c.type === 'text');
    const mediaComponents = components.filter((c) => c.type !== 'heading' && c.type !== 'paragraph' && c.type !== 'title' && c.type !== 'text');
    // 1. title-slide
    if (layout === 'title-slide') {
        return ((0, jsx_runtime_1.jsx)("div", { className: "w-full h-full p-20 flex flex-col justify-center items-center text-center z-10 relative", children: (0, jsx_runtime_1.jsx)("div", { className: "max-w-5xl space-y-8 flex flex-col items-center", children: components.map((c, i) => (0, exports.renderComponent)(c, i)) }) }));
    }
    // 2. section-header
    if (layout === 'section-header') {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "w-full h-full bg-indigo-900/40 p-20 flex flex-col justify-center items-start border-l-8 border-indigo-500 z-10 relative pl-32", children: [(0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaSlideHeader, { title: spec.title, subtitle: spec.subtitle, className: "!border-b-0 mb-4" }), (0, jsx_runtime_1.jsx)("div", { className: "max-w-4xl space-y-6", children: components.map((c, i) => (0, exports.renderComponent)(c, i)) })] }));
    }
    // 10. quote
    if (layout === 'quote') {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "w-full h-full p-24 flex flex-col justify-center items-center text-center z-10 relative", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-8xl text-indigo-500 opacity-50 mb-4", children: "\"" }), (0, jsx_runtime_1.jsx)("div", { className: "max-w-5xl", children: components.map((c, i) => (0, exports.renderComponent)(c, i)) })] }));
    }
    // 11. code-explainer
    if (layout === 'code-explainer') {
        const codeComponents = components.filter((c) => c.type === 'code');
        const explanationComponents = components.filter((c) => c.type !== 'code');
        return ((0, jsx_runtime_1.jsx)("div", { className: "w-full h-full p-16 flex items-center justify-center z-10 relative bg-[#0d1117]", children: (0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaSplitLayout, { leftRatio: 2, rightRatio: 3, left: (0, jsx_runtime_1.jsxs)("div", { className: "pr-12", children: [(0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaSlideHeader, { title: spec.title, subtitle: spec.subtitle }), explanationComponents.map((c, i) => (0, exports.renderComponent)(c, i))] }), right: (0, jsx_runtime_1.jsxs)("div", { className: "w-full shadow-2xl rounded-xl overflow-hidden border border-slate-700", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-[#161b22] px-4 py-3 flex items-center gap-2 border-b border-slate-700", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-3 h-3 rounded-full bg-rose-500" }), (0, jsx_runtime_1.jsx)("div", { className: "w-3 h-3 rounded-full bg-amber-500" }), (0, jsx_runtime_1.jsx)("div", { className: "w-3 h-3 rounded-full bg-emerald-500" })] }), (0, jsx_runtime_1.jsx)("div", { className: "bg-[#0d1117] p-8 h-[600px] overflow-auto", children: codeComponents.map((c, i) => (0, exports.renderComponent)(c, i)) })] }), className: "w-full h-full max-w-[1600px]" }) }));
    }
    // 12. terminal-walkthrough
    if (layout === 'terminal-walkthrough') {
        const commands = components.map((c) => ({
            text: c.data?.body || c.data?.text || c.label || '',
            type: (c.type === 'code' || c.type === 'command') ? 'command' : 'output'
        }));
        return ((0, jsx_runtime_1.jsxs)("div", { className: "w-full h-full p-16 flex flex-col justify-center items-center z-10 relative bg-black", children: [(0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaSlideHeader, { title: spec.title, subtitle: spec.subtitle, className: "w-full max-w-[1600px]" }), (0, jsx_runtime_1.jsx)("div", { className: "w-full max-w-[1600px] flex-grow pb-12", children: (0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaTerminalWindow, { commands: commands }) })] }));
    }
    // 13. roadmap-timeline
    if (layout === 'roadmap-timeline') {
        const steps = components.map((c, index) => {
            let status = 'pending';
            if (index === 0)
                status = 'completed';
            if (index === 1)
                status = 'active';
            return { label: c.label || c.data?.body || 'Step', status: status };
        });
        return ((0, jsx_runtime_1.jsxs)("div", { className: "w-full h-full p-16 flex flex-col z-10 relative", children: [(0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaSlideHeader, { title: spec.title, subtitle: spec.subtitle }), (0, jsx_runtime_1.jsx)("div", { className: "flex-grow w-full flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaRoadmapTimeline, { steps: steps, className: "w-full max-w-[1400px]" }) })] }));
    }
    // ALL OTHER STANDARD SLIDES (Require Header)
    return ((0, jsx_runtime_1.jsxs)("div", { className: "w-full h-full p-16 flex flex-col z-10 relative", children: [(0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaSlideHeader, { title: spec.title, subtitle: spec.subtitle }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-grow w-full flex relative", children: [layout === 'standard-content' && ((0, jsx_runtime_1.jsx)("div", { className: "w-full max-w-5xl flex flex-col gap-6", children: components.map((c, i) => (0, exports.renderComponent)(c, i)) })), (layout === 'two-column' || layout === 'comparison') && ((0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaSplitLayout, { leftRatio: 1, rightRatio: 1, left: textComponents.map((c, i) => (0, exports.renderComponent)(c, i)), right: mediaComponents.map((c, i) => (0, exports.renderComponent)(c, i)), className: "w-full h-full max-w-[1600px] mx-auto" })), layout === 'split-image' && ((0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaSplitLayout, { leftRatio: 2, rightRatio: 3, left: textComponents.map((c, i) => (0, exports.renderComponent)(c, i)), right: mediaComponents.map((c, i) => (0, exports.renderComponent)(c, i)), className: "w-full h-full max-w-[1600px] mx-auto" })), layout === 'architecture-diagram' && ((0, jsx_runtime_1.jsxs)("div", { className: "w-full h-full flex items-center justify-center relative overflow-hidden bg-slate-900/50 rounded-2xl border border-slate-700 p-12 shadow-inner", children: [(0, jsx_runtime_1.jsx)("div", { className: "absolute inset-0 opacity-20 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px]" }), (0, jsx_runtime_1.jsx)("div", { className: "relative z-10 w-full h-full flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(HtmlWidgets_1.KarmaArchitecturePipeline, { className: "scale-150", children: components.map((c, i) => (0, exports.renderComponent)(c, i)) }) })] })), layout === 'feature-grid' && ((0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-[1600px] mx-auto auto-rows-fr", children: components.map((c, i) => (0, exports.renderComponent)(c, i)) })), layout === 'big-number' && ((0, jsx_runtime_1.jsxs)("div", { className: "w-full h-full flex flex-col items-center justify-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-[200px] font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-blue-500 leading-none", children: components[0]?.data?.value || components[0]?.label || '0' }), components[1] && (0, jsx_runtime_1.jsx)("div", { className: "mt-8", children: (0, exports.renderComponent)(components[1], 1) })] }))] })] }));
};
exports.KarmaComponentRenderer = KarmaComponentRenderer;
