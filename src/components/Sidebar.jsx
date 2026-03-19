import React from 'react';
import { X, Info, Users, ChevronRight } from 'lucide-react';

const Sidebar = ({ selectedNode, onClose, surnames = [], onItemClick }) => {
  if (!selectedNode) return null;

  const isGotra = selectedNode.id.startsWith('gotra-');
  const isAlphabet = selectedNode.id.startsWith('alpha-');
  const isRoot = selectedNode.id === 'root-bhavana-rishi';

  const listTitle = isGotra ? `Associated Families (${surnames.length})` : isAlphabet ? `Sacred Lineages in Group ${selectedNode.data.label} (${surnames.length})` : '';

  return (
    <div className="glass" style={{
      position: 'absolute',
      top: 24,
      right: 24,
      bottom: 24,
      width: '340px',
      borderRadius: '28px',
      padding: '32px',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      color: 'var(--text-primary)',
      border: '1.5px solid rgba(212, 175, 55, 0.3)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--silk-gold)' }}>
          <Info size={18} />
          <span style={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Historical Archive</span>
        </div>
        <button onClick={onClose} style={{
          background: 'rgba(212, 175, 55, 0.1)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          borderRadius: '50%',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--silk-gold)',
          padding: '0'
        }}>
          <X size={18} />
        </button>
      </div>

      <div>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 800, color: 'var(--pasupu)' }}>
          {isAlphabet ? `Lineage Group ${selectedNode.data.label}` : selectedNode.data.label}
        </h2>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.5' }}>
          {isRoot ? 'Mula Purusha: The divine progenitor of the Padmasali weaving community.' : 
           isAlphabet ? 'Alphabetical indexing of ancestral Gotras and lineages.' :
           isGotra ? 'Ancient Family Gotram' : 'Traditional Surname'}
        </p>
      </div>

      {(isGotra || isAlphabet) && (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600 }}>
            <Users size={16} />
            <span>{listTitle}</span>
          </div>
          
          <div style={{ 
            flex: 1, 
            overflowY: 'auto', 
            paddingRight: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {surnames.map((s, idx) => (
              <div 
                key={idx} 
                onClick={() => onItemClick && onItemClick(s)}
                style={{
                  padding: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  fontSize: '13px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                {s.name}
                <ChevronRight size={14} opacity={0.3} />
              </div>
            ))}
            {surnames.length === 0 && (
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '20px' }}>
                {isAlphabet ? 'Loading Gotras...' : 'Click the node on the map to load surnames.'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
