import { ethers } from "ethers"
import axios from 'axios';

function initContract(contract, networkId, provider) {
    const { abi, addr } = getContractDescription(contract, networkId)
    
    return new ethers.Contract(addr, abi, provider)
}

async function isMetaMaskConnected() {
    const { ethereum } = window;
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    return accounts && accounts.length > 0;
}

function getContractDescription(name, chainId) {
    const artifact = require("../../contracts/contracts.json")
    return artifact[chainId].contracts[name]
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

// TODO do pinata stuff at backend
const PINATA_KEY = "11ea9686eed0b13e98fd"
const PINATA_SECRET_KEY = "9952d45035dda0fb55a2d8650371865d4421d008da908e493097065788cdfd98"

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
    formData.append('pinataOptions', options);

    const resFile = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
        data: formData,
        headers: {
            'pinata_api_key': PINATA_KEY,
            'pinata_secret_api_key': PINATA_SECRET_KEY,
            "Content-Type": "multipart/form-data"
        },
    });
    return `ipfs://${resFile.data.IpfsHash}`;
}

function openIpfsLink(hash) {
    window.open("https://gateway.pinata.cloud/ipfs/QmQ3C2j5ZzHxbdBKPFj6G7s9szwig95iy4MXHMrKcN9cvD")
}

async function proposeVote(governor, instances, funcs, args, values, description) {
    let encodedFuncs = [];

    for (let i = 0; i < instances.length; i++) {
        encodedFuncs.push(instances[i].interface.encodeFunctionData(funcs[i], args[i]))
    }
    
    const addresses = instances.map((instance) => instance.address)
    await governor.propose(addresses, values, encodedFuncs, description)
}


export { getContractDescription, formatAddress, getEthValue, uploadIpfsFile, openIpfsLink, isAllDefined, isMetaMaskConnected, initContract, proposeVote}