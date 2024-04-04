import React, { useState, useEffect } from 'react';
import { Box, Button } from '@mui/material';

function PrimsGraphBuilder() {
    const [inputFile, setInputFile] = useState<File | null>(null);
    const [buildLog, setBuildLog] = useState<[string]>([""]);

    // This runs Prim's algorithm whenever inputFile changes
    useEffect(() => {
        if (inputFile) {
            const reader = new FileReader();
            reader.onload = (event: ProgressEvent<FileReader>) => {
                const text = event.target?.result as string;
                // Run Prim's algorithm here
                // You can then set the result to a state or perform other actions
            };
            reader.readAsText(inputFile);
        }
    }, [inputFile]);

    // This updates the local 'inputFile' state when a file is uploaded
    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const file = e.target.files[0];
            setInputFile(file);
        }
    };

    // returns component with the build log and then below that, an import file button and an export log as pdf file button
    return (
        <Box>
            <Button variant="contained" component="label">
                {inputFile ? `File "${inputFile.name}" uploaded` : "Upload File"}
                <input type="file" hidden onChange={handleFileInput} />
            </Button>
        </Box>
    );
}

export default PrimsGraphBuilder;