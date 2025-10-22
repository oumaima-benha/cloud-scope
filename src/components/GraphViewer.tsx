import { useEffect, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { generateGraph } from '../utils/generateGraph';

type NodeType = {
  id: string;
  type: string;
  region: string;
  cost: number;
  metrics?: { cpu: number; mem: number };
  // ajoutées pour accéder aux positions, couleur
  x?: number;
  y?: number;
  color?: string;
};

type LinkType = {
  source: string;
  target: string;
  protocol?: string;
};

type GraphData = {
  nodes: NodeType[];
  links: LinkType[];
};

export default function GraphViewer({
  onNodeClick,
}: {
  onNodeClick?: (node: NodeType) => void;
}) {

  const fgRef = useRef<any>(null); // pour référencer le composant ForceGraph2D
  const [graph, setGraph] = useState<GraphData>(() => generateGraph(200, 0.02));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    //animer la vue initiale pour qu'elle s'ajusteau graphe 
    if (!fgRef.current) return;
    //protéger contre des méthodes absentes dans certaines versions
    if (typeof fgRef.current.zoomToFit === 'function') {
      fgRef.current.zoomToFit(400, 50);
    }
  }, [graph]);

  return (
    <div style={{ width: '100%', height: '700px', borderRadius: 8, overflow: 'hidden' }}>
      {loading && <div className="overlay">Loading...</div>}
      <ForceGraph2D
        ref={fgRef}
        graphData={graph}
        nodeLabel={(n: NodeType) => `${n.id} — ${n.type}`}
        nodeAutoColorBy="type"
        nodeCanvasObjectMode={() => 'replace'}
        nodeCanvasObject={(node: NodeType, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const label = node.id;
          const fontSize = 12 / globalScale;
          const x = node.x ?? 0;
          const y = node.y ?? 0;
          ctx.beginPath();
          ctx.arc(x, y, Math.max(2, 6 / globalScale), 0, 2 * Math.PI, false);
          ctx.fillStyle = node.color || 'steelblue';
          ctx.fill();

          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillStyle = 'rgba(0,0,0,0.7)';
          ctx.fillText(label, x, y + 6 / globalScale);
        }}
        linkDirectionalParticles={1}
        linkDirectionalParticleSpeed={() => 0.004}
        onNodeClick={(node: any) => {
          if (onNodeClick) onNodeClick(node);
          // mettre le focus au clic
          const distance = 40;
          const nx = node.x ?? 0;
          const ny = node.y ?? 0;
          const hyp = Math.hypot(nx, ny) || 1;
          const distRatio = 1 + distance / hyp;
          if (fgRef.current?.centerAt) {
            fgRef.current.centerAt(nx * distRatio, ny * distRatio, 300);
          }
          if (fgRef.current?.zoom) {
            fgRef.current.zoom(1.5, 300);
          }
        }}
        onNodeHover={() => {
          // rien à faire pour l'instant
        }}
      />
    </div>
  );
}
