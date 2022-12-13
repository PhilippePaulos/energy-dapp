require("@nomicfoundation/hardhat-toolbox")
require("@nomiclabs/hardhat-ethers")
require("solidity-coverage");
require('dotenv').config();
require("hardhat-gas-reporter");
require('solidity-docgen');

const ALCHEMY_KEY = process.env.ALCHEMY_KEY // === "undefined" ? process.env.ALCHEMY_KEY : ""
const MNEMONIC = process.env.MNEMONIC //=== "undefined" ? process.env.MNEMONIC : ""
const GOERLI_PKEY = process.env.GOERLI_PKEY //=== "undefined" ? process.env.GOERLI_PKEY : ""

module.exports = {
  solidity: "0.8.17",
  gasReporter: {
    enabled: true 
  },
  docgen: {},
  defaultNetwork: "localhost",
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
      accounts: [GOERLI_PKEY]
    },
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${MNEMONIC}`,
      accounts: { mnemonic: MNEMONIC }
    }
  }
}
