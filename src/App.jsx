import React from 'react';
import FamilyMap from './components/FamilyMap';

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#050505' }}>
      <FamilyMap />
      
      {/* Decorative branding overlay */}
      <div style={{
        position: 'absolute',
        top: 40,
        left: 40,
        color: 'white',
        zIndex: 10,
        pointerEvents: 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ width: '40px', height: '4px', background: 'var(--accent)', borderRadius: '2px' }} />
          <span style={{ fontWeight: 600, fontSize: '12px', letterSpacing: '0.2em', opacity: 0.5, textTransform: 'uppercase' }}>
            Historical Archive
          </span>
        </div>
        <h1 style={{ 
          margin: 0, 
          fontSize: '32px', 
          fontWeight: 700, 
          background: 'linear-gradient(to right, #fff, rgba(255,255,255,0.4))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Padmasali Family Network
        </h1>
        <p style={{ margin: '8px 0 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '14px', maxWidth: '300px' }}>
          Explore the ancestral Gotras and Surnames of the Padmasali heritage through an interactive network graph.
        </p>
      </div>

      <div style={{
        position: 'absolute',
        bottom: 40,
        left: 40,
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(8px)',
        padding: '12px 20px',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.1)',
        color: 'rgba(255,255,255,0.5)',
        fontSize: '11px',
        zIndex: 10
      }}>
        Scroll to Zoom • Drag to Move • Click Nodes to Expand
      </div>
    </div>
  );
}

export default App;
