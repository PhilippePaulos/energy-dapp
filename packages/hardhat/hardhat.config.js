require("@nomicfoundation/hardhat-toolbox")
require("@nomiclabs/hardhat-ethers")
require("solidity-coverage");
require('dotenv').config();
require("hardhat-gas-reporter");

const ALCHEMY_KEY = process.env.ALCHEMY_KEY === "undefined" ? process.env.ALCHEMY_KEY : ""
const MNEMONIC = process.env.mnemonic === "undefined" ? process.env.mnemonic : ""

module.exports = {
  solidity: "0.8.17",
  gasReporter: {
    enabled: true 
  },
  networks: {
    localhost: {
      chainId: 31337
    },
    hardhat: {
      // forking: {
      //   url: "https://eth-mainnet.alchemyapi.io/v2/" + process.env.ALCHEMY_KEY
      // }
    },
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_KEY}`,
      accounts: { mnemonic: MNEMONIC }
    },
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${MNEMONIC}`,
      accounts: { mnemonic: MNEMONIC }
    }
  }
}
