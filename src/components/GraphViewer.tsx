import React, { useEffect, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { generateGraphByChunk, generateGraphSync } from '../utils/generateGraph';
import type { Node as NodeType, Link as LinkType } from '../utils/generateGraph';

type GraphData = { nodes: NodeType[]; links: LinkType[] };

export default function GraphViewer({
  onNodeClick,
}: {
  onNodeClick?: (node: NodeType) => void;
}) {
  const fgRef = useRef<any>(null);
  const [graph, setGraph] = useState<GraphData>({ nodes: [], links: [] });
  const graphRef = useRef(graph);
  graphRef.current = graph;

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ loadedNodes: 0, totalNodes: 0, startedAt: 0, durationMs: 0 });

  useEffect(() => {
    // un petit graphe initial
    setGraph(generateGraphSync(200, 0.02));
  }, []);

  useEffect(() => {
    if (!fgRef.current) return;
    if (typeof fgRef.current.zoomToFit === 'function') {
      fgRef.current.zoomToFit(400, 50);
    }
  }, [graph]);

  async function loadLarge(size: number) {
    setLoading(true);
    setProgress({ loadedNodes: 0, totalNodes: size, startedAt: performance.now(), durationMs: 0 });

    let totalSeen = 0;
    const accumulated = { nodes: [] as NodeType[], links: [] as LinkType[] };

    await generateGraphByChunk(
      size,
      size >= 2000 ? 0.0008 : 0.001, // Réduire la densité des liens pour les très grands graphes
      250, // chunk size
      (chunk) => {
        // Ajouter le chunk aux données accumulées
        accumulated.nodes.push(...chunk.nodes);
        accumulated.links.push(...chunk.links);

        totalSeen += chunk.nodes.length;
        setProgress((p) => ({ ...p, loadedNodes: totalSeen }));

        // Mettre à jour l’état par lots (évite trop de re-rendus)
        // Soumettre une copie "snapshot" pour forcer la mise à jour de ForceGraph
        setGraph({ nodes: [...graphRef.current.nodes, ...chunk.nodes], links: [...graphRef.current.links, ...chunk.links] });
      }
    );

    const duration = performance.now() - progress.startedAt;
    setProgress((p) => ({ ...p, durationMs: duration, loadedNodes: size }));
    setLoading(false);
    console.log(`Graph loaded: ${size} nodes in ${Math.round(duration)} ms`);
  }

  return (
    <div style={{ width: '100%', height: '700px', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={() => setGraph(generateGraphSync(200, 0.02))}>Load 200</button>
        <button onClick={() => loadLarge(1000)} disabled={loading}>Load 1000</button>
        <button onClick={() => loadLarge(5000)} disabled={loading}>Load 5000</button>
        {loading && (
          <div style={{ marginLeft: 12 }}>
            Loading {progress.loadedNodes}/{progress.totalNodes} nodes...
          </div>
        )}
      </div>

      {loading && (
        <div style={{
          position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none'
        }}>
          <div style={{ background: 'rgba(255,255,255,0.9)', padding: 12, borderRadius: 8 }}>
            Chargement… {progress.loadedNodes}/{progress.totalNodes}
          </div>
        </div>
      )}

      <ForceGraph2D
        ref={fgRef}
        graphData={graph}
        nodeLabel={(n: any) => `${n.id} — ${n.type}`}
        nodeAutoColorBy="type"
        nodeCanvasObjectMode={() => 'replace'}
        nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const label = node.id;
          const fontSize = 12 / globalScale;
          const x = node.x ?? 0;
          const y = node.y ?? 0;
          ctx.beginPath();
          ctx.arc(x, y, Math.max(1, 4 / globalScale), 0, 2 * Math.PI, false);
          ctx.fillStyle = node.color || 'steelblue';
          ctx.fill();

          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillStyle = 'rgba(0,0,0,0.7)';
          if (globalScale > 0.6) {
            // Afficher les étiquettes seulement si le zoom est suffisant
            ctx.fillText(label, x, y + 6 / globalScale);
          }
        }}
        linkDirectionalParticles={0}
        onNodeClick={(node: any) => {
          if (onNodeClick) onNodeClick(node);
          const nx = node.x ?? 0;
          const ny = node.y ?? 0;
          const distance = 40;
          const hyp = Math.hypot(nx, ny) || 1;
          const distRatio = 1 + distance / hyp;
          fgRef.current?.centerAt(nx * distRatio, ny * distRatio, 300);
          fgRef.current?.zoom(1.5, 300);
        }}
      />
    </div>
  );
}
