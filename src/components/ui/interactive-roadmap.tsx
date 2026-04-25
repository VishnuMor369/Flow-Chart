import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  Handle,
  Position,
  Connection,
  Edge,
  NodeProps,
  Node,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toPng } from 'html-to-image';
import { Download, Info, CheckCircle2, Circle, Plus, Minus, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import dagre from 'dagre';

const nodeWidth = 260;
const nodeHeight = 90;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, ranksep: 100, nodesep: 50 });

  nodes.forEach((node) => {
    if (!node.hidden) {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    }
  });

  edges.forEach((edge) => {
    if (!edge.hidden) {
      dagreGraph.setEdge(edge.source, edge.target);
    }
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    if (node.hidden) return node;
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: newNodes, edges };
};

// --- Custom Node Component ---
const CustomNode = ({ data, id }: NodeProps) => {
  const depthColors = ['border-[#8bc34a]', 'border-[#4caf50]', 'border-[#009688]', 'border-[#00bcd4]'];
  const depthLevel = (data.depth as number) || 0;
  const borderColor = data.completed ? depthColors[depthLevel % depthColors.length] : 'border-white/10';
  
  return (
    <div 
      className={cn(
        "px-4 py-3 shadow-xl rounded-lg border-2 bg-[#151515] transition-all min-w-[260px] relative group",
        borderColor,
        data.isLocked ? "opacity-50 grayscale cursor-not-allowed" : "hover:shadow-[#8bc34a]/20",
        data.isHoveredPath ? "ring-2 ring-white ring-offset-2 ring-offset-[#0f0f0f]" : "",
        data.isDimmed ? "opacity-30" : ""
      )}
    >
      <Handle type="target" position={Position.Top} className="w-4 h-4 bg-[#151515] border-2 border-[#8bc34a]" />
      
      <div className="flex items-center justify-between gap-4 mb-1">
        <div className="flex items-center gap-2">
          {Boolean(data.isLocked) && <Lock size={14} className="text-gray-500" />}
          <div className="font-bold text-white text-sm">
            {data.label as string}
          </div>
        </div>
        {data.completed ? (
          <CheckCircle2 size={20} className="text-[#8bc34a]" />
        ) : (
          <Circle size={20} className="text-gray-500" />
        )}
      </div>
      
      <div className="text-xs text-gray-400 truncate max-w-[200px]">
        {data.description as string}
      </div>

      {Boolean(data.hasChildren) && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (data.onToggleExpand && !data.isLocked) {
              (data.onToggleExpand as Function)(id, !data.expanded);
            }
          }}
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#151515] border border-white/20 rounded-full p-1 text-white hover:bg-white/10 transition-colors z-10"
        >
          {data.expanded ? <Minus size={14} /> : <Plus size={14} />}
        </button>
      )}

      <Handle type="source" position={Position.Bottom} className="w-4 h-4 bg-[#151515] border-2 border-[#8bc34a]" />
    </div>
  );
};

const nodeTypes = { customNode: CustomNode };

interface InteractiveRoadmapProps {
  initialNodes: Node[];
  initialEdges: Edge[];
  roadmapId: string;
}

function InteractiveRoadmapInner({ initialNodes, initialEdges, roadmapId }: InteractiveRoadmapProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView } = useReactFlow();

  // Helper to re-layout gracefully
  const updateLayout = useCallback((currentNodes: Node[], currentEdges: Edge[]) => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(currentNodes, currentEdges);
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
  }, [setNodes, setEdges]);

  // Expand/Collapse Logic
  const handleToggleExpand = useCallback((nodeId: string, expand: boolean) => {
    // Find all descendants
    const getDescendants = (nId: string, currentEdges: Edge[]): string[] => {
      const children = currentEdges.filter(e => e.source === nId).map(e => e.target);
      return children.reduce((acc, child) => [...acc, child, ...getDescendants(child, currentEdges)], children);
    };

    setNodes((nds) => {
      const descendants = getDescendants(nodeId, edges);
      // We only toggle immediate children to visible, or hide ALL descendants
      const immediateChildren = edges.filter(e => e.source === nodeId).map(e => e.target);

      const newNodes = nds.map(n => {
        if (n.id === nodeId) {
          return { ...n, data: { ...n.data, expanded: expand } };
        }
        if (!expand && descendants.includes(n.id)) {
          // Collapse: hide all descendants and mark them collapsed
          return { ...n, hidden: true, data: { ...n.data, expanded: false } };
        }
        if (expand && immediateChildren.includes(n.id)) {
          // Expand: show immediate children
          return { ...n, hidden: false };
        }
        return n;
      });

      setEdges((eds) => {
        const newEdges = eds.map(e => {
          if (!expand && descendants.includes(e.target)) return { ...e, hidden: true };
          if (expand && e.source === nodeId) return { ...e, hidden: false };
          return e;
        });
        
        // Wait a tick then relayout
        setTimeout(() => updateLayout(newNodes, newEdges), 50);
        return newEdges;
      });

      return newNodes;
    });

    // Fit view slightly after layout transition
    setTimeout(() => {
      fitView({ duration: 800, padding: 0.2 });
    }, 150);
    
  }, [edges, setNodes, setEdges, updateLayout, fitView]);

  // Inject the toggle handler into node data
  useEffect(() => {
    setNodes((nds) => nds.map(n => ({
      ...n,
      data: { ...n.data, onToggleExpand: handleToggleExpand }
    })));
  }, [handleToggleExpand]);

  // Load progress and calculate layout on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem(`roadmap_progress_${roadmapId}`);
    const completedNodeIds: string[] = savedProgress ? JSON.parse(savedProgress) : [];

    // Recalculate locked states
    const checkLocked = (nId: string, currentNodes: Node[], currentEdges: Edge[]): boolean => {
      const parents = currentEdges.filter(e => e.target === nId).map(e => e.source);
      if (parents.length === 0) return false; // Root is never locked
      // Node is unlocked if AT LEAST ONE parent is completed
      const anyParentCompleted = parents.some(p => completedNodeIds.includes(p));
      return !anyParentCompleted;
    };

    const newNodes = initialNodes.map(n => {
      const isCompleted = completedNodeIds.includes(n.id);
      const isLocked = checkLocked(n.id, initialNodes, initialEdges);
      return {
        ...n,
        data: { ...n.data, completed: isCompleted, isLocked }
      };
    });

    updateLayout(newNodes, initialEdges);
  }, [roadmapId, initialNodes, initialEdges, updateLayout]);

  // Handle Progressive Unlocking when a node is completed
  const handleNodeCompletion = (nodeId: string, isCompleted: boolean) => {
    setNodes((nds) => {
      const completedNodeIds = nds.filter(n => n.id === nodeId ? isCompleted : n.data.completed).map(n => n.id);
      
      const checkLocked = (nId: string): boolean => {
        const parents = edges.filter(e => e.target === nId).map(e => e.source);
        if (parents.length === 0) return false;
        return !parents.some(p => completedNodeIds.includes(p));
      };

      const updatedNodes = nds.map(n => {
        if (n.id === nodeId) {
          return { ...n, data: { ...n.data, completed: isCompleted } };
        }
        return { ...n, data: { ...n.data, isLocked: checkLocked(n.id) } };
      });
      
      localStorage.setItem(`roadmap_progress_${roadmapId}`, JSON.stringify(completedNodeIds));

      if (selectedNode?.id === nodeId) {
        setSelectedNode(updatedNodes.find(n => n.id === nodeId) || null);
      }

      return updatedNodes;
    });
  };

  // Hover Path Highlighting
  const activePathIds = useMemo(() => {
    if (!hoveredNodeId) return [];
    const getAncestors = (nId: string): string[] => {
      const parents = edges.filter(e => e.target === nId).map(e => e.source);
      return parents.reduce((acc, p) => [...acc, p, ...getAncestors(p)], [nId]);
    };
    return getAncestors(hoveredNodeId);
  }, [hoveredNodeId, edges]);

  // Compute breadcrumbs
  const breadcrumbs = useMemo(() => {
    if (!selectedNode) return [];
    const getAncestors = (nId: string): Node[] => {
      const parents = edges.filter(e => e.target === nId).map(e => e.source);
      if (parents.length === 0) return [nodes.find(n => n.id === nId)!];
      return [...getAncestors(parents[0]), nodes.find(n => n.id === nId)!];
    };
    return getAncestors(selectedNode.id).filter(Boolean);
  }, [selectedNode, nodes, edges]);

  const nodesWithHoverState = useMemo(() => {
    if (!hoveredNodeId) return nodes.map(n => ({ ...n, data: { ...n.data, isHoveredPath: false, isDimmed: false }}));
    return nodes.map(n => ({
      ...n,
      data: {
        ...n.data,
        isHoveredPath: activePathIds.includes(n.id),
        isDimmed: !activePathIds.includes(n.id)
      }
    }));
  }, [nodes, hoveredNodeId, activePathIds]);

  const edgesWithHoverState = useMemo(() => {
    if (!hoveredNodeId) return edges.map(e => ({ ...e, animated: true, style: { stroke: '#8bc34a', strokeWidth: 2, opacity: 1 }}));
    return edges.map(e => {
      const isPathEdge = activePathIds.includes(e.source) && activePathIds.includes(e.target);
      return {
        ...e,
        animated: isPathEdge,
        style: {
          stroke: isPathEdge ? '#fff' : '#8bc34a',
          strokeWidth: isPathEdge ? 3 : 2,
          opacity: isPathEdge ? 1 : 0.2
        }
      };
    });
  }, [edges, hoveredNodeId, activePathIds]);


  const downloadImage = useCallback(() => {
    if (reactFlowWrapper.current === null) return;
    toPng(reactFlowWrapper.current, { 
        filter: (node) => !node?.classList?.contains('react-flow__panel') && !node?.classList?.contains('react-flow__controls'),
        backgroundColor: '#0f0f0f',
    }).then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `roadmap-${roadmapId}.png`;
        link.href = dataUrl;
        link.click();
    });
  }, [roadmapId]);

  const progressPercentage = Math.round((nodes.filter(n => n.data.completed).length / nodes.length) * 100) || 0;

  return (
    <div className="flex w-full h-[80vh] overflow-hidden" ref={reactFlowWrapper}>
      <style>{`
        .react-flow__node {
          transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease;
        }
      `}</style>
      
      {/* React Flow Canvas */}
      <div className="flex-1 h-full relative">
        <ReactFlow
          nodes={nodesWithHoverState}
          edges={edgesWithHoverState}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={(_, node) => setSelectedNode(node)}
          onNodeMouseEnter={(_, node) => setHoveredNodeId(node.id)}
          onNodeMouseLeave={() => setHoveredNodeId(null)}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.1}
          className="bg-[#0f0f0f]"
          colorMode="dark"
        >
          <Controls className="bg-[#151515] border-white/10 fill-white text-white" />
          <MiniMap 
            nodeColor={(n) => n.data?.completed ? '#8bc34a' : '#333'}
            maskColor="rgba(0, 0, 0, 0.7)"
            className="bg-[#151515] border border-white/10"
          />
          <Background color="#333" gap={16} />
          
          {/* Breadcrumb Navigation */}
          {breadcrumbs.length > 0 && (
            <Panel position="top-center" className="bg-[#151515]/90 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 max-w-[80%] overflow-x-auto custom-scrollbar">
              {breadcrumbs.map((b, i) => (
                <React.Fragment key={b.id}>
                  <span className={i === breadcrumbs.length - 1 ? 'text-[#8bc34a]' : 'text-gray-400'}>
                    {b.data.label as string}
                  </span>
                  {i < breadcrumbs.length - 1 && <span className="text-gray-600">/</span>}
                </React.Fragment>
              ))}
            </Panel>
          )}

          <Panel position="top-right" className="flex gap-2">
            <button 
              onClick={downloadImage}
              className="flex items-center gap-2 bg-[#151515] border border-white/10 px-4 py-2 rounded-md text-sm font-semibold hover:bg-white/5 transition-colors"
            >
              <Download size={16} /> Export PNG
            </button>
          </Panel>
          
          <Panel position="top-left" className="bg-[#151515] border border-white/10 p-4 rounded-md min-w-[200px]">
            <div className="text-sm font-medium text-gray-400 mb-2">Progress</div>
            <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-white">{progressPercentage}%</span>
                <span className="text-[#8bc34a] text-sm font-bold">{nodes.filter(n => n.data.completed).length} / {nodes.length}</span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-[#8bc34a] transition-all duration-500" 
                    style={{ width: `${progressPercentage}%` }}
                />
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Side Panel */}
      {selectedNode && (
        <div className="w-80 h-full bg-[#151515] border-l border-white/10 p-6 flex flex-col shrink-0 animate-in slide-in-from-right relative">
          <button 
            onClick={() => setSelectedNode(null)} 
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            ✕
          </button>

          <div className="flex items-center gap-2 text-[#8bc34a] mb-4">
            <Info size={20} />
            <span className="font-bold tracking-wider text-sm">TOPIC DETAILS</span>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            {Boolean(selectedNode.data.isLocked) && <Lock className="text-gray-500" />}
            {selectedNode.data.label as string}
          </h2>

          {Boolean(selectedNode.data.isLocked) && (
            <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs px-3 py-2 rounded-md mb-4">
              Complete the parent topics to unlock this path.
            </div>
          )}
          
          <p className="text-gray-400 leading-relaxed mb-4">
            {selectedNode.data.description as string || 'No description provided for this topic.'}
          </p>

          {Boolean(selectedNode.data.details) && Array.isArray(selectedNode.data.details) && selectedNode.data.details.length > 0 && (
            <div className="flex-1 overflow-y-auto mb-4 pr-2 custom-scrollbar">
              <h3 className="text-xs font-bold text-[#8bc34a] mb-3 uppercase tracking-widest border-b border-white/10 pb-2">Key Topics to Learn</h3>
              <ul className="space-y-2.5">
                {(selectedNode.data.details as string[]).map((detail, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-300 hover:text-white transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#8bc34a] mt-1.5 flex-shrink-0" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="border-t border-white/10 pt-6 mt-auto">
            <button
              disabled={selectedNode.data.isLocked as boolean}
              onClick={() => handleNodeCompletion(selectedNode.id, !selectedNode.data.completed)}
              className={cn(
                "w-full py-3 rounded-md font-bold flex items-center justify-center gap-2 transition-colors",
                selectedNode.data.isLocked ? "bg-gray-800 text-gray-500 cursor-not-allowed" :
                selectedNode.data.completed 
                  ? "bg-white/10 text-white hover:bg-white/20" 
                  : "bg-[#8bc34a] text-black hover:bg-[#8bc34a]/90"
              )}
            >
              {selectedNode.data.completed ? (
                <>Mark as Incomplete</>
              ) : (
                <><CheckCircle2 size={18} /> Mark as Completed</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InteractiveRoadmap(props: InteractiveRoadmapProps) {
  return (
    <ReactFlowProvider>
      <InteractiveRoadmapInner {...props} />
    </ReactFlowProvider>
  );
}
