import { useEffect, useRef } from 'react';
import { Card, Typography } from '@mui/material';
import { DataSet, Network } from 'vis-network/standalone';

interface GraphDisplayProps {
    edges: number[][] | null; // each edge is in format of [weight, from, to]
    mst: number[][] | null;
    verticeCount: number | null; // if there are x vertices then we know there is vertice 0, 1, 2, ... x-1 
}

function GraphDisplay({ edges, mst, verticeCount }: GraphDisplayProps) {
    const networkRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (networkRef.current && edges && verticeCount && verticeCount < 50) {
            // Create an array of nodes
            const nodes = Array.from({ length: verticeCount }, (_, index) => ({
                id: index,
                label: `Vertex ${index}`,
            }));

            // Convert edges to vis-network format
            const visEdges = edges.map(([weight, from, to]) => ({
                from,
                to,
                id: `${weight} ${from} ${to}`,
            }));

            // Initialize vis DataSet
            const nodesDataSet = new DataSet(nodes);
            const edgesDataSet = new DataSet(visEdges);

            // Provide the data in the vis format
            const data = {
                nodes: nodesDataSet,
                edges: edgesDataSet,
            };

            // Initialize network
            const options = {};
            new Network(networkRef.current, data, options);
        }
    }, [edges, verticeCount]);

    return (
        <Card sx={{ width: '50%', padding: 2 }}>
            <Typography variant="h3" sx={{ paddingBottom: 2 }}>Graph Display</Typography>
            <Typography> {(verticeCount && verticeCount < 50) ? "" : "Upload a graph with less than 50 vertices to display it here"}</Typography>
            <div ref={networkRef} style={{ height: '800px' }} />
        </Card>
    );
};

export default GraphDisplay;
