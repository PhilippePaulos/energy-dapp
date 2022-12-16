import { ThemeProvider } from "@emotion/react";
import { CssBaseline } from '@mui/material/';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { publicProvider } from 'wagmi/providers/public';
import './App.css';
import EnergyDao from "./components/EnergyDao";
import { Navbar } from "./components/Navbar";
import { theme } from './components/theme';
import { chain, configureChains, createClient, defaultChains, WagmiConfig } from "wagmi";
import { DaoProvider } from "./contexts/DaoContext";

const { chains, provider } = configureChains([chain.hardhat, ...defaultChains], [
  publicProvider(),
]);

const client = createClient({
  autoConnect: true,
  connectors: [new MetaMaskConnector({ chains })],
  provider
});

function App() {

  return (
    <WagmiConfig client={client}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
          <DaoProvider>
            <Navbar />
            <EnergyDao />
          </DaoProvider>
      </ThemeProvider>
    </WagmiConfig>

  )
}

export default App;