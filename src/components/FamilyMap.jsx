import React, { useEffect, useCallback, useState } from 'react';
import ReactFlow, { 
  useNodesState, 
  useEdgesState, 
  Background, 
  Controls, 
  useReactFlow,
  ReactFlowProvider,
  MarkerType
} from 'reactflow';
import dagre from 'dagre';
import { supabase } from '../lib/supabase';
import { RootNode, GotraNode, SurnameNode, AlphabetNode } from './nodes/CustomNodes';
import Sidebar from './Sidebar';
import SearchBar from './SearchBar';

const ROOT_ID = 'root-bhavana-rishi';

const nodeTypes = {
  root: RootNode,
  gotra: GotraNode,
  surname: SurnameNode,
  alphabet: AlphabetNode,
};

const NODE_SIZES = {
  root: { width: 180, height: 90 },
  alphabet: { width: 50, height: 50 },
  gotra: { width: 200, height: 70 },
  surname: { width: 160, height: 50 },
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  dagreGraph.setGraph({ rankdir: direction, nodesep: 10, ranksep: 120 });

  nodes.forEach((node) => {
    const size = NODE_SIZES[node.type] || { width: 200, height: 80 };
    dagreGraph.setNode(node.id, { width: size.width, height: size.height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const size = NODE_SIZES[node.type] || { width: 200, height: 80 };
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - size.width / 2,
        y: nodeWithPosition.y - size.height / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

const FamilyMapContent = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [allGotras, setAllGotras] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [sidebarSurnames, setSidebarSurnames] = useState([]);
  const { setCenter, fitView } = useReactFlow();

  // Load Initial Data (Root + Alphabet Groups)
  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: gotras, error } = await supabase.from('gotras').select('*').order('name');
      if (error) return;
      setAllGotras(gotras);

      // Create unique alphabet groups from Gotra names with defensive check
      const alphabetGroups = [...new Set(
        gotras
          .map(g => g.name?.[0]?.toUpperCase())
          .filter(Boolean)
      )].sort();

      const initialNodes = [
        {
          id: ROOT_ID,
          type: 'root',
          data: { label: 'Bhavana Rishi' },
          position: { x: 0, y: 0 },
        },
        ...alphabetGroups.map((char) => ({
          id: `alpha-${char}`,
          type: 'alphabet',
          data: { label: char },
          position: { x: 0, y: 0 },
        }))
      ];

      const initialEdges = alphabetGroups.map((char) => ({
        id: `e-${ROOT_ID}-alpha-${char}`,
        source: ROOT_ID,
        target: `alpha-${char}`,
        type: 'smoothstep',
        animated: false,
        className: 'silk-thread',
        style: { stroke: 'var(--silk-gold)', strokeWidth: 1.5 }
      }));

      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      
      setTimeout(() => fitView({ padding: 0.2 }), 200);
    };

    fetchInitialData();
  }, [fitView, setNodes, setEdges]);

  const expandAlphabet = useCallback((char) => {
    const alphaNodeId = `alpha-${char}`;
    
    setNodes((currentNodes) => {
      // AUTO-COLLAPSE: Remove all gotras and surnames, reset all alphabets to closed
      const baseNodes = currentNodes
        .filter(n => n.id === ROOT_ID || n.id.startsWith('alpha-'))
        .map(n => n.id.startsWith('alpha-') 
          ? { ...n, data: { ...n.data, expanded: n.id === alphaNodeId } } 
          : n);

      const alphaNode = baseNodes.find(n => n.id === alphaNodeId);
      if (!alphaNode) return currentNodes;

      setEdges((currentEdges) => {
        // Clear all edges that aren't Root->Alphabet
        const baseEdges = currentEdges.filter(e => e.source === ROOT_ID);
        
        const matchingGotras = allGotras.filter(g => g.name?.[0]?.toUpperCase() === char);
        
        const newNodes = matchingGotras.map((g) => ({
          id: `gotra-${g.id}`,
          type: 'gotra',
          data: { label: g.name, gotraId: g.id },
          position: { x: alphaNode.position.x, y: alphaNode.position.y },
        }));

        const newEdges = matchingGotras.map((g) => ({
          id: `e-${alphaNodeId}-gotra-${g.id}`,
          source: alphaNodeId,
          target: `gotra-${g.id}`,
          type: 'smoothstep',
          className: 'silk-thread',
          style: { stroke: 'var(--silk-gold)', strokeWidth: 1.5 }
        }));

        const intermediateNodes = [...baseNodes, ...newNodes];
        const intermediateEdges = [...baseEdges, ...newEdges];

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(intermediateNodes, intermediateEdges);
        
        setTimeout(() => {
          setNodes(layoutedNodes);
          setEdges(layoutedEdges);
          // Auto-focus on the expanded letter
          setCenter(alphaNode.position.x + 25, alphaNode.position.y + 100, { zoom: 0.8, duration: 800 });
        }, 0);

        return currentEdges;
      });
      return currentNodes;
    });
  }, [allGotras, setNodes, setEdges, setCenter]);

  const expandGotra = useCallback(async (gotraId, gotraNodeId) => {
    const { data: surnames, error } = await supabase
      .from('surnames')
      .select('*')
      .eq('gotra_id', gotraId);

    if (error || !surnames) return [];

    setNodes((currentNodes) => {
      // AUTO-COLLAPSE: Remove other surnames, reset other gotras
      const baseNodes = currentNodes
        .filter(n => !n.id.startsWith('surname-'))
        .map(n => n.id.startsWith('gotra-')
          ? { ...n, data: { ...n.data, expanded: n.id === gotraNodeId } }
          : n);

      const gotraNode = baseNodes.find(n => n.id === gotraNodeId);
      if (!gotraNode) return currentNodes;

      setEdges((currentEdges) => {
        // Remove existing gotra->surname edges
        const baseEdges = currentEdges.filter(e => !e.id.includes('surname-'));

        const newNodes = surnames.map((s) => ({
          id: `surname-${s.id}`,
          type: 'surname',
          data: { label: s.name },
          position: { x: gotraNode.position.x, y: gotraNode.position.y },
        }));

        const newEdges = surnames.map((s) => ({
          id: `e-${gotraNodeId}-surname-${s.id}`,
          source: gotraNodeId,
          target: `surname-${s.id}`,
          type: 'smoothstep',
          className: 'silk-thread',
          style: { stroke: 'var(--silk-gold)', strokeWidth: 1 }
        }));

        const intermediateNodes = [...baseNodes, ...newNodes];
        const intermediateEdges = [...baseEdges, ...newEdges];

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(intermediateNodes, intermediateEdges);
        
        setTimeout(() => {
          setNodes(layoutedNodes);
          setEdges(layoutedEdges);
        }, 0);

        return currentEdges;
      });
      return currentNodes;
    });

    return surnames;
  }, [setNodes, setEdges]);

  const onSearchResultSelect = useCallback(async (item) => {
    console.log('Search item selected:', item);
    if (item.type === 'gotra') {
      const char = item.name[0].toUpperCase();
      expandAlphabet(char);
      
      // Give more time for Dagre to finish and React to commit
      setTimeout(() => {
        setNodes(nds => {
          const gNodeId = `gotra-${item.id}`;
          const gNode = nds.find(n => n.id === gNodeId);
          console.log('Searching for gNode:', gNodeId, !!gNode);
          if (gNode) {
            setCenter(gNode.position.x + 80, gNode.position.y + 35, { zoom: 1.5, duration: 1000 });
            setSelectedNode(gNode);
            expandGotra(item.id, gNodeId).then(surnames => setSidebarSurnames(surnames));
          }
          return nds;
        });
      }, 800);
    } else if (item.type === 'surname') {
      const { data: gotra } = await supabase.from('gotras').select('name').eq('id', item.gotra_id).single();
      if (gotra) {
        const char = gotra.name[0].toUpperCase();
        const gotraNodeId = `gotra-${item.gotra_id}`;
        
        expandAlphabet(char);
        setTimeout(async () => {
          const surnames = await expandGotra(item.gotra_id, gotraNodeId);
          setSidebarSurnames(surnames);
          
          setTimeout(() => {
            setNodes(nds => {
              const sNodeId = `surname-${item.id}`;
              const sNode = nds.find(n => n.id === sNodeId);
              console.log('Searching for sNode:', sNodeId, !!sNode);
              if (sNode) {
                setCenter(sNode.position.x + 80, sNode.position.y + 25, { zoom: 1.8, duration: 1000 });
                setSelectedNode(sNode);
              }
              return nds;
            });
          }, 800);
        }, 800);
      }
    }
  }, [expandAlphabet, expandGotra, setCenter, setNodes]);

  const onNodeClick = useCallback(async (event, node) => {
    setSelectedNode(node);
    if (node.id.startsWith('alpha-')) {
      const char = node.data.label;
      expandAlphabet(char);
      const matchingGotras = allGotras.filter(g => g.name[0].toUpperCase() === char);
      setSidebarSurnames(matchingGotras.map(g => ({ name: g.name, id: g.id })));
    } else if (node.id.startsWith('gotra-')) {
      const surnames = await expandGotra(node.data.gotraId, node.id);
      setSidebarSurnames(surnames);
    } else {
      setSidebarSurnames([]);
    }
  }, [expandAlphabet, expandGotra, allGotras]);

  const onSidebarItemClick = useCallback(async (item) => {
    if (selectedNode?.id?.startsWith('alpha-')) {
      const char = selectedNode.data.label;
      const nodeId = `gotra-${item.id}`;
      expandAlphabet(char);

      setTimeout(async () => {
        setNodes(nds => {
          const gNode = nds.find(n => n.id === nodeId);
          console.log('Sidebar gotra jump:', nodeId, !!gNode);
          if (gNode) {
            setCenter(gNode.position.x + 80, gNode.position.y + 35, { zoom: 1.5, duration: 1000 });
            setSelectedNode(gNode);
            expandGotra(item.id, gNode.id).then(surnames => setSidebarSurnames(surnames));
          }
          return nds;
        });
      }, 800);
    } else if (selectedNode?.id?.startsWith('gotra-')) {
      const sNodeId = `surname-${item.id}`;
      setNodes(nds => {
        const sNode = nds.find(n => n.id === sNodeId);
        if (sNode) {
          setCenter(sNode.position.x + 80, sNode.position.y + 25, { zoom: 1.5, duration: 800 });
          setSelectedNode(sNode);
          setSidebarSurnames([]);
        }
        return nds;
      });
    }
  }, [selectedNode, expandAlphabet, expandGotra, setCenter, setNodes]);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', overflow: 'hidden' }}>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <SearchBar onSelect={onSearchResultSelect} />
        
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onPaneClick={() => setSelectedNode(null)}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
          fitView
          fitViewOptions={{ padding: 0.2 }}
        >
          <Background color="rgba(255,255,255,0.05)" gap={20} />
          <Controls />
        </ReactFlow>
      </div>

      {selectedNode && (
        <div style={{ 
          width: '380px', 
          height: '100%', 
          borderLeft: '1px solid rgba(212, 175, 55, 0.2)',
          background: 'rgba(10, 8, 6, 0.95)',
          zIndex: 100,
          position: 'relative'
        }}>
          <Sidebar 
            selectedNode={selectedNode} 
            onClose={() => setSelectedNode(null)} 
            surnames={sidebarSurnames}
            onItemClick={onSidebarItemClick}
          />
        </div>
      )}
    </div>
  );
};

const FamilyMap = () => (
  <ReactFlowProvider>
    <FamilyMapContent />
  </ReactFlowProvider>
);

export default FamilyMap;
