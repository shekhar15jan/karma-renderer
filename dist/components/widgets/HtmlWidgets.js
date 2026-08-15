"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KarmaConnector = exports.KarmaLanguageNode = exports.KarmaGcpNode = exports.KarmaAzureNode = exports.KarmaAwsNode = exports.KarmaBrowserNode = exports.KarmaLoggingNode = exports.KarmaKubernetesNode = exports.KarmaDockerNode = exports.KarmaMessageQueueNode = exports.KarmaApiGatewayNode = exports.KarmaMicroserviceNode = exports.KarmaUmlSyncBarNode = exports.KarmaUmlInterfaceNode = exports.KarmaUmlDeploymentNode = exports.KarmaUmlCloudNode = exports.KarmaFlowDocumentNode = exports.KarmaFlowIONode = exports.KarmaFlowProcessNode = exports.KarmaFlowTerminalNode = exports.KarmaUmlNoteNode = exports.KarmaUmlDatabaseNode = exports.KarmaUmlPackageNode = exports.KarmaUmlComponentNode = exports.KarmaUmlDecisionNode = exports.KarmaUmlMessageArrow = exports.KarmaUmlLifeline = exports.KarmaUmlUseCaseNode = exports.KarmaUmlActorNode = exports.KarmaUmlClassNode = exports.KarmaFlowDiagram = exports.KarmaCodeBlock = exports.KarmaBadge = exports.KarmaCard = exports.KarmaRoadmapTimeline = exports.KarmaTerminalWindow = exports.KarmaSlideHeader = exports.KarmaArchitecturePipeline = exports.KarmaSplitLayout = exports.KarmaGrid = exports.KarmaContainer = exports.KarmaBulletList = exports.KarmaText = exports.KarmaParagraph = exports.KarmaHeading = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const remotion_1 = require("remotion");
// ==========================================
// Karma UI Design System (Bootstrap-style)
// ==========================================
const FPS = 30;
// Base animation hook
const useEntranceAnimation = (startFrame, duration = 15) => {
    const frame = (0, remotion_1.useCurrentFrame)();
    const opacity = (0, remotion_1.interpolate)(frame, [startFrame, startFrame + duration], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const y = (0, remotion_1.interpolate)(frame, [startFrame, startFrame + duration], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const scale = (0, remotion_1.spring)({ frame: frame - startFrame, fps: FPS, config: { damping: 12 } });
    return { opacity, y, scale };
};
// --- Typography ---
const KarmaHeading = ({ text, level = 1, animationDelay = 0, className = "" }) => {
    const { opacity, y } = useEntranceAnimation(animationDelay);
    const baseClasses = "font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-slate-100 to-slate-400 drop-shadow-md leading-tight";
    const sizeClasses = {
        1: "text-5xl lg:text-7xl",
        2: "text-4xl lg:text-5xl",
        3: "text-2xl lg:text-3xl",
        4: "text-xl lg:text-2xl",
    };
    const Tag = `h${level}`;
    return ((0, jsx_runtime_1.jsx)(Tag, { className: `${baseClasses} ${sizeClasses[level]} ${className}`, style: { opacity, transform: `translateY(${y}px)` }, children: text }));
};
exports.KarmaHeading = KarmaHeading;
const KarmaParagraph = ({ text, animationDelay = 5, className = "" }) => {
    const { opacity } = useEntranceAnimation(animationDelay);
    return ((0, jsx_runtime_1.jsx)("p", { className: `text-xl lg:text-2xl text-slate-300 leading-relaxed font-medium tracking-wide ${className}`, style: { opacity }, children: text }));
};
exports.KarmaParagraph = KarmaParagraph;
const KarmaText = ({ text, variant, className = "" }) => {
    const variants = {
        muted: "text-slate-400",
        accent: "text-indigo-400 font-semibold",
        danger: "text-rose-400 font-semibold",
        success: "text-emerald-400 font-semibold",
    };
    return (0, jsx_runtime_1.jsx)("span", { className: `${variant ? variants[variant] : "text-slate-100"} ${className}`, children: text });
};
exports.KarmaText = KarmaText;
const KarmaBulletList = ({ items, animationDelay = 5, className = "" }) => {
    return ((0, jsx_runtime_1.jsx)("ul", { className: `flex flex-col gap-4 text-xl lg:text-2xl text-slate-300 leading-relaxed font-medium tracking-wide ${className}`, children: items.map((item, idx) => {
            const { opacity, y } = useEntranceAnimation(animationDelay + (idx * 2));
            return ((0, jsx_runtime_1.jsxs)("li", { className: "flex items-start gap-4", style: { opacity, transform: `translateY(${y}px)` }, children: [(0, jsx_runtime_1.jsx)("span", { className: "text-indigo-500 font-bold mt-1", children: "\u2022" }), (0, jsx_runtime_1.jsx)("span", { children: item })] }, idx));
        }) }));
};
exports.KarmaBulletList = KarmaBulletList;
// --- Layout ---
const KarmaContainer = ({ children, variant = 'transparent', animationDelay = 0, className = "" }) => {
    const { opacity, scale } = useEntranceAnimation(animationDelay);
    const variants = {
        transparent: "",
        glass: "bg-slate-900/60 border border-slate-800 backdrop-blur-md shadow-xl",
        solid: "bg-slate-900 border border-slate-800 shadow-2xl",
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: `p-8 rounded-3xl ${variants[variant]} ${className}`, style: { opacity, transform: `scale(${scale})` }, children: children }));
};
exports.KarmaContainer = KarmaContainer;
const KarmaGrid = ({ children, cols = 1, gap = "gap-8", className = "" }) => {
    const gridCols = {
        1: "grid-cols-1",
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-3",
        4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
        12: "grid-cols-12",
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: `grid ${gridCols[cols]} ${gap} ${className}`, children: children }));
};
exports.KarmaGrid = KarmaGrid;
const KarmaSplitLayout = ({ left, right, leftRatio = 1, rightRatio = 1, className = "" }) => {
    return ((0, jsx_runtime_1.jsxs)("div", { className: `w-full flex flex-col lg:flex-row gap-12 items-center justify-between ${className}`, children: [(0, jsx_runtime_1.jsx)("div", { className: `flex flex-col gap-6 w-full lg:w-[${leftRatio * 20}%] flex-[${leftRatio}]`, children: left }), (0, jsx_runtime_1.jsx)("div", { className: `flex flex-col items-center justify-center w-full lg:w-[${rightRatio * 20}%] flex-[${rightRatio}]`, children: right })] }));
};
exports.KarmaSplitLayout = KarmaSplitLayout;
const KarmaArchitecturePipeline = ({ children, connectorStyle = 'solid', connectorArrows = 'end', className = "" }) => {
    const elements = react_1.default.Children.toArray(children);
    return ((0, jsx_runtime_1.jsx)("div", { className: `flex flex-wrap items-center justify-center gap-4 ${className}`, children: elements.map((child, idx) => ((0, jsx_runtime_1.jsxs)(react_1.default.Fragment, { children: [child, idx < elements.length - 1 && ((0, jsx_runtime_1.jsx)(exports.KarmaConnector, { direction: "horizontal", type: connectorStyle, arrows: connectorArrows, length: 60, animationDelay: (idx * 5) + 3 }))] }, idx))) }));
};
exports.KarmaArchitecturePipeline = KarmaArchitecturePipeline;
const KarmaSlideHeader = ({ title, subtitle, animationDelay = 0, className = "" }) => {
    const { opacity, y } = useEntranceAnimation(animationDelay);
    if (!title && !subtitle)
        return null;
    return ((0, jsx_runtime_1.jsxs)("div", { className: `w-full pb-6 border-b-2 border-slate-700/50 mb-12 flex flex-col ${className}`, style: { opacity, transform: `translateY(${y}px)` }, children: [title && (0, jsx_runtime_1.jsx)("h2", { className: "text-4xl font-extrabold text-slate-100", children: title }), subtitle && (0, jsx_runtime_1.jsx)("p", { className: "text-xl text-slate-400 mt-2 font-medium", children: subtitle })] }));
};
exports.KarmaSlideHeader = KarmaSlideHeader;
const KarmaTerminalWindow = ({ commands, animationDelay = 0, className = "" }) => {
    const { opacity, scale } = useEntranceAnimation(animationDelay);
    const frame = (0, remotion_1.useCurrentFrame)();
    // Start typing slightly after the window scales in
    const typingStartFrame = animationDelay + 10;
    const charsPerFrame = 1.5; // Typing speed
    // Calculate total visible characters based on frame
    const visibleChars = Math.max(0, Math.floor((frame - typingStartFrame) * charsPerFrame));
    let charsRendered = 0;
    return ((0, jsx_runtime_1.jsxs)("div", { className: `w-full h-full bg-[#0a0a0a] border border-slate-800 rounded-xl flex flex-col overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.15)] ${className}`, style: { opacity, transform: `scale(${scale})` }, children: [(0, jsx_runtime_1.jsx)("div", { className: "bg-[#111] px-6 py-4 flex items-center justify-between border-b border-slate-800", children: (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-slate-500 font-mono", children: "user@server:~" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "p-8 font-mono text-xl text-emerald-400 flex flex-col gap-4 overflow-y-auto", children: [commands.map((cmd, idx) => {
                        const cmdLength = cmd.text.length;
                        const charsForThisCmd = Math.max(0, Math.min(cmdLength, visibleChars - charsRendered));
                        const textToRender = cmd.text.substring(0, charsForThisCmd);
                        const isDone = charsForThisCmd === cmdLength;
                        charsRendered += cmdLength;
                        if (charsForThisCmd === 0 && cmd.type === 'command')
                            return null; // Don't show command line until ready
                        return ((0, jsx_runtime_1.jsxs)("div", { className: cmd.type === 'output' ? 'text-slate-400' : '', children: [cmd.type === 'command' && (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("span", { className: "text-rose-500 mr-2", children: "\u279C" }), (0, jsx_runtime_1.jsx)("span", { className: "text-sky-400 mr-2", children: "~" })] }), textToRender, cmd.type === 'command' && !isDone && charsForThisCmd > 0 && (0, jsx_runtime_1.jsx)("span", { className: "w-3 h-5 bg-emerald-400 inline-block align-middle ml-1" })] }, idx));
                    }), visibleChars >= charsRendered && (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "text-rose-500 mr-2", children: "\u279C" }), (0, jsx_runtime_1.jsx)("span", { className: "text-sky-400 mr-2", children: "~" }), (0, jsx_runtime_1.jsx)("span", { className: "w-3 h-5 bg-emerald-400 inline-block animate-pulse align-middle ml-2" })] })] })] }));
};
exports.KarmaTerminalWindow = KarmaTerminalWindow;
const KarmaRoadmapTimeline = ({ steps, animationDelay = 0, className = "" }) => {
    const { opacity, y } = useEntranceAnimation(animationDelay);
    return ((0, jsx_runtime_1.jsxs)("div", { className: `flex flex-row items-center justify-center w-full px-12 relative ${className}`, style: { opacity, transform: `translateY(${y}px)` }, children: [(0, jsx_runtime_1.jsx)("div", { className: "absolute left-12 right-12 top-1/2 h-2 bg-slate-800 -translate-y-1/2 rounded-full" }), (0, jsx_runtime_1.jsx)("div", { className: "flex justify-between w-full relative z-10", children: steps.map((step, idx) => {
                    const isCompleted = step.status === 'completed';
                    const isActive = step.status === 'active';
                    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center gap-4", children: [(0, jsx_runtime_1.jsx)("div", { className: `w-16 h-16 rounded-full flex items-center justify-center border-4 z-10 ${isCompleted ? 'bg-indigo-500 border-slate-900 shadow-[0_0_25px_rgba(99,102,241,0.6)]' :
                                    isActive ? 'bg-slate-900 border-indigo-500 shadow-[0_0_25px_rgba(99,102,241,0.6)]' :
                                        'bg-slate-800 border-slate-900'}`, children: isCompleted && (0, jsx_runtime_1.jsx)("svg", { className: "w-8 h-8 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "3", d: "M5 13l4 4L19 7" }) }) }), (0, jsx_runtime_1.jsx)("span", { className: `text-lg font-bold ${isCompleted ? 'text-indigo-300' :
                                    isActive ? 'text-white' :
                                        'text-slate-500'}`, children: step.label })] }, idx));
                }) })] }));
};
exports.KarmaRoadmapTimeline = KarmaRoadmapTimeline;
// --- Data Display ---
const KarmaCard = ({ children, color = 'slate', animationDelay = 5, className = "" }) => {
    const { opacity, scale } = useEntranceAnimation(animationDelay);
    const colors = {
        slate: "from-slate-800/50 to-slate-900/50 border-slate-700",
        indigo: "from-indigo-500/20 to-blue-500/10 border-indigo-500/50",
        emerald: "from-emerald-500/20 to-teal-500/10 border-emerald-500/50",
        rose: "from-rose-500/20 to-pink-500/10 border-rose-500/50",
        amber: "from-amber-500/20 to-orange-500/10 border-amber-500/50",
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: `relative p-8 rounded-3xl border bg-gradient-to-br shadow-xl backdrop-blur-md flex flex-col ${colors[color]} ${className}`, style: { opacity, transform: `scale(${scale})` }, children: children }));
};
exports.KarmaCard = KarmaCard;
const KarmaBadge = ({ text, color = 'slate', className = "" }) => {
    const colors = {
        slate: "bg-slate-500/20 text-slate-300 border-slate-500/30",
        indigo: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
        emerald: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        rose: "bg-rose-500/20 text-rose-400 border-rose-500/30",
        amber: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    };
    return ((0, jsx_runtime_1.jsx)("span", { className: `px-3 py-1 text-sm font-bold uppercase tracking-wider rounded-full border ${colors[color]} ${className}`, children: text }));
};
exports.KarmaBadge = KarmaBadge;
// --- Code ---
const KarmaCodeBlock = ({ code, language = "bash", animationDelay = 10, className = "" }) => {
    const { opacity, y } = useEntranceAnimation(animationDelay);
    return ((0, jsx_runtime_1.jsxs)("div", { className: `rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/10 border border-slate-700 bg-[#1e1e1e]/95 backdrop-blur-md w-full flex flex-col ${className}`, style: { opacity, transform: `translateY(${y}px)` }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-slate-900 px-6 py-4 flex items-center space-x-3 border-b border-slate-700/80", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-3.5 h-3.5 rounded-full bg-red-500" }), (0, jsx_runtime_1.jsx)("div", { className: "w-3.5 h-3.5 rounded-full bg-yellow-500" }), (0, jsx_runtime_1.jsx)("div", { className: "w-3.5 h-3.5 rounded-full bg-green-500" }), (0, jsx_runtime_1.jsx)("span", { className: "ml-6 text-sm text-slate-400 font-mono tracking-wider uppercase", children: language })] }), (0, jsx_runtime_1.jsx)("pre", { className: "p-8 text-lg font-mono text-emerald-300 overflow-hidden leading-relaxed", children: (0, jsx_runtime_1.jsx)("code", { children: code }) })] }));
};
exports.KarmaCodeBlock = KarmaCodeBlock;
// --- Diagrams ---
const KarmaFlowDiagram = ({ nodes, animationDelay = 10, className = "" }) => {
    const { opacity, y } = useEntranceAnimation(animationDelay);
    const frame = (0, remotion_1.useCurrentFrame)();
    const colors = {
        indigo: "border-indigo-500 bg-slate-800 text-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.2)]",
        emerald: "border-emerald-500 bg-slate-800 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]",
        rose: "border-rose-500 bg-slate-800 text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.2)]",
    };
    const iconColors = {
        indigo: "bg-indigo-500/20 text-indigo-400",
        emerald: "bg-emerald-500/20 text-emerald-400",
        rose: "bg-rose-500/20 text-rose-400",
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: `relative flex flex-col md:flex-row justify-between items-center gap-8 md:gap-0 w-full px-4 lg:px-12 ${className}`, style: { opacity, transform: `translateY(${y}px)` }, children: [(0, jsx_runtime_1.jsxs)("svg", { className: "absolute inset-0 w-full h-full hidden md:block z-0 pointer-events-none opacity-50", children: [nodes.length > 1 && (0, jsx_runtime_1.jsx)("line", { x1: "16%", y1: "50%", x2: "48%", y2: "50%", stroke: "#6366f1", strokeWidth: "3", strokeDasharray: "10,10" }), nodes.length > 2 && (0, jsx_runtime_1.jsx)("line", { x1: "52%", y1: "50%", x2: "84%", y2: "50%", stroke: "#10b981", strokeWidth: "3", strokeDasharray: "10,10" })] }), nodes.map((node, i) => {
                const nodeScale = (0, remotion_1.spring)({ frame: frame - (animationDelay + i * 5), fps: FPS, config: { damping: 12 } });
                const themeClass = colors[node.color || 'indigo'];
                const iconClass = iconColors[node.color || 'indigo'];
                return ((0, jsx_runtime_1.jsxs)("div", { className: `relative z-10 p-6 border-2 rounded-2xl w-48 lg:w-56 text-center ${themeClass}`, style: { transform: `scale(${nodeScale})` }, children: [(0, jsx_runtime_1.jsx)("div", { className: `w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center ${iconClass}`, children: (0, jsx_runtime_1.jsx)("svg", { className: "w-8 h-8", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" }) }) }), (0, jsx_runtime_1.jsx)("h4", { className: "text-xl font-bold text-slate-200", children: node.title }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm opacity-80 font-mono mt-2", children: node.subtitle })] }, i));
            })] }));
};
exports.KarmaFlowDiagram = KarmaFlowDiagram;
// --- Native Granular UML Primitives ---
const KarmaUmlClassNode = ({ name, attributes = [], methods = [], animationDelay = 10, className = "" }) => {
    const { opacity, scale } = useEntranceAnimation(animationDelay);
    return ((0, jsx_runtime_1.jsxs)("div", { className: `bg-[#1e1e1e] border border-slate-600 rounded-xl overflow-hidden shadow-2xl w-72 ${className}`, style: { opacity, transform: `scale(${scale})` }, children: [(0, jsx_runtime_1.jsx)("div", { className: "bg-slate-700/80 px-4 py-3 text-center font-bold text-slate-100 border-b border-slate-600", children: name }), attributes.length > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "px-4 py-3 border-b border-slate-700/50", children: attributes.map((attr, j) => ((0, jsx_runtime_1.jsxs)("div", { className: "text-emerald-400 font-mono text-sm mb-1", children: ["+ ", attr] }, j))) })), methods.length > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "px-4 py-3", children: methods.map((method, j) => ((0, jsx_runtime_1.jsxs)("div", { className: "text-blue-400 font-mono text-sm mb-1", children: ["+ ", method, "()"] }, j))) }))] }));
};
exports.KarmaUmlClassNode = KarmaUmlClassNode;
const KarmaUmlActorNode = ({ name, animationDelay = 10, className = "" }) => {
    const { opacity, scale } = useEntranceAnimation(animationDelay);
    return ((0, jsx_runtime_1.jsxs)("div", { className: `flex flex-col items-center ${className}`, style: { opacity, transform: `scale(${scale})` }, children: [(0, jsx_runtime_1.jsx)("svg", { className: "w-16 h-16 text-indigo-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" }) }), (0, jsx_runtime_1.jsx)("div", { className: "font-bold text-slate-200 mt-2 text-lg", children: name })] }));
};
exports.KarmaUmlActorNode = KarmaUmlActorNode;
const KarmaUmlUseCaseNode = ({ label, animationDelay = 10, className = "" }) => {
    const { opacity, scale } = useEntranceAnimation(animationDelay);
    return ((0, jsx_runtime_1.jsx)("div", { className: `bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-300 font-bold text-center py-4 px-6 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.1)] ${className}`, style: { opacity, transform: `scale(${scale})` }, children: label }));
};
exports.KarmaUmlUseCaseNode = KarmaUmlUseCaseNode;
const KarmaUmlLifeline = ({ name, height = 256, animationDelay = 10, className = "" }) => {
    const { opacity, y } = useEntranceAnimation(animationDelay);
    return ((0, jsx_runtime_1.jsxs)("div", { className: `flex flex-col items-center relative ${className}`, style: { opacity, transform: `translateY(${y}px)`, height: height + 60 }, children: [(0, jsx_runtime_1.jsx)("div", { className: "px-6 py-3 bg-indigo-500 text-white font-bold rounded-xl shadow-lg border border-indigo-400/50 mb-2 z-10", children: name }), (0, jsx_runtime_1.jsx)("div", { className: "w-px border-l-2 border-dashed border-slate-600 z-0", style: { height } })] }));
};
exports.KarmaUmlLifeline = KarmaUmlLifeline;
const KarmaUmlMessageArrow = ({ label, direction = 'right', width = 200, animationDelay = 10, className = "" }) => {
    const frame = (0, remotion_1.useCurrentFrame)();
    const progress = (0, remotion_1.spring)({ frame: frame - animationDelay, fps: FPS, config: { damping: 14 } });
    return ((0, jsx_runtime_1.jsxs)("div", { className: `relative ${className}`, style: { width, opacity: progress, transform: `translateX(${(1 - progress) * 20}px)` }, children: [(0, jsx_runtime_1.jsx)("div", { className: "text-emerald-400 font-mono text-sm mb-1 text-center w-full", children: label }), (0, jsx_runtime_1.jsxs)("svg", { className: "w-full h-4 overflow-visible", children: [(0, jsx_runtime_1.jsx)("line", { x1: "0", y1: "0", x2: "100%", y2: "0", stroke: "#10b981", strokeWidth: "2", strokeDasharray: direction === 'left' ? "5,5" : "" }), direction === 'right' ? ((0, jsx_runtime_1.jsx)("polygon", { points: "0,-5 10,0 0,5", fill: "#10b981", style: { transform: `translate(calc(100% - 10px), 0)` } })) : ((0, jsx_runtime_1.jsx)("polygon", { points: "10,-5 0,0 10,5", fill: "#10b981" }))] })] }));
};
exports.KarmaUmlMessageArrow = KarmaUmlMessageArrow;
const KarmaUmlDecisionNode = ({ label, animationDelay = 10, className = "" }) => {
    const { opacity, scale } = useEntranceAnimation(animationDelay);
    return ((0, jsx_runtime_1.jsx)("div", { className: `flex items-center justify-center p-8 ${className}`, style: { opacity, transform: `scale(${scale})` }, children: (0, jsx_runtime_1.jsx)("div", { className: "relative w-32 h-32 border-2 border-amber-500 bg-amber-500/20 rotate-45 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.2)]", children: (0, jsx_runtime_1.jsx)("div", { className: "absolute -rotate-45 font-bold text-amber-300 text-center w-40", children: label }) }) }));
};
exports.KarmaUmlDecisionNode = KarmaUmlDecisionNode;
const KarmaUmlComponentNode = ({ label, animationDelay = 10, className = "" }) => {
    const { opacity, scale } = useEntranceAnimation(animationDelay);
    return ((0, jsx_runtime_1.jsxs)("div", { className: `relative w-48 h-32 border-2 border-indigo-500 bg-indigo-500/10 flex items-center justify-center rounded-lg shadow-xl ${className}`, style: { opacity, transform: `scale(${scale})` }, children: [(0, jsx_runtime_1.jsx)("div", { className: "absolute -left-3 top-6 w-6 h-5 border-2 border-indigo-500 bg-slate-900 rounded-sm" }), (0, jsx_runtime_1.jsx)("div", { className: "absolute -left-3 bottom-6 w-6 h-5 border-2 border-indigo-500 bg-slate-900 rounded-sm" }), (0, jsx_runtime_1.jsx)("span", { className: "font-bold text-indigo-300 text-center px-4", children: label })] }));
};
exports.KarmaUmlComponentNode = KarmaUmlComponentNode;
const KarmaUmlPackageNode = ({ label, animationDelay = 10, className = "" }) => {
    const { opacity, scale } = useEntranceAnimation(animationDelay);
    return ((0, jsx_runtime_1.jsxs)("div", { className: `relative mt-8 w-48 h-32 border-2 border-blue-500 bg-blue-500/10 flex items-center justify-center rounded-b-lg rounded-tr-lg shadow-xl ${className}`, style: { opacity, transform: `scale(${scale})` }, children: [(0, jsx_runtime_1.jsx)("div", { className: "absolute -top-8 left-[-2px] w-24 h-8 border-t-2 border-l-2 border-r-2 border-blue-500 bg-blue-500/10 rounded-t-lg" }), (0, jsx_runtime_1.jsx)("span", { className: "font-bold text-blue-300", children: label })] }));
};
exports.KarmaUmlPackageNode = KarmaUmlPackageNode;
const KarmaUmlDatabaseNode = ({ label, animationDelay = 10, className = "" }) => {
    const { opacity, scale } = useEntranceAnimation(animationDelay);
    return ((0, jsx_runtime_1.jsxs)("div", { className: `relative w-32 h-40 border-2 border-emerald-500 bg-slate-900 rounded-b-[50%] flex flex-col items-center shadow-xl ${className}`, style: { opacity, transform: `scale(${scale})` }, children: [(0, jsx_runtime_1.jsx)("div", { className: "absolute top-0 w-full h-12 border-2 border-emerald-500 rounded-[50%] bg-emerald-500/20 -translate-y-1/2" }), (0, jsx_runtime_1.jsx)("div", { className: "mt-12 font-bold text-emerald-300 text-center px-2", children: label })] }));
};
exports.KarmaUmlDatabaseNode = KarmaUmlDatabaseNode;
const KarmaUmlNoteNode = ({ text, animationDelay = 10, className = "" }) => {
    const { opacity, scale } = useEntranceAnimation(animationDelay);
    return ((0, jsx_runtime_1.jsxs)("div", { className: `relative w-48 p-6 border border-yellow-500/50 bg-yellow-500/10 shadow-lg ${className}`, style: { opacity, transform: `scale(${scale})` }, children: [(0, jsx_runtime_1.jsx)("div", { className: "absolute top-[-1px] right-[-1px] w-0 h-0 border-l-[24px] border-l-transparent border-t-[24px] border-t-slate-950" }), (0, jsx_runtime_1.jsx)("div", { className: "absolute top-[-1px] right-[-1px] w-6 h-6 border-b border-l border-yellow-500/50 bg-yellow-500/20" }), (0, jsx_runtime_1.jsx)("div", { className: "text-yellow-200 font-mono text-sm leading-relaxed", children: text })] }));
};
exports.KarmaUmlNoteNode = KarmaUmlNoteNode;
// --- Flowchart Specific Primitives ---
const KarmaFlowTerminalNode = ({ label, animationDelay = 10, className = "" }) => {
    const { opacity, scale } = useEntranceAnimation(animationDelay);
    return ((0, jsx_runtime_1.jsx)("div", { className: `px-8 py-4 rounded-full border-2 border-rose-500 bg-rose-500/20 text-rose-300 font-bold shadow-lg text-center min-w-[120px] ${className}`, style: { opacity, transform: `scale(${scale})` }, children: label }));
};
exports.KarmaFlowTerminalNode = KarmaFlowTerminalNode;
const KarmaFlowProcessNode = ({ label, animationDelay = 10, className = "" }) => {
    const { opacity, scale } = useEntranceAnimation(animationDelay);
    return ((0, jsx_runtime_1.jsx)("div", { className: `px-8 py-6 rounded-md border-2 border-cyan-500 bg-cyan-500/10 text-cyan-300 font-bold shadow-lg text-center min-w-[140px] ${className}`, style: { opacity, transform: `scale(${scale})` }, children: label }));
};
exports.KarmaFlowProcessNode = KarmaFlowProcessNode;
const KarmaFlowIONode = ({ label, animationDelay = 10, className = "" }) => {
    const { opacity, scale } = useEntranceAnimation(animationDelay);
    return ((0, jsx_runtime_1.jsx)("div", { className: `px-8 py-4 border-2 border-fuchsia-500 bg-fuchsia-500/20 text-fuchsia-300 font-bold shadow-lg text-center min-w-[140px] ${className}`, style: { opacity, transform: `scale(${scale}) skewX(-20deg)` }, children: (0, jsx_runtime_1.jsx)("div", { style: { transform: 'skewX(20deg)' }, children: label }) }));
};
exports.KarmaFlowIONode = KarmaFlowIONode;
const KarmaFlowDocumentNode = ({ label, animationDelay = 10, className = "" }) => {
    const { opacity, scale } = useEntranceAnimation(animationDelay);
    return ((0, jsx_runtime_1.jsxs)("div", { className: `relative w-40 h-28 text-teal-300 font-bold flex flex-col items-center justify-center shadow-xl ${className}`, style: { opacity, transform: `scale(${scale})` }, children: [(0, jsx_runtime_1.jsx)("svg", { className: "absolute inset-0 w-full h-full text-teal-500/20 overflow-visible", preserveAspectRatio: "none", viewBox: "0 0 100 100", children: (0, jsx_runtime_1.jsx)("path", { d: "M0,0 L100,0 L100,80 Q75,100 50,80 T0,80 Z", fill: "currentColor", stroke: "#14b8a6", strokeWidth: "2" }) }), (0, jsx_runtime_1.jsx)("span", { className: "z-10 -mt-4", children: label })] }));
};
exports.KarmaFlowDocumentNode = KarmaFlowDocumentNode;
// --- Edge Case / Specialized HLD & LLD Primitives ---
const KarmaUmlCloudNode = ({ label, animationDelay = 10, className = "" }) => {
    const { opacity, scale } = useEntranceAnimation(animationDelay);
    return ((0, jsx_runtime_1.jsxs)("div", { className: `relative flex flex-col items-center justify-center text-sky-400 font-bold w-40 h-32 ${className}`, style: { opacity, transform: `scale(${scale})` }, children: [(0, jsx_runtime_1.jsx)("svg", { className: "absolute inset-0 w-full h-full text-sky-500/20 drop-shadow-[0_0_15px_rgba(14,165,233,0.3)]", viewBox: "0 0 24 24", fill: "currentColor", stroke: "currentColor", strokeWidth: "0.5", children: (0, jsx_runtime_1.jsx)("path", { d: "M17.5 19C19.9853 19 22 16.9853 22 14.5C22 12.1387 20.1834 10.2016 17.8687 10.0125C17.4332 7.15175 14.9682 5 12 5C9.3789 5 7.14088 6.84074 6.32627 9.25624C3.89674 9.47565 2 11.5175 2 14C2 16.7614 4.23858 19 7 19H17.5Z" }) }), (0, jsx_runtime_1.jsx)("span", { className: "z-10 mt-2", children: label })] }));
};
exports.KarmaUmlCloudNode = KarmaUmlCloudNode;
const KarmaUmlDeploymentNode = ({ label, animationDelay = 10, className = "" }) => {
    const { opacity, scale } = useEntranceAnimation(animationDelay);
    return ((0, jsx_runtime_1.jsxs)("div", { className: `relative flex flex-col items-center justify-center w-36 h-40 ${className}`, style: { opacity, transform: `scale(${scale})` }, children: [(0, jsx_runtime_1.jsxs)("svg", { viewBox: "0 0 100 100", className: "absolute inset-0 w-full h-full text-slate-400 overflow-visible drop-shadow-xl", children: [(0, jsx_runtime_1.jsx)("polygon", { points: "0,25 50,0 100,25 50,50", fill: "rgba(148, 163, 184, 0.2)", stroke: "currentColor", strokeWidth: "2" }), (0, jsx_runtime_1.jsx)("polygon", { points: "0,25 50,50 50,100 0,75", fill: "rgba(148, 163, 184, 0.1)", stroke: "currentColor", strokeWidth: "2" }), (0, jsx_runtime_1.jsx)("polygon", { points: "50,50 100,25 100,75 50,100", fill: "rgba(148, 163, 184, 0.3)", stroke: "currentColor", strokeWidth: "2" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "z-10 text-slate-200 font-bold bg-slate-900/50 px-3 py-1 rounded backdrop-blur-sm mt-8 border border-slate-700/50 shadow-lg text-sm text-center", children: ["\u00ABdevice\u00BB", (0, jsx_runtime_1.jsx)("br", {}), label] })] }));
};
exports.KarmaUmlDeploymentNode = KarmaUmlDeploymentNode;
const KarmaUmlInterfaceNode = ({ label, animationDelay = 10, className = "" }) => {
    const { opacity, scale } = useEntranceAnimation(animationDelay);
    return ((0, jsx_runtime_1.jsxs)("div", { className: `flex items-center ${className}`, style: { opacity, transform: `scale(${scale})` }, children: [(0, jsx_runtime_1.jsx)("div", { className: "w-12 h-1 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" }), (0, jsx_runtime_1.jsx)("div", { className: "w-8 h-8 rounded-full border-4 border-indigo-500 bg-slate-900 shadow-[0_0_15px_rgba(99,102,241,0.5)] z-10" }), (0, jsx_runtime_1.jsx)("span", { className: "ml-3 font-bold text-indigo-300 bg-slate-900/50 px-2 py-1 rounded backdrop-blur-sm text-sm", children: label })] }));
};
exports.KarmaUmlInterfaceNode = KarmaUmlInterfaceNode;
const KarmaUmlSyncBarNode = ({ orientation = 'horizontal', length = 160, animationDelay = 10, className = "" }) => {
    const { opacity, scale } = useEntranceAnimation(animationDelay);
    const w = orientation === 'horizontal' ? length : 12;
    const h = orientation === 'horizontal' ? 12 : length;
    return ((0, jsx_runtime_1.jsx)("div", { className: `bg-slate-300 rounded-sm shadow-[0_0_15px_rgba(203,213,225,0.4)] ${className}`, style: { width: w, height: h, opacity, transform: `scale(${scale})` } }));
};
exports.KarmaUmlSyncBarNode = KarmaUmlSyncBarNode;
// --- Microservices Specific Primitives ---
const KarmaMicroserviceNode = ({ name, stack = [], animationDelay = 10, className = "" }) => {
    const { opacity, scale } = useEntranceAnimation(animationDelay);
    return ((0, jsx_runtime_1.jsxs)("div", { className: `relative p-6 border-2 border-indigo-500 bg-slate-900/90 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.2)] flex flex-col items-center justify-center min-w-[200px] ${className}`, style: { opacity, transform: `scale(${scale})` }, children: [(0, jsx_runtime_1.jsx)("div", { className: "absolute -top-6 bg-indigo-500 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg border border-indigo-400/50", children: (0, jsx_runtime_1.jsx)("svg", { className: "w-6 h-6 text-white", fill: "none", stroke: "currentColor", strokeWidth: "2", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" }) }) }), (0, jsx_runtime_1.jsx)("h4", { className: "mt-4 text-lg font-bold text-slate-100", children: name }), stack.length > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-2 mt-3 justify-center", children: stack.map((s, i) => ((0, jsx_runtime_1.jsx)("span", { className: "px-2 py-1 bg-indigo-500/20 text-indigo-300 text-[10px] font-mono rounded uppercase tracking-wider border border-indigo-500/30", children: s }, i))) }))] }));
};
exports.KarmaMicroserviceNode = KarmaMicroserviceNode;
const KarmaApiGatewayNode = ({ label, animationDelay = 10, className = "" }) => {
    const { opacity, y } = useEntranceAnimation(animationDelay);
    return ((0, jsx_runtime_1.jsx)("div", { className: `w-full py-4 px-8 border-2 border-emerald-500 bg-emerald-500/10 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center justify-center ${className}`, style: { opacity, transform: `translateY(${y}px)` }, children: (0, jsx_runtime_1.jsx)("span", { className: "font-bold text-emerald-400 tracking-widest uppercase", children: label }) }));
};
exports.KarmaApiGatewayNode = KarmaApiGatewayNode;
const KarmaMessageQueueNode = ({ label, animationDelay = 10, className = "" }) => {
    const { opacity, scale } = useEntranceAnimation(animationDelay);
    return ((0, jsx_runtime_1.jsxs)("div", { className: `relative flex items-center h-16 w-48 ${className}`, style: { opacity, transform: `scale(${scale})` }, children: [(0, jsx_runtime_1.jsx)("div", { className: "absolute left-0 w-16 h-16 border-2 border-amber-500 bg-amber-500/10 rounded-lg -rotate-12 translate-x-2" }), (0, jsx_runtime_1.jsx)("div", { className: "absolute left-0 w-16 h-16 border-2 border-amber-500 bg-amber-500/20 rounded-lg -rotate-6 translate-x-1" }), (0, jsx_runtime_1.jsx)("div", { className: "absolute left-0 w-full h-16 border-2 border-amber-500 bg-slate-900 rounded-lg flex items-center justify-center z-10 shadow-[0_0_15px_rgba(245,158,11,0.2)]", children: (0, jsx_runtime_1.jsx)("span", { className: "font-bold text-amber-400 pl-4", children: label }) })] }));
};
exports.KarmaMessageQueueNode = KarmaMessageQueueNode;
// --- DevOps & UI Primitives ---
const KarmaDockerNode = ({ label, animationDelay = 10, className = "" }) => {
    const { opacity, scale } = useEntranceAnimation(animationDelay);
    return ((0, jsx_runtime_1.jsxs)("div", { className: `relative flex flex-col items-center justify-center p-4 border-2 border-sky-500 bg-sky-900/30 rounded shadow-[0_0_15px_rgba(14,165,233,0.3)] w-40 h-32 hover:scale-105 transition-transform cursor-pointer ${className}`, style: { opacity, transform: `scale(${scale})` }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex gap-1 mb-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-4 h-4 bg-sky-500 rounded-sm" }), (0, jsx_runtime_1.jsx)("div", { className: "w-4 h-4 bg-sky-500 rounded-sm" }), (0, jsx_runtime_1.jsx)("div", { className: "w-4 h-4 bg-sky-500 rounded-sm" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-1 mb-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-4 h-4 bg-transparent" }), (0, jsx_runtime_1.jsx)("div", { className: "w-4 h-4 bg-sky-500 rounded-sm" }), (0, jsx_runtime_1.jsx)("div", { className: "w-4 h-4 bg-sky-500 rounded-sm" })] }), (0, jsx_runtime_1.jsx)("span", { className: "font-bold text-sky-400 text-sm mt-2", children: label })] }));
};
exports.KarmaDockerNode = KarmaDockerNode;
const KarmaKubernetesNode = ({ label, pods = 3, animationDelay = 10, className = "" }) => {
    const { opacity, scale } = useEntranceAnimation(animationDelay);
    return ((0, jsx_runtime_1.jsxs)("div", { className: `relative p-4 border-2 border-dashed border-blue-500 bg-blue-900/10 rounded-xl w-56 shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:-translate-y-1 transition-transform cursor-pointer ${className}`, style: { opacity, transform: `scale(${scale})` }, children: [(0, jsx_runtime_1.jsx)("div", { className: "absolute -top-3 left-4 bg-slate-900 px-2 font-bold text-blue-400 text-xs uppercase tracking-wider", children: label }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-2 mt-2 justify-center", children: Array.from({ length: pods }).map((_, i) => ((0, jsx_runtime_1.jsx)("div", { className: "flex items-center justify-center w-12 h-12 rounded-full border-2 border-blue-500 bg-blue-500/20 shadow-inner", children: (0, jsx_runtime_1.jsx)("div", { className: "w-4 h-4 rounded-full bg-blue-400" }) }, i))) })] }));
};
exports.KarmaKubernetesNode = KarmaKubernetesNode;
const KarmaLoggingNode = ({ label, animationDelay = 10, className = "" }) => {
    const { opacity, scale } = useEntranceAnimation(animationDelay);
    return ((0, jsx_runtime_1.jsxs)("div", { className: `relative flex flex-col p-4 border border-slate-600 bg-black rounded shadow-lg w-48 h-32 hover:-rotate-1 transition-transform cursor-pointer ${className}`, style: { opacity, transform: `scale(${scale})` }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "font-mono text-emerald-500 text-[10px] leading-tight flex-grow opacity-70", children: [(0, jsx_runtime_1.jsx)("div", { children: "> tail -f /var/log" }), (0, jsx_runtime_1.jsx)("div", { children: "[INFO] System OK" }), (0, jsx_runtime_1.jsx)("div", { children: "[WARN] High CPU" }), (0, jsx_runtime_1.jsx)("div", { className: "animate-pulse", children: "[INFO] Data sync..." })] }), (0, jsx_runtime_1.jsx)("div", { className: "font-bold text-slate-300 text-sm text-center border-t border-slate-800 pt-2 mt-2", children: label })] }));
};
exports.KarmaLoggingNode = KarmaLoggingNode;
const KarmaBrowserNode = ({ title, animationDelay = 10, className = "" }) => {
    const { opacity, scale } = useEntranceAnimation(animationDelay);
    return ((0, jsx_runtime_1.jsxs)("div", { className: `flex flex-col border border-slate-700 bg-slate-900 rounded-lg shadow-2xl overflow-hidden w-64 h-40 hover:-translate-y-2 transition-transform cursor-pointer ${className}`, style: { opacity, transform: `scale(${scale})` }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-slate-800 px-3 py-2 flex items-center gap-2 border-b border-slate-700", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex gap-1.5", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-3 h-3 rounded-full bg-rose-500" }), (0, jsx_runtime_1.jsx)("div", { className: "w-3 h-3 rounded-full bg-amber-500" }), (0, jsx_runtime_1.jsx)("div", { className: "w-3 h-3 rounded-full bg-emerald-500" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-grow text-center text-[10px] font-mono text-slate-400 bg-slate-900 rounded px-2 py-0.5 mx-4 truncate", children: ["https://", title.toLowerCase().replace(/\s+/g, ''), ".com"] })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex-grow bg-slate-50 flex items-center justify-center p-4", children: (0, jsx_runtime_1.jsx)("div", { className: "text-slate-800 font-bold text-lg", children: title }) })] }));
};
exports.KarmaBrowserNode = KarmaBrowserNode;
// --- Cloud Provider Primitives ---
const KarmaAwsNode = ({ label, service, animationDelay = 10, className = "" }) => {
    const { opacity, scale } = useEntranceAnimation(animationDelay);
    return ((0, jsx_runtime_1.jsx)("div", { className: `relative p-5 border-2 border-[#FF9900] bg-slate-900 rounded-xl shadow-[0_0_20px_rgba(255,153,0,0.15)] w-48 hover:-translate-y-1 transition-transform cursor-pointer ${className}`, style: { opacity, transform: `scale(${scale})` }, children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-10 h-10 rounded-lg bg-[#FF9900]/10 border border-[#FF9900]/50 flex items-center justify-center", children: (0, jsx_runtime_1.jsxs)("svg", { viewBox: "0 0 24 24", fill: "currentColor", className: "w-6 h-6 text-[#FF9900]", children: [(0, jsx_runtime_1.jsx)("path", { d: "M14.92 18.06c-1.8.8-4.22 1.34-6.52 1.34-3.5 0-5.83-1.12-5.83-1.12l.6-1.55s2.2 1.05 5.3 1.05c2.9 0 5-.87 6-1.52-.02-.02.46.72.45.8z" }), (0, jsx_runtime_1.jsx)("path", { d: "M16.58 17.52s-.75-1.54-2.14-2.58l.72-1.25c1.86 1.15 3.12 3.1 3.12 3.1l-1.7 .73z" })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-bold text-slate-100 text-sm", children: label }), service && (0, jsx_runtime_1.jsx)("span", { className: "text-[#FF9900] text-[10px] font-mono tracking-widest uppercase", children: service })] })] }) }));
};
exports.KarmaAwsNode = KarmaAwsNode;
const KarmaAzureNode = ({ label, service, animationDelay = 10, className = "" }) => {
    const { opacity, scale } = useEntranceAnimation(animationDelay);
    return ((0, jsx_runtime_1.jsx)("div", { className: `relative p-5 border-2 border-[#0089D6] bg-slate-900 rounded-xl shadow-[0_0_20px_rgba(0,137,214,0.15)] w-48 hover:-translate-y-1 transition-transform cursor-pointer ${className}`, style: { opacity, transform: `scale(${scale})` }, children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-10 h-10 rounded-lg bg-[#0089D6]/10 border border-[#0089D6]/50 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)("svg", { viewBox: "0 0 24 24", fill: "currentColor", className: "w-6 h-6 text-[#0089D6]", children: (0, jsx_runtime_1.jsx)("path", { d: "M5.483 21.3H1.05l7.087-11.45 3.96 6.843-6.614 4.607zm5.55-10.233l2.802-4.832 9.115 15.065h-4.394l-7.523-10.233z" }) }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-bold text-slate-100 text-sm", children: label }), service && (0, jsx_runtime_1.jsx)("span", { className: "text-[#0089D6] text-[10px] font-mono tracking-widest uppercase", children: service })] })] }) }));
};
exports.KarmaAzureNode = KarmaAzureNode;
const KarmaGcpNode = ({ label, service, animationDelay = 10, className = "" }) => {
    const { opacity, scale } = useEntranceAnimation(animationDelay);
    return ((0, jsx_runtime_1.jsxs)("div", { className: `relative p-5 bg-slate-900 rounded-xl w-48 hover:-translate-y-1 transition-transform cursor-pointer ${className}`, style: { opacity, transform: `scale(${scale})` }, children: [(0, jsx_runtime_1.jsx)("div", { className: "absolute inset-0 rounded-xl border-2 border-transparent", style: { backgroundImage: 'linear-gradient(#0f172a, #0f172a), linear-gradient(to right, #4285F4, #EA4335, #FBBC05, #34A853)', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box' } }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3 relative z-10", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shadow-inner overflow-hidden", children: (0, jsx_runtime_1.jsxs)("svg", { viewBox: "0 0 24 24", className: "w-6 h-6", children: [(0, jsx_runtime_1.jsx)("path", { fill: "#4285F4", d: "M12 2.25L3.75 7v10L12 21.75l8.25-4.75V7z", opacity: "0.8" }), (0, jsx_runtime_1.jsx)("path", { fill: "#34A853", d: "M12 11.25L7.5 8.65v5.2l4.5 2.6z" }), (0, jsx_runtime_1.jsx)("path", { fill: "#FBBC05", d: "M12 11.25l4.5-2.6v5.2l-4.5 2.6z" }), (0, jsx_runtime_1.jsx)("path", { fill: "#EA4335", d: "M12 11.25L7.5 8.65l4.5-2.6 4.5 2.6z" })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-bold text-slate-100 text-sm", children: label }), service && (0, jsx_runtime_1.jsx)("span", { className: "text-slate-400 text-[10px] font-mono tracking-widest uppercase", children: service })] })] })] }));
};
exports.KarmaGcpNode = KarmaGcpNode;
// --- Programming Language Primitives ---
const KarmaLanguageNode = ({ language, label, animationDelay = 10, className = "" }) => {
    const { opacity, scale } = useEntranceAnimation(animationDelay);
    const langLower = language.toLowerCase();
    let colorClass = "border-slate-500 text-slate-300 bg-slate-900 shadow-[0_0_15px_rgba(100,116,139,0.2)]";
    let iconNode = (0, jsx_runtime_1.jsx)("span", { className: "font-mono text-xs", children: "{}" });
    if (langLower.includes("js") || langLower.includes("javascript")) {
        colorClass = "border-[#F7DF1E] text-[#F7DF1E] bg-[#F7DF1E]/10 shadow-[0_0_15px_rgba(247,223,30,0.15)]";
        iconNode = (0, jsx_runtime_1.jsx)("span", { className: "font-bold text-black bg-[#F7DF1E] px-1 text-[10px] mt-1 ml-1", children: "JS" });
    }
    else if (langLower.includes("ts") || langLower.includes("typescript")) {
        colorClass = "border-[#3178C6] text-[#3178C6] bg-[#3178C6]/10 shadow-[0_0_15px_rgba(49,120,198,0.15)]";
        iconNode = (0, jsx_runtime_1.jsx)("span", { className: "font-bold text-white bg-[#3178C6] px-1 text-[10px] mt-1 ml-1", children: "TS" });
    }
    else if (langLower.includes("python") || langLower === "py") {
        colorClass = "border-[#3776AB] text-[#3776AB] bg-[#3776AB]/10 shadow-[0_0_15px_rgba(55,118,171,0.15)]";
        iconNode = ((0, jsx_runtime_1.jsxs)("svg", { viewBox: "0 0 110 110", className: "w-5 h-5 text-[#3776AB] fill-current", children: [(0, jsx_runtime_1.jsx)("path", { d: "M53.8,11.2c-27.1,0-25.6,11.7-25.6,11.7l0.1,12h26.4v3.8H26.9c0,0-15.7-1.8-15.7,23.3c0,25.1,13.7,24,13.7,24h8.3v-11.7c0,0-0.2-13.3,13.5-13.3h27.1c0,0,12.5,0,12.5-12v-26C86.3,13,74.7,11.2,53.8,11.2z M41.8,20.4c2.5,0,4.6,2,4.6,4.6c0,2.5-2,4.6-4.6,4.6c-2.5,0-4.6-2-4.6-4.6C37.2,22.4,39.3,20.4,41.8,20.4z" }), (0, jsx_runtime_1.jsx)("path", { d: "M55.8,99.2c27.1,0,25.6-11.7,25.6-11.7l-0.1-12H54.9v-3.8h27.8c0,0,15.7,1.8,15.7-23.3c0-25.1-13.7-24-13.7-24h-8.3v11.7c0,0,0.2,13.3-13.5,13.3H35.8c0,0-12.5,0-12.5,12v26C23.3,97.4,34.9,99.2,55.8,99.2z M67.8,90c-2.5,0-4.6-2-4.6-4.6c0-2.5,2-4.6,4.6-4.6c2.5,0,4.6,2,4.6,4.6C72.4,88,70.3,90,67.8,90z", fill: "#FFD43B" })] }));
    }
    else if (langLower.includes("go")) {
        colorClass = "border-[#00ADD8] text-[#00ADD8] bg-[#00ADD8]/10 shadow-[0_0_15px_rgba(0,173,216,0.15)]";
        iconNode = (0, jsx_runtime_1.jsx)("span", { className: "font-bold text-[#00ADD8] italic tracking-tighter pr-1", children: "GO" });
    }
    else if (langLower.includes("java")) {
        colorClass = "border-[#b07219] text-[#b07219] bg-[#b07219]/10 shadow-[0_0_15px_rgba(176,114,25,0.15)]";
        iconNode = (0, jsx_runtime_1.jsx)("svg", { className: "w-5 h-5 text-[#b07219]", viewBox: "0 0 24 24", fill: "currentColor", children: (0, jsx_runtime_1.jsx)("path", { d: "M16 11c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2v-1h10v1zm-2 3H8v2h6v-2zm-1-6H9v1h4V8zm4-2h-1c-.5-1.5-1.5-2.5-3-3-.7-.2-1.3-.2-1.8 0-.6.2-1 .7-1.3 1.2-.5 1-1.1 1.7-1.8 2-1 .5-2.2.4-3.1-.3l-.7-.6 1-1.3.7.6c.6.4 1.3.5 1.9.2.4-.2.8-.7 1.1-1.4.3-.6.7-1.1 1.3-1.3 1-.3 2.1-.2 2.9.4.9.7 1.6 1.8 1.9 3.1z" }) });
    }
    else if (langLower.includes("rust") || langLower === "rs") {
        colorClass = "border-[#dea584] text-[#dea584] bg-[#dea584]/10 shadow-[0_0_15px_rgba(222,165,132,0.15)]";
        iconNode = (0, jsx_runtime_1.jsxs)("svg", { className: "w-5 h-5 text-[#dea584]", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [(0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "8" }), (0, jsx_runtime_1.jsx)("path", { d: "M12 8v8M9 10h6" })] });
    }
    else if (langLower.includes("react")) {
        colorClass = "border-[#61DAFB] text-[#61DAFB] bg-[#61DAFB]/10 shadow-[0_0_15px_rgba(97,218,251,0.15)]";
        iconNode = ((0, jsx_runtime_1.jsxs)("svg", { viewBox: "-11.5 -10.23174 23 20.46348", className: "w-6 h-6 text-[#61DAFB]", children: [(0, jsx_runtime_1.jsx)("circle", { cx: "0", cy: "0", r: "2.05", fill: "currentColor" }), (0, jsx_runtime_1.jsxs)("g", { stroke: "currentColor", strokeWidth: "1", fill: "none", children: [(0, jsx_runtime_1.jsx)("ellipse", { rx: "11", ry: "4.2" }), (0, jsx_runtime_1.jsx)("ellipse", { rx: "11", ry: "4.2", transform: "rotate(60)" }), (0, jsx_runtime_1.jsx)("ellipse", { rx: "11", ry: "4.2", transform: "rotate(120)" })] })] }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: `relative flex items-center gap-3 p-3 border-2 rounded-lg ${colorClass} w-36 hover:scale-105 transition-transform cursor-pointer ${className}`, style: { opacity, transform: `scale(${scale})` }, children: [(0, jsx_runtime_1.jsx)("div", { className: "w-8 h-8 rounded bg-slate-950 flex items-center justify-center font-bold font-mono text-xs border border-current opacity-90 overflow-hidden", children: iconNode }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-col", children: (0, jsx_runtime_1.jsx)("span", { className: "font-bold text-sm leading-tight text-slate-100", children: label || language }) })] }));
};
exports.KarmaLanguageNode = KarmaLanguageNode;
// --- Connection Primitives (Arrows & Lines) ---
const KarmaConnector = ({ direction = 'horizontal', type = 'solid', arrows = 'end', length = 100, label, animationDelay = 10, className = "" }) => {
    const { opacity, scale } = useEntranceAnimation(animationDelay);
    const lenStr = typeof length === 'number' ? `${length}px` : length;
    const isHoriz = direction === 'horizontal';
    const lineClass = `border-slate-500 ${type === 'dashed' ? 'border-dashed' : type === 'dotted' ? 'border-dotted' : 'border-solid'}`;
    return ((0, jsx_runtime_1.jsx)("div", { className: `relative flex items-center justify-center ${className}`, style: { opacity, transform: `scale(${scale})`, width: isHoriz ? lenStr : 'auto', height: !isHoriz ? lenStr : 'auto', minWidth: isHoriz ? '20px' : 'auto', minHeight: !isHoriz ? '20px' : 'auto' }, children: (0, jsx_runtime_1.jsxs)("div", { className: `absolute flex items-center justify-center ${isHoriz ? 'w-full h-0 border-t-2' : 'h-full w-0 border-l-2'} ${lineClass}`, children: [(arrows === 'start' || arrows === 'both') && ((0, jsx_runtime_1.jsx)("div", { className: `absolute ${isHoriz ? 'left-0 border-t-2 border-l-2 -rotate-45 w-3 h-3 -ml-0.5' : 'top-0 border-t-2 border-l-2 rotate-45 w-3 h-3 -mt-0.5'} border-slate-500` })), (arrows === 'end' || arrows === 'both') && ((0, jsx_runtime_1.jsx)("div", { className: `absolute ${isHoriz ? 'right-0 border-t-2 border-r-2 rotate-45 w-3 h-3 -mr-0.5' : 'bottom-0 border-b-2 border-r-2 rotate-45 w-3 h-3 -mb-0.5'} border-slate-500` })), label && ((0, jsx_runtime_1.jsx)("div", { className: `absolute bg-slate-900 px-2 text-[10px] font-mono text-slate-400 border border-slate-700 rounded z-10 whitespace-nowrap shadow-md ${isHoriz ? '-translate-y-4' : 'translate-x-4'}`, children: label }))] }) }));
};
exports.KarmaConnector = KarmaConnector;
