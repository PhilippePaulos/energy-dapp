import { useState } from "react"
import { etherscanBlockExplorers, useContractEvent, useContractRead, useNetwork, useProvider } from "wagmi"
import { getContractDescription, openIpfsLink } from "../../../helpers/eth"
import ButtonUI from "../../ui/button"
import CreateProjectModal from "../Create/CreateProjectModal"
import {ethers} from "ethers"
import { useEffect } from "react"

function DisplayProjects() {

    const provider = useProvider()
    const [open, setOpen] = useState(false)

    const { chain } = useNetwork()

    const { abi, addr } = getContractDescription('EnergyDao', chain.id)

    // const { data } = useContractRead({
    //     address: addr,
    //     abi: abi,
    //     functionName: "getProject",
    //     args: [2],
    //     watch: true
    // })


    const fetchEvents = async () => {
        const contract = new ethers.Contract(addr, abi, provider)
        let eventFilter = contract.filters.ProjectRegistered()
        let events = await contract.queryFilter(eventFilter)
        console.log(events);
    }

    useEffect(() => {
        fetchEvents()
    })

    useContractEvent({
        address: addr,
        abi: abi,
        eventName: 'ProjectRegistered',
        listener(id, node) {
            console.log(id);
            console.log(node)
        },
    })

    const handleClick = () => {
        setOpen(true)
    }

    return (
        <>
            <ButtonUI variant="contained" onClick={handleClick}>
                Create project
            </ButtonUI>
            <CreateProjectModal open={open} setOpen={setOpen} />
        </>
    )
}

export default DisplayProjects