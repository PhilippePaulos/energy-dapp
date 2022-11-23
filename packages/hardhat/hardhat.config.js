require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers")
require('hardhat-deploy');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    localhost: {
      saveDeployments: true,
    }
  },
  namedAccounts: {
    deployer: {
      default: 0,
    }
  }
};
