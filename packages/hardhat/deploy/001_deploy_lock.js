const { network } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();


  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
  const unlockTime = currentTimestampInSeconds + ONE_YEAR_IN_SECS;

  const lockedAmount = hre.ethers.utils.parseEther("1");

  const lock = await deploy('Lock', {
    contract: 'Lock',
    from: deployer,
    log: true,
    args: [unlockTime],
    value: lockedAmount
  });

  console.log(
    `Lock with 1 ETH and unlock timestamp ${unlockTime} deployed to ${lock.address}`
  );

}
module.exports.tags = ["Lock"]
