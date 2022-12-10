const { ethers, artifacts } = require("hardhat")
const path = require("path")

const fs = require("fs")
const ONE_ETHER = ethers.utils.parseEther('1')
const BURN_ADDRESS = "0x0000000000000000000000000000000000000000"

async function getBalance(address, provider) {
    return provider.getBalance(address)
}

/**
 * Exports the abi of a contract to front package
 * @param {*} contractAddress 
 * @param {*} contract 
 */
async function exportAbis(contractAddress, contract) {
    const contractsDir = path.join(__dirname, "..", "..", "front", "src", "contracts")

    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir)
    }

    const artifact = artifacts.readArtifactSync(contract)

    let chainId = network.config.chainId
    let jsonData

    if (fs.existsSync(path.join(contractsDir, "contracts.json"))) {
        const fileData = fs.readFileSync("../front/src/contracts/contracts.json", "utf8")
        jsonData = JSON.parse(fileData)

        if (!jsonData.hasOwnProperty(chainId)) {
            jsonData[chainId] = { "contracts": {} }
        }
    }
    else {
        jsonData = {}
        let contracts = {}
        contracts[contract] = {}
        let chain = {}
        chain["contracts"] = contracts
        jsonData[chainId] = chain
    }

    jsonData[chainId]['contracts'][contract] = {
        'addr': contractAddress,
        'abi': artifact.abi
    }

    fs.writeFileSync(
        path.join(contractsDir, "contracts.json"),
        JSON.stringify(jsonData, null, 2)
    )
}

module.exports = { ONE_ETHER, BURN_ADDRESS, exportAbis, getBalance }