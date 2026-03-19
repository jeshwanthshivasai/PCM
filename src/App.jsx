import React from 'react';
import { Analytics } from "@vercel/analytics/react";
import FamilyMap from './components/FamilyMap';

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: 'var(--earth-bg)' }}>
      <FamilyMap />
      <Analytics />
    </div>
  );
}

export default App;
