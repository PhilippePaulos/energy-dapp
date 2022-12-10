const {time,loadFixture} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { getBalance } = require("../helpers/common");
const { proposeVote, Votes } = require('../helpers/governor')
const { BN , expectRevert, expectEvent } = require('@openzeppelin/test-helpers');

const provider = ethers.provider
const IPFS_IMG = "ipfs://bafybeibrzm2h3z37eaxqvofioxfythtv6fhdq7acdzwgukpoupsdcjecny/"

async function prepareData() {
    const ONE_DAY_IN_SECS = 24 * 60 * 60
    const closingTime = (await time.latest()) + ONE_DAY_IN_SECS
    const mintAmount = ethers.utils.parseEther("100000")
    const saleAmount = ethers.utils.parseEther("100000")
    const rate = 2
    const timeToPropose = 10
    const timeToVote = 2
    const votingPeriod = 2
    const nbTokenToStake = ethers.utils.parseEther('75')
    return { closingTime,  mintAmount, saleAmount, rate, 
        timeToPropose, timeToVote, votingPeriod, nbTokenToStake }
  }
  
  async function deployFixture() {
    const { closingTime, mintAmount, saleAmount, rate,
        timeToPropose, timeToVote, votingPeriod, nbTokenToStake  } = await prepareData()
  
    const MyDaoInstance = await ethers.getContractFactory("EnergyDao");
    const dao = await MyDaoInstance.deploy(mintAmount, saleAmount, rate, closingTime, timeToPropose, timeToVote, votingPeriod, nbTokenToStake)
    const [owner, craftsman1, craftsman2, beneficiary1, beneficiary2, voter1, voter2] = await ethers.getSigners()

    const EEDToken = await ethers.getContractFactory("EEDToken")
    const eedToken = EEDToken.attach(dao.token())
    const Sale = await ethers.getContractFactory("Sale")
    const sale = Sale.attach(dao.sale())
    const Governor = await ethers.getContractFactory("EnergyGovernor")
    const governor = Governor.attach(dao.governor())

/*     const { proposalId, descriptionHash, encodedFuncs } = await proposeVote(
        governor, [dao, dao], [ "validateCraftsman", "validateCraftsman"],
        [[craftsman1.address], [craftsman2.address]], [0, 0], "validate some craftsmans")
    await eedToken.connect(craftsman1).delegate(craftsman1.address)
    await governor.connect(voter1).castVote(proposalId, Votes.For)
    await hre.network.provider.send("hardhat_mine")

    await governor.execute([dao.address, dao.address], [0, 0], encodedFuncs, descriptionHash) */


    await sale.buyTokens(craftsman1.address, { value: ethers.utils.parseEther('150') })
    await sale.buyTokens(beneficiary1.address, { value: ethers.utils.parseEther('150') })
    //await sale.buyTokens(addr3.address, { value: ethers.utils.parseEther('150') })

    await dao.connect(craftsman1).registerCraftsman("Jean", "7 rue du Maine", IPFS_IMG)
    await dao.connect(craftsman2).registerCraftsman("Paul", "8 impasse des coquelicots", IPFS_IMG)

    await eedToken.connect(beneficiary1).approve(dao.address, ethers.utils.parseEther("0.75"));
    await dao.connect(beneficiary1).addProject("Immo City", "Renovation entreprise paprem Marseille", 13, 0, [IPFS_IMG, IPFS_IMG], IPFS_IMG, IPFS_IMG)



    return { dao, eedToken, sale, governor,  timeToPropose, timeToVote, votingPeriod, nbTokenToStake, owner,
        craftsman1, beneficiary1, voter1 }
  }


    describe("registerCraftman setter/getter/event", function () {

        it("Name not empty", async function () {
           const {dao} = await loadFixture(deployFixture);
           await expect(dao.registerCraftsman("", "b", "c")).to.be.revertedWith("You must fill all fields");
          });
        it("Not already craftman", async function () {
        const {dao, craftsman1 } = await loadFixture(deployFixture);
        await expect(dao.connect(craftsman1).registerCraftsman("a", "b", "c")).to.be.revertedWith("Already registered as craftsman");
        });
        it("Should return name of craftman", async function () {
            const {dao, craftsman1 } = await loadFixture(deployFixture);
            const craft = await dao.craftsmans(craftsman1.address)
            expect(craft.name).to.equal("Jean");
        });
        it("Should event craftman added", async function () {
            const {dao, owner} = await loadFixture(deployFixture);
            await expect(dao.connect(owner).registerCraftsman("Adrien", "8 impasse des coquelicots", IPFS_IMG)).to.emit(dao, "CraftsmanRegistered").withArgs(owner.address);
        });

/*        
         it("Should return craftman validated", async function () {
            const {dao, craftsman1} = await loadFixture(deployFixture);
            const bool = await dao.connect(craftsman1).isCraftsmanValidated(craftsman1.address);
            expect(bool).to.be.true;
 
            //expectEvent(findEvent, "CraftsmanRegistered", {craftsmanAddress: voter1})
        });

            it("Should validate craftman", async function () {
            const {dao, craftsman1} = await loadFixture(deployFixture);
            const bool = await dao.connect(craftsman1).isCraftsmanValidated(craftsman1.address);
            expect(bool).to.be.true;
 
            //expectEvent(findEvent, "CraftsmanRegistered", {craftsmanAddress: voter1})
        });

     */

        
    });


    describe("addProject setter/getter/event", function () {

        it("Name not empty", async function () {
           const {dao} = await loadFixture(deployFixture);
           await expect(dao.registerCraftsman("", "b", "c")).to.be.revertedWith("You must fill all fields");
          });
        it("Not already craftman", async function () {
        const {dao, craftsman1 } = await loadFixture(deployFixture);
        await expect(dao.connect(craftsman1).registerCraftsman("a", "b", "c")).to.be.revertedWith("Already registered as craftsman");
        });
        it("Should return name of craftman", async function () {
            const {dao, craftsman1 } = await loadFixture(deployFixture);
            const craft = await dao.craftsmans(craftsman1.address)
            expect(craft.name).to.equal("Jean");
        });
        it("Should event craftman added", async function () {
            const {dao, owner} = await loadFixture(deployFixture);
            await expect(dao.connect(owner).registerCraftsman("Adrien", "8 impasse des coquelicots", IPFS_IMG)).to.emit(dao, "CraftsmanRegistered").withArgs(owner.address) 

        });


        
    });
  








