const {time,loadFixture} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { getBalance } = require("./helpers");

const provider = ethers.provider

async function prepare() {
  const ONE_DAY_IN_SECS = 24 * 60 * 60;
  const mintAmount = hre.ethers.utils.parseEther("10000");
  const saleAmount = hre.ethers.utils.parseEther("100");
  const rate = 1;
  const closingTime = (await time.latest()) + ONE_DAY_IN_SECS;
  return { mintAmount, saleAmount, rate, closingTime }
}

describe("EngDeployer", function () {
  async function deployFixture() {

    const { mintAmount, saleAmount, rate, closingTime } = await prepare()

    const [owner, otherAccount] = await ethers.getSigners();

    const Deployer = await ethers.getContractFactory("EngDeployer");
    const deployer = await Deployer.deploy(mintAmount, saleAmount, rate, closingTime);
    const Sale = await ethers.getContractFactory("Sale");
    const sale = Sale.attach(await deployer.sale());

    return { deployer, sale, mintAmount, saleAmount, rate, closingTime, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right status", async function () {
      const { deployer, sale, mintAmount, saleAmount, rate, closingTime } = await loadFixture(deployFixture);

      expect(await deployer.mintAmount()).to.equal(mintAmount);
      expect(await deployer.saleAmount()).to.equal(saleAmount);
      expect(await sale.closingTime()).to.equal(closingTime);
      expect(await sale.rate()).to.equal(rate);

    });

    it("Should set the right owner", async function () {
      const { deployer, owner } = await loadFixture(deployFixture);

      expect(await deployer.owner()).to.equal(owner.address);
    });


    it("Should fail if the closingTime is not in the future", async function () {
      const { mintAmount, saleAmount, rate } = await prepare();
      const latestTime = await time.latest();

      const Deployer = await ethers.getContractFactory("EngDeployer");

      await expect(Deployer.deploy(mintAmount, saleAmount, rate, latestTime)).to.be.revertedWith(
        "Closing time should be in the future"
      );
    });

    it("Should fail if the mintAmount is lower than saleAmount", async function () {
      const { closingTime, rate } = await prepare();

      const mintAmount = hre.ethers.utils.parseEther("1");
      const saleAmount = hre.ethers.utils.parseEther("2");

      const Deployer = await ethers.getContractFactory("EngDeployer");

      await expect(Deployer.deploy(mintAmount, saleAmount, rate, closingTime)).to.be.revertedWith(
        "Mint amount should be higher than sale amount"
      );
    });
  });

  describe("sendFounds", function () {
    it("Should send the contract balance to the given address", async function () {
      const { deployer, owner, otherAccount } = await loadFixture(deployFixture);
      tx = {
        to: deployer.address,
        value: ethers.utils.parseEther('1')
      };
      await owner.sendTransaction(tx);

      const oldBalance = await getBalance(otherAccount.address, provider);
      await deployer.sendFunds(otherAccount.address);
      const newBalance = await getBalance(otherAccount.address, provider);

      expect(newBalance).to.equal(oldBalance.add(ethers.utils.parseEther('1')));
    });
  });

  describe("getFunds", function () {
    it("Should retrieve funds when sale ended", async function () {
      const { deployer, sale, closingTime, otherAccount } = await loadFixture(deployFixture);

      await sale.connect(otherAccount).buyTokens(otherAccount.address, {value: ethers.utils.parseEther('1')});
      await time.increaseTo(closingTime + 1);
      await deployer.getFunds()
      const contractBalance = await getBalance(deployer.address, provider);

      expect(contractBalance).to.equal(ethers.utils.parseEther('1'));
    });

    it("Should fail if sale not ended", async function () {
      const { deployer} = await loadFixture(deployFixture);

      await expect(deployer.getFunds()).to.be.revertedWith("Sale still ongoing");
    })
  });

});
