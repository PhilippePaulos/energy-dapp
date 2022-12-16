const { ethers, artifacts } = require("hardhat")
const path = require("path")

const fs = require("fs")
const ONE_ETHER = ethers.utils.parseEther('1')
const BURN_ADDRESS = "0x0000000000000000000000000000000000000000"

/**
 * Gets `address` balance
 * @param {*} address 
 * @param {*} provider 
 * @returns 
 */
async function getBalance(address, provider) {
    return provider.getBalance(address)
}

/**
 * Exports the abi of a contract to the front package
 * @param {*} contracts 
 */
async function exportAbis(contracts, blockNumber) {

    const contractsDir = path.join(__dirname, "..", "..", "front", "src", "contracts")

    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir)
    }

    for (const contract of contracts) {
        const {address, name} = contract
        const artifact = artifacts.readArtifactSync(name)

        let chainId = network.config.chainId
        let json
    
        if (fs.existsSync(path.join(contractsDir, "contracts.json"))) {
            const fileData = fs.readFileSync("../front/src/contracts/contracts.json", "utf8")
            json = JSON.parse(fileData)
    
            if (!json.hasOwnProperty(chainId)) {
                json[chainId] = { "contracts": {} }
            }
        }
        else {
            json = {}
            let contracts = {}
            contracts[name] = {}
            let chain = {}
            chain["contracts"] = contracts
            json[chainId] = chain
        }
    
        json[chainId]['contracts'][name] = {
            'addr': address,
            'abi': artifact.abi
        }

        json[chainId]['block'] = blockNumber
    
        fs.writeFileSync(
            path.join(contractsDir, "contracts.json"),
            JSON.stringify(json, null, 2)
        )
    }
   

   
}

module.exports = { ONE_ETHER, BURN_ADDRESS, exportAbis, getBalance }