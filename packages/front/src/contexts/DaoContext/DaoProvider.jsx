import { BigNumber, ethers } from "ethers"
import React, { useEffect, useState } from "react"
import { useCallback } from "react"
import { useAccount, useNetwork, useProvider } from "wagmi"
import { initContract } from "../../common/helpers/eth"
import DaoContext from "./DaoContext"

function DaoProvider({ children }) {

  const provider = useProvider()
  const { chain } = useNetwork()

  const contracts = {
    EnergyDao: initContract("EnergyDao", chain.id, provider),
    EEDToken: initContract("EEDToken", chain.id, provider),
    Sale: initContract("Sale", chain.id, provider),
    EnergyGovernor: initContract("EnergyGovernor", chain.id, provider)
  }
  

  useEffect(() => {
    const events = ["chainChanged", "accountsChanged"]
    
    const handleChange = () => {
      window.location.reload()
    }

    events.forEach(e => window.ethereum.on(e, handleChange))
    return () => {
      events.forEach(e => window.ethereum.removeListener(e, handleChange))
    }
  }, [])

  const profile = {
    contracts
  }

  return (
    <DaoContext.Provider value={{
      profile
    }}>
      {children}
    </DaoContext.Provider>
  )
}


export default DaoProvider