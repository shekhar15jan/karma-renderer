import React from 'react';
import { AbsoluteFill } from 'remotion';
import { KarmaHeading, KarmaParagraph, KarmaContainer, KarmaGrid, KarmaCard, KarmaCodeBlock, KarmaBadge } from '../../components/widgets/HtmlWidgets';
import '../../styles/global.css';

export const WidgetShowcase: React.FC = () => {
  return (
    <AbsoluteFill className="bg-[#020617] flex flex-col items-center justify-center font-sans overflow-hidden">
      <AbsoluteFill className="bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900/80 to-slate-950 opacity-90" />
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />
      
      <div className="w-full h-full p-12 flex flex-col justify-center items-center z-10 relative">
        <KarmaGrid cols={1} className="w-full max-w-7xl gap-12">
          
          <KarmaContainer variant="transparent" animationDelay={0}>
            <KarmaHeading text="Karma UI Design System" level={1} className="text-center mb-4" />
            <KarmaParagraph text="A fully composable, native React rendering engine for visual_spec layouts. The script agent outputs simple components, and the engine builds beautiful frames." className="text-center" />
          </KarmaContainer>

          <KarmaGrid cols={2} gap="gap-8" className="w-full">
            
            <KarmaContainer variant="transparent" animationDelay={10}>
              <KarmaHeading text="Performance Metrics" level={3} animationDelay={15} className="mb-6" />
              <KarmaGrid cols={2} gap="gap-4">
                <KarmaCard color="emerald" animationDelay={20}>
                  <KarmaBadge text="Uptime" color="emerald" />
                  <div className="mt-4 text-5xl font-extrabold text-white">99.9%</div>
                </KarmaCard>
                <KarmaCard color="indigo" animationDelay={25}>
                  <KarmaBadge text="Latency" color="indigo" />
                  <div className="mt-4 text-5xl font-extrabold text-white">42ms</div>
                </KarmaCard>
              </KarmaGrid>
            </KarmaContainer>

            <KarmaContainer variant="glass" animationDelay={15}>
              <KarmaBadge text="Technical Explainer" color="rose" className="mb-6 inline-block" />
              <KarmaCodeBlock 
                language="json"
                animationDelay={30}
                code={`{
  "layout": "dashboard",
  "components": [
    { "type": "card", "label": "Uptime", "data": { "value": "99.9%" } },
    { "type": "code", "data": { "text": "..." } }
  ]
}`}
              />
            </KarmaContainer>

          </KarmaGrid>
          
        </KarmaGrid>
      </div>
    </AbsoluteFill>
  );
};
