import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Users, X, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const SearchBar = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data: gotras } = await supabase
          .from('gotras')
          .select('id, name')
          .ilike('name', `%${query}%`)
          .limit(5);

        const { data: surnames } = await supabase
          .from('surnames')
          .select('id, name, gotra_id')
          .ilike('name', `%${query}%`)
          .limit(10);

        const combined = [
          ...(gotras?.map(g => ({ ...g, type: 'gotra' })) || []),
          ...(surnames?.map(s => ({ ...s, type: 'surname' })) || [])
        ];
        setResults(combined);
        setShowResults(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div ref={searchRef} style={{
      position: 'relative',
      zIndex: 200,
      width: '100%',
      maxWidth: '400px',
      pointerEvents: 'auto',
      boxSizing: 'border-box'
    }}>
      <div className="glass" style={{
        borderRadius: '20px',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        background: 'rgba(20, 18, 15, 0.8)'
      }}>
        {loading ? <Loader2 className="animate-spin" size={20} color="var(--accent)" /> : <Search size={20} color="var(--text-secondary)" />}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Gotras or Surnames..."
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            outline: 'none',
            width: '100%',
            fontSize: '15px',
            fontFamily: 'inherit'
          }}
        />
        {query && (
          <button onClick={() => setQuery('')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)' }}>
            <X size={18} />
          </button>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="glass" style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '8px',
          borderRadius: '20px',
          overflow: 'hidden',
          maxHeight: '400px',
          overflowY: 'auto',
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(20, 18, 15, 0.98)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
        }}>
          {results.map((item) => (
            <button
              key={`${item.type}-${item.id}`}
              onClick={() => {
                onSelect(item);
                setShowResults(false);
                setQuery('');
              }}
              style={{
                width: '100%',
                padding: '16px 20px',
                textAlign: 'left',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {item.type === 'gotra' ? <Users size={18} color="#00d4ff" /> : <MapPin size={18} color="white" opacity={0.5} />}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 600 }}>{item.name}</span>
                <span style={{ fontSize: '11px', opacity: 0.5, uppercase: true }}>{item.type}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
