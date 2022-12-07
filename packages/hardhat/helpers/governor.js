const { ethers, artifacts } = require("hardhat")

const Votes = {
    Against: 0,
    For: 1,
    Abstain: 2
}

async function proposeVote(governor, instances, funcs, args, values, description) {
    let encodedFuncs = [];

    for (let i = 0; i < instances.length; i++) {
        encodedFuncs.push(instances[i].interface.encodeFunctionData(funcs[i], args[i]))
    }
    
    const addresses = instances.map((instance) => instance.address)
    let tx = await governor.propose(addresses, values, encodedFuncs, description)
    let receipt = await tx.wait()
    const proposalId = receipt.events?.filter((x) => { return x.event == "ProposalCreated" })[0].args.proposalId

    const descriptionHash = ethers.utils.id(receipt.events?.filter((x) => { return x.event == "ProposalCreated" })[0].args.description)
    return { proposalId, descriptionHash, encodedFuncs }
}


module.exports = { Votes, proposeVote }