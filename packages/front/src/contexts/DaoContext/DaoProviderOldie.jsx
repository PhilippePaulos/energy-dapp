import { ethers } from "ethers";
import React, { useCallback, useEffect, useReducer, useState } from "react";
import { useAccount, useContractRead, useNetwork, useProvider } from "wagmi";
import { getContractDescription, getEthValue } from "../../helpers/eth";
import DaoContext from "./DaoContext";
import { actions, initialState, reducer } from "./state";

const initContract = async (contract, networkId, provider) => {
  const { abi, addr } = getContractDescription(contract, networkId)
  const Contract = new ethers.Contract(addr, abi, provider)
  return Contract.attach(addr)
}

function DaoProvider({ children }) {

  const provider = useProvider()
  const { address } = useAccount()
  const { chain } = useNetwork()

  const init = useCallback(
    async () => {
    }, [initContract])

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

  const state = {
    
  }

  return (
    <DaoContext.Provider value={{
      state
    }}>
      {children}
    </DaoContext.Provider>
  );
}


export default DaoProvider;