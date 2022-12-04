const { ChainId, Fetcher, WETH, Route, Trade, TokenAmount, TradeType, Percent, Token } = require('@uniswap/sdk');
const { Pool, Position, nearestUsableTick } = require('@uniswap/v3-sdk')

const compiledUniswapFactory = require("@uniswap/v2-core/build/UniswapV2Factory.json");
const { Contract, BigNumber } = require("ethers")
const bn = require('bignumber.js')
bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 })
const { Network, Alchemy } = require('alchemy-sdk')

const artifacts = {
    UniswapV3Factory: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json"),
    UniswapV3Pool: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json"),
    NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
}

const POSITION_MANAGER_ADDRESS = '0xC36442b4a4522E871399CD717aBDD847Ab11FE88'
const FACTORY_ADDRESS = '0x1f98431c8ad98523631ae4a59f267346ea31f984'

module.exports = async (hre) => {
    // const [owner, signer2] = await ethers.getSigners();

    // const settings = {
    //     apiKey: "6YjiVQyhzAeVeJJRyh-6wArnOeTYGY6C",
    //     network: Network.ETH_MAINNET,
    // };
    
    // const alchemy = new Alchemy(settings);  
    // const latestBlock = await alchemy.core.getBlockNumber();


    // const tether = await (await hre.ethers.getContractFactory('Tether', owner)).deploy()
    // await tether.connect(owner).mint(signer2.address, hre.ethers.utils.parseEther('100000'))
    // const eedToken = await (await hre.ethers.getContractFactory('EEDToken')).deploy()

    // const tether_address = tether.address
    // const eng_address = eedToken.address
    // console.log('TETHER_ADDRESS =', tether_address)
    // console.log('ENG_TOKEN_ADDRESS =', eng_address)


    // // CREATE POOL
    // const factory = await hre.ethers.getContractAt(artifacts.UniswapV3Factory.abi, FACTORY_ADDRESS)
    // console.log(await factory.owner());

    // const fee = 500
    // await factory.connect(owner).createPool(tether_address, eng_address, fee)
    // const poolAddress = await factory.connect(owner).getPool(tether_address, eng_address, fee)
    // console.log("POOL_ADDRESS = ", poolAddress);

     // await tether.connect(signer2).approve(POSITION_MANAGER_ADDRESS, hre.ethers.utils.parseEther('1000'))
    // await eedToken.connect(signer2).approve(POSITION_MANAGER_ADDRESS, hre.ethers.utils.parseEther('1000'))

    // const poolContract = new Contract(poolAddress, artifacts.UniswapV3Pool.abi, provider)
    // console.log(poolContract);
    // console.log("finish");

}