import { useCallback, useState } from "react"
import { chainId, etherscanBlockExplorers, useContractEvent, useContractRead, useNetwork, useProvider } from "wagmi"
import { getContractDescription, initContract, openIpfsLink } from "../../../common/helpers/eth"
import ButtonUI from "../../ui/button"
import CreateProjectModal from "../Create/CreateProjectModal"
import { ethers } from "ethers"
import { useEffect } from "react"
import { Box, Grid, ListItem, Paper, Table, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"
import { useProfile } from "../../../contexts/DaoContext"
import { theme } from "../../theme"
import TableBody from "../../ui/TableBody"
import TableBodyUI from "../../ui/TableBody"
import { SectorCodes, StatusCodes } from "../../../common/enums"
import ProjectDetailsModal from "../Details/ProjectDetails"
import TableContainerUI from "../../ui/TableContainer"
import AddBusinessIcon from '@mui/icons-material/AddBusiness';

function DisplayProjects() {

    const provider = useProvider()
    const [openCreate, setOpenCreate] = useState(false)
    const [openDetails, setOpenDetails] = useState(false)
    const { chain } = useNetwork()
    const [projects, setProjects] = useState([])
    const [project, setProject] = useState({})
    const [quotations, setQuotations] = useState([])

    const contract = initContract("EnergyDao", chain.id, provider)

    const fetchEvents = useCallback(async (contract) => {
        let eventFilter = contract.filters.ProjectRegistered()
        let events = await contract.queryFilter(eventFilter)
        const ids = events.map((event) => {
            return event.args.id
        })
        const retrieveProject = (projectId) => {
            return contract.projects(projectId).then((project) => {
                return Object.assign({}, project, { id: projectId })
            })
        }
        const promises = ids.map((id) => retrieveProject(id))
        const projects = await Promise.all(promises)
        setProjects(projects)
    }, [])

    const fetchQuotationEvents = useCallback(async (contract, projectId) => {
        let eventFilter = contract.filters.QuotationRegistred(projectId)
        let events = await contract.queryFilter(eventFilter)
        const quotationsEvents = events.map((event) => {
            return event.args.craftsmanAddr
        })

        const retrieveQuotations = (addr) => {
            return contract.quotations(projectId, addr).then((quotation) => {
                return Object.assign({}, quotation, { id: addr })
            })
        }

        const promises = quotationsEvents.map((addr) => retrieveQuotations(addr))
        const quotations = await Promise.all(promises)

        setQuotations(quotations)
    }, [])

    useEffect(() => {
        fetchEvents(contract)
    }, [fetchEvents])

    const handleClickCreate = () => {
        setOpenCreate(true)
    }

    const handleClickDetails = useCallback((row) => {
        setProject(row)
        fetchQuotationEvents(contract, row.id)
        setOpenDetails(true)
    }, [])

    return (
        <>
            <Grid container >
                <Grid item xs={12} textAlign="right" mb={1}>
                    <ButtonUI variant="contained" color="action" onClick={handleClickCreate} >
                        <AddBusinessIcon />
                    </ButtonUI>
                </Grid>
            </Grid>

            <CreateProjectModal open={openCreate} setOpen={setOpenCreate} />
            {Object.keys(project).length !== 0 && <ProjectDetailsModal open={openDetails} setOpen={setOpenDetails} project={project} quotations={quotations} />}
            <Grid container >
                <Grid item xs={12}>
                    <TableContainerUI component={Paper} sx={{ width: '100%', backgroundColor: theme.palette.background.grid, marginBottom: '10px', boxShadow: 'none' }}>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Projet</TableCell>
                                    <TableCell align="right">Secteur</TableCell>
                                    <TableCell align="right">Status</TableCell>
                                    <TableCell align="right">Beneficiaire</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBodyUI>
                                {projects.map((row) =>
                                (

                                    <TableRow
                                        key={row.id}
                                        onClick={() => handleClickDetails(row)}
                                    >
                                        <TableCell component="th" scope="row">{row.name}</TableCell>
                                        <TableCell align="right">{SectorCodes[row.sector]}</TableCell>
                                        <TableCell align="right">{StatusCodes[row.status]}</TableCell>
                                        <TableCell align="right">{row.beneficiaryAddr}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBodyUI>
                        </Table>
                    </TableContainerUI>
                </Grid>
            </Grid>
        </>
    )
}

export default DisplayProjects