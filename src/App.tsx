import React, { useState, type JSX } from 'react';
import GraphViewer from './components/GraphViewer.tsx';
import './App.css';

export default function App(): JSX.Element {
  const [selectedNode, setSelectedNode] = useState<any | null>(null);

  return (
    <div className="app-root">
      <header className="app-header">
        <h1>cloud-scope — POC GraphViewer</h1>
      </header>

      <main className="app-main">
        <section className="graph-section">
          <GraphViewer onNodeClick={(node) => setSelectedNode(node)} />
        </section>

        <aside className="details-section">
          <h2>Détails du nœud</h2>
          {selectedNode ? (
            <div>
              <p><strong>id:</strong> {selectedNode.id}</p>
              <p><strong>type:</strong> {selectedNode.type}</p>
              <p><strong>region:</strong> {selectedNode.region}</p>
              <p><strong>coût:</strong> {selectedNode.cost}</p>
              <p><strong>CPU:</strong> {selectedNode.metrics?.cpu?.toFixed(1)}%</p>
              <p><strong>Mémoire:</strong> {selectedNode.metrics?.mem?.toFixed(1)}%</p>
            </div>
          ) : (
            <p>Clique sur un nœud pour voir les détails.</p>
          )}
        </aside>
      </main>
    </div>
  );
}
