import { ethers } from "ethers"
import React, { useCallback, useEffect, useState } from "react"
import { useAccount, useBlockNumber, useContractRead, useNetwork, useProvider } from "wagmi"
import { getContractDescription, initContract } from "../../common/helpers/eth"
import DaoContext from "./DaoContext"

function DaoProvider({ children }) {

  const provider = useProvider()
  const { chain } = useNetwork()
  const { address, isConnected } = useAccount()

  const [state, setState] = useState({
    fetched: false,
    votePower: 0,
    contracts: {},
    isValidated: false,
    isCraftsman: false,
    address: null,
    balance: 0,
    allowance: 0,
    blockNumber: null
  })

  const { abi: tokenAbi, addr: tokenAddr } = !isConnected ? {} : getContractDescription('EEDToken', chain.id)
  const { addr: daoAddr } = !isConnected ? {} : getContractDescription('EnergyDao', chain.id)

  useContractRead({
    address: tokenAddr,
    abi: tokenAbi,
    functionName: "balanceOf",
    args: [address],
    watch: true,
    onSuccess(balance) {
      setState((s) => ({ ...s, balance: balance }))
    },
  })

  useContractRead({
    address: tokenAddr,
    abi: tokenAbi,
    functionName: "allowance",
    args: [address, daoAddr],
    watch: true,
    onSuccess(allowance) {
      setState((s) => ({ ...s, allowance: allowance }))
    },
  })

  useBlockNumber({
    onSuccess(blockNumber) {
      setState((s) => ({ ...s, blockNumber: blockNumber }))
    }
  })


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
      const lock = await contracts.EnergyDao.amountToLock()
      const fees = await contracts.EnergyDao.fees()

      setState((s) => ({
        ...s,
        votePower: ethers.utils.formatEther(votes),
        isValidated: isValidated,
        contracts: contracts,
        isCraftsman: addr.craftsmanAddr === address,
        fetched: true,
        address: address,
        lock: lock,
        fees: fees
      }))
    }
  }, [chain, provider, address])

  useEffect(() => {
    const tryInit = async () => {
      try {
        init();
      } catch (err) {
        console.error(err);
      }
    };

    tryInit();
  }, [init, address]);


  useEffect(() => {
    const events = ["chainChanged"]

    const handleChange = () => {
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