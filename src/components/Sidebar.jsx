import React from 'react';
import { X, Info, Users, ChevronRight } from 'lucide-react';

const Sidebar = ({ selectedNode, onClose, surnames = [] }) => {
  if (!selectedNode) return null;

  const isGotra = selectedNode.id.startsWith('gotra-');
  const isRoot = selectedNode.id === 'root-bhavana-rishi';

  return (
    <div className="glass" style={{
      position: 'absolute',
      top: 20,
      right: 20,
      bottom: 20,
      width: '320px',
      borderRadius: '24px',
      padding: '24px',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      color: 'white'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)' }}>
          <Info size={18} />
          <span style={{ fontWeight: 600, fontSize: '12px', uppercase: true }}>Details</span>
        </div>
        <button onClick={onClose} style={{
          background: 'rgba(255,255,255,0.1)',
          border: 'none',
          borderRadius: '50%',
          padding: '4px',
          cursor: 'pointer',
          color: 'white'
        }}>
          <X size={18} />
        </button>
      </div>

      <div>
        <h2 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: 700 }}>{selectedNode.data.label}</h2>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
          {isRoot ? 'The divine progenitor of the Padmasali community.' : isGotra ? 'Ancient Family Gotra' : 'Traditional Surname'}
        </p>
      </div>

      {isGotra && (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600 }}>
            <Users size={16} />
            <span>Associated Surnames ({surnames.length})</span>
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
              <div key={idx} style={{
                padding: '12px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
                fontSize: '13px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                {s.name}
                <ChevronRight size={14} opacity={0.3} />
              </div>
            ))}
            {surnames.length === 0 && (
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '20px' }}>
                Click the node on the map to load surnames.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
