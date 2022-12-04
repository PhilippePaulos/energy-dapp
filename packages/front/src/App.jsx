import { ThemeProvider } from "@emotion/react";
import { CssBaseline } from '@mui/material/';

import { Grid } from "@mui/material";
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { chain, configureChains, createClient, defaultChains, useAccount, WagmiConfig } from 'wagmi';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { publicProvider } from 'wagmi/providers/public';
import './App.css';
import DisplayCraftsman from "./components/Craftsman/Display/DisplayCraftsman";
import Home from "./components/Home/Home";
import Ico from "./components/Ico/Ico";
import { Navbar } from "./components/Navbar";
import { DisplayProjects } from "./components/Projects/Display";
import { theme } from './components/theme';
import AppProvider from './contexts/AppContext/AppProvider';

// TODO add alchemy provider
const { chains, provider } = configureChains([chain.hardhat, ...defaultChains], [
  publicProvider(),
]);

const client = createClient({
  autoConnect: true,
  connectors: [new MetaMaskConnector({ chains })],
  provider
});

function App() {

  const { isConnected } = useAccount()

  return (
    <WagmiConfig client={client}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppProvider>
          <Navbar />
          <Grid container sx={{ mx: "auto", maxWidth: "1250px" }}>
            <Router>
              <Routes>
                <Route exact path="/" element={<Home />} />
                <Route exact path="/ico" element={isConnected ? <Ico /> : <Navigate replace to="/" />} />
                <Route exact path="/projects-display" element={isConnected ? <DisplayProjects /> : <Navigate replace to="/" />} />
                <Route exact path="/craftsman-display" element={isConnected ? <DisplayCraftsman /> : <Navigate replace to="/" />} />
              </Routes>
            </Router>
          </Grid>
        </AppProvider>
      </ThemeProvider>
    </WagmiConfig>
  )
}

export default App;