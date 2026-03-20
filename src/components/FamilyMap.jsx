import React, { useEffect, useCallback, useState } from 'react';
import ReactFlow, { 
  useNodesState, 
  useEdgesState, 
  Background, 
  Controls, 
  useReactFlow,
  ReactFlowProvider
} from 'reactflow';
import { supabase } from '../lib/supabase';
import { RootNode, GotraNode, SurnameNode, AlphabetNode } from './nodes/CustomNodes';
import Sidebar from './Sidebar';
import SearchBar from './SearchBar';
import SilkEdge from './edges/SilkEdge';

const ROOT_ID = 'root-bhavana-rishi';

const nodeTypes = {
  root: RootNode,
  gotra: GotraNode,
  surname: SurnameNode,
  alphabet: AlphabetNode,
};

const edgeTypes = {
  silk: SilkEdge,
};

const FamilyMapContent = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [allGotras, setAllGotras] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [expandedAlpha, setExpandedAlpha] = useState(null);
  const [expandedGotra, setExpandedGotra] = useState(null);
  
  const { setCenter, fitView } = useReactFlow();

  // Load Initial Data
  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: gotras, error } = await supabase.from('gotras').select('*').order('name');
      if (error) return;
      setAllGotras(gotras);
    };
    fetchInitialData();
  }, []);

  // Declarative Graph Rebuild Effect
  useEffect(() => {
    const rebuildGraph = async () => {
      if (allGotras.length === 0) return;

      const alphabetChars = [...new Set(
        allGotras.map(g => g.name?.[0]?.toUpperCase()).filter(Boolean)
      )].sort();

      // Implement requested 9-1-9 split with 'K' in the middle
      const kIndex = alphabetChars.indexOf('K');
      let leftWing = [];
      let midChar = null;
      let rightWing = [];

      if (kIndex !== -1) {
        leftWing = alphabetChars.slice(0, kIndex);
        midChar = 'K';
        rightWing = alphabetChars.slice(kIndex + 1);
      } else {
        // Fallback to normal split if K isn't found
        const midIndex = Math.ceil(alphabetChars.length / 2);
        leftWing = alphabetChars.slice(0, midIndex);
        rightWing = alphabetChars.slice(midIndex);
      }

      // BASE NODES: Root
      let nextNodes = [
        { 
          id: ROOT_ID, 
          type: 'root', 
          data: { label: 'Bhavana Rishi' }, 
          position: { x: 0, y: 0 },
          origin: [0.5, 0.5] // Position by center
        }
      ];
      let nextEdges = [];

      // HELPER: Fixed position for Alphabets (Tight gap in center)
      // HELPER: Fixed position for Alphabets (Centered midChar, symmetric wings)
      const getAlphaPos = (char, index, side) => {
        const spacing = 100; // Improved spacing
        const verticalOffset = 300; // Increased as requested
        
        if (side === 'mid') return { x: 0, y: verticalOffset };
        
        // Exact symmetrical math: K is 0, J is -100, M is +100
        return { 
          x: side === 'left' 
            ? (index - leftWing.length) * spacing 
            : (index + 1) * spacing, 
          y: verticalOffset 
        };
      };

      // Add Alphabets (Left Wing)
      leftWing.forEach((char, i) => {
        const pos = getAlphaPos(char, i, 'left');
        nextNodes.push({
          id: `alpha-${char}`,
          type: 'alphabet',
          data: { label: char, expanded: expandedAlpha === char },
          position: pos,
          origin: [0.5, 0.5],
          draggable: false
        });
        nextEdges.push({
          id: `e-root-alpha-${char}`,
          source: ROOT_ID,
          target: `alpha-${char}`,
          type: 'silk',
          style: { stroke: 'var(--silk-gold)', strokeWidth: 1.5 }
        });
      });

      // Add Middle Char (K)
      if (midChar) {
        const pos = getAlphaPos(midChar, 0, 'mid');
        nextNodes.push({
          id: `alpha-${midChar}`,
          type: 'alphabet',
          data: { label: midChar, expanded: expandedAlpha === midChar },
          position: pos,
          origin: [0.5, 0.5],
          draggable: false
        });
        nextEdges.push({
          id: `e-root-alpha-${midChar}`,
          source: ROOT_ID,
          target: `alpha-${midChar}`,
          type: 'silk',
          straight: true, // Specifically request straight line
          style: { stroke: 'var(--silk-gold)', strokeWidth: 1.5 }
        });
      }

      // Add Alphabets (Right Wing)
      rightWing.forEach((char, i) => {
        const pos = getAlphaPos(char, i, 'right');
        nextNodes.push({
          id: `alpha-${char}`,
          type: 'alphabet',
          data: { label: char, expanded: expandedAlpha === char },
          position: pos,
          origin: [0.5, 0.5],
          draggable: false
        });
        nextEdges.push({
          id: `e-root-alpha-${char}`,
          source: ROOT_ID,
          target: `alpha-${char}`,
          type: 'silk',
          style: { stroke: 'var(--silk-gold)', strokeWidth: 1.5 }
        });
      });

      // EXPAND ALPHABET: Horizontal spread
      if (expandedAlpha) {
        const matchingGotras = allGotras.filter(g => g.name?.[0]?.toUpperCase() === expandedAlpha);
        const aNode = nextNodes.find(n => n.id === `alpha-${expandedAlpha}`);

        const isSmallGroup = matchingGotras.length < 5;
        const gotraSpacing = isSmallGroup ? 140 : 220; // Tighter for small groups
        const totalGotraWidth = (matchingGotras.length - 1) * gotraSpacing;
        const startX = aNode.position.x - (totalGotraWidth / 2);

        nextNodes.push(...matchingGotras.map((g, i) => ({
          id: `gotra-${g.id}`,
          type: 'gotra',
          data: { label: g.name, gotraId: g.id, expanded: expandedGotra?.id === g.id },
          position: { 
            x: startX + (i * gotraSpacing), 
            y: aNode.position.y + 200 
          },
          origin: [0.5, 0.5]
        })));

        nextEdges.push(...matchingGotras.map(g => ({
          id: `e-alpha-${expandedAlpha}-gotra-${g.id}`,
          source: `alpha-${expandedAlpha}`,
          target: `gotra-${g.id}`,
          type: 'silk',
          // Auto-straighten if single child
          straight: matchingGotras.length === 1,
          style: { stroke: 'var(--silk-gold)', strokeWidth: 1.2 }
        })));

        // EXPAND GOTRA: Horizontal spread for surnames
        if (expandedGotra && expandedGotra.name?.[0]?.toUpperCase() === expandedAlpha) {
          const { data: surnames } = await supabase
            .from('surnames')
            .select('*')
            .eq('gotra_id', expandedGotra.id);

          if (surnames && surnames.length > 0) {
            const gNode = nextNodes.find(n => n.id === `gotra-${expandedGotra.id}`);
            if (gNode) {
              const isSmallGroup = surnames.length < 5;
              const surSpacing = isSmallGroup ? 120 : 160;
              const totalSurWidth = (surnames.length - 1) * surSpacing;
              const surStartX = gNode.position.x - (totalSurWidth / 2);

              nextNodes.push(...surnames.map((s, i) => ({
                id: `surname-${s.id}`,
                type: 'surname',
                data: { label: s.name },
                position: { 
                  x: surStartX + (i * surSpacing), 
                  y: gNode.position.y + 150
                },
                origin: [0.5, 0.5]
              })));

              nextEdges.push(...surnames.map(s => ({
                id: `e-gotra-${expandedGotra.id}-surname-${s.id}`,
                source: `gotra-${expandedGotra.id}`,
                target: `surname-${s.id}`,
                type: 'silk',
                straight: surnames.length === 1,
                style: { stroke: 'var(--silk-gold)', strokeWidth: 1 }
              })));
            }
          }
        }
      }

      setNodes(nextNodes);
      setEdges(nextEdges);

      // Animation & View Sync
      if (expandedGotra) {
        const targetNode = nextNodes.find(n => n.id === `gotra-${expandedGotra.id}`);
        if (targetNode) setCenter(targetNode.position.x, targetNode.position.y + 100, { zoom: 0.7, duration: 1000 });
      } else if (expandedAlpha) {
        const targetNode = nextNodes.find(n => n.id === `alpha-${expandedAlpha}`);
        if (targetNode) setCenter(targetNode.position.x, targetNode.position.y + 200, { zoom: 0.8, duration: 1000 });
      } else {
        fitView({ padding: 0.2, duration: 800 });
      }
    };

    rebuildGraph();
  }, [allGotras, expandedAlpha, expandedGotra, setNodes, setEdges, setCenter, fitView]);

  const onSearchResultSelect = useCallback(async (item) => {
    if (item.type === 'gotra') {
      const char = item.name[0].toUpperCase();
      setExpandedAlpha(char);
      setExpandedGotra({ id: item.id, name: item.name });
    } else if (item.type === 'surname') {
      const { data: gotra } = await supabase.from('gotras').select('*').eq('id', item.gotra_id).single();
      if (gotra) {
        setExpandedAlpha(gotra.name[0].toUpperCase());
        setExpandedGotra({ id: gotra.id, name: gotra.name });
      }
    }
  }, []);

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    if (node.id.startsWith('alpha-')) {
      const char = node.data.label;
      setExpandedAlpha(prev => prev === char ? null : char);
      setExpandedGotra(null);
    } else if (node.id.startsWith('gotra-')) {
      const gId = node.data.gotraId;
      setExpandedGotra(prev => prev?.id === gId ? null : { id: gId, name: node.data.label });
    }
  }, []);

  const onSidebarNavigation = useCallback((type, value) => {
    if (type === 'alphabet') {
      setExpandedAlpha(value);
      setExpandedGotra(null);
    } else if (type === 'gotra') {
      setExpandedAlpha(value.name[0].toUpperCase());
      setExpandedGotra({ id: value.id, name: value.name });
    }
  }, []);

  return (
    <div className="bento-layout" style={{ 
      padding: '24px',
      boxSizing: 'border-box',
      background: 'transparent',
      position: 'relative'
    }}>
      {/* Bento 1: Header/Branding */}
      <div className="window-pane bento-title" style={{ padding: '24px', position: 'relative' }}>
        <div className="bento-title-inner" style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <h1 className="traditional-title" style={{ margin: 0, color: 'var(--pasupu)' }}>
              Padmasali Family Network
            </h1>
            <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)' }}>
              Sacred Lineages and Ancestral Gotras of the Padmasali Community.
            </p>
          </div>
        </div>
      </div>

      {/* Bento 2: Network Map */}
      <div className="window-pane bento-map" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Floating Search Bar */}
        <div style={{ 
          position: 'absolute', 
          top: '20px', 
          right: '20px', 
          left: '20px',
          display: 'flex',
          justifyContent: 'flex-end',
          zIndex: 1000,
          pointerEvents: 'none' // allow clicks through the container but the child has pointerEvents: auto
        }}>
          <SearchBar onSelect={onSearchResultSelect} />
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onPaneClick={() => setSelectedNode(null)}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
          nodeOrigin={[0.5, 0.5]} // Crucial: position all nodes by center
          fitView
          fitViewOptions={{ padding: 0.2 }}
        >
          <Background color="transparent" />
          <Controls />
        </ReactFlow>
      </div>

      {/* Bento 3: Persistent Sidebar */}
      <div className="window-pane bento-sidebar">
        <Sidebar 
          selectedNode={selectedNode} 
          allGotras={allGotras}
          expandedAlpha={expandedAlpha}
          expandedGotra={expandedGotra}
          onNavigate={onSidebarNavigation}
          onClose={() => {
            setSelectedNode(null);
            setExpandedAlpha(null);
            setExpandedGotra(null);
          }}
        />
      </div>
    </div>
  );
};

const FamilyMap = () => (
  <ReactFlowProvider>
    <div style={{ width: '100vw', height: '100vh', background: 'var(--earth-bg)' }}>
      <FamilyMapContent />
    </div>
  </ReactFlowProvider>
);

export default FamilyMap;
