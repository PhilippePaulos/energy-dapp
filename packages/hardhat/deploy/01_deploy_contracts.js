const { ethers } = require("hardhat")
const { proposeVote, Votes } = require('../helpers/governor')
const { exportAbis, ONE_ETHER } = require("../helpers/common")
const { Network, Alchemy } = require("alchemy-sdk")

const settings = {
  apiKey: process.env.ALCHEMY_KEY,
  network: Network.ETH_GOERLI,
}


const IPFS_FOLDER = "ipfs/QmY1okHh4rc6NriBJYVqTComuprvaxpHqCbPk9jLF3eUE1"

async function main() {

  const mintAmount = ethers.utils.parseEther("1000000")
  const saleAmount = ethers.utils.parseEther("1000000")
  const craftsmanPeriod = 2
  const quotationPeriod = 4
  const votingPeriod = 2
  const voteExpire = 2
  const nbMaxProject = 100
  const nbMaxQuotations = 10
  // 1ETH -> 10000 EED
  const rate = 10000
  const ONE_DAY_IN_SECS = 24 * 60 * 60
  const closingTime = Date.now() + ONE_DAY_IN_SECS

  console.log("Deploy DAO...")
  const EnergyDao = await ethers.getContractFactory("EnergyDao")

  const energyDao = await EnergyDao.deploy(mintAmount, saleAmount, rate, closingTime, craftsmanPeriod,
    quotationPeriod, votingPeriod, voteExpire, ethers.utils.parseEther("75"), nbMaxProject, nbMaxQuotations)

  await energyDao.deployed()
  console.log("Deployed DAO to", energyDao.address)

  const EEDToken = await ethers.getContractFactory("EEDToken")
  const eedToken = EEDToken.attach(energyDao.token())

  const Sale = await ethers.getContractFactory("Sale")
  const sale = Sale.attach(energyDao.sale())

  const Governor = await ethers.getContractFactory("EnergyGovernor")
  const governor = Governor.attach(energyDao.governor())

  let latestBlock
  if (network.config.chainId === 31337) {
    latestBlock = (await hre.ethers.provider.getBlock("latest")).number
    console.log("Prepare data")
    await prepareData(energyDao, eedToken, governor, sale)
  } else {
    const alchemy = new Alchemy(settings)
    latestBlock = await alchemy.core.getBlockNumber()
  }
  console.log("The latest block number is", latestBlock)


  console.log("Export ABIs to front folder...")

  const contracts = [
    { address: await sale.address, name: "Sale" },
    { address: await eedToken.address, name: "EEDToken" },
    { address: await energyDao.address, name: "EnergyDao" },
    { address: await governor.address, name: "EnergyGovernor" }
  ]

  exportAbis(contracts, latestBlock)
  console.log("ABIs exported")

}

async function prepareData(energyDao, eedToken, governor, sale) {
  const [owner, addr1, addr2, addr3, addr4, addr5, addr6, addr7, addr8, addr9] = await ethers.getSigners()

  await sale.buyTokens(addr1.address, { value: ethers.utils.parseEther('2') })
  for (const addr of [addr2, addr3, addr4, addr5, addr6, addr7, addr8, addr9]) {
    await sale.buyTokens(addr.address, { value: ethers.utils.parseEther('1') })
  }

  console.log("Register craftsmans...")
  const certif = `${IPFS_FOLDER}/CertificationRGE-01.jpg`
  await energyDao.connect(addr1).registerCraftsman("Jean Massé", "7 rue du Maine - 75013 Paris", certif)
  await energyDao.connect(addr2).registerCraftsman("Paul Dumant", "8 impasse des Coquelicots - 21231 Dijon", certif)
  await energyDao.connect(addr3).registerCraftsman("Jacques Artan", "1 rue des Rameaux - 35000 Rennes", certif)
  await energyDao.connect(addr4).registerCraftsman("Charlotte Dieuzé", "12 avenue des Lilas - 29510 Edern", certif)

  console.log("Delegates...")
  for (const addr of [addr1, addr2, addr3, addr4, addr5, addr6, addr7, addr8, addr9]) {
    await eedToken.connect(addr).delegate(addr.address)
  }

  console.log("Execute craftsman proposals")
  await addCraftsman(governor, energyDao, addr1, addr1)
  await addCraftsman(governor, energyDao, addr1, addr2)
  await addCraftsman(governor, energyDao, addr1, addr3)
  await proposeVote(governor, [energyDao], ["validateCraftsman"], [[addr4.address]], [0], `validate ${addr4.address}`)


  console.log("Approve tokens")
  const fees = await energyDao.fees()
  for (const addr of [addr2, addr3, addr5, addr6]) {
    await eedToken.connect(addr).approve(energyDao.address, fees)
  }

  console.log("PROJECT 1")
  const PHOTOS_IPFS = `${IPFS_FOLDER}/photos.jpg`
  const DPE_IPFS = `${IPFS_FOLDER}/dpe.gif`
  await energyDao.connect(addr5).addProject("Citya Pau", "Rénovation immeuble année 1980 - 10 étages", 64, 1, PHOTOS_IPFS, DPE_IPFS, `${IPFS_FOLDER}/Plans-02.jpg`, { value: fees })
  await energyDao.connect(addr2).proposeQuotation(0, "Devis - Construction 2000", `${IPFS_FOLDER}/Devis-01.jpg`, 25000, 210000)
  await energyDao.connect(addr3).proposeQuotation(0, "Devis - Renov", `${IPFS_FOLDER}/Devis-03.jpeg`, 21000, 306000)

  await hre.network.provider.send("hardhat_mine", ["0x3"]);

  await energyDao.connect(addr1).castVote(0, addr1.address, addr2.address)

  await energyDao.connect(addr5).accept(0)

  console.log("PROJECT 2")
  await eedToken.connect(addr2).approve(energyDao.address, fees)
  await eedToken.connect(addr3).approve(energyDao.address, fees)

  await energyDao.connect(addr6).addProject("Immo City", "Devis - Rénovation entreprise paprem Marseille", 13, 0, PHOTOS_IPFS, DPE_IPFS, `${IPFS_FOLDER}/Plans-02.jpg`, { value: fees })
  await energyDao.connect(addr2).proposeQuotation(1, "Devis - Paul SARL", `${IPFS_FOLDER}/Devis-01.jpg`, 6500, 85000)
  await energyDao.connect(addr3).proposeQuotation(1, "Devis - Construct2001", `${IPFS_FOLDER}/Devis-03.jpeg`, 5700, 60000)

}

async function addCraftsman(governor, energyDao, signer, addr) {

  const { proposalId, descriptionHash, encodedFuncs } = await proposeVote(governor, [energyDao], ["validateCraftsman"], [[addr.address]], [0], `validate ${addr.address}`)
  await governor.connect(signer).castVote(proposalId, Votes.For)

  await hre.network.provider.send("hardhat_mine", ["0x2"]);

  await governor.execute([energyDao.address], [0], encodedFuncs, descriptionHash)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })