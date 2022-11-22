import { useContext } from "react";
import WalletContext from "./WalletContext";

const useWallet = () => useContext(WalletContext);

export default useWallet;
