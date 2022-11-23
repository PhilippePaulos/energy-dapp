import { ethers } from "ethers";
import React, { useCallback, useEffect, useReducer } from "react";
import { actions, initialState, reducer } from "./state";
import WalletContext from "./WalletContext";


function WalletProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const init = useCallback(
    async (artifact) => {
      if (artifact) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        const networkID = (await provider.getNetwork()).chainId;
        let contract;
        try {
          const contractJson = artifact[networkID][0].contracts["Lock"];
          const { abi, address } = contractJson;
          contract = new ethers.Contract(address, abi, provider.getSigner(0))
        } catch (err) {
          console.error(err);
        }
        dispatch({
          type: actions.init,
          data: { artifact, provider, accounts, networkID, contract }
        });
      }
    }, []);

  useEffect(() => {
    const tryInit = async () => {
      try {
        const artifact = require("../../contracts/contracts.json")
        init(artifact);
      } catch (err) {
        console.error(err);
      }
    };

    tryInit();
  }, [init]);

  useEffect(() => {
    const events = ["chainChanged", "accountsChanged"];
    const handleChange = () => {
      init(state.artifact);
    };

    events.forEach(e => window.ethereum.on(e, handleChange));
    return () => {
      events.forEach(e => window.ethereum.removeListener(e, handleChange));
    };
  }, [init, state.artifact]);

  return (
    <WalletContext.Provider value={{
      state,
      dispatch
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export default WalletProvider;
