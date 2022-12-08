import { ethers } from "ethers";
import React, { useCallback, useEffect, useReducer } from "react";
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

  const [state, dispatch] = useReducer(reducer, initialState)

  const provider = useProvider()
  const { address } = useAccount()
  const { chain } = useNetwork()

  const { abi, addr } = getContractDescription('EEDToken', chain.id)

  const { data } = useContractRead({
    address: addr,
    abi: abi,
    functionName: "balanceOf",
    args: [address],
    watch: true
  })

  const balance = data ? getEthValue(data) : null

  const init = useCallback(
    async () => {
      const contracts = {}
      contracts["EnergyDao"] = await initContract("EnergyDao", chain.id, provider)
      contracts["EEDToken"] = await initContract("EEDToken", chain.id, provider)
      contracts["EnergyGovernor"] = await initContract("EnergyGovernor", chain.id, provider)
      contracts["Sale"] = await initContract("Sale", chain.id, provider)

      dispatch({
        type: actions.init,
        data: { balance, contracts: contracts }
      })
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


  return (
    <DaoContext.Provider value={{
      state,
      dispatch
    }}>
      {children}
    </DaoContext.Provider>
  );
}


export default DaoProvider;