const { ethers, network } = require("hardhat");
const artifact = require("../../front/src/contracts/contracts.json")


async function main() {
    const [owner, addr1] = await ethers.getSigners();
    const chainId = network.config.chainId

    const { addr } = artifact[chainId].contracts["EnergyDao"];
    let energyDao = await ethers.getContractFactory("EnergyDao");
    energyDao = energyDao.attach(addr);

    const {addr: addr2} = artifact[chainId].contracts["EnergyGovernor"];
    let energyGovernor = await ethers.getContractFactory("EnergyGovernor");
    energyGovernor = energyGovernor.attach(addr2);


    const hash = ethers.utils.id("validate 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65");

    await energyGovernor.execute([energyDao.address], [0], ["0x0757fc4200000000000000000000000015d34aaf54267db7d7c367839aaf71a00a2c6a65"], hash)

}

main()