import PersonAddIcon from '@mui/icons-material/PersonAdd'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import { Box, Grid, Paper, Table, TableCell, TableHead, TableRow, Typography } from "@mui/material"
import Identicon from '@polkadot/react-identicon'
import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import { useContractEvent, useNetwork } from 'wagmi'
import { ProposalState, ProposalStateCodes } from '../../../../common/enums'
import { formatAddress, getContractDescription, getDeployBlock, getEthValue, openIpfsLink } from "../../../../common/helpers/eth"
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
    const [state, setState] = useState({
        craftsman: {}
    })

    const { state: { contracts: { EnergyDao, EnergyGovernor }, isCraftsman, blockNumber} } = useProfile()
    const [quorum, setQuorum] = useState()
    const { chain } = useNetwork()

    useContractEvent({
        address: EnergyDao.address,
        abi: getContractDescription('EnergyGovernor', chain.id).abi,
        eventName: 'VoteCast',
        listener() {
            console.log("in event");
        },
    })

    useContractEvent({
        address: EnergyDao.address,
        abi: getContractDescription('EnergyGovernor', chain.id).abi,
        eventName: 'ProposalCreated',
        listener() {
            console.log("in event");
        },
    })

    useEffect(() => {
        fetchCraftsmans(blockNumber)
        fetchQuorum(blockNumber)
    }, [state.craftsman])

    const handleClickCreate = () => {
        setOpenCreate(true)
    }

    const handleClickDetails = useCallback((row) => {
        setCraftsman(row)
        setOpenDisplay(true)
    }, [])

    const fetchVotes = useCallback(async () => {
        let eventFilter = EnergyGovernor.filters.ProposalCreated()
        let events = await EnergyGovernor.queryFilter(eventFilter, getDeployBlock(chain.id))

        let proposals = events.flatMap((event) => {
            const description = event.args.description.toLowerCase()
            if (description.toLowerCase().includes("validate")) {
                const addr = description.split(" ")[1]
                return event.args.description.includes("validate") ? [{ proposalId: event.args.proposalId, description: event.args.description, addr: addr }] : null
            }
            return []
        })

        const retrieveProposalStatus = (async (proposal) => {
            return EnergyGovernor.state(proposal.proposalId).then((state) => Object.assign({}, proposal, { state: state }))
        })

        const retrieveProposalVotes = ((proposal) => {
            return EnergyGovernor.proposalVotes(proposal.proposalId).then((votes) => Object.assign({}, proposal, { votes: votes }))
        })

        let promises = proposals.map((proposal) => retrieveProposalStatus(proposal))
        proposals = await Promise.all(promises)
        promises = proposals.map((proposal) => retrieveProposalVotes(proposal))
        proposals = await Promise.all(promises)

        return proposals

    }, [EnergyGovernor])

    // const fetchCraftsman = useCallback(async() => {
        
    // }, [])

    const fetchCraftsmans = useCallback(async (blockNumber) => {
        let eventFilter = EnergyDao.filters.CraftsmanRegistered()
        let events = await EnergyDao.queryFilter(eventFilter, getDeployBlock(chain.id))
        const addr = events.map((event) => {
            return event.args.craftsmanAddress
        })
        const retrieveCraftsman = (addr) => {
            return EnergyDao.craftsmans(addr).then((project) => {
                return Object.assign({}, project)
            })
        }

        let promises = addr.map((id) => retrieveCraftsman(id))
        const craftsmans = await Promise.all(promises)
        const proposals = await fetchVotes()
        const datas = leftJoin(craftsmans, proposals, "craftsmanAddr", "addr")

        const computeSnapshotState = async (data) => {
            if (data.proposalId !== undefined) {
                return EnergyGovernor.proposalSnapshot(data.proposalId).then((block) => {
                    let state = data.state
                    if (BigNumber.from(block).toNumber() === blockNumber) {
                        if (ProposalStateCodes[state] === ProposalState.Pending) {
                            state = ProposalState.Active
                        }
                    } else {
                        state = ProposalStateCodes[state]
                    }
                    return Object.assign({}, data, { state: state })
                })
            }
            else {
                return data
            }
        }
        promises = datas.map((data) => computeSnapshotState(data))
        let result = await Promise.all(promises)

        const computeDeadlineState = async (data) => {
            if (data.state !== undefined) {
                return EnergyGovernor.proposalDeadline(data.proposalId).then((block) => {
                    let state = data.state
                    if (BigNumber.from(block).toNumber() === blockNumber) {
                        if (state === ProposalState.Active) {
                            state = ProposalState.Finished
                        }
                    }
                    return Object.assign({}, data, { state: state, endBlock: block })
                })
            }
            else {
                return data
            }
        }
        promises = result.map((data) => computeDeadlineState(data))
        result = await Promise.all(promises)
        setCraftsmans(result)

    }, [fetchVotes, EnergyDao, EnergyGovernor])

    const setCraftsman = useCallback((row) => {
        setState((s) => ({ ...s, craftsman: row }))
    }, [])

    const fetchQuorum = useCallback(async (blockNumber) => {
        const quorum = await EnergyGovernor.quorum(blockNumber - 1)
        setQuorum(getEthValue(quorum))
    }, [EnergyGovernor])


    return (
        <>
            <Grid container pb={2}>
                <Grid item xs={12} m={1} display="flex" justifyContent={"space-between"}>
                    <Typography variant='h4'>Artisans</Typography>
                    {
                        !isCraftsman && <Typography variant="contained" color="action" onClick={handleClickCreate} alignSelf="center" >
                            <IconHover sx={{ width: "50px" }}><PersonAddIcon /></IconHover>
                        </Typography>
                    }
                </Grid>
            </Grid>

            <CreateCraftsmanModal open={openCreate} setOpen={setOpenCreate} fetchCraftsman={fetchCraftsmans} />
            {Object.keys(state.craftsman).length !== 0 && <CraftsmanDetailsModal open={openDisplay} setOpen={setOpenDisplay} craftsman={state.craftsman}
                setCraftsman={setCraftsman}
                quorum={quorum}
                fetchCraftsmans={fetchCraftsmans} />}
            <Grid container >
                <Grid item xs={12}>
                    <TableContainerUI component={Paper} sx={{ width: '100%', backgroundColor: theme.palette.background.grid, marginBottom: '10px', boxShadow: 'none' }}>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Artisan</TableCell>
                                    <TableCell align="right">Nom</TableCell>
                                    <TableCell align="right">Addresse</TableCell>
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
                                            <TableCell align="right"><VoteIcon isValidated={row.isValidated} state={row.state} /></TableCell>
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