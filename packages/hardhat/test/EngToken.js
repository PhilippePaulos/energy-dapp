const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { ONE_ETHER } = require("./helpers");


async function deployFixture() {

    const [owner, otherAccount] = await ethers.getSigners();
    const mintAmount = ONE_ETHER

    const EEDToken = await ethers.getContractFactory("EEDToken");
    const eedToken = await EEDToken.deploy(mintAmount);

    return { eedToken, mintAmount, owner, otherAccount };
}

describe("EEDToken", function () {

    describe("transfer", function () {

        it("Should transfer the required amount", async function () {
            const { eedToken, owner, otherAccount } = await loadFixture(deployFixture);
            await eedToken.connect(owner).transfer(otherAccount.address, ONE_ETHER)

            expect(await eedToken.balanceOf(otherAccount.address)).to.equal(ONE_ETHER);

        })
    })
})