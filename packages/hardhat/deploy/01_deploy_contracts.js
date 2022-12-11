const { ethers } = require("hardhat")
const {
  time,
} = require("@nomicfoundation/hardhat-network-helpers")
const { proposeVote, Votes } = require('../helpers/governor')
const { exportAbis, ONE_ETHER } = require("../helpers/common")

const IPFS_IMG = "ipfs://bafybeibrzm2h3z37eaxqvofioxfythtv6fhdq7acdzwgukpoupsdcjecny/"

async function main() {

  const mintAmount = ethers.utils.parseEther("1000000")
  const saleAmount = ethers.utils.parseEther("1000000")
  const craftsmanPeriod = 2
  const quotationPeriod = 4
  const votingPeriod = 2
  const voteExpire = 2
  // 1ETH -> 2000 EED
  const rate = 10000
  const ONE_DAY_IN_SECS = 24 * 60 * 60
  const closingTime = (await time.latest()) + ONE_DAY_IN_SECS

  console.log("Deploy DAO...")
  const EnergyDao = await ethers.getContractFactory("EnergyDao")

  const energyDao = await EnergyDao.deploy(mintAmount, saleAmount, rate, closingTime, craftsmanPeriod, quotationPeriod, votingPeriod, voteExpire, ethers.utils.parseEther("75"))

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
  const [owner, addr1, addr2, addr3, addr4, addr5, addr6, addr7] = await ethers.getSigners()

  await sale.buyTokens(addr1.address, { value: ethers.utils.parseEther('1') })
  await sale.buyTokens(addr2.address, { value: ethers.utils.parseEther('1') })
  await sale.buyTokens(addr3.address, { value: ethers.utils.parseEther('1') })
  await sale.buyTokens(addr4.address, { value: ethers.utils.parseEther('1') })
  await sale.buyTokens(addr5.address, { value: ethers.utils.parseEther('1') })
  await sale.buyTokens(addr6.address, { value: ethers.utils.parseEther('1') })
  await sale.buyTokens(addr7.address, { value: ethers.utils.parseEther('1') })

  //const res = await eedToken.balanceOf(energyDao.address);
  const res = await eedToken.balanceOf(addr1.address);
  console.log("Register craftsmans...")
  await energyDao.connect(addr1).registerCraftsman("Jean", "7 rue du Maine", IPFS_IMG)
  await energyDao.connect(addr2).registerCraftsman("Paul", "8 impasse des coquelicots", IPFS_IMG)
  await energyDao.connect(addr3).registerCraftsman("Jacques", "1 rue des Rameaux", IPFS_IMG)
  await energyDao.connect(addr4).registerCraftsman("Philippe", "12 avenue des Lilas", IPFS_IMG)
  await energyDao.connect(addr5).registerCraftsman("Baptiste", "3 impasse Emile Zola", IPFS_IMG)

  console.log("Validate craftsman via governor instance....")
  // transfer tokens to reach quorum
  await eedToken.connect(addr1).delegate(addr1.address)
  await eedToken.connect(addr2).delegate(addr2.address)
  await eedToken.connect(addr3).delegate(addr3.address)
  await eedToken.connect(addr4).delegate(addr4.address)
  await eedToken.connect(addr5).delegate(addr5.address)

  await addCraftsman(governor, energyDao,addr1, addr1)
  await addCraftsman(governor, energyDao, addr1, addr2)
  await addCraftsman(governor, energyDao, addr1, addr3)
  await addCraftsman(governor, energyDao, addr1, addr4)

  // console.log("Craftsmans validated")

  // console.log("Create projects...")

  console.log("Approve tokens");
  await eedToken.connect(addr1).approve(energyDao.address, ethers.utils.parseEther("1.5"));
  await eedToken.connect(addr2).approve(energyDao.address, ethers.utils.parseEther("1.5"));
  await eedToken.connect(addr3).approve(energyDao.address, ethers.utils.parseEther("1.5"));
  await eedToken.connect(addr4).approve(energyDao.address, ethers.utils.parseEther("1.5"));
  await eedToken.connect(addr5).approve(energyDao.address, ethers.utils.parseEther("1.5"));
  await eedToken.connect(addr6).approve(energyDao.address, ethers.utils.parseEther("1.5"));
  await eedToken.connect(addr7).approve(energyDao.address, ethers.utils.parseEther("1.5"));


  console.log("PROJET 1");
  await energyDao.connect(addr6).addProject("Citya Pau", "Renovation immeuble année 1980 10 étages", 64, 1, [IPFS_IMG, IPFS_IMG], IPFS_IMG, IPFS_IMG)
  await energyDao.connect(addr2).proposeQuotation(0, "devis Construct2000", IPFS_IMG, 720, 200000)
  await energyDao.connect(addr3).proposeQuotation(0, "devis super", IPFS_IMG, 720, 200000)
  await energyDao.connect(addr4).proposeQuotation(0, "Etanchéité renouvelable", IPFS_IMG, 720, 200000)

  await hre.network.provider.send("hardhat_mine")
  await hre.network.provider.send("hardhat_mine")
  
  await energyDao.connect(addr1).castVote(0, addr1.address, addr2.address)
  await hre.network.provider.send("hardhat_mine")

  await energyDao.connect(addr6).accept(0)

  console.log("PROJET 2");
  await energyDao.connect(addr7).addProject("Immo City", "Renovation entreprise paprem Marseille", 13, 0, [IPFS_IMG, IPFS_IMG], IPFS_IMG, IPFS_IMG)
  await energyDao.connect(addr2).proposeQuotation(1, "devis Paul SARL", IPFS_IMG, 6500, 250000)
  await energyDao.connect(addr3).proposeQuotation(1, "devis Construct2001", IPFS_IMG, 900, 300000)
  await energyDao.connect(addr4).proposeQuotation(1, "Devis installation panneaux solaires ", IPFS_IMG, 900, 300000)
  await hre.network.provider.send("hardhat_mine")

}

async function addCraftsman(governor, energyDao, signer, addr) {

  const { proposalId, descriptionHash, encodedFuncs } = await proposeVote(governor, [energyDao], ["validateCraftsman"], [[addr.address]], [0], `validate ${addr.address}`)
  await governor.connect(signer).castVote(proposalId, Votes.For)

  await hre.network.provider.send("hardhat_mine")
  await hre.network.provider.send("hardhat_mine")

  await governor.execute([energyDao.address], [0], encodedFuncs, descriptionHash)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })