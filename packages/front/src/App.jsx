import { ThemeProvider } from "@emotion/react";
import { Box, Button, CssBaseline } from '@mui/material/';
import { chain, configureChains, createClient, defaultChains, WagmiConfig } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { publicProvider } from 'wagmi/providers/public';
import Navbar from "./components/Navbar";
import { theme } from './components/theme';
import AppProvider from './contexts/AppContext/AppProvider';


// TODO add alchemy provider
const { chains, provider } = configureChains([chain.hardhat, ...defaultChains], [
  publicProvider(),
]);

const client = createClient({
  autoConnect: true,
  connectors: [new InjectedConnector({ chains })],
  provider
});

function App() {
  return (
    <WagmiConfig client={client}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppProvider>
          <Navbar />
        </AppProvider>
      </ThemeProvider>
    </WagmiConfig>
  );
}

export default App;