import { ThemeProvider } from "@emotion/react";
import { CssBaseline, Grid } from '@mui/material/';
import { getDefaultProvider } from "ethers";
import { chain, configureChains, createClient, defaultChains, WagmiConfig } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { publicProvider } from 'wagmi/providers/public';
import { Navbar } from "./components/Navbar";
import { theme } from './components/theme';
import AppProvider from './contexts/AppContext/AppProvider';
import './App.css'
import { Submission } from "./components/Submission";

// // // TODO add alchemy provider
const { chains, provider } = configureChains([chain.hardhat, ...defaultChains], [
  publicProvider(),
]);

const client = createClient({
  autoConnect: true,
  connectors: [new InjectedConnector({ chains })],
  provider
});

// const client = createClient({
//   autoConnect: true,
//   provider: getDefaultProvider(),
// })


function App() {
  return (
    <WagmiConfig client={client}>
         <ThemeProvider theme={theme}>
         <CssBaseline />
         {/* <AppProvider> */}
          <Navbar />
          <Grid container sx={{ mx: "auto", maxWidth: "1250px" }}>
            <Grid item xs={5} mt={2}>
              <Submission/>
            </Grid>        
          </Grid>
        {/* </AppProvider> */}
      </ThemeProvider>
    </WagmiConfig>
  )
}

export default App;