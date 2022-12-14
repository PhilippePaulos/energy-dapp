import { ethers } from "ethers"
import axios from 'axios'
const artifact = require("../../contracts/contracts.json")


function initContract(contract, networkId, provider) {
    const { abi, addr } = getContractDescription(contract, networkId)
    
    return new ethers.Contract(addr, abi, provider)
}

async function isMetaMaskConnected() {
    const { ethereum } = window
    const accounts = await ethereum.request({ method: 'eth_accounts' })
    return accounts && accounts.length > 0
}

function getContractDescription(name, chainId) {
    return artifact[chainId].contracts[name]
}

function getDeployBlock(chainId) {
    return artifact[chainId].block
}

function formatAddress(address) {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4, address.length)}`
}

function getEthValue(value) {
    return ethers.utils.formatEther(value)
}

function isAllDefined(values) {
    return Object.values(values).every(e => e !== null && e !== "")
}

async function uploadIpfsFile(file) {
    const formData = new FormData()
    formData.append("file", file)

    const metadata = JSON.stringify({
        name: file.name,
        type: "certification"
    })
    formData.append('pinataMetadata', metadata)

    const options = JSON.stringify({
        cidVersion: 0,
    })
    formData.append('pinataOptions', options)

    const resFile = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
        data: formData,
        headers: {
            'pinata_api_key': process.env.REACT_APP_PINATA_KEY,
            'pinata_secret_api_key': process.env.REACT_APP_PINATA_SECRET_KEY,
            "Content-Type": "multipart/form-data"
        },
    })
    return `ipfs://${resFile.data.IpfsHash}`
}

function openIpfsLink(hash) {
    window.open(`https://gateway.pinata.cloud/${hash}`)
}

function formatIpfsLink(link) {
    return link.replace('ipfs://', 'ipfs/')
}

async function proposeVote(governor, instances, funcs, args, values, description) {
    let encodedFuncs = []

    for (let i = 0; i < instances.length; i++) {
        encodedFuncs.push(instances[i].interface.encodeFunctionData(funcs[i], args[i]))
    }
    
    const addresses = instances.map((instance) => instance.address)
    await governor.propose(addresses, values, encodedFuncs, description)
}

export { getContractDescription, getDeployBlock, formatAddress, getEthValue, uploadIpfsFile, openIpfsLink, isAllDefined, isMetaMaskConnected, initContract, formatIpfsLink, proposeVote}