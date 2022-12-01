function getContractDescription(name, chainId) {
    const artifact = require("../contracts/contracts.json")
    return artifact[chainId][0].contracts[name]
}

function formatAddress(address) {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4, address.length)}`
}

export { getContractDescription, formatAddress }