import { ethers } from "ethers";
import React, { useCallback, useEffect, useReducer } from "react";
import { useAccount, useContractRead, useNetwork, useProvider } from "wagmi";
import { getContractDescription, getEthValue } from "../../common/helpers/eth";
import DaoContext from "./DaoContext";
import { actions, initialState, reducer } from "./state";

function DaoProvider({ children }) {

  const [state, dispatch] = useReducer(reducer, initialState)

  const provider = useProvider()
  const { address } = useAccount()
  const { chain } = useNetwork()

  // const { abi, addr } = getContractDescription('EEDToken', chain.id)

  // const { data } = useContractRead({
  //   address: addr,
  //   abi: abi,
  //   functionName: "balanceOf",
  //   args: [address],
  //   watch: true
  // })

  // const balance = getEthValue(data)

  // const init = useCallback(
  //   async () => {
  //     dispatch({
  //       type: actions.init,
  //       data: { contracts }
  //     })
  //   }, [initContract])

  // useEffect(() => {
  //   const tryInit = async () => {
  //     try {
  //       init();
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   };
  //   tryInit();
  // }, [init]);

  useEffect(() => {
    const events = ["chainChanged", "accountsChanged"];
    const handleChange = () => {
      // init();
    };

    events.forEach(e => window.ethereum.on(e, handleChange));
    return () => {
      events.forEach(e => window.ethereum.removeListener(e, handleChange));
    };
  }, []);


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