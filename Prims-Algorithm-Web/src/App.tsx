import { AppBar, Box, Typography } from '@mui/material'
import PrimsGraphBuilder from './components/PrimsGraphBuilder'
import GraphDisplay from './components/GraphDisplay'
import CssBaseline from '@mui/material/CssBaseline';
import { useState } from 'react';

function App() {
  const [edges, setEdges] = useState<number[][] | null>(null);
  const [mst, setMST] = useState<number[][] | null>(null);
  const [verticeCount, setVerticeCount] = useState<number | null>(null);

  return (
    <>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <AppBar position="static" sx={{ height: 50, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant='h5'>Eli's Minimum Spanning Tree Builder</Typography>
        </AppBar>
        <Box sx={{ display: 'flex', flexGrow: 1, backgroundColor: 'lightblue', padding: 2, gap: 2, overflowY: 'hidden' }}>
          <PrimsGraphBuilder setEdges={setEdges} setMST={setMST} setVerticeCount={setVerticeCount} />
          <GraphDisplay edges={edges} mst={mst} verticeCount={verticeCount} />
        </Box>
      </Box >
    </>
  )
}

export default App
