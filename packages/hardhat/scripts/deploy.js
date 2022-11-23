const hre = require("hardhat");
const path = require("path");

async function main() {
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
  const unlockTime = currentTimestampInSeconds + ONE_YEAR_IN_SECS;

  const lockedAmount = hre.ethers.utils.parseEther("1");

  const Lock = await hre.ethers.getContractFactory("Lock");

  const [deployer] = await hre.ethers.getSigners();
  console.log(
      "Deploying the contracts with the account:",
      await deployer.getAddress()
  );

  const lock = await Lock.deploy(unlockTime, { value: lockedAmount });

  await lock.deployed();

  console.log(
    `Lock with 1 ETH and unlock timestamp ${unlockTime} deployed to ${lock.address}`
  );


  saveFrontendFiles("Lock", lock);

}

function saveFrontendFiles(contractName, deployedContract) {
  const fs = require("fs");
  const contractsDir = path.join(__dirname, "..", "..", "front", "src", "contracts");
  console.log(`Write ABI into ${contractsDir}`)
  const chainId = hre.network.config.chainId

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
      path.join(contractsDir, "contract-addresses.json"),
      JSON.stringify({[contractName]: {[hre.network.config.chainId]: deployedContract.address}}, undefined, 2)
  );

  const artifact = artifacts.readArtifactSync(contractName);

  fs.writeFileSync(
      path.join(contractsDir, `${contractName}.json`),
      JSON.stringify(artifact, null, 2)
  );
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
