const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { ONE_ETHER } = require("../helpers/common");


async function deployFixture() {

    const [owner, otherAccount] = await ethers.getSigners();
    const mintAmount = ONE_ETHER
    const nbTokenToStake = ethers.utils.parseEther('75')
    const EEDToken = await ethers.getContractFactory("EEDToken");
    const eedToken = await EEDToken.deploy(mintAmount, nbTokenToStake);

    return { eedToken, mintAmount, owner, otherAccount, nbTokenToStake};
}

 describe("EEDToken", function () {

    describe("transfer", function () {

        it("Should transfer the required amount", async function () {
            const { eedToken, owner, otherAccount } = await loadFixture(deployFixture);
            const a = await eedToken.balanceOf(owner.address);
            await eedToken.connect(owner).transfer(otherAccount.address, 10)
            expect(await eedToken.balanceOf(otherAccount.address)).to.equal(10);

        })
    })
}) 