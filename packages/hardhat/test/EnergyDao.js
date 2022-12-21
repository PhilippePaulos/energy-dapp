const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers")
const { expect } = require("chai")
const { ethers } = require("hardhat")
const { proposeVote, Votes } = require('../helpers/governor')

const IPFS_IMG = "ipfs://bafybeibrzm2h3z37eaxqvofioxfythtv6fhdq7acdzwgukpoupsdcjecny/"

async function addCraftsman(governor, energyDao, signer, addr) {

    const { proposalId, descriptionHash, encodedFuncs } = await proposeVote(governor, [energyDao], ["validateCraftsman"], [[addr.address]], [0], `validate ${addr.address}`)
    await governor.connect(signer).castVote(proposalId, Votes.For)

    await hre.network.provider.send("hardhat_mine", ["0x2"])

    await governor.execute([energyDao.address], [0], encodedFuncs, descriptionHash)
}

async function removeCraftsman(governor, energyDao, signer, addr) {

    const { proposalId, descriptionHash, encodedFuncs } = await proposeVote(governor, [energyDao], ["removeCraftsman"], [[addr.address]], [0], `validate ${addr.address}`)
    await governor.connect(signer).castVote(proposalId, Votes.For)

    await hre.network.provider.send("hardhat_mine", ["0x2"])

    await governor.execute([energyDao.address], [0], encodedFuncs, descriptionHash)
}

async function prepareData() {
    const ONE_DAY_IN_SECS = 24 * 60 * 60
    const closingTime = (await time.latest()) + ONE_DAY_IN_SECS
    const mintAmount = ethers.utils.parseEther("300000")
    const saleAmount = ethers.utils.parseEther("300000")
    const craftsmanPeriod = 2
    const quotationPeriod = 3
    const votingPeriod = 2
    const voteExpire = 2
    // 1ETH -> 200 EED
    const rate = 200
    const nbTokenToStake = ethers.utils.parseEther('75')
    const numberProject = 2
    const numberQuotation = 2
    return {
        closingTime, mintAmount, saleAmount, rate, craftsmanPeriod,
        quotationPeriod, votingPeriod, voteExpire, nbTokenToStake, numberProject, numberQuotation
    }
}

async function deployFixture() {
    const { closingTime, mintAmount, saleAmount, rate,
        quotationPeriod, votingPeriod, nbTokenToStake, numberProject, craftsmanPeriod, voteExpire, numberQuotation } = await prepareData()

    const MyDaoInstance = await ethers.getContractFactory("EnergyDao")
    const dao = await MyDaoInstance.deploy(mintAmount, saleAmount, rate, closingTime, craftsmanPeriod, quotationPeriod, votingPeriod, voteExpire, nbTokenToStake, numberProject, numberQuotation)
    const [owner, craftsman1, craftsman2, beneficiary1, beneficiary2, voter1, voter2, voter3] = await ethers.getSigners()

    const EEDToken = await ethers.getContractFactory("EEDToken")
    const eedToken = EEDToken.attach(dao.token())
    const Sale = await ethers.getContractFactory("Sale")
    const sale = Sale.attach(dao.sale())
    const Governor = await ethers.getContractFactory("EnergyGovernor")
    const governor = Governor.attach(dao.governor())
    await sale.buyTokens(craftsman1.address, { value: ethers.utils.parseEther('150') })
    await sale.buyTokens(craftsman2.address, { value: ethers.utils.parseEther('150') })
    await sale.buyTokens(beneficiary1.address, { value: ethers.utils.parseEther('150') })
    await sale.buyTokens(beneficiary2.address, { value: ethers.utils.parseEther('150') })
    await sale.buyTokens(voter1.address, { value: ethers.utils.parseEther('150') })
    await sale.buyTokens(voter2.address, { value: ethers.utils.parseEther('150') })

    await dao.connect(craftsman1).registerCraftsman("Jean", "7 rue du Maine", IPFS_IMG)
    await dao.connect(craftsman2).registerCraftsman("Paul", "8 impasse des coquelicots", IPFS_IMG)
    await dao.connect(beneficiary1).registerCraftsman("Jacques", "1 rue des Rameaux", IPFS_IMG)
    await dao.connect(beneficiary2).registerCraftsman("Philippe", "12 avenue des Lilas", IPFS_IMG)


    await eedToken.connect(craftsman1).delegate(craftsman1.address)
    await eedToken.connect(craftsman2).delegate(craftsman2.address)
    await eedToken.connect(beneficiary1).delegate(beneficiary1.address)
    await eedToken.connect(beneficiary2).delegate(beneficiary2.address)
    await eedToken.connect(voter1).delegate(voter1.address)
    await eedToken.connect(voter2).delegate(voter2.address)

    await addCraftsman(governor, dao, voter1, craftsman1)
    await addCraftsman(governor, dao, voter1, beneficiary1)
    await addCraftsman(governor, dao, voter1, beneficiary2)
    await addCraftsman(governor, dao, voter1, craftsman2)

    await eedToken.connect(beneficiary1).approve(dao.address, ethers.utils.parseEther("10"))
    await eedToken.connect(craftsman1).approve(dao.address, ethers.utils.parseEther("10"))

    await dao.connect(beneficiary1).addProject("Immo City", "Renovation entreprise paprem Marseille", 13, 0, IPFS_IMG, IPFS_IMG, IPFS_IMG)

    await dao.connect(craftsman1).proposeQuotation(0, "devis Construct2000", IPFS_IMG, 720, 200000)

    return {
        dao, eedToken, sale, governor, craftsmanPeriod,
        quotationPeriod, votingPeriod, voteExpire, nbTokenToStake, owner,
        craftsman1, craftsman2, beneficiary1, beneficiary2, voter1, numberProject, voter3
    }
}


describe("registerCraftman setter/getter/event", function () {

    it("Name not empty", async function () {
        const { dao } = await loadFixture(deployFixture)
        await expect(dao.registerCraftsman("", "b", "c")).to.be.revertedWith("You must fill all fields")
    })

    it("Not already craftman", async function () {
        const { dao, craftsman1 } = await loadFixture(deployFixture)
        await expect(dao.connect(craftsman1).registerCraftsman("a", "b", "c")).to.be.revertedWith("Already registered as craftsman")
    })

    it("Should return name of craftman", async function () {
        const { dao, craftsman1 } = await loadFixture(deployFixture)
        const craft = await dao.craftsmans(craftsman1.address)
        expect(craft.name).to.equal("Jean")
    })

    it("Should event craftman added", async function () {
        const { dao, owner } = await loadFixture(deployFixture)
        await expect(dao.connect(owner).registerCraftsman("Adrien", "8 impasse des coquelicots", IPFS_IMG)).to.emit(dao, "CraftsmanRegistered").withArgs(owner.address)
    })

    it("Should return craftman validated", async function () {
        const { dao, craftsman1 } = await loadFixture(deployFixture)
        const bool = await dao.connect(craftsman1).isCraftsmanValidated(craftsman1.address)
        expect(bool).to.be.true
    })

    it("Should validate craftman", async function () {
        const { dao, craftsman1 } = await loadFixture(deployFixture)
        const craftman = await dao.craftsmans(craftsman1.address)
        expect(craftman.isValidated).to.be.true
    })
})


describe("addProject setter/getter/event", function () {

    it("Enough project", async function () {
        const { dao, beneficiary2, craftsman1, eedToken } = await loadFixture(deployFixture)
        await eedToken.connect(beneficiary2).approve(dao.address, ethers.utils.parseEther("0.75"))
        await dao.connect(beneficiary2).addProject("Immo City", "Renovation entreprise paprem Marseille", 13, 0, IPFS_IMG, IPFS_IMG, IPFS_IMG)
        await eedToken.connect(craftsman1).approve(dao.address, ethers.utils.parseEther("0.75"))
        await expect(dao.connect(craftsman1).addProject("Immo City2", "Renovation entreprise paprem Marseille", 13, 0, IPFS_IMG, IPFS_IMG, IPFS_IMG)).to.be.revertedWith("Project list is full")
    })

    it("Name not empty", async function () {
        const { dao } = await loadFixture(deployFixture)
        await expect(dao.addProject("", "Renovation entreprise paprem Marseille", 13, 0, IPFS_IMG, IPFS_IMG, IPFS_IMG)).to.be.revertedWith("You must fill all fields")
    })

    it("Should return name of Project", async function () {
        const { dao, beneficiary2, eedToken } = await loadFixture(deployFixture)
        await eedToken.connect(beneficiary2).approve(dao.address, ethers.utils.parseEther("0.75"))
        await dao.connect(beneficiary2).addProject("Immo City", "Renovation entreprise paprem Marseille", 13, 0, IPFS_IMG, IPFS_IMG, IPFS_IMG)
        const project = await dao.projects(1)
        expect(project.name).to.equal("Immo City")
    })

    it("Should event project added", async function () {
        const { dao, beneficiary2, eedToken } = await loadFixture(deployFixture)
        await eedToken.connect(beneficiary2).approve(dao.address, ethers.utils.parseEther("0.75"))
        await expect(dao.connect(beneficiary2).addProject("Immo City", "Renovation entreprise paprem Marseille", 13, 0, IPFS_IMG, IPFS_IMG, IPFS_IMG)).to.emit(dao, "ProjectRegistered").withArgs(beneficiary2.address, 1, "Immo City", 0)
    })


})

describe("proposeQuotation setter/getter/event", function () {

    it("Should be validated craftmans", async function () {
        const { dao, voter1 } = await loadFixture(deployFixture)
        await expect(dao.connect(voter1).proposeQuotation(0, "devis", IPFS_IMG, 720, 200000)).to.be.revertedWith("You are not a validated craftsman")
    })

    it("_description not empty", async function () {
        const { dao, craftsman1, eedToken } = await loadFixture(deployFixture)
        await eedToken.connect(craftsman1).approve(dao.address, ethers.utils.parseEther("0.75"))
        await expect(dao.connect(craftsman1).proposeQuotation(0, "", IPFS_IMG, 720, 200000)).to.be.revertedWith("You must fill all fields")
    })

    it("project not exists", async function () {
        const { dao, craftsman1, eedToken } = await loadFixture(deployFixture)
        await eedToken.connect(craftsman1).approve(dao.address, ethers.utils.parseEther("0.75"))
        await expect(dao.connect(craftsman1).proposeQuotation(1, "devis", IPFS_IMG, 720, 200000)).to.be.revertedWith("Project doesn't exists")
    })

    it("Too many quotation for this project", async function () {
        const { dao, craftsman2, beneficiary2, eedToken } = await loadFixture(deployFixture)
        await eedToken.connect(beneficiary2).approve(dao.address, ethers.utils.parseEther("0.75"))
        await dao.connect(beneficiary2).proposeQuotation(0, "devis 2", IPFS_IMG, 730, 250000)
        await eedToken.connect(craftsman2).approve(dao.address, ethers.utils.parseEther("0.75"))
        await expect(dao.connect(craftsman2).proposeQuotation(0, "devis 3", IPFS_IMG, 710, 190000)).to.be.revertedWith("Quotation list for this project is full")
    })

    it("Beneficiary cannot propose quotation for his own project", async function () {
        const { dao, beneficiary1, eedToken } = await loadFixture(deployFixture)
        await eedToken.connect(beneficiary1).approve(dao.address, ethers.utils.parseEther("0.75"))
        await expect(dao.connect(beneficiary1).proposeQuotation(0, "devis", IPFS_IMG, 720, 200000)).to.be.revertedWith("You can't propose quotation for your project")
    })

    it("Craftsman cannot propose quotation twice on a project", async function () {
        const { dao, craftsman1, eedToken } = await loadFixture(deployFixture)
        await eedToken.connect(craftsman1).approve(dao.address, ethers.utils.parseEther("0.75"))
        await expect(dao.connect(craftsman1).proposeQuotation(0, "devis", IPFS_IMG, 720, 200000)).to.be.revertedWith("You already proposed a quotation for this project")
    })

    it("Proposal session close", async function () {
        const { dao, craftsman2, eedToken } = await loadFixture(deployFixture)
        await hre.network.provider.send("hardhat_mine", ["0x1"])
        await eedToken.connect(craftsman2).approve(dao.address, ethers.utils.parseEther("0.75"))
        const quotation = dao.connect(craftsman2).proposeQuotation(0, "devis", IPFS_IMG, 720, 200000)
        await expect(quotation).to.be.revertedWith("Proposal session is close for this project")
    })

    it("Should return description of Quotation", async function () {
        const { dao, craftsman2, eedToken } = await loadFixture(deployFixture)
        await eedToken.connect(craftsman2).approve(dao.address, ethers.utils.parseEther("0.75"))
        await dao.connect(craftsman2).proposeQuotation(0, "devis", IPFS_IMG, 720, 200000)
        const quotation = await dao.quotations(0, craftsman2.address)
        expect(quotation.description).to.equal("devis")
    })
    
    it("Check lock token", async function () {
        const { dao, craftsman2, eedToken } = await loadFixture(deployFixture)
        await eedToken.connect(craftsman2).approve(dao.address, ethers.utils.parseEther("0.75"))
        await dao.connect(craftsman2).proposeQuotation(0, "devis", IPFS_IMG, 720, 200000)
        const lock = await dao.locks(craftsman2.address)
        expect(Number(lock)).to.equal(74250000000000000000)
    })

    it("Should event quotation added", async function () {
        const { dao, craftsman2, eedToken } = await loadFixture(deployFixture)
        await eedToken.connect(craftsman2).approve(dao.address, ethers.utils.parseEther("0.75"))
        await expect(dao.connect(craftsman2).proposeQuotation(0, "devis", IPFS_IMG, 720, 200000)).to.emit(dao, "QuotationRegistred").withArgs(0, craftsman2.address)
    })

    it("Should remove quotation", async function () {
        const { dao, craftsman2, eedToken } = await loadFixture(deployFixture)
        await eedToken.connect(craftsman2).approve(dao.address, ethers.utils.parseEther("0.75"))
        await dao.connect(craftsman2).proposeQuotation(0, "devis", IPFS_IMG, 720, 200000)
        await dao.connect(craftsman2).removeQuotation(0)
        const quotation = await dao.quotations(0, craftsman2.address)
        expect(quotation.isDeleted).to.equal(true)
    })


})

describe("Votes setter/getter/event", function () {

    it("should be vote session", async function () {
        const { dao, voter1, craftsman1 } = await loadFixture(deployFixture)
        await expect(dao.connect(craftsman1).castVote(0, voter1.address, craftsman1.address)).to.be.revertedWith("Vote session is not active")
    })

    it("should not already vote", async function () {
        const { dao, voter1, craftsman1 } = await loadFixture(deployFixture)
        await hre.network.provider.send("hardhat_mine", ["0x2"])
        await dao.connect(voter1).castVote(0, voter1.address, craftsman1.address)
        await expect(dao.connect(craftsman1).castVote(0, voter1.address, craftsman1.address)).to.be.revertedWith("Vote already cast")
    })

    it("Should return vote", async function () {
        const { dao, voter1, craftsman1 } = await loadFixture(deployFixture)
        await hre.network.provider.send("hardhat_mine", ["0x2"])
        await dao.connect(voter1).castVote(0, voter1.address, craftsman1.address)
        const quotation = await dao.quotations(0, craftsman1.address)
        expect(Number(quotation.weightVote)).to.equal(30000000000000000000000)
    })

    it("Should event vote added", async function () {
        const { dao, voter1, craftsman1 } = await loadFixture(deployFixture)
        await hre.network.provider.send("hardhat_mine", ["0x2"])
        await expect(dao.connect(voter1).castVote(0, voter1.address, craftsman1.address)).to.emit(dao, "Voted").withArgs(voter1.address, 0, craftsman1.address, BigInt(30000000000000000000000))
    })

    it("check getvoteproject", async function () {
        const { dao, voter1, craftsman1 } = await loadFixture(deployFixture)
        await hre.network.provider.send("hardhat_mine", ["0x2"])
        await dao.connect(voter1).castVote(0, voter1.address, craftsman1.address)
        const vote = await dao.connect(voter1).getVoteProject(0, craftsman1.address)
        expect(vote).to.equal(BigInt(30000000000000000000000))
    })

    it("check hasvoted", async function () {
        const { dao, voter1, craftsman1 } = await loadFixture(deployFixture)
        await hre.network.provider.send("hardhat_mine", ["0x2"])
        await dao.connect(voter1).castVote(0, voter1.address, craftsman1.address)
        const vote = await dao.connect(voter1).hasVoted(0, voter1.address)
        expect(vote).to.equal(true)
    })
})

describe("Votes setter/getter/event", function () {

    it("should be vote session", async function () {
        const { dao, voter1, craftsman1 } = await loadFixture(deployFixture)
        await expect(dao.connect(craftsman1).castVote(0, voter1.address, craftsman1.address)).to.be.revertedWith("Vote session is not active")
    })

    it("should not already vote", async function () {
        const { dao, voter1, craftsman1 } = await loadFixture(deployFixture)
        await hre.network.provider.send("hardhat_mine", ["0x2"])
        await dao.connect(voter1).castVote(0, voter1.address, craftsman1.address)
        await expect(dao.connect(craftsman1).castVote(0, voter1.address, craftsman1.address)).to.be.revertedWith("Vote already cast")
    })

    it("Should return vote", async function () {
        const { dao, voter1, craftsman1 } = await loadFixture(deployFixture)
        await hre.network.provider.send("hardhat_mine", ["0x2"])
        await dao.connect(voter1).castVote(0, voter1.address, craftsman1.address)
        const quotation = await dao.quotations(0, craftsman1.address)
        expect(Number(quotation.weightVote)).to.equal(30000000000000000000000)
    })
    
    it("Should event vote added", async function () {
        const { dao, voter1, craftsman1 } = await loadFixture(deployFixture)
        await hre.network.provider.send("hardhat_mine", ["0x2"])
        await expect(dao.connect(voter1).castVote(0, voter1.address, craftsman1.address)).to.emit(dao, "Voted").withArgs(voter1.address, 0, craftsman1.address, BigInt(30000000000000000000000))
    })

    it("check getvoteproject", async function () {
        const { dao, voter1, craftsman1 } = await loadFixture(deployFixture)
        await hre.network.provider.send("hardhat_mine", ["0x2"])
        await dao.connect(voter1).castVote(0, voter1.address, craftsman1.address)
        const vote = await dao.connect(voter1).getVoteProject(0, craftsman1.address)
        expect(vote).to.equal(BigInt(30000000000000000000000))
    })

    it("Should vote without delegate", async function () {
        const { dao, voter3, craftsman1 } = await loadFixture(deployFixture)
        await hre.network.provider.send("hardhat_mine", ["0x2"])
        await dao.connect(voter3).castVote(0, voter3.address, craftsman1.address)
    })

    it("check hasvoted", async function () {
        const { dao, voter1, craftsman1 } = await loadFixture(deployFixture)
        await hre.network.provider.send("hardhat_mine", ["0x2"])
        await dao.connect(voter1).castVote(0, voter1.address, craftsman1.address)
        const vote = await dao.connect(voter1).hasVoted(0, voter1.address)
        expect(vote).to.equal(true)
    })

})

describe("State setter/getter/event", function () {

    it("should return pending (0)", async function () {
        const { dao, voter1 } = await loadFixture(deployFixture)
        const state = await dao.connect(voter1).getState(0)
        expect(state).to.equal(0)
    })

    it("should return pending (1)", async function () {
        const { dao, voter1 } = await loadFixture(deployFixture)
        await hre.network.provider.send("hardhat_mine", ["0x2"])
        const state = await dao.connect(voter1).getState(0)
        expect(state).to.equal(1)
    })

    it("should return Ended (2)", async function () {
        const { dao, voter1 } = await loadFixture(deployFixture)
        await hre.network.provider.send("hardhat_mine", ["0x4"])
        const state = await dao.connect(voter1).getState(0)
        expect(state).to.equal(2)
    })

    it("should return Expired (5)", async function () {
        const { dao, voter1 } = await loadFixture(deployFixture)
        await hre.network.provider.send("hardhat_mine", ["0x6"])
        const state = await dao.connect(voter1).getState(0)
        expect(state).to.equal(5)
    })

    it("should return accepted (4)", async function () {
        const { dao, voter1, craftsman1, beneficiary1 } = await loadFixture(deployFixture)
        await hre.network.provider.send("hardhat_mine", ["0x3"])
        await dao.connect(voter1).castVote(0, voter1.address, craftsman1.address)
        await dao.connect(beneficiary1).accept(0)
        const state = await dao.connect(voter1).getState(0)
        expect(state).to.equal(4)
    })

    it("should return Rejected (3)", async function () {
        const { dao, voter1, beneficiary1 } = await loadFixture(deployFixture)
        await hre.network.provider.send("hardhat_mine", ["0x4"])
        const state1 = await dao.connect(voter1).getState(0)
        //console.log(state1)
        await dao.connect(beneficiary1).accept(0)
        const state = await dao.connect(voter1).getState(0)
        expect(state).to.equal(3)
    })

})


describe("Accept setter/getter/event", function () {

    it("Should be beneficiary", async function () {
        const { dao, voter1 } = await loadFixture(deployFixture)
        await expect(dao.connect(voter1).accept(0)).to.be.revertedWith("You are not the beneficiary")
    })

    it("should be vote ended", async function () {
        const { dao, beneficiary1 } = await loadFixture(deployFixture)
        await expect(dao.connect(beneficiary1).accept(0)).to.be.revertedWith("Vote session is not ended")
    })

    it("Should return winning craftsman", async function () {
        const { dao, voter1, craftsman1, beneficiary1 } = await loadFixture(deployFixture)
        await hre.network.provider.send("hardhat_mine", ["0x3"])
        await dao.connect(voter1).castVote(0, voter1.address, craftsman1.address)
        await dao.connect(beneficiary1).accept(0)
        const project = await dao.projects(0)
        expect(project.choosedCraftsman).to.equal(craftsman1.address)
        expect(project.voteInfo.accepted).to.equal(true)
        const craftman = await dao.craftsmans(craftsman1.address)
        expect(craftman.nbProjectsValidated).to.equal(1)
    })

    it("Should be rejected", async function () {
        const { dao, beneficiary2, eedToken, voter1, craftsman1 } = await loadFixture(deployFixture)
        await eedToken.connect(beneficiary2).approve(dao.address, ethers.utils.parseEther("10"))
        await dao.connect(beneficiary2).addProject("Immo City2", "Renovation entreprise paprem Marseille", 13, 0, IPFS_IMG, IPFS_IMG, IPFS_IMG)
        await dao.connect(craftsman1).proposeQuotation(1, "devis Construct2000", IPFS_IMG, 720, 200000)
        await hre.network.provider.send("hardhat_mine", ["0x2"])
        await dao.connect(voter1).castVote(1, voter1.address, craftsman1.address)
        await dao.connect(craftsman1).removeQuotation(1)
        await dao.connect(beneficiary2).accept(1)
        const project = await dao.projects(1)
        expect(project.voteInfo.rejected).to.equal(true)
    })

    it("Should event vote added", async function () {
        const { dao, beneficiary1, craftsman1, voter1 } = await loadFixture(deployFixture)
        await hre.network.provider.send("hardhat_mine", ["0x3"])
        await dao.connect(voter1).castVote(0, voter1.address, craftsman1.address)
        await expect(dao.connect(beneficiary1).accept(0)).to.emit(dao, "QuotationAccepted").withArgs(0, craftsman1.address)
    })

})

describe("Reject setter/getter/event", function () {

    it("should be vote ended", async function () {
        const { dao, beneficiary1 } = await loadFixture(deployFixture)
        await expect(dao.connect(beneficiary1).reject(0)).to.be.revertedWith("Vote session is not ended")
    })

    it("Should be rejected", async function () {
        const { dao, beneficiary1 } = await loadFixture(deployFixture)
        await hre.network.provider.send("hardhat_mine", ["0x4"])
        await dao.connect(beneficiary1).reject(0)
        const project = await dao.projects(0)
        expect(project.voteInfo.rejected).to.equal(true)
    })

    it("Should event vote added", async function () {
        const { dao, beneficiary1 } = await loadFixture(deployFixture)
        await hre.network.provider.send("hardhat_mine", ["0x4"])
        await expect(dao.connect(beneficiary1).reject(0)).to.emit(dao, "QuotationRejected").withArgs(0)
    })
})

describe("Remove craftsman setter/getter/event", function () {

    it("Should remove craftsman", async function () {
        const { governor, dao, voter1, beneficiary2 } = await loadFixture(deployFixture)
        await removeCraftsman(governor, dao, voter1, beneficiary2)
        const craftman = await dao.craftsmans(beneficiary2.address)
        expect(craftman.isValidated).to.equal(false)
    })
})

describe("Remove quotation setter/getter/event", function () {

    it("should project exists", async function () {
        const { dao, craftsman1 } = await loadFixture(deployFixture)
        await expect(dao.connect(craftsman1).removeQuotation(2)).to.be.revertedWith("Project doesn't exists")
    })
    it("should quotation exists", async function () {
        const { dao, beneficiary2, craftsman1, eedToken } = await loadFixture(deployFixture)
        await eedToken.connect(beneficiary2).approve(dao.address, ethers.utils.parseEther("10"))
        await dao.connect(beneficiary2).addProject("Immo City2", "Renovation entreprise paprem Marseille", 13, 0, IPFS_IMG, IPFS_IMG, IPFS_IMG)
        await expect(dao.connect(craftsman1).removeQuotation(1)).to.be.revertedWith("No quotation for this project")
    })
})

describe("withdraw", function () {

    it("withdraw fund", async function () {
        const { dao, owner } = await loadFixture(deployFixture)
        await time.increase(100000000)
        await dao.connect(owner).getFunds()
    })

})

describe("send funds, transfer, fallback", function () {

    it("Should send funds", async function () {
        const { dao, owner, voter1 } = await loadFixture(deployFixture)
        await dao.connect(owner).sendFunds(voter1.address)
    })

    it("Should transfer", async function () {
        const { dao, owner, voter1 } = await loadFixture(deployFixture)
        await dao.connect(owner).transfer(voter1.address, 1)
    })

    it("Should transfer", async function () {
        const { dao, owner } = await loadFixture(deployFixture)
        await dao.connect(owner).fallback()
    })

})

describe("modifiers", function () {

    it("Should be validated craftmans", async function () {
        const { dao, craftsman1 } = await loadFixture(deployFixture)
        await expect(dao.connect(craftsman1).removeQuotation(2)).to.be.revertedWith("Project doesn't exists")
    })

    it("Should transfer", async function () {
        const { dao, owner, voter1 } = await loadFixture(deployFixture)
        await dao.connect(owner).transfer(voter1.address, 1)
    })

    it("Should transfer", async function () {
        const { dao, owner } = await loadFixture(deployFixture)
        await dao.connect(owner).fallback()
    })

})