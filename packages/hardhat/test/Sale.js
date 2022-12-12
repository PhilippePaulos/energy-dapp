const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers")
const { expect } = require("chai")
const { BigNumber } = require("ethers")
const { ethers } = require("hardhat")
const { ONE_ETHER, getBalance, BURN_ADDRESS } = require("../helpers/common")

const provider = ethers.provider

async function prepareData() {
  const ONE_DAY_IN_SECS = 24 * 60 * 60
  const closingTime = (await time.latest()) + ONE_DAY_IN_SECS
  const [owner, otherAccount] = await ethers.getSigners()
  const mintAmount = ethers.utils.parseEther('100')
  const allowanceAmount = ethers.utils.parseEther('10')
  const rate = 2
  const nbTokenToStake = ethers.utils.parseEther('75')
  return { closingTime, owner, otherAccount, mintAmount, allowanceAmount, rate, nbTokenToStake }
}

async function deployFixture() {
  const { closingTime, owner, otherAccount, mintAmount, allowanceAmount, rate, nbTokenToStake } = await prepareData()

  const EEDToken = await ethers.getContractFactory("EEDToken")
  const token = await EEDToken.deploy(mintAmount, nbTokenToStake)

  const Sale = await ethers.getContractFactory("Sale")

  const sale = await Sale.deploy(token.address, rate, closingTime, owner.address)

  await token.approve(sale.address, allowanceAmount)

  return { sale, owner, otherAccount, rate, closingTime, allowanceAmount }
}


describe("Sale", function () {

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { sale, owner } = await loadFixture(deployFixture)

      expect(await sale.owner()).to.equal(owner.address)
    })

    it("Should set the right closingTime", async function () {
      const { sale, closingTime } = await loadFixture(deployFixture)

      expect(await sale.closingTime()).to.equal(closingTime)
    })

    it("Should set the right rate", async function () {
      const { sale, rate } = await loadFixture(deployFixture)

      expect(await sale.rate()).to.equal(rate)
    })

    it("Should set the right remainingTokens", async function () {
      const { sale, allowanceAmount } = await loadFixture(deployFixture)

      expect(await sale.remainingTokens()).to.equal(allowanceAmount)
    })

    it("Should have 0 weiRaised", async function () {
      const { sale } = await loadFixture(deployFixture)

      expect(await sale.weiRaised()).to.equal('0')
    })

    it("Should fail if closingTime is lower than current block timestamp", async function () {
      const { owner, mintAmount, rate } = await prepareData()
      const pastTime = await time.latest() - 1
      const nbTokenToStake = ethers.utils.parseEther('75')
      const EEDToken = await ethers.getContractFactory("EEDToken")
      const token = await EEDToken.deploy(mintAmount, nbTokenToStake)

      const Sale = await ethers.getContractFactory("Sale")
      await expect(Sale.deploy(token.address, rate, pastTime, owner.address)).to.be.revertedWith("Closing time should be in the future")

    })

    it("Should fail if rate equals 0", async function () {
      const { owner, mintAmount, closingTime } = await prepareData()
      const rate = 0
      const nbTokenToStake = ethers.utils.parseEther('75')
      const EEDToken = await ethers.getContractFactory("EEDToken")
      const token = await EEDToken.deploy(mintAmount, nbTokenToStake)

      const Sale = await ethers.getContractFactory("Sale")
      await expect(Sale.deploy(token.address, rate, closingTime, owner.address)).to.be.reverted
    })

    it("Should fail if token address is 0", async function () {
      const { owner, rate, closingTime } = await prepareData()

      const Sale = await ethers.getContractFactory("Sale")
      await expect(Sale.deploy(BURN_ADDRESS, rate, closingTime, owner.address)).to.be.reverted
    })

    it("Should fail if token wallet is 0", async function () {
      const { mintAmount, rate, closingTime } = await prepareData()
      const nbTokenToStake = ethers.utils.parseEther('75')
      const EEDToken = await ethers.getContractFactory("EEDToken")
      const token = await EEDToken.deploy(mintAmount, nbTokenToStake)

      const Sale = await ethers.getContractFactory("Sale")
      await expect(Sale.deploy(token.address, rate, closingTime, BURN_ADDRESS)).to.be.reverted
    })

  })

  describe("buyTokens", function () {

    it("Should buy the correct amount of tokens", async function () {

      const { sale, owner, allowanceAmount } = await loadFixture(deployFixture)
      const investAmount = ONE_ETHER
      await sale.buyTokens(owner.address, { value: investAmount })
      const saleBalance = await getBalance(sale.address, provider)
      const rate = await sale.rate()

      const expectTokens = investAmount.mul(BigNumber.from(rate))

      expect(await sale.remainingTokens()).to.equal(allowanceAmount.sub(expectTokens))
      expect(saleBalance).to.equal(investAmount)

    })

    it("Should compute weiRaised correctly", async function () {
      const { owner, sale } = await loadFixture(deployFixture)

      const investAmount1 = ONE_ETHER
      const investAmount2 = ethers.utils.parseEther('2')

      await sale.buyTokens(owner.address, { value: investAmount1 })
      await sale.buyTokens(owner.address, { value: investAmount2 })

      const expectedAmount = investAmount1.add(investAmount2)

      expect(await sale.weiRaised()).to.equal(expectedAmount)

    })


    it("Should emit TokenPurchase event", async function () {

      const { sale, owner } = await loadFixture(deployFixture)
      const investAmount = ONE_ETHER
      const rate = await sale.rate()

      const expectedTokens = rate.mul(investAmount)
      const receipt = sale.buyTokens(owner.address, { value: investAmount })
      await expect(receipt).to.emit(sale, "TokenPurchase").withArgs(owner.address, owner.address, investAmount, expectedTokens)

    })

    it("Should fail if beneficiary is burn address", async function () {

      const { sale } = await loadFixture(deployFixture)
      const investAmount = ONE_ETHER
      await expect(sale.buyTokens(BURN_ADDRESS, { value: investAmount })).to.be.reverted

    })

    it("Should fail if sending 0 wei", async function () {

      const { sale, owner } = await loadFixture(deployFixture)
      const investAmount = ethers.utils.parseEther('0')
      await expect(sale.buyTokens(owner.address, { value: investAmount })).to.be.reverted

    })

    it("Should fail if allowance exceeded", async function () {

      const { sale, owner } = await loadFixture(deployFixture)

      const investAmount = ethers.utils.parseEther('5')
      await sale.buyTokens(owner.address, { value: investAmount })

      await expect(sale.buyTokens(owner.address, { value: investAmount })).to.be.revertedWith('ERC20: insufficient allowance')

    })

    it("Should fail if sale is not open", async function () {

      const { sale, owner, closingTime } = await loadFixture(deployFixture)

      const investAmount = ONE_ETHER
      await time.increaseTo(closingTime + 1)

      await expect(sale.buyTokens(owner.address, { value: investAmount })).to.be.reverted

    })

  })

  describe("high-level purchase", function () {

    it("should purchase tokens when sending value", async function () {

      const { owner, sale } = await loadFixture(deployFixture)
      const tx = {
        to: sale.address,
        value: ONE_ETHER
      };
      await owner.sendTransaction(tx);
      const balance = await provider.getBalance(sale.address);
      expect(balance).to.be.equal(ONE_ETHER)

    })
  })

  describe("remainingTokens", function () {

    it("Should compute remaining tokens correctly", async function () {

      const { sale, owner, allowanceAmount } = await loadFixture(deployFixture)
      expect(await sale.remainingTokens()).to.equal(ethers.utils.parseEther('10'))

      const investAmount = ONE_ETHER
      await sale.buyTokens(owner.address, { value: investAmount })

      const rate = await sale.rate()
      const expectTokens = investAmount.mul(BigNumber.from(rate))

      expect(await sale.remainingTokens()).to.equal(allowanceAmount.sub(expectTokens))

    })
  })

  describe("withdrawFunds", function () {

    it("Should fail if not owner", async function () {

      const { sale, otherAccount } = await loadFixture(deployFixture)

      await expect(sale.connect(otherAccount).withdrawFunds()).to.be.revertedWith("Ownable: caller is not the owner")

    })

    it("Should fail if sale is still ongoing", async function () {

      const { sale } = await loadFixture(deployFixture)

      await expect(sale.withdrawFunds()).to.be.revertedWith("Sale still ongoing")

    })

    it("Should withdraw if sale finished", async function () {

      const { owner, sale, closingTime, otherAccount } = await loadFixture(deployFixture)


      await sale.connect(otherAccount).buyTokens(owner.address, { value: ONE_ETHER })

      await time.increaseTo(closingTime + 1)

      const previousBalance = await provider.getBalance(owner.address)
      const trans = await sale.withdrawFunds()
      const receipt = await trans.wait()
      const gasCostForTxn = receipt.gasUsed.mul(receipt.effectiveGasPrice)
      const newBalance = await provider.getBalance(owner.address)
      const expectedReceiveAmount = newBalance.sub(previousBalance).add(gasCostForTxn);

      expect(expectedReceiveAmount).to.be.equal(ONE_ETHER)

    })
  })

  describe("hasClosed", function () {

    it("Should return false if sale is ongoing", async function () {

      const { sale } = await loadFixture(deployFixture)

      expect(await sale.hasClosed()).to.be.false

    })

    it("Should return true if sale is finished", async function () {

      const { sale, closingTime } = await loadFixture(deployFixture)

      await time.increaseTo(closingTime + 1)

      expect(await sale.hasClosed()).to.be.true

    })
  })

    it("Should get rate", async function () {
        const {sale} = await loadFixture(deployFixture);
        const rate = await sale.getRate();
        await expect(rate).to.equal(2);
    });


})
