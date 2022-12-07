const { network, ethers, artifacts } = require("hardhat")
const {
  time,
} = require("@nomicfoundation/hardhat-network-helpers")
const path = require("path")

const IPFS_IMG = "ipfs://bafybeibrzm2h3z37eaxqvofioxfythtv6fhdq7acdzwgukpoupsdcjecny/"

async function main() {

  const [owner, addr1, addr2, addr3] = await ethers.getSigners()

  const mintAmount = ethers.utils.parseEther("100")
  const saleAmount = ethers.utils.parseEther("1")
  const rate = 1
  const ONE_DAY_IN_SECS = 24 * 60 * 60
  const closingTime = (await time.latest()) + ONE_DAY_IN_SECS

  const EnergyDao = await ethers.getContractFactory("EnergyDao")
  const energyDao = await EnergyDao.deploy(mintAmount, saleAmount, rate, closingTime, 0, 1)
  await energyDao.deployed()

  await energyDao.connect(addr1).registerCraftman("Jean", "7 rue du Maine", IPFS_IMG)
  await energyDao.connect(addr2).registerCraftman("Paul", "8 impasse des coquelicots", IPFS_IMG)
  await energyDao.connect(addr3).registerCraftman("Jacques", "1 rue des Rameaux", IPFS_IMG)

  const EEDToken = await ethers.getContractFactory("EEDToken")
  const eedToken = EEDToken.attach(energyDao.token())
  const Governor = await ethers.getContractFactory("EnergyGovernor")
  const governor = Governor.attach(energyDao.governor())

  console.log(await eedToken.balanceOf(addr1.address));
  await energyDao.transfer(addr1.address, ethers.utils.parseEther('30'))
  console.log(await eedToken.balanceOf(addr1.address));

  const func1 = energyDao.interface.encodeFunctionData("validateCraftman", [addr1.address])

  let tx = await governor.propose([energyDao.address],[0], [func1], [])
  let receipt = await tx.wait()
  const proposalId1 = receipt.events?.filter((x) => {return x.event == "ProposalCreated"})[0].args.proposalId
  const descriptionHash = ethers.utils.id(receipt.events?.filter((x) => {return x.event == "ProposalCreated"})[0].args.description)
  // console.log(await governor.state(proposalId1));

  const voteWay = 1 // 0 = Against, 1 = For, 2 = Abstain

  await governor.connect(addr1).castVote(proposalId1, voteWay)
  const hasVoted = await governor.hasVoted(proposalId1 , addr1.address)
  console.log("voted", hasVoted);

  console.log('validated', await energyDao.isCraftmanValidated(addr1.address))
  console.log("state", await governor.state(proposalId1));

  await hre.network.provider.send("hardhat_mine");

  console.log("state", await governor.state(proposalId1));

  await governor.execute([energyDao.address],[0], [func1], descriptionHash)

  console.log('validated', await energyDao.isCraftmanValidated(addr1))


  // // console.log(proposalId.hash);
  // id = await governor.ids(0);
  // console.log(id);
  // console.log(await governor.state(id));
  // await energyDao.connect(governor.address).validateCraftman(addr2.address)
  // console.log(await energyDao.isCraftmanValidated(addr1.address));
  // console.log(await energyDao.isCraftmanValidated(addr1.address));
  // console.log(await energyDao.isCraftmanValidated(addr3.address));


  // await energyDao.connect(addr1).addProject("Citya Pau", 10000, "Renovation immeuble année 1980 10 étages", 64, 1, [IPFS_IMG, IPFS_IMG], IPFS_IMG, IPFS_IMG)
  // await energyDao.connect(addr1).addProject("Immo City", 100000, "Renovation entreprise paprem Marseille", 13, 0, [IPFS_IMG, IPFS_IMG], IPFS_IMG, IPFS_IMG)

  // await time.increase(5)
  // await energyDao.connect(addr1).proposeQuotation(0, "devis Construct2000", IPFS_IMG, 720, 200000)
  // await energyDao.connect(addr2).proposeQuotation(1, "devis Paul SARL", IPFS_IMG, 6500, 250000)
  // await energyDao.connect(addr1).proposeQuotation(2, "devis Construct2001", IPFS_IMG, 900, 300000)



  // var project0 = await energyDao.getProject(0)
  // console.log(project0)
  // var quotationproject0 = await energyDao.getProjectQuotation(0,0)
  // console.log(quotationproject0)

  // await exportAbis(mainContract.address, "MainContract")
  // await exportAbis(saleAddress, "Sale")
  // await exportAbis(tokenAddress, "EEDToken")
  // await exportAbis(energyDao.address, "EnergyDao")

}


/**
 * Exports the abi of a contract to front package
 * @param {*} contractAddress 
 * @param {*} contract 
 */
async function exportAbis(contractAddress, contract) {
  const fs = require("fs")
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
  console.log(jsonData[chainId])

  jsonData[chainId]['contracts'][contract] = {
    'addr': contractAddress,
    'abi': artifact.abi
  }

  fs.writeFileSync(
    path.join(contractsDir, "contracts.json"),
    JSON.stringify(jsonData, null, 2)
  )
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })