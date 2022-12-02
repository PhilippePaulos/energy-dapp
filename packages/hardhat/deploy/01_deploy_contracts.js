const { network } = require("hardhat");
const {
  time,
  } = require("@nomicfoundation/hardhat-network-helpers");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();


  const mintAmount = hre.ethers.utils.parseEther("10000");
  const saleAmount = hre.ethers.utils.parseEther("100");
  const rate = 1;
  const ONE_DAY_IN_SECS = 24 * 60 * 60;
  const closingTime = (await time.latest()) + ONE_DAY_IN_SECS;
  

  const engDeployer = await deploy('EngDeployer', {
    contract: 'EngDeployer',
    from: deployer,
    log: true,
    args: [mintAmount, saleAmount, rate, closingTime],
  });

  console.log(engDeployer);

  // const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  // const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
  // const unlockTime = currentTimestampInSeconds + ONE_YEAR_IN_SECS;

  // const lockedAmount = hre.ethers.utils.parseEther("0");

  // const lock = await deploy('Lock', {
  //   contract: 'Lock',
  //   from: deployer,
  //   log: true,
  //   args: [unlockTime],
  //   value: lockedAmount
  // });

  // console.log(
  //   `Lock with 1 ETH and unlock timestamp ${unlockTime} deployed to ${lock.address}`
  // );
}
module.exports.tags = ["Lock"]
