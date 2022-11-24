import { chain, configureChains, createClient, defaultChains, WagmiConfig } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { infuraProvider } from "wagmi/providers/infura";
import { publicProvider } from 'wagmi/providers/public';
import './App.css';
import AppProvider from './contexts/AppContext/AppProvider';
import Welcome from './components/Welcome'

// TODO add alchemy provider
const { chains, provider } = configureChains([chain.hardhat, ...defaultChains], [
  publicProvider(),
]);

const client = createClient({
  autoConnect: true,
  connectors: [new InjectedConnector({chains})],
  provider
});

function App() {
  return (
    <WagmiConfig client={client}>
      <AppProvider>
        <Welcome/>
      </AppProvider>
    </WagmiConfig>
  );
}

export default App;