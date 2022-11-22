import './App.css';
import Home from './components/Home';
import { WalletProvider } from './contexts/WalletContext';

function App() {
  return (
    <WalletProvider >
      <Home />
    </WalletProvider>
  );
}

export default App;
