const { ethers} = require("hardhat");
const { ONE_ETHER } = require("../test/helpers");

async function main() {
    const [owner, addr1] = await ethers.getSigners();

    const Sale = await ethers.getContractFactory("Sale");
    const sale = Sale.attach("0xB7A5bd0345EF1Cc5E66bf61BdeC17D2461fBd968");
    console.log(await sale.remainingTokens());
    await sale.buyTokens(owner.address, { value: ONE_ETHER })
    console.log(await sale.remainingTokens());

    console.log(owner.address);
    const Token = await ethers.getContractFactory("EEDToken");
    const token = Token.attach("0xa16E02E87b7454126E5E10d957A927A7F5B5d2be");
    console.log(await token.balanceOf(owner.address))

}
main()