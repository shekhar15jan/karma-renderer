import React from 'react';
import { interpolate, useCurrentFrame, spring } from 'remotion';

// ==========================================
// Karma UI Design System (Bootstrap-style)
// ==========================================

const FPS = 30;

// Base animation hook
const useEntranceAnimation = (startFrame: number, duration: number = 15) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [startFrame, startFrame + duration], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const y = interpolate(frame, [startFrame, startFrame + duration], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const scale = spring({ frame: frame - startFrame, fps: FPS, config: { damping: 12 } });
  return { opacity, y, scale };
};

// --- Typography ---

export const KarmaHeading: React.FC<{ text: string, level?: 1 | 2 | 3 | 4, animationDelay?: number, className?: string }> = ({ text, level = 1, animationDelay = 0, className = "" }) => {
  const { opacity, y } = useEntranceAnimation(animationDelay);

  const baseClasses = "font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-slate-100 to-slate-400 drop-shadow-md leading-tight";
  const sizeClasses = {
    1: "text-5xl lg:text-7xl",
    2: "text-4xl lg:text-5xl",
    3: "text-2xl lg:text-3xl",
    4: "text-xl lg:text-2xl",
  };

  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <Tag className={`${baseClasses} ${sizeClasses[level]} ${className}`} style={{ opacity, transform: `translateY(${y}px)` }}>
      {text}
    </Tag>
  );
};

export const KarmaParagraph: React.FC<{ text: string, animationDelay?: number, className?: string }> = ({ text, animationDelay = 5, className = "" }) => {
  const { opacity } = useEntranceAnimation(animationDelay);
  return (
    <p className={`text-xl lg:text-2xl text-slate-300 leading-relaxed font-medium tracking-wide ${className}`} style={{ opacity }}>
      {text}
    </p>
  );
};

export const KarmaText: React.FC<{ text: string, variant?: 'muted' | 'accent' | 'danger' | 'success', className?: string }> = ({ text, variant, className = "" }) => {
  const variants = {
    muted: "text-slate-400",
    accent: "text-indigo-400 font-semibold",
    danger: "text-rose-400 font-semibold",
    success: "text-emerald-400 font-semibold",
  };
  return <span className={`${variant ? variants[variant] : "text-slate-100"} ${className}`}>{text}</span>;
};

export const KarmaBulletList: React.FC<{ items: string[], animationDelay?: number, className?: string }> = ({ items, animationDelay = 5, className = "" }) => {
  return (
    <ul className={`flex flex-col gap-4 text-xl lg:text-2xl text-slate-300 leading-relaxed font-medium tracking-wide ${className}`}>
      {items.map((item, idx) => {
        const { opacity, y } = useEntranceAnimation(animationDelay + (idx * 2));
        return (
          <li key={idx} className="flex items-start gap-4" style={{ opacity, transform: `translateY(${y}px)` }}>
            <span className="text-indigo-500 font-bold mt-1">•</span>
            <span>{item}</span>
          </li>
        );
      })}
    </ul>
  );
};

// --- Layout ---

export const KarmaContainer: React.FC<{ children: React.ReactNode, variant?: 'glass' | 'solid' | 'transparent', animationDelay?: number, className?: string }> = ({ children, variant = 'transparent', animationDelay = 0, className = "" }) => {
  const { opacity, scale } = useEntranceAnimation(animationDelay);

  const variants = {
    transparent: "",
    glass: "bg-slate-900/60 border border-slate-800 backdrop-blur-md shadow-xl",
    solid: "bg-slate-900 border border-slate-800 shadow-2xl",
  };

  return (
    <div className={`p-8 rounded-3xl ${variants[variant]} ${className}`} style={{ opacity, transform: `scale(${scale})` }}>
      {children}
    </div>
  );
};

export const KarmaGrid: React.FC<{ children: React.ReactNode, cols?: 1 | 2 | 3 | 4 | 12, gap?: string, className?: string }> = ({ children, cols = 1, gap = "gap-8", className = "" }) => {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    12: "grid-cols-12",
  };
  return (
    <div className={`grid ${gridCols[cols]} ${gap} ${className}`}>
      {children}
    </div>
  );
};

export const KarmaSplitLayout: React.FC<{ left: React.ReactNode, right: React.ReactNode, leftRatio?: 1 | 2 | 3 | 4, rightRatio?: 1 | 2 | 3 | 4, className?: string }> = ({ left, right, leftRatio = 1, rightRatio = 1, className = "" }) => {
  return (
    <div className={`w-full flex flex-col lg:flex-row gap-12 items-center justify-between ${className}`}>
      <div className={`flex flex-col gap-6 w-full lg:w-[${leftRatio * 20}%] flex-[${leftRatio}]`}>
        {left}
      </div>
      <div className={`flex flex-col items-center justify-center w-full lg:w-[${rightRatio * 20}%] flex-[${rightRatio}]`}>
        {right}
      </div>
    </div>
  );
};

export const KarmaArchitecturePipeline: React.FC<{ children: React.ReactNode[], connectorStyle?: 'solid' | 'dashed' | 'dotted', connectorArrows?: 'start' | 'end' | 'both' | 'none', className?: string }> = ({ children, connectorStyle = 'solid', connectorArrows = 'end', className = "" }) => {
  const elements = React.Children.toArray(children);
  return (
    <div className={`flex flex-wrap items-center justify-center gap-4 ${className}`}>
      {elements.map((child, idx) => (
        <React.Fragment key={idx}>
          {child}
          {idx < elements.length - 1 && (
            <KarmaConnector direction="horizontal" type={connectorStyle} arrows={connectorArrows} length={60} animationDelay={(idx * 5) + 3} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export const KarmaSlideHeader: React.FC<{ title?: string, subtitle?: string, animationDelay?: number, className?: string }> = ({ title, subtitle, animationDelay = 0, className = "" }) => {
  const { opacity, y } = useEntranceAnimation(animationDelay);
  if (!title && !subtitle) return null;
  return (
    <div className={`w-full pb-6 border-b-2 border-slate-700/50 mb-12 flex flex-col ${className}`} style={{ opacity, transform: `translateY(${y}px)` }}>
      {title && <h2 className="text-4xl font-extrabold text-slate-100">{title}</h2>}
      {subtitle && <p className="text-xl text-slate-400 mt-2 font-medium">{subtitle}</p>}
    </div>
  );
};

export const KarmaTerminalWindow: React.FC<{ commands: { text: string, type: 'command' | 'output' }[], animationDelay?: number, className?: string }> = ({ commands, animationDelay = 0, className = "" }) => {
  const { opacity, scale } = useEntranceAnimation(animationDelay);
  const frame = useCurrentFrame();
  
  // Start typing slightly after the window scales in
  const typingStartFrame = animationDelay + 10;
  const charsPerFrame = 1.5; // Typing speed
  
  // Calculate total visible characters based on frame
  const visibleChars = Math.max(0, Math.floor((frame - typingStartFrame) * charsPerFrame));

  let charsRendered = 0;

  return (
    <div className={`w-full h-full bg-[#0a0a0a] border border-slate-800 rounded-xl flex flex-col overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.15)] ${className}`} style={{ opacity, transform: `scale(${scale})` }}>
      <div className="bg-[#111] px-6 py-4 flex items-center justify-between border-b border-slate-800">
        <div className="text-sm text-slate-500 font-mono">user@server:~</div>
      </div>
      <div className="p-8 font-mono text-xl text-emerald-400 flex flex-col gap-4 overflow-y-auto">
        {commands.map((cmd, idx) => {
          const cmdLength = cmd.text.length;
          const charsForThisCmd = Math.max(0, Math.min(cmdLength, visibleChars - charsRendered));
          const textToRender = cmd.text.substring(0, charsForThisCmd);
          
          const isDone = charsForThisCmd === cmdLength;
          charsRendered += cmdLength;

          if (charsForThisCmd === 0 && cmd.type === 'command') return null; // Don't show command line until ready
          
          return (
            <div key={idx} className={cmd.type === 'output' ? 'text-slate-400' : ''}>
              {cmd.type === 'command' && <><span className="text-rose-500 mr-2">➜</span><span className="text-sky-400 mr-2">~</span></>}
              {textToRender}
              {cmd.type === 'command' && !isDone && charsForThisCmd > 0 && <span className="w-3 h-5 bg-emerald-400 inline-block align-middle ml-1"></span>}
            </div>
          );
        })}
        {visibleChars >= charsRendered && <div><span className="text-rose-500 mr-2">➜</span><span className="text-sky-400 mr-2">~</span><span className="w-3 h-5 bg-emerald-400 inline-block animate-pulse align-middle ml-2"></span></div>}
      </div>
    </div>
  );
};

export const KarmaRoadmapTimeline: React.FC<{ steps: { label: string, status: 'completed' | 'active' | 'pending' }[], animationDelay?: number, className?: string }> = ({ steps, animationDelay = 0, className = "" }) => {
  const { opacity, y } = useEntranceAnimation(animationDelay);
  
  return (
    <div className={`flex flex-row items-center justify-center w-full px-12 relative ${className}`} style={{ opacity, transform: `translateY(${y}px)` }}>
      <div className="absolute left-12 right-12 top-1/2 h-2 bg-slate-800 -translate-y-1/2 rounded-full"></div>
      <div className="flex justify-between w-full relative z-10">
        {steps.map((step, idx) => {
          const isCompleted = step.status === 'completed';
          const isActive = step.status === 'active';
          
          return (
            <div key={idx} className="flex flex-col items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 z-10 ${
                isCompleted ? 'bg-indigo-500 border-slate-900 shadow-[0_0_25px_rgba(99,102,241,0.6)]' :
                isActive ? 'bg-slate-900 border-indigo-500 shadow-[0_0_25px_rgba(99,102,241,0.6)]' :
                'bg-slate-800 border-slate-900'
              }`}>
                {isCompleted && <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
              </div>
              <span className={`text-lg font-bold ${
                isCompleted ? 'text-indigo-300' :
                isActive ? 'text-white' :
                'text-slate-500'
              }`}>{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Data Display ---

export const KarmaCard: React.FC<{ children: React.ReactNode, color?: 'slate' | 'indigo' | 'emerald' | 'rose' | 'amber', animationDelay?: number, className?: string }> = ({ children, color = 'slate', animationDelay = 5, className = "" }) => {
  const { opacity, scale } = useEntranceAnimation(animationDelay);

  const colors = {
    slate: "from-slate-800/50 to-slate-900/50 border-slate-700",
    indigo: "from-indigo-500/20 to-blue-500/10 border-indigo-500/50",
    emerald: "from-emerald-500/20 to-teal-500/10 border-emerald-500/50",
    rose: "from-rose-500/20 to-pink-500/10 border-rose-500/50",
    amber: "from-amber-500/20 to-orange-500/10 border-amber-500/50",
  };

  return (
    <div className={`relative p-8 rounded-3xl border bg-gradient-to-br shadow-xl backdrop-blur-md flex flex-col ${colors[color]} ${className}`} style={{ opacity, transform: `scale(${scale})` }}>
      {children}
    </div>
  );
};

export const KarmaBadge: React.FC<{ text: string, color?: 'slate' | 'indigo' | 'emerald' | 'rose' | 'amber', className?: string }> = ({ text, color = 'slate', className = "" }) => {
  const colors = {
    slate: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    indigo: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    emerald: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    rose: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    amber: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  };

  return (
    <span className={`px-3 py-1 text-sm font-bold uppercase tracking-wider rounded-full border ${colors[color]} ${className}`}>
      {text}
    </span>
  );
};

// --- Code ---

export const KarmaCodeBlock: React.FC<{ code: string, language?: string, animationDelay?: number, className?: string }> = ({ code, language = "bash", animationDelay = 10, className = "" }) => {
  const { opacity, y } = useEntranceAnimation(animationDelay);

  return (
    <div className={`rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/10 border border-slate-700 bg-[#1e1e1e]/95 backdrop-blur-md w-full flex flex-col ${className}`} style={{ opacity, transform: `translateY(${y}px)` }}>
      <div className="bg-slate-900 px-6 py-4 flex items-center space-x-3 border-b border-slate-700/80">
        <div className="w-3.5 h-3.5 rounded-full bg-red-500"></div>
        <div className="w-3.5 h-3.5 rounded-full bg-yellow-500"></div>
        <div className="w-3.5 h-3.5 rounded-full bg-green-500"></div>
        <span className="ml-6 text-sm text-slate-400 font-mono tracking-wider uppercase">{language}</span>
      </div>
      <pre className="p-8 text-lg font-mono text-emerald-300 overflow-hidden leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
};

// --- Diagrams ---

export const KarmaFlowDiagram: React.FC<{ nodes: { title: string, subtitle: string, color?: 'indigo' | 'emerald' | 'rose' }[], animationDelay?: number, className?: string }> = ({ nodes, animationDelay = 10, className = "" }) => {
  const { opacity, y } = useEntranceAnimation(animationDelay);
  const frame = useCurrentFrame();

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

  return (
    <div className={`relative flex flex-col md:flex-row justify-between items-center gap-8 md:gap-0 w-full px-4 lg:px-12 ${className}`} style={{ opacity, transform: `translateY(${y}px)` }}>

      {/* Connecting lines */}
      <svg className="absolute inset-0 w-full h-full hidden md:block z-0 pointer-events-none opacity-50">
        {nodes.length > 1 && <line x1="16%" y1="50%" x2="48%" y2="50%" stroke="#6366f1" strokeWidth="3" strokeDasharray="10,10" />}
        {nodes.length > 2 && <line x1="52%" y1="50%" x2="84%" y2="50%" stroke="#10b981" strokeWidth="3" strokeDasharray="10,10" />}
      </svg>

      {nodes.map((node, i) => {
        const nodeScale = spring({ frame: frame - (animationDelay + i * 5), fps: FPS, config: { damping: 12 } });
        const themeClass = colors[node.color || 'indigo'];
        const iconClass = iconColors[node.color || 'indigo'];

        return (
          <div key={i} className={`relative z-10 p-6 border-2 rounded-2xl w-48 lg:w-56 text-center ${themeClass}`} style={{ transform: `scale(${nodeScale})` }}>
            <div className={`w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center ${iconClass}`}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-slate-200">{node.title}</h4>
            <div className="text-sm opacity-80 font-mono mt-2">{node.subtitle}</div>
          </div>
        );
      })}
    </div>
  );
};

// --- Native Granular UML Primitives ---

export const KarmaUmlClassNode: React.FC<{ name: string, attributes?: string[], methods?: string[], animationDelay?: number, className?: string }> = ({ name, attributes = [], methods = [], animationDelay = 10, className = "" }) => {
  const { opacity, scale } = useEntranceAnimation(animationDelay);

  return (
    <div className={`bg-[#1e1e1e] border border-slate-600 rounded-xl overflow-hidden shadow-2xl w-72 ${className}`} style={{ opacity, transform: `scale(${scale})` }}>
      <div className="bg-slate-700/80 px-4 py-3 text-center font-bold text-slate-100 border-b border-slate-600">
        {name}
      </div>
      {attributes.length > 0 && (
        <div className="px-4 py-3 border-b border-slate-700/50">
          {attributes.map((attr, j) => (
            <div key={j} className="text-emerald-400 font-mono text-sm mb-1">+ {attr}</div>
          ))}
        </div>
      )}
      {methods.length > 0 && (
        <div className="px-4 py-3">
          {methods.map((method, j) => (
            <div key={j} className="text-blue-400 font-mono text-sm mb-1">+ {method}()</div>
          ))}
        </div>
      )}
    </div>
  );
};

export const KarmaUmlActorNode: React.FC<{ name: string, animationDelay?: number, className?: string }> = ({ name, animationDelay = 10, className = "" }) => {
  const { opacity, scale } = useEntranceAnimation(animationDelay);

  return (
    <div className={`flex flex-col items-center ${className}`} style={{ opacity, transform: `scale(${scale})` }}>
      <svg className="w-16 h-16 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
      </svg>
      <div className="font-bold text-slate-200 mt-2 text-lg">{name}</div>
    </div>
  );
};

export const KarmaUmlUseCaseNode: React.FC<{ label: string, animationDelay?: number, className?: string }> = ({ label, animationDelay = 10, className = "" }) => {
  const { opacity, scale } = useEntranceAnimation(animationDelay);

  return (
    <div className={`bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-300 font-bold text-center py-4 px-6 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.1)] ${className}`} style={{ opacity, transform: `scale(${scale})` }}>
      {label}
    </div>
  );
};

export const KarmaUmlLifeline: React.FC<{ name: string, height?: number, animationDelay?: number, className?: string }> = ({ name, height = 256, animationDelay = 10, className = "" }) => {
  const { opacity, y } = useEntranceAnimation(animationDelay);

  return (
    <div className={`flex flex-col items-center relative ${className}`} style={{ opacity, transform: `translateY(${y}px)`, height: height + 60 }}>
      <div className="px-6 py-3 bg-indigo-500 text-white font-bold rounded-xl shadow-lg border border-indigo-400/50 mb-2 z-10">{name}</div>
      <div className="w-px border-l-2 border-dashed border-slate-600 z-0" style={{ height }}></div>
    </div>
  );
};

export const KarmaUmlMessageArrow: React.FC<{ label: string, direction?: 'right' | 'left', width?: number, animationDelay?: number, className?: string }> = ({ label, direction = 'right', width = 200, animationDelay = 10, className = "" }) => {
  const frame = useCurrentFrame();
  const progress = spring({ frame: frame - animationDelay, fps: FPS, config: { damping: 14 } });

  return (
    <div className={`relative ${className}`} style={{ width, opacity: progress, transform: `translateX(${(1 - progress) * 20}px)` }}>
      <div className="text-emerald-400 font-mono text-sm mb-1 text-center w-full">
        {label}
      </div>
      <svg className="w-full h-4 overflow-visible">
        <line x1="0" y1="0" x2="100%" y2="0" stroke="#10b981" strokeWidth="2" strokeDasharray={direction === 'left' ? "5,5" : ""} />
        {direction === 'right' ? (
          <polygon points="0,-5 10,0 0,5" fill="#10b981" style={{ transform: `translate(calc(100% - 10px), 0)` }} />
        ) : (
          <polygon points="10,-5 0,0 10,5" fill="#10b981" />
        )}
      </svg>
    </div>
  );
};

export const KarmaUmlDecisionNode: React.FC<{ label: string, animationDelay?: number, className?: string }> = ({ label, animationDelay = 10, className = "" }) => {
  const { opacity, scale } = useEntranceAnimation(animationDelay);
  return (
    <div className={`flex items-center justify-center p-8 ${className}`} style={{ opacity, transform: `scale(${scale})` }}>
      <div className="relative w-32 h-32 border-2 border-amber-500 bg-amber-500/20 rotate-45 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.2)]">
        <div className="absolute -rotate-45 font-bold text-amber-300 text-center w-40">{label}</div>
      </div>
    </div>
  );
};

export const KarmaUmlComponentNode: React.FC<{ label: string, animationDelay?: number, className?: string }> = ({ label, animationDelay = 10, className = "" }) => {
  const { opacity, scale } = useEntranceAnimation(animationDelay);
  return (
    <div className={`relative w-48 h-32 border-2 border-indigo-500 bg-indigo-500/10 flex items-center justify-center rounded-lg shadow-xl ${className}`} style={{ opacity, transform: `scale(${scale})` }}>
      <div className="absolute -left-3 top-6 w-6 h-5 border-2 border-indigo-500 bg-slate-900 rounded-sm"></div>
      <div className="absolute -left-3 bottom-6 w-6 h-5 border-2 border-indigo-500 bg-slate-900 rounded-sm"></div>
      <span className="font-bold text-indigo-300 text-center px-4">{label}</span>
    </div>
  );
};

export const KarmaUmlPackageNode: React.FC<{ label: string, animationDelay?: number, className?: string }> = ({ label, animationDelay = 10, className = "" }) => {
  const { opacity, scale } = useEntranceAnimation(animationDelay);
  return (
    <div className={`relative mt-8 w-48 h-32 border-2 border-blue-500 bg-blue-500/10 flex items-center justify-center rounded-b-lg rounded-tr-lg shadow-xl ${className}`} style={{ opacity, transform: `scale(${scale})` }}>
      <div className="absolute -top-8 left-[-2px] w-24 h-8 border-t-2 border-l-2 border-r-2 border-blue-500 bg-blue-500/10 rounded-t-lg"></div>
      <span className="font-bold text-blue-300">{label}</span>
    </div>
  );
};

export const KarmaUmlDatabaseNode: React.FC<{ label: string, animationDelay?: number, className?: string }> = ({ label, animationDelay = 10, className = "" }) => {
  const { opacity, scale } = useEntranceAnimation(animationDelay);
  return (
    <div className={`relative w-32 h-40 border-2 border-emerald-500 bg-slate-900 rounded-b-[50%] flex flex-col items-center shadow-xl ${className}`} style={{ opacity, transform: `scale(${scale})` }}>
      <div className="absolute top-0 w-full h-12 border-2 border-emerald-500 rounded-[50%] bg-emerald-500/20 -translate-y-1/2"></div>
      <div className="mt-12 font-bold text-emerald-300 text-center px-2">{label}</div>
    </div>
  );
};

export const KarmaUmlNoteNode: React.FC<{ text: string, animationDelay?: number, className?: string }> = ({ text, animationDelay = 10, className = "" }) => {
  const { opacity, scale } = useEntranceAnimation(animationDelay);
  return (
    <div className={`relative w-48 p-6 border border-yellow-500/50 bg-yellow-500/10 shadow-lg ${className}`} style={{ opacity, transform: `scale(${scale})` }}>
      {/* Folded corner effect using CSS borders */}
      <div className="absolute top-[-1px] right-[-1px] w-0 h-0 border-l-[24px] border-l-transparent border-t-[24px] border-t-slate-950"></div>
      <div className="absolute top-[-1px] right-[-1px] w-6 h-6 border-b border-l border-yellow-500/50 bg-yellow-500/20"></div>
      <div className="text-yellow-200 font-mono text-sm leading-relaxed">{text}</div>
    </div>
  );
};

// --- Flowchart Specific Primitives ---

export const KarmaFlowTerminalNode: React.FC<{ label: string, animationDelay?: number, className?: string }> = ({ label, animationDelay = 10, className = "" }) => {
  const { opacity, scale } = useEntranceAnimation(animationDelay);
  return (
    <div className={`px-8 py-4 rounded-full border-2 border-rose-500 bg-rose-500/20 text-rose-300 font-bold shadow-lg text-center min-w-[120px] ${className}`} style={{ opacity, transform: `scale(${scale})` }}>
      {label}
    </div>
  );
};

export const KarmaFlowProcessNode: React.FC<{ label: string, animationDelay?: number, className?: string }> = ({ label, animationDelay = 10, className = "" }) => {
  const { opacity, scale } = useEntranceAnimation(animationDelay);
  return (
    <div className={`px-8 py-6 rounded-md border-2 border-cyan-500 bg-cyan-500/10 text-cyan-300 font-bold shadow-lg text-center min-w-[140px] ${className}`} style={{ opacity, transform: `scale(${scale})` }}>
      {label}
    </div>
  );
};

export const KarmaFlowIONode: React.FC<{ label: string, animationDelay?: number, className?: string }> = ({ label, animationDelay = 10, className = "" }) => {
  const { opacity, scale } = useEntranceAnimation(animationDelay);
  return (
    <div className={`px-8 py-4 border-2 border-fuchsia-500 bg-fuchsia-500/20 text-fuchsia-300 font-bold shadow-lg text-center min-w-[140px] ${className}`} style={{ opacity, transform: `scale(${scale}) skewX(-20deg)` }}>
      <div style={{ transform: 'skewX(20deg)' }}>{label}</div>
    </div>
  );
};

export const KarmaFlowDocumentNode: React.FC<{ label: string, animationDelay?: number, className?: string }> = ({ label, animationDelay = 10, className = "" }) => {
  const { opacity, scale } = useEntranceAnimation(animationDelay);
  return (
    <div className={`relative w-40 h-28 text-teal-300 font-bold flex flex-col items-center justify-center shadow-xl ${className}`} style={{ opacity, transform: `scale(${scale})` }}>
      <svg className="absolute inset-0 w-full h-full text-teal-500/20 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
        <path d="M0,0 L100,0 L100,80 Q75,100 50,80 T0,80 Z" fill="currentColor" stroke="#14b8a6" strokeWidth="2" />
      </svg>
      <span className="z-10 -mt-4">{label}</span>
    </div>
  );
};

// --- Edge Case / Specialized HLD & LLD Primitives ---

export const KarmaUmlCloudNode: React.FC<{ label: string, animationDelay?: number, className?: string }> = ({ label, animationDelay = 10, className = "" }) => {
  const { opacity, scale } = useEntranceAnimation(animationDelay);
  return (
    <div className={`relative flex flex-col items-center justify-center text-sky-400 font-bold w-40 h-32 ${className}`} style={{ opacity, transform: `scale(${scale})` }}>
      <svg className="absolute inset-0 w-full h-full text-sky-500/20 drop-shadow-[0_0_15px_rgba(14,165,233,0.3)]" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0.5">
        <path d="M17.5 19C19.9853 19 22 16.9853 22 14.5C22 12.1387 20.1834 10.2016 17.8687 10.0125C17.4332 7.15175 14.9682 5 12 5C9.3789 5 7.14088 6.84074 6.32627 9.25624C3.89674 9.47565 2 11.5175 2 14C2 16.7614 4.23858 19 7 19H17.5Z" />
      </svg>
      <span className="z-10 mt-2">{label}</span>
    </div>
  );
};

export const KarmaUmlDeploymentNode: React.FC<{ label: string, animationDelay?: number, className?: string }> = ({ label, animationDelay = 10, className = "" }) => {
  const { opacity, scale } = useEntranceAnimation(animationDelay);
  return (
    <div className={`relative flex flex-col items-center justify-center w-36 h-40 ${className}`} style={{ opacity, transform: `scale(${scale})` }}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-slate-400 overflow-visible drop-shadow-xl">
        <polygon points="0,25 50,0 100,25 50,50" fill="rgba(148, 163, 184, 0.2)" stroke="currentColor" strokeWidth="2" />
        <polygon points="0,25 50,50 50,100 0,75" fill="rgba(148, 163, 184, 0.1)" stroke="currentColor" strokeWidth="2" />
        <polygon points="50,50 100,25 100,75 50,100" fill="rgba(148, 163, 184, 0.3)" stroke="currentColor" strokeWidth="2" />
      </svg>
      <div className="z-10 text-slate-200 font-bold bg-slate-900/50 px-3 py-1 rounded backdrop-blur-sm mt-8 border border-slate-700/50 shadow-lg text-sm text-center">
        &laquo;device&raquo;<br />{label}
      </div>
    </div>
  );
};

export const KarmaUmlInterfaceNode: React.FC<{ label: string, animationDelay?: number, className?: string }> = ({ label, animationDelay = 10, className = "" }) => {
  const { opacity, scale } = useEntranceAnimation(animationDelay);
  return (
    <div className={`flex items-center ${className}`} style={{ opacity, transform: `scale(${scale})` }}>
      <div className="w-12 h-1 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
      <div className="w-8 h-8 rounded-full border-4 border-indigo-500 bg-slate-900 shadow-[0_0_15px_rgba(99,102,241,0.5)] z-10"></div>
      <span className="ml-3 font-bold text-indigo-300 bg-slate-900/50 px-2 py-1 rounded backdrop-blur-sm text-sm">{label}</span>
    </div>
  );
};

export const KarmaUmlSyncBarNode: React.FC<{ orientation?: 'horizontal' | 'vertical', length?: number, animationDelay?: number, className?: string }> = ({ orientation = 'horizontal', length = 160, animationDelay = 10, className = "" }) => {
  const { opacity, scale } = useEntranceAnimation(animationDelay);
  const w = orientation === 'horizontal' ? length : 12;
  const h = orientation === 'horizontal' ? 12 : length;
  return (
    <div className={`bg-slate-300 rounded-sm shadow-[0_0_15px_rgba(203,213,225,0.4)] ${className}`} style={{ width: w, height: h, opacity, transform: `scale(${scale})` }}></div>
  );
};

// --- Microservices Specific Primitives ---

export const KarmaMicroserviceNode: React.FC<{ name: string, stack?: string[], animationDelay?: number, className?: string }> = ({ name, stack = [], animationDelay = 10, className = "" }) => {
  const { opacity, scale } = useEntranceAnimation(animationDelay);
  return (
    <div className={`relative p-6 border-2 border-indigo-500 bg-slate-900/90 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.2)] flex flex-col items-center justify-center min-w-[200px] ${className}`} style={{ opacity, transform: `scale(${scale})` }}>
      <div className="absolute -top-6 bg-indigo-500 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg border border-indigo-400/50">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
        </svg>
      </div>
      <h4 className="mt-4 text-lg font-bold text-slate-100">{name}</h4>
      {stack.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3 justify-center">
          {stack.map((s, i) => (
            <span key={i} className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-[10px] font-mono rounded uppercase tracking-wider border border-indigo-500/30">
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export const KarmaApiGatewayNode: React.FC<{ label: string, animationDelay?: number, className?: string }> = ({ label, animationDelay = 10, className = "" }) => {
  const { opacity, y } = useEntranceAnimation(animationDelay);
  return (
    <div className={`w-full py-4 px-8 border-2 border-emerald-500 bg-emerald-500/10 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center justify-center ${className}`} style={{ opacity, transform: `translateY(${y}px)` }}>
      <span className="font-bold text-emerald-400 tracking-widest uppercase">{label}</span>
    </div>
  );
};

export const KarmaMessageQueueNode: React.FC<{ label: string, animationDelay?: number, className?: string }> = ({ label, animationDelay = 10, className = "" }) => {
  const { opacity, scale } = useEntranceAnimation(animationDelay);
  return (
    <div className={`relative flex items-center h-16 w-48 ${className}`} style={{ opacity, transform: `scale(${scale})` }}>
      {/* 3 stacked squares for queue visual */}
      <div className="absolute left-0 w-16 h-16 border-2 border-amber-500 bg-amber-500/10 rounded-lg -rotate-12 translate-x-2"></div>
      <div className="absolute left-0 w-16 h-16 border-2 border-amber-500 bg-amber-500/20 rounded-lg -rotate-6 translate-x-1"></div>
      <div className="absolute left-0 w-full h-16 border-2 border-amber-500 bg-slate-900 rounded-lg flex items-center justify-center z-10 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
        <span className="font-bold text-amber-400 pl-4">{label}</span>
      </div>
    </div>
  );
};

// --- DevOps & UI Primitives ---

export const KarmaDockerNode: React.FC<{ label: string, animationDelay?: number, className?: string }> = ({ label, animationDelay = 10, className = "" }) => {
  const { opacity, scale } = useEntranceAnimation(animationDelay);
  return (
    <div className={`relative flex flex-col items-center justify-center p-4 border-2 border-sky-500 bg-sky-900/30 rounded shadow-[0_0_15px_rgba(14,165,233,0.3)] w-40 h-32 hover:scale-105 transition-transform cursor-pointer ${className}`} style={{ opacity, transform: `scale(${scale})` }}>
      {/* Container boxes motif */}
      <div className="flex gap-1 mb-3">
        <div className="w-4 h-4 bg-sky-500 rounded-sm"></div>
        <div className="w-4 h-4 bg-sky-500 rounded-sm"></div>
        <div className="w-4 h-4 bg-sky-500 rounded-sm"></div>
      </div>
      <div className="flex gap-1 mb-3">
        <div className="w-4 h-4 bg-transparent"></div>
        <div className="w-4 h-4 bg-sky-500 rounded-sm"></div>
        <div className="w-4 h-4 bg-sky-500 rounded-sm"></div>
      </div>
      <span className="font-bold text-sky-400 text-sm mt-2">{label}</span>
    </div>
  );
};

export const KarmaKubernetesNode: React.FC<{ label: string, pods?: number, animationDelay?: number, className?: string }> = ({ label, pods = 3, animationDelay = 10, className = "" }) => {
  const { opacity, scale } = useEntranceAnimation(animationDelay);
  return (
    <div className={`relative p-4 border-2 border-dashed border-blue-500 bg-blue-900/10 rounded-xl w-56 shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:-translate-y-1 transition-transform cursor-pointer ${className}`} style={{ opacity, transform: `scale(${scale})` }}>
      <div className="absolute -top-3 left-4 bg-slate-900 px-2 font-bold text-blue-400 text-xs uppercase tracking-wider">{label}</div>
      <div className="flex flex-wrap gap-2 mt-2 justify-center">
        {Array.from({ length: pods }).map((_, i) => (
          <div key={i} className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-blue-500 bg-blue-500/20 shadow-inner">
            <div className="w-4 h-4 rounded-full bg-blue-400"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const KarmaLoggingNode: React.FC<{ label: string, animationDelay?: number, className?: string }> = ({ label, animationDelay = 10, className = "" }) => {
  const { opacity, scale } = useEntranceAnimation(animationDelay);
  return (
    <div className={`relative flex flex-col p-4 border border-slate-600 bg-black rounded shadow-lg w-48 h-32 hover:-rotate-1 transition-transform cursor-pointer ${className}`} style={{ opacity, transform: `scale(${scale})` }}>
      <div className="font-mono text-emerald-500 text-[10px] leading-tight flex-grow opacity-70">
        <div>&gt; tail -f /var/log</div>
        <div>[INFO] System OK</div>
        <div>[WARN] High CPU</div>
        <div className="animate-pulse">[INFO] Data sync...</div>
      </div>
      <div className="font-bold text-slate-300 text-sm text-center border-t border-slate-800 pt-2 mt-2">{label}</div>
    </div>
  );
};

export const KarmaBrowserNode: React.FC<{ title: string, animationDelay?: number, className?: string }> = ({ title, animationDelay = 10, className = "" }) => {
  const { opacity, scale } = useEntranceAnimation(animationDelay);
  return (
    <div className={`flex flex-col border border-slate-700 bg-slate-900 rounded-lg shadow-2xl overflow-hidden w-64 h-40 hover:-translate-y-2 transition-transform cursor-pointer ${className}`} style={{ opacity, transform: `scale(${scale})` }}>
      {/* Browser Header */}
      <div className="bg-slate-800 px-3 py-2 flex items-center gap-2 border-b border-slate-700">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-rose-500"></div>
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
        </div>
        <div className="flex-grow text-center text-[10px] font-mono text-slate-400 bg-slate-900 rounded px-2 py-0.5 mx-4 truncate">
          https://{title.toLowerCase().replace(/\s+/g, '')}.com
        </div>
      </div>
      {/* Browser Content Frame */}
      <div className="flex-grow bg-slate-50 flex items-center justify-center p-4">
        <div className="text-slate-800 font-bold text-lg">{title}</div>
      </div>
    </div>
  );
};

// --- Cloud Provider Primitives ---

export const KarmaAwsNode: React.FC<{ label: string, service?: string, animationDelay?: number, className?: string }> = ({ label, service, animationDelay = 10, className = "" }) => {
  const { opacity, scale } = useEntranceAnimation(animationDelay);
  return (
    <div className={`relative p-5 border-2 border-[#FF9900] bg-slate-900 rounded-xl shadow-[0_0_20px_rgba(255,153,0,0.15)] w-48 hover:-translate-y-1 transition-transform cursor-pointer ${className}`} style={{ opacity, transform: `scale(${scale})` }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#FF9900]/10 border border-[#FF9900]/50 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[#FF9900]">
            <path d="M14.92 18.06c-1.8.8-4.22 1.34-6.52 1.34-3.5 0-5.83-1.12-5.83-1.12l.6-1.55s2.2 1.05 5.3 1.05c2.9 0 5-.87 6-1.52-.02-.02.46.72.45.8z" />
            <path d="M16.58 17.52s-.75-1.54-2.14-2.58l.72-1.25c1.86 1.15 3.12 3.1 3.12 3.1l-1.7 .73z" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-slate-100 text-sm">{label}</span>
          {service && <span className="text-[#FF9900] text-[10px] font-mono tracking-widest uppercase">{service}</span>}
        </div>
      </div>
    </div>
  );
};

export const KarmaAzureNode: React.FC<{ label: string, service?: string, animationDelay?: number, className?: string }> = ({ label, service, animationDelay = 10, className = "" }) => {
  const { opacity, scale } = useEntranceAnimation(animationDelay);
  return (
    <div className={`relative p-5 border-2 border-[#0089D6] bg-slate-900 rounded-xl shadow-[0_0_20px_rgba(0,137,214,0.15)] w-48 hover:-translate-y-1 transition-transform cursor-pointer ${className}`} style={{ opacity, transform: `scale(${scale})` }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#0089D6]/10 border border-[#0089D6]/50 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[#0089D6]">
            <path d="M5.483 21.3H1.05l7.087-11.45 3.96 6.843-6.614 4.607zm5.55-10.233l2.802-4.832 9.115 15.065h-4.394l-7.523-10.233z" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-slate-100 text-sm">{label}</span>
          {service && <span className="text-[#0089D6] text-[10px] font-mono tracking-widest uppercase">{service}</span>}
        </div>
      </div>
    </div>
  );
};

export const KarmaGcpNode: React.FC<{ label: string, service?: string, animationDelay?: number, className?: string }> = ({ label, service, animationDelay = 10, className = "" }) => {
  const { opacity, scale } = useEntranceAnimation(animationDelay);
  return (
    <div className={`relative p-5 bg-slate-900 rounded-xl w-48 hover:-translate-y-1 transition-transform cursor-pointer ${className}`} style={{ opacity, transform: `scale(${scale})` }}>
      {/* 4-color GCP border effect */}
      <div className="absolute inset-0 rounded-xl border-2 border-transparent" style={{ backgroundImage: 'linear-gradient(#0f172a, #0f172a), linear-gradient(to right, #4285F4, #EA4335, #FBBC05, #34A853)', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box' }}></div>
      <div className="flex items-center gap-3 relative z-10">
        <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shadow-inner overflow-hidden">
          <svg viewBox="0 0 24 24" className="w-6 h-6">
            <path fill="#4285F4" d="M12 2.25L3.75 7v10L12 21.75l8.25-4.75V7z" opacity="0.8" />
            <path fill="#34A853" d="M12 11.25L7.5 8.65v5.2l4.5 2.6z" />
            <path fill="#FBBC05" d="M12 11.25l4.5-2.6v5.2l-4.5 2.6z" />
            <path fill="#EA4335" d="M12 11.25L7.5 8.65l4.5-2.6 4.5 2.6z" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-slate-100 text-sm">{label}</span>
          {service && <span className="text-slate-400 text-[10px] font-mono tracking-widest uppercase">{service}</span>}
        </div>
      </div>
    </div>
  );
};

// --- Programming Language Primitives ---

export const KarmaLanguageNode: React.FC<{ language: string, label?: string, animationDelay?: number, className?: string }> = ({ language, label, animationDelay = 10, className = "" }) => {
  const { opacity, scale } = useEntranceAnimation(animationDelay);

  const langLower = language.toLowerCase();

  let colorClass = "border-slate-500 text-slate-300 bg-slate-900 shadow-[0_0_15px_rgba(100,116,139,0.2)]";
  let iconNode = <span className="font-mono text-xs">{"{}"}</span>;

  if (langLower.includes("js") || langLower.includes("javascript")) {
    colorClass = "border-[#F7DF1E] text-[#F7DF1E] bg-[#F7DF1E]/10 shadow-[0_0_15px_rgba(247,223,30,0.15)]";
    iconNode = <span className="font-bold text-black bg-[#F7DF1E] px-1 text-[10px] mt-1 ml-1">JS</span>;
  } else if (langLower.includes("ts") || langLower.includes("typescript")) {
    colorClass = "border-[#3178C6] text-[#3178C6] bg-[#3178C6]/10 shadow-[0_0_15px_rgba(49,120,198,0.15)]";
    iconNode = <span className="font-bold text-white bg-[#3178C6] px-1 text-[10px] mt-1 ml-1">TS</span>;
  } else if (langLower.includes("python") || langLower === "py") {
    colorClass = "border-[#3776AB] text-[#3776AB] bg-[#3776AB]/10 shadow-[0_0_15px_rgba(55,118,171,0.15)]";
    iconNode = (
      <svg viewBox="0 0 110 110" className="w-5 h-5 text-[#3776AB] fill-current">
        <path d="M53.8,11.2c-27.1,0-25.6,11.7-25.6,11.7l0.1,12h26.4v3.8H26.9c0,0-15.7-1.8-15.7,23.3c0,25.1,13.7,24,13.7,24h8.3v-11.7c0,0-0.2-13.3,13.5-13.3h27.1c0,0,12.5,0,12.5-12v-26C86.3,13,74.7,11.2,53.8,11.2z M41.8,20.4c2.5,0,4.6,2,4.6,4.6c0,2.5-2,4.6-4.6,4.6c-2.5,0-4.6-2-4.6-4.6C37.2,22.4,39.3,20.4,41.8,20.4z" />
        <path d="M55.8,99.2c27.1,0,25.6-11.7,25.6-11.7l-0.1-12H54.9v-3.8h27.8c0,0,15.7,1.8,15.7-23.3c0-25.1-13.7-24-13.7-24h-8.3v11.7c0,0,0.2,13.3-13.5,13.3H35.8c0,0-12.5,0-12.5,12v26C23.3,97.4,34.9,99.2,55.8,99.2z M67.8,90c-2.5,0-4.6-2-4.6-4.6c0-2.5,2-4.6,4.6-4.6c2.5,0,4.6,2,4.6,4.6C72.4,88,70.3,90,67.8,90z" fill="#FFD43B" />
      </svg>
    );
  } else if (langLower.includes("go")) {
    colorClass = "border-[#00ADD8] text-[#00ADD8] bg-[#00ADD8]/10 shadow-[0_0_15px_rgba(0,173,216,0.15)]";
    iconNode = <span className="font-bold text-[#00ADD8] italic tracking-tighter pr-1">GO</span>;
  } else if (langLower.includes("java")) {
    colorClass = "border-[#b07219] text-[#b07219] bg-[#b07219]/10 shadow-[0_0_15px_rgba(176,114,25,0.15)]";
    iconNode = <svg className="w-5 h-5 text-[#b07219]" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2v-1h10v1zm-2 3H8v2h6v-2zm-1-6H9v1h4V8zm4-2h-1c-.5-1.5-1.5-2.5-3-3-.7-.2-1.3-.2-1.8 0-.6.2-1 .7-1.3 1.2-.5 1-1.1 1.7-1.8 2-1 .5-2.2.4-3.1-.3l-.7-.6 1-1.3.7.6c.6.4 1.3.5 1.9.2.4-.2.8-.7 1.1-1.4.3-.6.7-1.1 1.3-1.3 1-.3 2.1-.2 2.9.4.9.7 1.6 1.8 1.9 3.1z" /></svg>;
  } else if (langLower.includes("rust") || langLower === "rs") {
    colorClass = "border-[#dea584] text-[#dea584] bg-[#dea584]/10 shadow-[0_0_15px_rgba(222,165,132,0.15)]";
    iconNode = <svg className="w-5 h-5 text-[#dea584]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="8" /><path d="M12 8v8M9 10h6" /></svg>;
  } else if (langLower.includes("react")) {
    colorClass = "border-[#61DAFB] text-[#61DAFB] bg-[#61DAFB]/10 shadow-[0_0_15px_rgba(97,218,251,0.15)]";
    iconNode = (
      <svg viewBox="-11.5 -10.23174 23 20.46348" className="w-6 h-6 text-[#61DAFB]">
        <circle cx="0" cy="0" r="2.05" fill="currentColor" />
        <g stroke="currentColor" strokeWidth="1" fill="none">
          <ellipse rx="11" ry="4.2" />
          <ellipse rx="11" ry="4.2" transform="rotate(60)" />
          <ellipse rx="11" ry="4.2" transform="rotate(120)" />
        </g>
      </svg>
    );
  }

  return (
    <div className={`relative flex items-center gap-3 p-3 border-2 rounded-lg ${colorClass} w-36 hover:scale-105 transition-transform cursor-pointer ${className}`} style={{ opacity, transform: `scale(${scale})` }}>
      <div className="w-8 h-8 rounded bg-slate-950 flex items-center justify-center font-bold font-mono text-xs border border-current opacity-90 overflow-hidden">
        {iconNode}
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-sm leading-tight text-slate-100">{label || language}</span>
      </div>
    </div>
  );
};

// --- Connection Primitives (Arrows & Lines) ---

export const KarmaConnector: React.FC<{
  direction?: 'horizontal' | 'vertical',
  type?: 'solid' | 'dashed' | 'dotted',
  arrows?: 'start' | 'end' | 'both' | 'none',
  length?: number | string,
  label?: string,
  animationDelay?: number,
  className?: string
}> = ({ direction = 'horizontal', type = 'solid', arrows = 'end', length = 100, label, animationDelay = 10, className = "" }) => {
  const { opacity, scale } = useEntranceAnimation(animationDelay);

  const lenStr = typeof length === 'number' ? `${length}px` : length;
  const isHoriz = direction === 'horizontal';

  const lineClass = `border-slate-500 ${type === 'dashed' ? 'border-dashed' : type === 'dotted' ? 'border-dotted' : 'border-solid'}`;

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ opacity, transform: `scale(${scale})`, width: isHoriz ? lenStr : 'auto', height: !isHoriz ? lenStr : 'auto', minWidth: isHoriz ? '20px' : 'auto', minHeight: !isHoriz ? '20px' : 'auto' }}>

      {/* Container for the line */}
      <div className={`absolute flex items-center justify-center ${isHoriz ? 'w-full h-0 border-t-2' : 'h-full w-0 border-l-2'} ${lineClass}`}>

        {/* Start Arrow */}
        {(arrows === 'start' || arrows === 'both') && (
          <div className={`absolute ${isHoriz ? 'left-0 border-t-2 border-l-2 -rotate-45 w-3 h-3 -ml-0.5' : 'top-0 border-t-2 border-l-2 rotate-45 w-3 h-3 -mt-0.5'} border-slate-500`}></div>
        )}

        {/* End Arrow */}
        {(arrows === 'end' || arrows === 'both') && (
          <div className={`absolute ${isHoriz ? 'right-0 border-t-2 border-r-2 rotate-45 w-3 h-3 -mr-0.5' : 'bottom-0 border-b-2 border-r-2 rotate-45 w-3 h-3 -mb-0.5'} border-slate-500`}></div>
        )}

        {/* Label */}
        {label && (
          <div className={`absolute bg-slate-900 px-2 text-[10px] font-mono text-slate-400 border border-slate-700 rounded z-10 whitespace-nowrap shadow-md ${isHoriz ? '-translate-y-4' : 'translate-x-4'}`}>
            {label}
          </div>
        )}

      </div>
    </div>
  );
};
