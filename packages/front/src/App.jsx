import { ThemeProvider } from "@emotion/react";
import { CssBaseline, Grid } from '@mui/material/';

import { chain, configureChains, createClient, defaultChains, useAccount, WagmiConfig } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { publicProvider } from 'wagmi/providers/public';
import { Navbar } from "./components/Navbar";
import { theme } from './components/theme';
import AppProvider from './contexts/AppContext/AppProvider';
import './App.css'
import { Submission } from "./components/Submission";
import Ico from "./components/Ico/Ico";

// // // TODO add alchemy provider
const { chains, provider } = configureChains([chain.hardhat, ...defaultChains], [
  publicProvider(),
]);

const client = createClient({
  autoConnect: true,
  connectors: [new InjectedConnector({ chains })],
  provider
});

function App() {

  const {isConnected} = useAccount()
  return (
    <WagmiConfig client={client}>
         <ThemeProvider theme={theme}>
         <CssBaseline />
         <AppProvider>
          <Navbar />
          <Grid container sx={{ mx: "auto", maxWidth: "1250px" }}>
            {isConnected ? 
            <Grid item xs={12} mt={2}>
              <Ico/>
            </Grid>        
            : null}
          </Grid>
        </AppProvider>
      </ThemeProvider>
    </WagmiConfig>
  )
}

export default App;