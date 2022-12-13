import { BigNumber, ethers } from "ethers"
import React, { useEffect, useState } from "react"
import { useCallback } from "react"
import { useAccount, useNetwork, useProvider } from "wagmi"
import { initContract } from "../../common/helpers/eth"
import DaoContext from "./DaoContext"

function DaoProvider({ children }) {

  const provider = useProvider()
  const { chain } = useNetwork()
  const { address } = useAccount()

  const [state, setState] = useState({
    fetched: false,
    votePower: 0,
    contracts: {},
    isValidated: false,
    isCraftsman: false
  })

  // const contracts = {
  //   EnergyDao: initContract("EnergyDao", chain.id, provider),
  //   EEDToken: initContract("EEDToken", chain.id, provider),
  //   Sale: initContract("Sale", chain.id, provider),
  //   EnergyGovernor: initContract("EnergyGovernor", chain.id, provider)
  // }

  const init = useCallback(async () => {
    if (chain) {
      const contracts = {
        EnergyDao: initContract("EnergyDao", chain.id, provider),
        EEDToken: initContract("EEDToken", chain.id, provider),
        Sale: initContract("Sale", chain.id, provider),
        EnergyGovernor: initContract("EnergyGovernor", chain.id, provider)
      }

      const votes = await contracts.EEDToken.getVotes(address)
      const isValidated = await contracts.EnergyDao.isCraftsmanValidated(address)
      const addr = await contracts.EnergyDao.craftsmans(address)

      setState((s) => ({ ...s, votePower: ethers.utils.formatEther(votes) }))
      setState((s) => ({ ...s, isValidated: isValidated }))
      setState((s) => ({ ...s, contracts: contracts }))
      setState((s) => ({ ...s, fetched: true }))
      setState((s) => ({ ...s, isCraftsman: addr.craftsmanAddr === address }))

    }

  }, [address, chain, provider])

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
    const events = ["chainChanged", "accountsChanged"]

    const handleChange = () => {
      // window.location.reload()
      init()
    }

    events.forEach(e => window.ethereum.on(e, handleChange))
    return () => {
      events.forEach(e => window.ethereum.removeListener(e, handleChange))
    }
  }, [init])

  return (

    <DaoContext.Provider value={{
      state
    }}>
      {children}
    </DaoContext.Provider>
  )
}


export default DaoProvider