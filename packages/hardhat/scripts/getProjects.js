const { ethers, network } = require("hardhat");
const { ONE_ETHER } = require("../test/helpers");
const artifact = require("../../front/src/contracts/contracts.json")


async function main() {
    const [owner, addr1] = await ethers.getSigners();
    const chainId = network.config.chainId

    const { addr } = artifact[chainId].contracts["EnergyDao"];
    let energyDao = await ethers.getContractFactory("EnergyDao");
    energyDao = energyDao.attach(addr);
    console.log(await energyDao.getProject(0));
}

main()