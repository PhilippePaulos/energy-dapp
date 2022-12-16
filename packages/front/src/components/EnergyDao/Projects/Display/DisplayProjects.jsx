import AddBusinessIcon from '@mui/icons-material/AddBusiness'
import { Box, Grid, Paper, Table, TableCell, TableHead, TableRow, Typography } from "@mui/material"
import Identicon from '@polkadot/react-identicon'
import { useCallback, useEffect, useState } from "react"
import { useContractEvent, useNetwork } from "wagmi"
import { ProposalProjectStateCodes, SectorCodes } from "../../../../common/enums"
import { formatAddress, getContractDescription, getDeployBlock } from "../../../../common/helpers/eth"
import { useProfile } from '../../../../contexts/DaoContext'
import { theme } from "../../../theme"
import IconHover from '../../../ui/IconHover'
import TableBodyHover from "../../../ui/TableBodyHover"
import TableContainerUI from "../../../ui/TableContainer"
import CreateProjectModal from "../Create/CreateProjectModal"
import ProjectDetailsModal from "../Details/ProjectDetails"

function DisplayProjects() {

    const { state: { contracts: { EnergyDao } } } = useProfile()

    const [openCreate, setOpenCreate] = useState(false)
    const [openDetails, setOpenDetails] = useState(false)

    const { chain } = useNetwork()

    const [projects, setProjects] = useState([])
    const [project, setProject] = useState({})
    const [quotations, setQuotations] = useState([])

    useContractEvent({
        address: EnergyDao.address,
        abi: getContractDescription('EnergyDao', chain.id).abi,
        eventName: 'ProjectRegistered',
        listener() {
            fetchProjects()
            setOpenCreate(false)
        },
    })

    const updateProject = useCallback((p) => {
        setProject(p)
    }, [])
    
    const retrieveState = useCallback(async(project) => {
        return EnergyDao.getState(project.id).then((state) => {
            return {...project, state: ProposalProjectStateCodes[state]}
        })
    }, [EnergyDao])

    const fetchProjects = useCallback(async () => {
        let eventFilter = EnergyDao.filters.ProjectRegistered()
        let events = await EnergyDao.queryFilter(eventFilter, getDeployBlock(chain.id) - 1)
        const ids = events.map((event) => {
            return event.args.id
        })
        const retrieveProject = (projectId) => {
            return EnergyDao.projects(projectId).then((project) => {
                return Object.assign({}, project, { id: projectId })
            })
        }
        let promises = ids.map((id) => retrieveProject(id))
        let projects = await Promise.all(promises)
        console.log(projects);

        promises = projects.map((id) => retrieveState(id))
        projects = await Promise.all(promises)

        setProjects(projects)

    }, [EnergyDao, retrieveState])
    
    useEffect(() => {
        fetchProjects()
    }, [fetchProjects])


    const fetchQuotations = useCallback(async (projectId) => {
        let eventFilter = EnergyDao.filters.QuotationRegistred(projectId)
        let events = await EnergyDao.queryFilter(eventFilter, getDeployBlock(chain.id))
        const quotationsEvents = events.map((event) => {
            return event.args.craftsmanAddr
        })

        const retrieveQuotations = (addr) => {
            return EnergyDao.quotations(projectId, addr).then((quotation) => {
                return Object.assign({}, quotation, { id: addr, isWinner: false })
            })
        }

        const promises = quotationsEvents.map((addr) => retrieveQuotations(addr))
        const quotations = await Promise.all(promises)
        if (quotations.length > 0) {
            quotations.sort((a, b) => b.weightVote - a.weightVote)
            quotations[0].isWinner = true
        }

        setQuotations(quotations)
    }, [EnergyDao])

    const handleClickCreate = () => {
        setOpenCreate(true)
    }

    const handleClickDetails = useCallback((row) => {
        setProject(row)
        fetchQuotations(row.id)
        setOpenDetails(true)
    }, [fetchQuotations])

    return (
        <>
            <CreateProjectModal open={openCreate} setOpen={setOpenCreate} />
            {Object.keys(project).length !== 0 && 
                <ProjectDetailsModal 
                    open={openDetails} 
                    setOpen={setOpenDetails} 
                    project={project}
                    updateProject={updateProject}
                    fetchProjects={fetchProjects} 
                    fetchQuotations={fetchQuotations}
                    quotations={quotations} />}
            <Grid container pb={2}>
                <Grid item xs={12} m={1} display="flex" justifyContent={"space-between"}>
                    <Typography variant='h4'>Projets de rénovation énergétiques</Typography>
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
                                    <TableCell>Beneficiaire</TableCell>
                                    <TableCell align="right">Description</TableCell>
                                    <TableCell align="right">Secteur</TableCell>
                                    <TableCell align="right">Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBodyHover>
                                {projects.map((row) =>
                                (

                                    <TableRow
                                        key={row.id}
                                        onClick={() => handleClickDetails(row)}
                                    >
                                        <TableCell component="th" scope="row">
                                            <Box display="flex" gap="4px">
                                                <Identicon className="identicon" value={row.beneficiaryAddr} size={20} theme="ethereum" />
                                                <Typography>{formatAddress(row.beneficiaryAddr)}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right">{row.name}</TableCell>
                                        <TableCell align="right">{SectorCodes[row.sector]}</TableCell>
                                        <TableCell align="right">{row.state}</TableCell>
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