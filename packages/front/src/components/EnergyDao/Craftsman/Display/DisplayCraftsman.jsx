import PersonAddIcon from '@mui/icons-material/PersonAdd'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import { Box, Grid, Paper, Table, TableCell, TableHead, TableRow, Typography } from "@mui/material"
import Identicon from '@polkadot/react-identicon'
import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from "react"
import { formatAddress, openIpfsLink } from "../../../../common/helpers/eth"
import { leftJoin } from "../../../../common/helpers/utils.js"
import { useProfile } from "../../../../contexts/DaoContext"
import { theme } from "../../../theme"
import IconHover from "../../../ui/IconHover"
import TableBodyHover from "../../../ui/TableBodyHover"
import TableContainerUI from "../../../ui/TableContainer"
import { CreateCraftsmanModal } from "../../Craftsman/Create"
import CraftsmanDetailsModal from '../Details/CraftsmanDetailsModal'
import VoteIcon from '../VoteIcon/VoteIcon.jsx'

function DisplayCraftsman() {

    const [openCreate, setOpenCreate] = useState(false)
    const [openDisplay, setOpenDisplay] = useState(false)
    const [craftsmans, setCraftsmans] = useState([])
    const [craftsman, setCraftsman] = useState({})
    const { profile: { contracts: { EnergyDao, EnergyGovernor } } } = useProfile()

    const handleClickCreate = () => {
        setOpenCreate(true)
    }

    const handleClickDetails = useCallback((row) => {
        setCraftsman(row)
        setOpenDisplay(true)
    }, [])

    const fetchVotes = useCallback(async () => {
        let eventFilter = EnergyGovernor.filters.ProposalCreated()
        let events = await EnergyGovernor.queryFilter(eventFilter)

        let proposals = events.flatMap((event) => {
            const description = event.args.description.toLowerCase()
            if (description.toLowerCase().includes("validate")) {
                const addr = description.split(" ")[1]
                return event.args.description.includes("validate") ? [{proposalId: event.args.proposalId, description: event.args.description, addr: addr}]: null
            }
            return []
        })

        const retrieveProposalStatus = (async(proposal) => {          
            return EnergyGovernor.state(proposal.proposalId).then((state) => Object.assign({}, proposal, {state: state}))
        })

        const retrieveProposalVotes = ((proposal) => {
            return EnergyGovernor.proposalVotes(proposal.proposalId).then((votes) => Object.assign({}, proposal, {votes: votes}))
        })

        let promises = proposals.map((proposal) => retrieveProposalStatus(proposal))
        proposals = await Promise.all(promises)
        promises = proposals.map((proposal) => retrieveProposalVotes(proposal))
        proposals = await Promise.all(promises)

        return proposals
        
    }, [EnergyGovernor])

    const fetchCraftsman = useCallback(async () => {
        let eventFilter = EnergyDao.filters.CraftsmanRegistered()
        let events = await EnergyDao.queryFilter(eventFilter)
        const addr = events.map((event) => {
            return event.args.craftsmanAddress
        })
        const retrieveCraftsman = (addr) => {
            return EnergyDao.craftsmans(addr).then((project) => {
                return Object.assign({}, project)
            })
        }

        const promises = addr.map((id) => retrieveCraftsman(id))
        const craftsmans = await Promise.all(promises)
        const proposals = await fetchVotes()
        setCraftsmans(leftJoin(craftsmans, proposals, "craftsmanAddr", "addr"))

    }, [EnergyGovernor, fetchVotes])

    

    useEffect(() => {
        fetchCraftsman()
    }, [fetchCraftsman, fetchVotes])

    return (
        <>
            <Grid container pb={2}>
                <Grid item xs={12} m={1} display="flex" justifyContent={"space-between"}>
                    <Typography variant='h4'>Liste des artisans</Typography>
                    <Typography variant="contained" color="action" onClick={handleClickCreate} alignSelf="center" >
                        <IconHover sx={{width: "50px"}}><PersonAddIcon /></IconHover>
                    </Typography>
                </Grid>
            </Grid>

            <CreateCraftsmanModal open={openCreate} setOpen={setOpenCreate} fetchCraftsman={fetchCraftsman} />
            {Object.keys(craftsman).length !== 0 && <CraftsmanDetailsModal open={openDisplay} setOpen={setOpenDisplay} craftsman={craftsman} fetchCraftsman={fetchCraftsman}/>}
            <Grid container >
                <Grid item xs={12}>
                    <TableContainerUI component={Paper} sx={{ width: '100%', backgroundColor: theme.palette.background.grid, marginBottom: '10px', boxShadow: 'none' }}>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Artisan</TableCell>
                                    <TableCell align="right">Nom</TableCell>
                                    <TableCell align="right">Addresse </TableCell>
                                    <TableCell align="right">Certification </TableCell>
                                    <TableCell align="right">Projets validés </TableCell>
                                    <TableCell align="right">Validé par la DAO ? </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBodyHover>
                                {craftsmans.map((row) => {                                  
                                    return (
                                        <TableRow
                                            key={row.craftsmanAddr}
                                            onClick={() => handleClickDetails(row)}
                                        >
                                            <TableCell component="th" scope="row">
                                                <Box display="flex" alignItems="center" gap="4px">
                                                    <Identicon className="identicon" value={row.craftsmanAddr} size={20} theme="ethereum" />
                                                    <Typography>{formatAddress(row.craftsmanAddr)}</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="right">{row.name}</TableCell>
                                            <TableCell align="right">{row.addressCompany}</TableCell>
                                            <TableCell align="right"><IconHover><PictureAsPdfIcon onClick={() => openIpfsLink(row.certification)} /></IconHover></TableCell>
                                            <TableCell align="right">{BigNumber.from(row.nbProjectsValidated).toNumber()}</TableCell>
                                            <TableCell align="right"><VoteIcon isValidated={row.isValidated} state={row.state}/></TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBodyHover>
                        </Table>
                    </TableContainerUI>
                </Grid>
            </Grid>
        </>
    )
}

export default DisplayCraftsman