import { AppBar, Box, Typography } from '@mui/material'
// import PrimsGraphBuilder from './components/PrimsGraphBuilder'
// import GraphDisplay from './components/GraphDisplay'
import CssBaseline from '@mui/material/CssBaseline';
// import { useState } from 'react';
import FordFulkerson from './components/Ford-Fulkerson';

function App() {
  // 

  return (
    <>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <AppBar position="static" sx={{ height: 50, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant='h5'>Eli's Ford-Fulkerson Flow Calculator</Typography>
        </AppBar>
        <Box sx={{ display: 'flex', flexGrow: 1, backgroundColor: 'lightblue', padding: 2, gap: 2, overflowY: 'hidden' }}>
          <FordFulkerson/>
          {/* <GraphDisplay edges={edges} verticeCount={verticeCount} /> */}
        </Box>
      </Box >
    </>
  )
}

export default App
