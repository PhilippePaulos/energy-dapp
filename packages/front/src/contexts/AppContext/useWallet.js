import { useContext } from "react";
import AppContext from "./AppContext";

const useWallet = () => useContext(AppContext);

export default useWallet;
