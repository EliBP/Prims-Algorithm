import React, { useState, useEffect } from 'react';
import { Box, Button, Card, Typography } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { jsPDF } from 'jspdf';

interface PrimsGraphBuilderProps {
    setEdges: React.Dispatch<React.SetStateAction<number[][] | null>>;
    setMST: React.Dispatch<React.SetStateAction<number[][] | null>>;
    setVerticeCount: React.Dispatch<React.SetStateAction<number | null>>;
}

function PrimsGraphBuilder({ setEdges, setMST, setVerticeCount }: PrimsGraphBuilderProps) {
    const [inputFile, setInputFile] = useState<File | null>(null);
    const [buildLog, setBuildLog] = useState<string[] | null>(null);

    // This extracts edges and calls the function to run Prim's algorithm whenever inputFile changes
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
                setVerticeCount(verticeCount);
                setBuildLog([`${verticeCount} vertices found.`]);
                console.log("Number of vertices: " + verticeCount);

                // step 3: build and populate the adjacency matrix
                let adjacencyMatrix: number[][] = [];
                let index = 1;
                for (let row = 0; row < verticeCount; row++) {
                    adjacencyMatrix[row] = inputArray.slice(index, index + verticeCount);
                    index += verticeCount;
                }
                console.log("Adjacency Matrix: ", adjacencyMatrix);

                // step 4: extract edges from the adjency matrix
                let tempEdges: number[][] = [];
                for (let row = 0; row < verticeCount; row++) {
                    for (let column = row + 1; column < verticeCount; column++) {
                        let weight = adjacencyMatrix[row][column]
                        if (weight != 0) {
                            tempEdges = [...tempEdges, [weight, row, column]];
                        }
                    }
                }
                setEdges(tempEdges);
                console.log("All Edges: ", tempEdges);

                // step 5: call function to run Prim's Algorithm
                runPrimsAlgorithm(tempEdges, verticeCount);

            };
            reader.readAsText(inputFile);
        }
    }, [inputFile]);

    // This function runs Prim's Algorithm
    const runPrimsAlgorithm = (edges: number[][], verticeCount: number): void => {
        const inMST = new Array(verticeCount).fill(false); // Tracks if a vertex is in the MST
        const mstEdges: number[][] = []; // Stores the edges in the MST
        let mstWeight = 0;

        // Select an arbitrary vertex to begin, here we choose vertex 0
        inMST[0] = true;

        // Grow MST by adding one edge at each iteration
        for (let edgesInMST = 1; edgesInMST < verticeCount; ++edgesInMST) {
            let minEdge = [Infinity, -1, -1]; // Initialize with [weight, from, to]

            // Find the least weight edge connecting MST with an outside vertex
            edges.forEach(([weight, from, to]) => {
                // Make sure one vertex of the edge is in MST and the other is not
                if (inMST[from] !== inMST[to]) {
                    // Update minEdge if this one is smaller
                    if (weight < minEdge[0]) {
                        minEdge = [weight, from, to];
                    }
                }
            });

            const [weight, from, to] = minEdge;     // Extract useful values from minEdge
            mstEdges.push(minEdge);                 // Add the found minimum edge to MST
            inMST[from] = inMST[to] = true;         // Update the inMST array to include the new vertex
            mstWeight += weight;                    // Update spanning tree weight to include new vertex

            // add to build log
            setBuildLog((prevBuildLog) => [...(prevBuildLog || []), `Adding edge (${from},${to}) with weight ${weight}.`]);
        }

        // Log the MST edges 
        console.log("MST Edges:", mstEdges);
        setMST(mstEdges);
        // Add the total weight to the build log
        setBuildLog((prevBuildLog) => [...(prevBuildLog || []), '', `Total weight of spanning tree: ${mstWeight}`]); // empty string for an empty line
    }

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
        if (buildLog && buildLog.length > 0) {
            // Set variables
            let yPos = 10;
            const lineHeight = 7;
            const pageHeight = pdf.internal.pageSize.height;

            // Loop through each log entry
            buildLog.forEach((logEntry) => {
                if (yPos > pageHeight - 10) {
                    pdf.addPage(); // Add a new page if the current line will be beyond the page height
                    yPos = 10; // Reset Y position for the new page
                }

                // Add text to PDF, starting at 10mm from the left and 'yPos' mm from the top
                pdf.text(logEntry, 10, yPos);
                yPos += lineHeight; // Increase Y position for the next line
            });

            // Save the PDF
            pdf.save('buildLog.pdf');
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
                )) : <Typography variant='body1'>Upload a file to view the MST build log with Prim's Algoirhm.</Typography>}
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

export default PrimsGraphBuilder;