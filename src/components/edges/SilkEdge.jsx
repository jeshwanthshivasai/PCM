import React from 'react';
import { getBezierPath } from 'reactflow';

export default function SilkEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  straight = false, // New prop
}) {
  // Use a straight line if requested or if source and target are perfectly aligned vertically
  const isStraight = straight || Math.abs(sourceX - targetX) < 1;

  const [edgePath] = isStraight
    ? [`M ${sourceX},${sourceY} L ${targetX},${targetY}`]
    : getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        curvature: 0.5,
      });

  return (
    <>
      {/* Outer Glow Path */}
      <path
        id={`${id}-glow`}
        style={{
          ...style,
          strokeWidth: (style.strokeWidth || 1.5) * 3,
          stroke: 'var(--silk-gold)',
          opacity: 0.1,
          filter: 'blur(3px)',
        }}
        className="react-flow__edge-path"
        d={edgePath}
        fill="none"
      />
      {/* Primary Silk Path */}
      <path
        id={id}
        style={{
          ...style,
          stroke: 'var(--silk-gold)',
          strokeWidth: style.strokeWidth || 1.5,
          opacity: 0.6,
        }}
        className="react-flow__edge-path silk-thread-organic"
        d={edgePath}
        markerEnd={markerEnd}
        fill="none"
      />
    </>
  );
}
