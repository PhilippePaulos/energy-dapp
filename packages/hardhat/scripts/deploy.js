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

  console.log("Write files to front")
  saveFrontendFiles(lock);

}

function saveFrontendFiles(lock) {
  const fs = require("fs");
  const contractsDir = path.join(__dirname, "..", "..", "front", "src", "contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
      path.join(contractsDir, "contract-address.json"),
      JSON.stringify({ Lock: lock.address }, undefined, 2)
  );

  const LockArtifact = artifacts.readArtifactSync("Lock");

  fs.writeFileSync(
      path.join(contractsDir, "Lock.json"),
      JSON.stringify(LockArtifact, null, 2)
  );
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
