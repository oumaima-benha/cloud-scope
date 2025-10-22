export function generateGraph(n = 200, edgeProb = 0.02) {
  type Node = {
    id: string;
    type: string;
    region: string;
    cost: number;
    metrics: { cpu: number; mem: number };
  };
  const types = ['vm', 'container', 'db', 'load-balancer', 'storage'];
  const regions = ['eu-west-1', 'us-east-1', 'ap-south-1'];

  const nodes: Node[] = Array.from({ length: n }, (_, i) => ({
    id: `node-${i}`,
    type: types[Math.floor(Math.random() * types.length)],
    region: regions[Math.floor(Math.random() * regions.length)],
    cost: Math.round(Math.random() * 1000),
    metrics: { cpu: Math.random() * 100, mem: Math.random() * 100 },
  }));

  const links: { source: string; target: string; protocol?: string }[] = [];
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