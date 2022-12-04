const { network, ethers, artifacts } = require("hardhat")
const {
  time,
} = require("@nomicfoundation/hardhat-network-helpers")
const path = require("path")

async function main() {

  const mintAmount = ethers.utils.parseEther("10000")
  const saleAmount = ethers.utils.parseEther("100")
  const rate = 1
  const ONE_DAY_IN_SECS = 24 * 60 * 60
  const closingTime = (await time.latest()) + ONE_DAY_IN_SECS

  const EngDeployer = await ethers.getContractFactory("EngDeployer")
  const engDeployer = await EngDeployer.deploy(mintAmount, saleAmount, rate, closingTime)
  await engDeployer.deployed()
  const saleAddress = await engDeployer.sale()
  const tokenAddress = await engDeployer.token()

  await exportAbis(engDeployer.address, "EngDeployer")
  await exportAbis(saleAddress, "Sale")
  await exportAbis(tokenAddress, "EEDToken")

}

/**
 * Exports the abi of a contract to front package
 * @param {*} contractAddress 
 * @param {*} contract 
 */
async function exportAbis(contractAddress, contract) {
  const fs = require("fs");
  const contractsDir = path.join(__dirname, "..", "..", "front", "src", "contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir)
  }

  const artifact = artifacts.readArtifactSync(contract);

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
  console.log(jsonData[chainId])

  jsonData[chainId]['contracts'][contract] = {
    'addr': contractAddress,
    'abi': artifact.abi
  }

  fs.writeFileSync(
    path.join(contractsDir, "contracts.json"),
    JSON.stringify(jsonData, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  });