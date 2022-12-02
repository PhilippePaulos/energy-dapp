const { ethers } = require("hardhat");

const ONE_ETHER = ethers.utils.parseEther('1')
const BURN_ADDRESS = "0x0000000000000000000000000000000000000000"

async function getBalance(address, provider) {
    return provider.getBalance(address)
}

module.exports = {ONE_ETHER, BURN_ADDRESS, getBalance}