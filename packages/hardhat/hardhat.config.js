require("@nomicfoundation/hardhat-toolbox");
require('hardhat-abi-exporter');


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    hardhat: {
      chainId: 1337
    }
  }
};
