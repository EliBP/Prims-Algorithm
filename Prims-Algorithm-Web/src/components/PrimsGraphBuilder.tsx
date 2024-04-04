import React, { useState, useEffect } from 'react';
import { Box, Button, Card, Typography } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';

function PrimsGraphBuilder() {
    const [inputFile, setInputFile] = useState<File | null>(null);
    const [buildLog, setBuildLog] = useState<[string]>(["First Test Log"]);

    // This runs Prim's algorithm whenever inputFile changes
    useEffect(() => {
        if (inputFile) {
            const reader = new FileReader();
            reader.onload = (event: ProgressEvent<FileReader>) => {
                const text = event.target?.result as string;
                // Run Prim's algorithm here
            };
            reader.readAsText(inputFile);
        }
    }, [inputFile]);

    // This updates the local 'inputFile' state when a file is uploaded
    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setInputFile(e.target.files[0]);
        }
    };

    // This updates the local 'inputFile' state when a file is uploaded
    const handleFileExport = (e: any) => {
        //todo: implement converting the build log array into PDF
    };

    return (
        <Card sx={{ width: '50%', padding: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant='h3'>Build Log</Typography>
            <Card sx={{ flexGrow: 1, marginTop: 2 }}>
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