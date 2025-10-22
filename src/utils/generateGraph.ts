export type Node = {
  id: string;
  type: string;
  region: string;
  cost: number;
  metrics: { cpu: number; mem: number };
};

export type Link = {
  source: string;
  target: string;
  protocol?: string;
};

type ChunkCallback = (chunk: { nodes: Node[]; links: Link[]; done: boolean }) => void;


export function generateGraphSync(n = 100, edgeProb = 0.02) {
  const types = ['vm', 'container', 'db', 'load-balancer', 'storage'];
  const regions = ['eu-west-1', 'us-east-1', 'ap-south-1'];

  const nodes: Node[] = Array.from({ length: n }, (_, i) => ({
    id: `node-${i}`,
    type: types[Math.floor(Math.random() * types.length)],
    region: regions[Math.floor(Math.random() * regions.length)],
    cost: Math.round(Math.random() * 1000),
    metrics: { cpu: Math.random() * 100, mem: Math.random() * 100 },
  }));

  const links: Link[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (Math.random() < edgeProb) {
        links.push({
          source: nodes[i].id,
          target: nodes[j].id,
          protocol: ['HTTP', 'HTTPS', 'DB', 'Internal'][Math.floor(Math.random() * 4)],
        });
      }
    }
  }

  return { nodes, links };
}



/**
 * Cette fonction nous permet de optimiser de performance en générant le graphe par morceaux.
 * Génère le graphe en plusieurs chunks et appelle `onChunk` à chaque paquet.
 * - n: nombre de noeuds
 * - edgeProb: probabilité d'arête (entre 0 et 1)
 * - chunkSize: nombre de nœuds générés par itération
 */
export async function generateGraphByChunk(
  n = 1000,
  edgeProb = 0.001,
  chunkSize = 200,
  onChunk?: ChunkCallback
): Promise<{ nodes: Node[]; links: Link[] }> {
  const types = ['vm', 'container', 'db', 'load-balancer', 'storage'];
  const regions = ['eu-west-1', 'us-east-1', 'ap-south-1'];

  const nodes: Node[] = [];
  const links: Link[] = [];

  for (let start = 0; start < n; start += chunkSize) {
    const end = Math.min(n, start + chunkSize);
    // créer les noeuds dans le chunk actuel
    for (let i = start; i < end; i++) {
      nodes.push({
        id: `node-${i}`,
        type: types[Math.floor(Math.random() * types.length)],
        region: regions[Math.floor(Math.random() * regions.length)],
        cost: Math.round(Math.random() * 1000),
        metrics: { cpu: Math.random() * 100, mem: Math.random() * 100 },
      });
    }

    // crréer les relations entre les noeuds du chunk actuel
    for (let i = start; i < end; i++) {
      // se connecte à un maximum de 8 noeuuds suivants — permet de garder le graphe peu dense
      const maxJ = Math.min(n, i + 8);
      for (let j = i + 1; j < maxJ; j++) { //maxJ à remplacer par n  pour un graphe plus dense!
        if (Math.random() < edgeProb) {
          links.push({
            source: `node-${i}`,
            target: `node-${j}`,
            protocol: ['HTTP', 'HTTPS', 'DB', 'Internal'][Math.floor(Math.random() * 4)],
          });
        }
      }
    }

    // Transmet l’avancement (les nœuds et liens du chunk courant) au code appelant
    const done = end >= n;
    if (onChunk) {
      onChunk({ nodes: nodes.slice(-chunkSize), links: links.slice(-chunkSize * 2), done });
    }

    // laisse le temps à la boucle d’événements pour maintenir l’interface réactive
    // une courte pause (timeout) rend la main au navigateur
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, 0)); //cède le contrôle au navigateur entre chunks.
  }

  return { nodes, links };
}