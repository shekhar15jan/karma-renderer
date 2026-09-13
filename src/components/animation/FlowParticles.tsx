import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export interface FlowParticlesProps {
  path: string;
  color?: string;
  speed?: number; // Higher is faster
  particleLength?: number;
  gap?: number;
  strokeWidth?: number;
}

/**
 * Renders animated particles flowing along an SVG path.
 * Uses Remotion's frame-based animation for smooth flow.
 */
export const FlowParticles: React.FC<FlowParticlesProps> = ({
  path,
  color = "#0ea5e9", // Default to Cyan
  speed = 1,
  particleLength = 12,
  gap = 24,
  strokeWidth = 2,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Calculate offset based on time (frame/fps) and speed
  // A negative offset makes it flow forward along the path
  const time = frame / fps;
  const offset = -time * speed * 100;
  
  const dashArray = `${particleLength} ${gap}`;

  return (
    <svg style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none", zIndex: 3 }}>
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={dashArray}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{
          filter: `drop-shadow(0 0 4px ${color})`,
        }}
      />
    </svg>
  );
};
