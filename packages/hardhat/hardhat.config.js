require("@nomicfoundation/hardhat-toolbox")
require("@nomiclabs/hardhat-ethers")
require("solidity-coverage");
require('dotenv').config();
require("hardhat-gas-reporter");
require('solidity-docgen');

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
      url: `https://eth-goerli.alchemyapi.io/v2/${process.env.ALCHEMY_KEY}`,
      accounts: [process.env.GOERLI_PKEY],
      chainId: 5
    },
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.MNEMONIC}`,
      accounts: { mnemonic: process.env.MNEMONIC }
    }
  }
}
