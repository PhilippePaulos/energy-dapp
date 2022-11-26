import React, { useCallback, useEffect, useReducer } from "react";
import { useNetwork } from 'wagmi';
import AppContext from "./AppContext";
import { actions, initialState, reducer } from "./state";

function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  // const { chain } = useNetwork()

  const init = useCallback(
    async () => {
      // const networkId = chain.id
      const networkId = null
      dispatch({
        type: actions.init,
        data: { networkId }
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