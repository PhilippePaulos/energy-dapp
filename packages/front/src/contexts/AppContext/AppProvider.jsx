import React, { useCallback, useEffect, useReducer } from "react";
import { useContract, useNetwork, useProvider } from 'wagmi';
import { getContractDescription } from "../../helpers/eth";
import AppContext from "./AppContext";
import { actions, initialState, reducer } from "./state";

function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { chain } = useNetwork()
  const provider = useProvider()
  const { address, abi } = getContractDescription('Lock', chain.id)
  const contract = useContract({
    address: address,
    abi: abi,
    signerOrProvider: provider
  })

  const init = useCallback(
    async () => {
      const networkId = chain.id
      dispatch({
        type: actions.init,
        data: { networkId, contract }
      })
    }, [])

  useEffect(() => {
    const tryInit = async () => {
      try {
        init();
      } catch (err) {
        console.error(err);
      }
    };
    tryInit();
  }, [init]);

  useEffect(() => {
    const events = ["chainChanged", "accountsChanged"];
    const handleChange = () => {
      init();
    };

    events.forEach(e => window.ethereum.on(e, handleChange));
    return () => {
      events.forEach(e => window.ethereum.removeListener(e, handleChange));
    };
  }, [init]);

  return (
    <AppContext.Provider value={{
      state,
      dispatch
    }}>
      {children}
    </AppContext.Provider>
  );
}

export default AppProvider;