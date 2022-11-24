function getContractDescription(name, chainId) {
    const artifact = require("../contracts/contracts.json")
    return artifact[chainId][0].contracts[name]
}

export { getContractDescription }