import { AppBar, Box, Typography } from '@mui/material'
import PrimsGraphBuilder from './components/PrimsGraphBuilder'
import GraphDisplay from './components/GraphDisplay'
import CssBaseline from '@mui/material/CssBaseline';

function App() {
  return (
    <>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <AppBar position="static" sx={{ height: 50, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant='h5'>Prims Graph Builder</Typography>
        </AppBar>
        <Box sx={{ display: 'flex', flexGrow: 1, backgroundColor: 'lightblue', padding: 2, gap: 2 }}>
          <PrimsGraphBuilder />
          <GraphDisplay />
        </Box>
      </Box >
    </>
  )
}

export default App
