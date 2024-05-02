/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Box, Button, Card, Typography } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { jsPDF } from 'jspdf';

interface Edge {
    source: number;
    sink: number;
    flow: number;
    capacity: number;
    residualCapacity: number;
}

interface RedirectResult {
    bottleneck: number;
    pathFromSource: Edge[];
    pathToSink: Edge[];
    linkingPath: Edge[];
}

function FordFulkerson() {

    // Define variables
    const [inputFile, setInputFile] = useState<File | null>(null);
    const [buildLog, setBuildLog] = useState<string[] | null>(null);

    // This extracts edges and calls the function to run Ford-Fulkerson algo whenever inputFile changes
    useEffect(() => {
        if (inputFile) {
            const reader = new FileReader();
            reader.onload = (event: ProgressEvent<FileReader>) => {

                // step 1: turn the input text into an array
                const text = event.target?.result as string;
                const inputArray: number[] = text.split(',').map((item) => parseInt(item, 10));
                console.log("Input as an array: ", inputArray);

                // step 2: extract number of vertices
                const verticeCount = inputArray[0];
                console.log("Number of vertices: " + verticeCount);

                // step 3: build and populate the adjacency matrix
                const adjacencyMatrix: number[][] = [];
                let index = 1;
                for (let row = 0; row < verticeCount; row++) {
                    adjacencyMatrix[row] = inputArray.slice(index, index + verticeCount);
                    index += verticeCount;
                }
                console.log("Adjacency Matrix: ", adjacencyMatrix);

                // step 4: extract edges from the adjency matrix
                let edges: Edge[] = [];
                for (let row = 0; row < verticeCount; row++) {
                    for (let column = 0; column < verticeCount; column++) {
                        const capacity = adjacencyMatrix[row][column]
                        if (capacity != 0) {
                            // rows are the tails of the arrows, and columns are the head
                            edges = [...edges, { source: row, sink: column, flow: 0, capacity: capacity, residualCapacity: capacity }];
                        }
                    }
                }
                console.log("All Edges: ", edges);

                // step 5: call function to run Ford-Fulkerson algo
                runFordFulkerson(edges, verticeCount);
            };
            reader.readAsText(inputFile);
        }
    }, [inputFile]);

    // This function runs Ford-Fulkerson's Algorithm
    const runFordFulkerson = (edges: Edge[], verticeCount: number): void => {

        // Set the flow for the entire network equal to zero.
        let totalFlow = 0;

        // Create the residual graph and maxFlowReached
        const residualGraph = edges;
        let maxFlowReached = false;

        // Loop until no more paths can be found or augmented
        while (!maxFlowReached) {
            let justIncreasedFlow = false;

            // Try to find augmenting paths and update flow until none can be found
            const path = findAugmentingPathToVertex(residualGraph, 0, verticeCount - 1, verticeCount)
            if (path != null) {
                const bottleneck = calculateBottleneck(path);
                updateFlow(residualGraph, path, bottleneck, 1);
                totalFlow += bottleneck;
                setBuildLog(prevBuildLog => [...(prevBuildLog || []), `Augmenting Path found: ${pathToString(path)} with flow: ${bottleneck}`]);
                justIncreasedFlow = true;
            }

            // Attempt to redirect flow if no new augmenting paths are found
            if (!justIncreasedFlow) {
                const redirectResult = redirectFlow(residualGraph, verticeCount);
                if (redirectResult != null) {
                    setBuildLog(prevBuildLog => [...(prevBuildLog || []), `Rescue attempt:`]);
                    setBuildLog(prevBuildLog => [...(prevBuildLog || []), `Found path from source: ${pathToString(redirectResult.pathFromSource)} with capacity ${redirectResult.bottleneck}`]);
                    setBuildLog(prevBuildLog => [...(prevBuildLog || []), `Found path to sink: ${pathToString(redirectResult.pathToSink)} with capacity ${redirectResult.bottleneck}`]);
                    setBuildLog(prevBuildLog => [...(prevBuildLog || []), `Increasing total flow by ${redirectResult.bottleneck}.`]);
                    totalFlow += redirectResult.bottleneck;
                    justIncreasedFlow = true;
                }
            }

            // If we were unable to increase the flow then we've reached the maximum flow
            if (!justIncreasedFlow) maxFlowReached = true;
        }

        // Log the total flow
        setBuildLog((prevBuildLog) => [...(prevBuildLog || []), `Total flow: ${totalFlow}`]);
    }

    // Finds opportunities to redirect flow if no augmenting paths are found
    const redirectFlow = (residualGraph: Edge[], verticeCount: number): RedirectResult | null => {
        console.log('Rescue attempt')

        // Scan for vertices that might be potential redirection points
        for (let v = 0; v < verticeCount; v++) {
            for (let u = 0; u < verticeCount; u++) {
                if (v !== u) {
                    // Find path from source to u
                    const pathFromSource = findAugmentingPathToVertex(residualGraph, 0, u, verticeCount);
                    // Find path from v to sink
                    const pathToSink = findAugmentingPathToVertex(residualGraph, v, verticeCount - 1, verticeCount);
                    // Find linking path with positive flow from v to u
                    const linkingPath = findPositiveFlowPath(residualGraph, v, u);

                    if (pathFromSource && pathToSink && linkingPath) {
                        console.log(`path from source: ${pathToString(pathFromSource)}`);
                        console.log(`path to sink: ${pathToString(pathToSink)}`);
                        console.log(`linking path: ${pathToString(linkingPath)}`);


                        // Calculate the bottleneck capacity for the redirection
                        const bottleneck = Math.min(
                            calculateBottleneck(pathFromSource),
                            calculateBottleneck(pathToSink),
                            calculateUsedCapacity(linkingPath)
                        );

                        // Before adjusting flow, ensure no shared edges and a positive value of 'bottleneck'
                        if (!sharesEdges(pathFromSource, pathToSink, linkingPath) && bottleneck > 0) {
                            updateFlow(residualGraph, pathFromSource, bottleneck, 1);  // Increase flow (+1 direction)
                            updateFlow(residualGraph, pathToSink, bottleneck, 1);     // Increase flow (+1 direction)
                            updateFlow(residualGraph, linkingPath, bottleneck, -1);   // Decrease flow (-1 direction)
                            return { bottleneck, pathFromSource, pathToSink, linkingPath };
                        }
                    }
                }
            }
        }
        return null;
    };

    // Create a string in format "[ 0 3 2 5 ]" from a path (which is just an array of edges)
    const pathToString = (path: Edge[] | null): string => {
        if (path == null || path.length === 0) {
            return "[]";
        }
        // Start with the source of the first edge
        const vertices = [path[0].source];
        // Append the sink of each edge to the list
        path.forEach(edge => vertices.push(edge.sink));
        // Convert the list of vertices to a string
        return `[ ${vertices.join(' ')} ]`;
    }

    // Find an augmenting path for a given start and end vertex 
    const findAugmentingPathToVertex = (residualGraph: Edge[], start: number, end: number, verticeCount: number): Edge[] | null => {
        const parent = Array(verticeCount).fill(-1);
        const visited = Array(verticeCount).fill(false);
        const queue = [start];
        visited[start] = true;

        while (queue.length > 0) {
            const current = queue.shift();

            for (const edge of residualGraph) {
                if (edge.source === current && !visited[edge.sink] && edge.residualCapacity > 0) {
                    parent[edge.sink] = current; // Store parent to reconstruct path later
                    visited[edge.sink] = true;
                    queue.push(edge.sink);

                    if (edge.sink === end) { // Sink reached
                        return buildPathFromParent(parent, start, end, residualGraph);
                    }
                }
            }
        }

        return null; // No path found
    };

    // Helper function to build a path from parent with given start and end vertices
    const buildPathFromParent = (parent: number[], start: number, end: number, residualGraph: Edge[]): Edge[] => {
        const path: Edge[] = [];
        let current = end;

        // Reconstruct path by walking from end to start using the parent array
        while (current !== start) {
            const prev = parent[current];
            const edge = residualGraph.find(e => e.source === prev && e.sink === current);
            if (edge) {
                path.push(edge);
            }
            current = prev;
        }

        return path.reverse(); // Reverse to get path from start to end
    };

    // Find the bottleneck by finding minimum residual capacity along a path
    const calculateBottleneck = (path: Edge[]): number => {
        return Math.min(...path.map(edge => edge.residualCapacity));
    };

    // Updates the flow along the path with flexibility to either increase or decrease flow
    const updateFlow = (residualGraph: Edge[], path: Edge[], bottleneck: number, flowDirection: number): void => {
        path.forEach(edge => {
            // Adjust flow and residual capacity for forward direction
            edge.flow += bottleneck * flowDirection;
            edge.residualCapacity -= bottleneck * flowDirection;

            // Find or create a reverse edge to adjust or establish its residual capacity
            const reverseEdge = residualGraph.find(e => e.source === edge.sink && e.sink === edge.source);
            if (reverseEdge) {
                reverseEdge.residualCapacity += bottleneck * flowDirection;  // Adjust reverse capacity accordingly
            } else {
                // // Create a reverse edge if it does not exist with appropriate initial values
                // residualGraph.push({
                //     source: edge.sink,
                //     sink: edge.source,
                //     flow: -bottleneck * flowDirection,  // Reflect the reverse flow
                //     capacity: 0,  // Reverse edges typically don't have original capacity
                //     residualCapacity: bottleneck * (flowDirection > 0 ? 1 : -1)  // Set the initial residual capacity based on flow direction
                // });
            }
        });
    };

    // Calculate the minimum flow (used capacity) among all edges in a given path
    const calculateUsedCapacity = (path: Edge[]): number => {
        if (path.length === 0) return 0; // If there is no path, there's no flow to calculate
        let minFlow = Infinity; // Start with the highest possible value
        // Loop through each edge in the path
        for (const edge of path) {
            if (edge.flow < minFlow) {
                minFlow = edge.flow;
            }
        }
        return minFlow;
    };

    // Finds a path with existing positive flow between two vertices
    const findPositiveFlowPath = (residualGraph: Edge[], from: number, to: number): Edge[] | null => {
        const parent = Array(residualGraph.length).fill(-1);  // Store the predecessor of each vertex to reconstruct the path
        const visited = Array(residualGraph.length).fill(false);  // Track visited vertices to avoid revisiting
        const queue = [from];  // BFS queue
        visited[from] = true;  // Mark the start vertex as visited

        while (queue.length > 0) {
            const current = queue.shift();  // Dequeue the front of the queue

            for (const edge of residualGraph) {
                // Check if the current edge originates from the current vertex and has positive flow
                if (edge.source === current && !visited[edge.sink] && edge.flow > 0) {
                    parent[edge.sink] = current;  // Record the path
                    visited[edge.sink] = true;  // Mark this vertex as visited
                    queue.push(edge.sink);  // Enqueue this vertex for further exploration

                    if (edge.sink === to) {  // If we've reached the target vertex
                        return buildPathFromParent(parent, from, to, residualGraph);  // Build and return the path
                    }
                }
            }
        }

        return null;  // Return null if no path with positive flow is found
    };

    // Helper function that returns true if any of the paths share an edge
    const sharesEdges = (path1: Edge[], path2: Edge[], path3: Edge[]): boolean => {
        const edgeSet = new Set<string>();
        const addEdgesToSet = (path: Edge[]) => {
            path.forEach(edge => {
                const edgeKey = `${edge.source}-${edge.sink}`; // Create a unique identifier for each edge
                edgeSet.add(edgeKey);
            });
        };

        // Add all edges from all paths to the set
        addEdgesToSet(path1);
        addEdgesToSet(path2);
        addEdgesToSet(path3);

        const totalEdges = path1.length + path2.length + path3.length;
        return edgeSet.size !== totalEdges; // If the size of the set is less than the total number of edges, some edges are shared
    };

    // This updates the local 'inputFile' state when a file is uploaded
    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setInputFile(e.target.files[0]);
        }
    };

    const handleFileExport = () => {
        // Create a new instance of jsPDF
        const pdf = new jsPDF();

        // Check if buildLog is not null or empty
        if (buildLog && buildLog.length > 0 && inputFile) {
            // Set variables
            let yPos = 10;
            const lineHeight = 7;
            const pageHeight = pdf.internal.pageSize.height;

            // Loop through each log entry
            buildLog.forEach((logEntry) => {
                pdf.setFont("helvetica", "normal");
                if (yPos > pageHeight - 10) {
                    pdf.addPage(); // Add a new page if the current line will be beyond the page height
                    yPos = 10; // Reset Y position for the new page
                }

                // Bold 'Rescue attempt' log entries
                if (logEntry == 'Rescue attempt:') {
                    pdf.setFont("helvetica", "bold");
                }

                // Add text to PDF, starting at 10mm from the left and 'yPos' mm from the top
                pdf.text(logEntry, 10, yPos);
                yPos += lineHeight; // Increase Y position for the next line
            });

            // Save the PDF
            pdf.save(`${inputFile.name}-buildLog.pdf`);
        } else {
            alert('Build log is empty.');
        }
    };

    return (
        <Card sx={{ width: '50%', padding: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant='h3'>Build Log</Typography>
            <Card sx={{ flexGrow: 1, marginTop: 2, overflowY: 'auto' }}>
                {buildLog ? buildLog.map((message) => (
                    <Typography variant='body1' key={message}> {message} </Typography>
                )) : <Typography variant='body1'>Upload a file to view the build log with Ford-Fulkerson's algorithm.</Typography>}
            </Card>
            <Box sx={{ alignSelf: 'center', paddingTop: 2 }}>
                <label>
                    <Button variant="contained" component="span" sx={{ marginRight: 2 }} startIcon={<FileUploadIcon />}>
                        {inputFile ? `File "${inputFile.name}" uploaded` : "Upload File"}
                    </Button>
                    <input type="file" hidden onChange={handleFileInput} />
                </label>
                <Button variant="contained" onClick={handleFileExport} startIcon={<FileDownloadIcon />}>
                    Export log as PDF
                </Button>
            </Box>
        </Card>
    );
}

export default FordFulkerson;