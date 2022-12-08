import { useCallback, useState } from "react"
import { etherscanBlockExplorers, useContractEvent, useContractRead, useNetwork, useProvider } from "wagmi"
import { getContractDescription, openIpfsLink } from "../../../helpers/eth"
import ButtonUI from "../../ui/button"
import CreateProjectModal from "../Create/CreateProjectModal"
import { ethers } from "ethers"
import { useEffect } from "react"
import { Grid, ListItem, Typography } from "@mui/material"

function DisplayProjects() {

    const provider = useProvider()
    const [open, setOpen] = useState(false)
    const { chain } = useNetwork()
    const { abi, addr } = getContractDescription('EnergyDao', chain.id)
    const [projects, setProjects] = useState([])


    // const fetchEvents = useCallback(async (contract) => {
    //     console.log("in");
    //     let eventFilter = contract.filters.ProjectRegistered()
    //     let events = await contract.queryFilter(eventFilter)
    //     console.log(await contract.getProject(events[0].args.id))
    //     setProjects([{id: "1"}])

    // }, [])

    // useEffect(() => {
    //     const contract = new ethers.Contract(addr, abi, provider)
    //     fetchEvents(contract)
    // }, [fetchEvents])

    const handleClick = () => {
        setOpen(true)
    }

    return (
        <>
            <ButtonUI variant="contained" onClick={handleClick}>
                Create project
            </ButtonUI>
            <CreateProjectModal open={open} setOpen={setOpen} />
            <Grid container >
                <Grid item xs={12}>
                    {/* {projects.map((project) => {
                        console.log("coucou");
                        return (<Typography key={project.id}>
                            TEST
                        </Typography>)
                    })} */}
                </Grid>
            </Grid>
        </>
    )
}

export default DisplayProjects