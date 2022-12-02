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

    const EngToken = await ethers.getContractFactory("EngToken");
    const engToken = await EngToken.deploy(mintAmount);

    return { engToken, mintAmount, owner, otherAccount };
}

describe("EngToken", function () {

    describe("transfer", function () {

        it("Should transfer the required amount", async function () {
            const { engToken, owner, otherAccount } = await loadFixture(deployFixture);
            await engToken.connect(owner).transfer(otherAccount.address, ONE_ETHER)

            expect(await engToken.balanceOf(otherAccount.address)).to.equal(ONE_ETHER);

        })
    })
})