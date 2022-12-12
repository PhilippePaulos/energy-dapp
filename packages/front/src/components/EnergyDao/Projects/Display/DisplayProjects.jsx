import AddBusinessIcon from '@mui/icons-material/AddBusiness'
import { Box, Grid, Paper, Table, TableCell, TableHead, TableRow, Typography } from "@mui/material"
import Identicon from '@polkadot/react-identicon'
import { useCallback, useEffect, useState } from "react"
import { useContractEvent, useNetwork } from "wagmi"
import { ProposalProjectStateCodes, SectorCodes } from "../../../../common/enums"
import { formatAddress, getContractDescription } from "../../../../common/helpers/eth"
import { useProfile } from '../../../../contexts/DaoContext'
import { theme } from "../../../theme"
import IconHover from '../../../ui/IconHover'
import TableBodyHover from "../../../ui/TableBodyHover"
import TableContainerUI from "../../../ui/TableContainer"
import CreateProjectModal from "../Create/CreateProjectModal"
import ProjectDetailsModal from "../Details/ProjectDetails"

function DisplayProjects() {

    const { profile: { contracts: { EnergyDao } } } = useProfile()
    const [openCreate, setOpenCreate] = useState(false)
    const [openDetails, setOpenDetails] = useState(false)
    const { chain } = useNetwork()
    const [projects, setProjects] = useState([])
    const [project, setProject] = useState({})
    const [quotations, setQuotations] = useState([])

    useContractEvent({
        address: EnergyDao.address,
        abi: getContractDescription('EnergyDao', chain.id).abi,
        eventName: 'QuotationRegistred',
        listener() {
            fetchEvents(EnergyDao)
        },
    })

    useContractEvent({
        address: EnergyDao.address,
        abi: getContractDescription('EnergyDao', chain.id).abi,
        eventName: 'ProjectRegistered',
        listener() {
            fetchEvents(EnergyDao)
            setOpenCreate(false)
        },
    })

    useEffect(() => {
        fetchEvents(EnergyDao)
    }, [])

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
        const retrieveState = (project) => {
            return contract.getState(project.id).then((state) => {
                return Object.assign({}, { state: ProposalProjectStateCodes[state] }, project)
            })
        }
        let promises = ids.map((id) => retrieveProject(id))
        let projects = await Promise.all(promises)
        console.log(await contract.projects(0));

        promises = projects.map((id) => retrieveState(id))
        projects = await Promise.all(promises)

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

        let promises = quotationsEvents.map((addr) => retrieveQuotations(addr))
        let quotations = await Promise.all(promises)

        setQuotations(quotations)
    }, [])

    const handleClickCreate = () => {
        setOpenCreate(true)
    }

    const handleClickDetails = useCallback((row) => {
        setProject(row)
        fetchQuotationEvents(EnergyDao, row.id)
        setOpenDetails(true)
    }, [fetchQuotationEvents])

    return (
        <>
            <CreateProjectModal open={openCreate} setOpen={setOpenCreate} />
            {Object.keys(project).length !== 0 && <ProjectDetailsModal open={openDetails} setOpen={setOpenDetails} project={project} quotations={quotations} />}
            <Grid container pb={2}>
                <Grid item xs={12} m={1} display="flex" justifyContent={"space-between"}>
                    <Typography variant='h4'>Liste des projets de rénovation énergétiques</Typography>
                    <Typography variant="contained" color="action" onClick={handleClickCreate} alignSelf="center" >
                        <IconHover sx={{ width: "50px" }}><AddBusinessIcon /></IconHover>
                    </Typography>
                </Grid>
            </Grid>
            <Grid container mb={10}>
                <Grid item xs={12}>
                    <TableContainerUI component={Paper} sx={{ width: '100%', backgroundColor: theme.palette.background.grid, marginBottom: '10px', boxShadow: 'none' }}>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell >Beneficiaire</TableCell>
                                    <TableCell align="right">Secteur</TableCell>
                                    <TableCell align="right">Status</TableCell>
                                    <TableCell align="right">Votes</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBodyHover>
                                {projects.map((row) =>
                                (

                                    <TableRow
                                        key={row.id}
                                        onClick={() => handleClickDetails(row)}
                                    >
                                        <TableCell >
                                            <Box display="flex" gap="4px">
                                                <Identicon className="identicon" value={row.beneficiaryAddr} size={20} theme="ethereum" />
                                                <Typography>{formatAddress(row.beneficiaryAddr)}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell component="th" scope="row">{row.name}</TableCell>
                                        <TableCell align="right">{SectorCodes[row.sector]}</TableCell>
                                        <TableCell align="right">{row.state}</TableCell>
                                        {/* <TableCell align="right">{ethers.utils.formatEther(row.weightVote)}</TableCell> */}
                                    </TableRow>
                                ))}
                            </TableBodyHover>
                        </Table>
                    </TableContainerUI>
                </Grid>
            </Grid>
        </>
    )
}

export default DisplayProjects