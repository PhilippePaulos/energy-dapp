import { ethers } from "ethers"

function getContractDescription(name, chainId) {
    const artifact = require("../contracts/contracts.json")
    return artifact[chainId].contracts[name]
}

function formatAddress(address) {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4, address.length)}`
}

function getEthValue(value){
    return ethers.utils.formatEther( value ) 
}

export { getContractDescription, formatAddress, getEthValue }