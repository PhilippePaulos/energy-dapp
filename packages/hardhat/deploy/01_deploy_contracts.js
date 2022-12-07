const { ethers } = require("hardhat")
const {
  time,
} = require("@nomicfoundation/hardhat-network-helpers")
const { proposeVote, Votes } = require('../helpers/governor')
const { exportAbis, ONE_ETHER } = require("../helpers/common")

const IPFS_IMG = "ipfs://bafybeibrzm2h3z37eaxqvofioxfythtv6fhdq7acdzwgukpoupsdcjecny/"

async function main() {

  const mintAmount = ethers.utils.parseEther("400000")
  const saleAmount = ethers.utils.parseEther("200000")
  // 1ETH -> 200 EED
  const rate = 200
  const ONE_DAY_IN_SECS = 24 * 60 * 60
  const closingTime = (await time.latest()) + ONE_DAY_IN_SECS

  console.log("Deploy DAO...")
  const EnergyDao = await ethers.getContractFactory("EnergyDao")
  const energyDao = await EnergyDao.deploy(mintAmount, saleAmount, rate, closingTime, 0, 2, 2)

  await energyDao.deployed()
  console.log("Deployed DAO to", energyDao.address)

  const EEDToken = await ethers.getContractFactory("EEDToken")
  const eedToken = EEDToken.attach(energyDao.token())

  const Sale = await ethers.getContractFactory("Sale")
  const sale = Sale.attach(energyDao.sale())

  const Governor = await ethers.getContractFactory("EnergyGovernor")
  const governor = Governor.attach(energyDao.governor())

  if (network.config.chainId === 31337) {
    console.log("Prepare data")
    await prepareData(energyDao, eedToken, governor, sale)
  }

  console.log("Export ABIs to front folder...")


  await exportAbis(await sale.address, "Sale")
  await exportAbis(await eedToken.address, "EEDToken")
  await exportAbis(await energyDao.address, "EnergyDao")
  await exportAbis(await governor.address, "EnergyGovernor")
  console.log("ABIs exported")

}

async function prepareData(energyDao, eedToken, governor, sale) {
  const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners()

  await sale.buyTokens(addr1.address, { value: ethers.utils.parseEther('1')})
  await sale.buyTokens(addr3.address, {value: ONE_ETHER})
  await sale.buyTokens(addr3.address, {value: ONE_ETHER})

  console.log("Register craftsmans...")
  await energyDao.connect(addr1).registerCraftsman("Jean", "7 rue du Maine", IPFS_IMG)
  await energyDao.connect(addr2).registerCraftsman("Paul", "8 impasse des coquelicots", IPFS_IMG)
  await energyDao.connect(addr3).registerCraftsman("Jacques", "1 rue des Rameaux", IPFS_IMG)
  await energyDao.connect(addr4).registerCraftsman("Philippe", "12 avenue des Lilas", IPFS_IMG)

  console.log("Validate craftsman via governor instance....")
  // transfer tokens to reach quorum
  await energyDao.transfer(addr1.address, ethers.utils.parseEther('30000'))
  await eedToken.connect(addr1).delegate(addr1.address)

  const { proposalId, descriptionHash, encodedFuncs } = await proposeVote(
    governor, [energyDao, energyDao, energyDao], ["validateCraftsman", "validateCraftsman", "validateCraftsman"],
    [[addr1.address], [addr2.address], [addr3.address]], [0, 0, 0], "validate some craftsmans")


  await governor.connect(addr1).castVote(proposalId, Votes.For)

  await hre.network.provider.send("hardhat_mine")

  await governor.execute([energyDao.address, energyDao.address, energyDao.address], [0, 0, 0], encodedFuncs, descriptionHash)
  console.log("Craftsmans validated")

  console.log("Create projects...")
  await energyDao.addProject("Citya Pau", "Renovation immeuble année 1980 10 étages", 64, 1, [IPFS_IMG, IPFS_IMG], IPFS_IMG, IPFS_IMG)
  await energyDao.addProject("Immo City", "Renovation entreprise paprem Marseille", 13, 0, [IPFS_IMG, IPFS_IMG], IPFS_IMG, IPFS_IMG)

  await energyDao.connect(addr1).proposeQuotation(0, "devis Construct2000", IPFS_IMG, 720, 200000)
  await energyDao.connect(addr2).proposeQuotation(1, "devis Paul SARL", IPFS_IMG, 6500, 250000)
  await energyDao.connect(addr3).proposeQuotation(1, "devis Construct2001", IPFS_IMG, 900, 300000)

  console.log("Projects created")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })