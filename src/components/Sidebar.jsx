import React, { useState, useEffect, useMemo } from 'react';
import { X, ChevronRight, ChevronLeft, Users, Library, ScrollText } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Sidebar = ({ selectedNode, allGotras = [], expandedAlpha, expandedGotra, onNavigate, onClose }) => {
  const [view, setView] = useState('alphabet'); // 'alphabet' | 'gotras' | 'surnames'
  const [currentAlphabet, setCurrentAlphabet] = useState(null);
  const [currentGotra, setCurrentGotra] = useState(null);
  const [surnames, setSurnames] = useState([]);
  const [loading, setLoading] = useState(false);

  // Declarative view sync
  useEffect(() => {
    if (expandedGotra) {
      setCurrentAlphabet(expandedGotra.name[0].toUpperCase());
      setCurrentGotra(expandedGotra);
      setView('surnames');
      
      const fetchSurnames = async () => {
        setLoading(true);
        const { data: results } = await supabase.from('surnames').select('*').eq('gotra_id', expandedGotra.id);
        setSurnames(results || []);
        setLoading(false);
      };
      fetchSurnames();
    } else if (expandedAlpha) {
      setCurrentAlphabet(expandedAlpha);
      setView('gotras');
      setCurrentGotra(null);
    } else {
      setView('alphabet');
      setCurrentAlphabet(null);
      setCurrentGotra(null);
    }
  }, [expandedAlpha, expandedGotra]);

  const alphabets = useMemo(() => {
    return [...new Set(allGotras.map(g => g.name?.[0]?.toUpperCase()).filter(Boolean))].sort();
  }, [allGotras]);

  const filteredGotras = useMemo(() => {
    if (!currentAlphabet) return [];
    return allGotras.filter(g => g.name?.[0]?.toUpperCase() === currentAlphabet);
  }, [currentAlphabet, allGotras]);

  const handleAlphabetClick = (char) => {
    setCurrentAlphabet(char);
    setView('gotras');
    onNavigate('alphabet', char);
  };

  const handleGotraClick = async (gotra) => {
    setCurrentGotra(gotra);
    setLoading(true);
    setView('surnames');
    const { data: results } = await supabase.from('surnames').select('*').eq('gotra_id', gotra.id);
    setSurnames(results || []);
    setLoading(false);
    onNavigate('gotra', gotra);
  };

  const handleBack = () => {
    if (view === 'surnames') {
      setView('gotras');
      setCurrentGotra(null);
    } else if (view === 'gotras') {
      setView('alphabet');
      setCurrentAlphabet(null);
    }
  };

  return (
    <div className="sidebar-window" style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'url("/weaver_pattern.png") repeat',
      backgroundSize: '200px',
    }}>
      {/* Sidebar Header */}
      <div style={{
        padding: '24px 24px 16px 24px',
        borderBottom: '1px solid rgba(212, 175, 55, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {view !== 'alphabet' && (
            <button onClick={handleBack} style={{
              background: 'none',
              border: 'none',
              color: 'var(--silk-gold)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <ChevronLeft size={20} />
            </button>
          )}
          <span style={{ 
            fontSize: '12px', 
            fontWeight: 700, 
            textTransform: 'uppercase', 
            letterSpacing: '0.1em',
            color: 'var(--silk-gold)',
            opacity: 0.8
          }}>
            {view === 'alphabet' ? 'Lineage Groups' : view === 'gotras' ? `Alphabet ${currentAlphabet}` : currentGotra?.name}
          </span>
        </div>
        <button onClick={onClose} style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.4)',
          cursor: 'pointer',
          padding: '4px'
        }}>
          <X size={18} />
        </button>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        {view === 'alphabet' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {alphabets.map(char => (
              <button
                key={char}
                onClick={() => handleAlphabetClick(char)}
                className="alphabet-btn"
                style={{
                  aspectRatio: '1',
                  background: 'rgba(212, 175, 55, 0.05)',
                  border: '1px solid rgba(212, 175, 55, 0.1)',
                  borderRadius: '12px',
                  color: 'var(--silk-gold)',
                  fontSize: '18px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {char}
              </button>
            ))}
          </div>
        )}

        {view === 'gotras' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredGotras.map(g => (
              <div
                key={g.id}
                onClick={() => handleGotraClick(g)}
                className="list-item"
                style={{
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(212, 175, 55, 0.05)',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Library size={16} color="var(--pasupu)" opacity={0.6} />
                  <span style={{ fontWeight: 600 }}>{g.name}</span>
                </div>
                <ChevronRight size={16} opacity={0.3} />
              </div>
            ))}
          </div>
        )}

        {view === 'surnames' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ 
              marginBottom: '16px', 
              padding: '12px', 
              background: 'rgba(139, 0, 0, 0.1)', 
              borderRadius: '8px',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <ScrollText size={14} />
              <span>Ancestral Surnames in {currentGotra?.name}</span>
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '40px' }}>Loading...</div>
            ) : (
              surnames.map(s => (
                <div
                  key={s.id}
                  style={{
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    borderLeft: '2px solid var(--silk-gold)'
                  }}
                >
                  {s.name}
                </div>
              ))
            )}
            {!loading && surnames.length === 0 && (
              <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '40px' }}>No records found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
