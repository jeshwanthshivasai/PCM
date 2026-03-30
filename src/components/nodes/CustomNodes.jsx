import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const RootNode = memo(({ data }) => {
  const { t } = useTranslation();
  return (
    <div className="custom-node-container node-pulse" style={{ 
      background: 'var(--kumkum)',
      border: '3px solid var(--silk-gold)',
      padding: '20px 32px',
      boxShadow: '0 0 30px rgba(139, 0, 0, 0.5)'
    }}>
      <User size={28} color="var(--silk-gold)" strokeWidth={2.5} />
      <div style={{ color: 'white', fontWeight: 800, fontSize: '18px', letterSpacing: '0.05em' }}>{data.label}</div>
      <div style={{ color: 'var(--pasupu)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em' }}>{t('nodes.mula_purusha')}</div>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
});

export const GotraNode = memo(({ data }) => {
  const { t } = useTranslation();
  return (
    <div className="custom-node-container glass" style={{ 
      borderColor: 'var(--silk-gold)',
      padding: '12px 20px',
      borderWidth: '1px',
      background: 'rgba(139, 0, 0, 0.1)'
    }}>
      <div style={{ color: 'var(--pasupu)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('nodes.gotram')}</div>
      <div style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>{data.label}</div>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
});

export const AlphabetNode = memo(({ data }) => {
  return (
    <div className="custom-node-container glass" style={{ 
      borderColor: 'var(--silk-gold)', 
      width: '56px',
      height: '56px',
      minWidth: '56px',
      borderRadius: '50%',
      padding: '0', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'rgba(212, 175, 55, 0.1)',
      borderWidth: '2px'
    }}>
      <div style={{ color: 'var(--silk-gold)', fontWeight: 800, fontSize: '22px' }}>{data.label}</div>
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
