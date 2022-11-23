import './App.css';
import Welcome from './components/Welcome';
import { WalletProvider } from './contexts/WalletContext';

function App() {
  return (
    <WalletProvider >
      <Welcome />
    </WalletProvider>
  );
}

export default App;
