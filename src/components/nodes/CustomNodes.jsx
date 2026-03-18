import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { User } from 'lucide-react';

export const RootNode = memo(({ data }) => {
  return (
    <div className="custom-node-container node-pulse" style={{ background: 'var(--root-gradient)' }}>
      <User size={24} color="white" strokeWidth={2.5} />
      <div style={{ color: 'white', fontWeight: 700, fontSize: '14px' }}>{data.label}</div>
      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px' }}>PROGENITOR</div>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
});

export const GotraNode = memo(({ data }) => {
  return (
    <div className="custom-node-container glass" style={{ borderColor: '#00d4ff' }}>
      <div style={{ color: '#00d4ff', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' }}>GOTRA</div>
      <div style={{ color: 'white', fontWeight: 600, fontSize: '13px' }}>{data.label}</div>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
});

export const SurnameNode = memo(({ data }) => {
  return (
    <div className="custom-node-container glass" style={{ minWidth: '100px', padding: '8px 16px' }}>
      <div style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 400, fontSize: '12px' }}>{data.label}</div>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
    </div>
  );
});
