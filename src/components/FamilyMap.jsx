import React, { useEffect, useMemo, useCallback, useState } from 'react';
import ReactFlow, { 
  useNodesState, 
  useEdgesState, 
  Background, 
  Controls, 
  MarkerType,
  useReactFlow,
  ReactFlowProvider
} from 'reactflow';
import * as d3 from 'd3-force';
import { supabase } from '../lib/supabase';
import { RootNode, GotraNode, SurnameNode } from './nodes/CustomNodes';
import Sidebar from './Sidebar';
import SearchBar from './SearchBar';

const ROOT_ID = 'root-bhavana-rishi';

const nodeTypes = {
  root: RootNode,
  gotra: GotraNode,
  surname: SurnameNode,
};

const FamilyMapContent = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [sidebarSurnames, setSidebarSurnames] = useState([]);
  const { setCenter, zoomTo } = useReactFlow();

  // Initialize nodes and edges
  useEffect(() => {
    const fetchInitialData = async () => {
      const rootNode = {
        id: ROOT_ID,
        type: 'root',
        data: { label: 'Bhavana Rishi' },
        position: { x: 0, y: -400 },
      };

      const { data: gotras, error } = await supabase.from('gotras').select('*');
      if (error) return;

      const gotraNodes = gotras.map((g, idx) => ({
        id: `gotra-${g.id}`,
        type: 'gotra',
        data: { label: g.name, gotraId: g.id },
        position: { x: (idx - gotras.length/2) * 200, y: 0 },
      }));

      const initialEdges = gotras.map((g) => ({
        id: `e-${ROOT_ID}-gotra-${g.id}`,
        source: ROOT_ID,
        target: `gotra-${g.id}`,
        animated: true,
      }));

      setNodes([rootNode, ...gotraNodes]);
      setEdges(initialEdges);
    };

    fetchInitialData();
  }, []);

  // Physics simulation (Hierarchical Tree)
  const simulation = useMemo(() => {
    return d3.forceSimulation()
      .force('link', d3.forceLink().id(d => d.id).distance(200).strength(1))
      .force('charge', d3.forceManyBody().strength(-1000))
      .force('x', d3.forceX().strength(0.1))
      .force('y', d3.forceY(d => {
        if (d.id === ROOT_ID) return -400;
        if (d.id.startsWith('gotra-')) return 0;
        return 400;
      }).strength(0.5))
      .force('collide', d3.forceCollide().radius(120));
  }, []);

  useEffect(() => {
    if (nodes.length === 0) return;

    const d3Nodes = nodes.map(n => ({ ...n }));
    const d3Edges = edges.map(e => ({ source: e.source, target: e.target }));

    simulation.nodes(d3Nodes);
    simulation.force('link').links(d3Edges);

    simulation.on('tick', () => {
      setNodes((nds) => 
        nds.map((node) => {
          const d3Node = d3Nodes.find(d => d.id === node.id);
          if (d3Node) {
            return { ...node, position: { x: d3Node.x, y: d3Node.y } };
          }
          return node;
        })
      );
    });

    simulation.alpha(0.3).restart();
    return () => simulation.on('tick', null);
  }, [nodes.length, edges.length]);

  const expandGotra = useCallback(async (gotraId, gotraNodeId) => {
    const { data: surnames, error } = await supabase
      .from('surnames')
      .select('*')
      .eq('gotra_id', gotraId);

    if (error) return [];
    
    // Filter out already existing nodes/edges
    setNodes((nds) => {
      const existingIds = new Set(nds.map(n => n.id));
      const newNodes = (surnames || [])
        .filter(s => !existingIds.has(`surname-${s.id}`))
        .map((s) => ({
          id: `surname-${s.id}`,
          type: 'surname',
          data: { label: s.name },
          position: { x: nds.find(n => n.id === gotraNodeId)?.position.x || 0, y: 400 },
        }));
      return [...nds, ...newNodes];
    });

    setEdges((eds) => {
      const existingIds = new Set(eds.map(e => e.id));
      const newEdges = (surnames || [])
        .filter(s => !existingIds.has(`e-${gotraNodeId}-surname-${s.id}`))
        .map((s) => ({
          id: `e-${gotraNodeId}-surname-${s.id}`,
          source: gotraNodeId,
          target: `surname-${s.id}`,
        }));
      return [...eds, ...newEdges];
    });

    return surnames || [];
  }, [setNodes, setEdges]);

  const onSearchResultSelect = useCallback(async (item) => {
    if (item.type === 'gotra') {
      const nodeId = `gotra-${item.id}`;
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        setCenter(node.position.x, node.position.y, { zoom: 1.2, duration: 1000 });
        setSelectedNode(node);
        const surnames = await expandGotra(item.id, nodeId);
        setSidebarSurnames(surnames);
      }
    } else if (item.type === 'surname') {
      const gotraId = item.gotra_id;
      const gotraNodeId = `gotra-${gotraId}`;
      
      // Ensure gotra node is clicked/expanded
      const surnames = await expandGotra(gotraId, gotraNodeId);
      setSidebarSurnames(surnames);
      
      // Wait a bit for nodes to be added to state and simulation to place them
      setTimeout(() => {
        const surnameId = `surname-${item.id}`;
        // We might not have the surname node in the current 'nodes' state yet because of async setNodes
        // but it will be there on next render.
        setNodes(nds => {
          const sNode = nds.find(n => n.id === surnameId);
          if (sNode) {
            setCenter(sNode.position.x, sNode.position.y, { zoom: 1.5, duration: 1000 });
            setSelectedNode(sNode);
          }
          return nds;
        });
      }, 500);
    }
  }, [nodes, setCenter, expandGotra]);

  const onNodeClick = useCallback(async (event, node) => {
    setSelectedNode(node);
    if (node.id.startsWith('gotra-')) {
      const surnames = await expandGotra(node.data.gotraId, node.id);
      setSidebarSurnames(surnames);
    } else if (node.id.startsWith('surname-')) {
        // Find parent gotra to show in sidebar context if needed
        setSidebarSurnames([]);
    } else {
      setSidebarSurnames([]);
    }
  }, [expandGotra]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <SearchBar onSelect={onSearchResultSelect} />
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={() => setSelectedNode(null)}
        fitView
        minZoom={0.05}
        maxZoom={4}
      >
        <Background color="rgba(255,255,255,0.05)" gap={20} />
        <Controls />
      </ReactFlow>

      <Sidebar 
        selectedNode={selectedNode} 
        onClose={() => setSelectedNode(null)} 
        surnames={sidebarSurnames}
      />
    </div>
  );
};

// Wrap with ReactFlowProvider to use useReactFlow hooks
const FamilyMap = () => (
  <ReactFlowProvider>
    <FamilyMapContent />
  </ReactFlowProvider>
);

export default FamilyMap;
