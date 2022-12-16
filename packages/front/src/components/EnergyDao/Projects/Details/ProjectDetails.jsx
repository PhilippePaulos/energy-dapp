
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import { Box, Grid, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material"
import Identicon from '@polkadot/react-identicon'
import { BigNumber } from "ethers"
import { formatEther } from 'ethers/lib/utils.js'
import { useCallback, useEffect, useState } from 'react'
import { useContractEvent, useNetwork, useProvider, useSigner } from 'wagmi'
import { ProposalProjectStateCodes, ProposalProjectStates } from "../../../../common/enums"
import { formatAddress, getContractDescription, openIpfsLink } from "../../../../common/helpers/eth"
import { useProfile } from '../../../../contexts/DaoContext'
import SnackbarUI from '../../../SnackbarUI/SnackbarUI'
import ButtonUI from '../../../ui/button'
import CenteredModal from "../../../ui/CenteredModal"
import CircularIndeterminate from '../../../ui/CircularIndeterminate'
import IconHover from '../../../ui/IconHover'
import PdfPicture from "../../../ui/PdfPicture"
import RoundedGrid from "../../../ui/RoundedGrid"
import TableContainerUI from "../../../ui/TableContainer"
import CreateQuotationModal from '../Create/CreateQuotationModal'
import DisplayStateIcon from './DisplayStateIcon'

function DisplayVoteBlock({ state, voteEnd, voteStart, voteExpire, blockNumber }) {

    const currentDisplay =
        <Box className="line">
            <Typography variant="b">Current block</Typography>
            <Typography>{blockNumber}</Typography>
        </Box>

    if (state === ProposalProjectStates.Pending) {
        return (
            <>
                {currentDisplay}
                <Box className="line">
                    <Typography variant="b">Vote block start</Typography>
                    <Typography>{BigNumber.from(voteStart).toNumber()}</Typography>
                </Box>
            </>
        )
    } else if (state === ProposalProjectStates.Active) {
        return (
            <>
                {currentDisplay}
                <Box className="line">
                    <Typography variant="b">Vote block ends</Typography>
                    <Typography>{BigNumber.from(voteEnd).toNumber()}</Typography>
                </Box>
            </>

        )
    } else if (state === ProposalProjectStates.Ended) {
        return (
            <>
                {currentDisplay}
                <Box className="line">
                    <Typography variant="b">Expiration block</Typography>
                    <Typography>{BigNumber.from(voteExpire).toNumber()}</Typography>
                </Box>
            </>

        )
    }
}

function ProjectDetailsModal(props) {

    const { project, updateProject, quotations, open, setOpen, fetchQuotations, fetchProjects } = props

    const { state: { contracts: { EnergyDao }, votePower, blockNumber }, state: profile } = useProfile()

    const [state, setState] = useState({
        openQuotation: false,
        hasVoted: false,
        castVote: false,
        isLoading: false,
        displayCreation: false
    })

    const { data: signer } = useSigner()
    const provider = useProvider()
    const { chain } = useNetwork()

    const [notif, setNotif] = useState({
        open: false,
        msg: ""
    })

    const isBeneficiary = project.beneficiaryAddr === profile.address

    const setOpenNotif = (b) => {
        setNotif({ ...notif, open: b })
    }

    useContractEvent({
        address: EnergyDao.address,
        abi: getContractDescription('EnergyDao', chain.id).abi,
        eventName: 'Voted',
        listener() {
            fetchData()
            setNotif({ msg: "Vote enregistré!", open: true })
        },
    })

    useContractEvent({
        address: EnergyDao.address,
        abi: getContractDescription('EnergyDao', chain.id).abi,
        eventName: 'QuotationAccepted',
        listener() {
            fetchData()
            setNotif({ msg: "Devis accepté!", open: true })
        },
    })

    useContractEvent({
        address: EnergyDao.address,
        abi: getContractDescription('EnergyDao', chain.id).abi,
        eventName: 'QuotationRejected',
        listener() {
            fetchData()
            setNotif({ msg: "Devis refusé!", open: true })
        },
    })

    useContractEvent({
        address: EnergyDao.address,
        abi: getContractDescription('EnergyDao', chain.id).abi,
        eventName: 'QuotationRegistred',
        listener() {
            fetchData()
            setNotif({ msg: "Devis enregistré!", open: true })
        },
    })

    const fetchCraftsman = useCallback(async () => {
        const quotation = await EnergyDao.quotations(project.id, profile.address)

        if (project.beneficiaryAddr !== profile.address && profile.isValidated && profile.address !== quotation.craftsmanAddr
            && project.voteInfo.voteStart > BigNumber.from(blockNumber)) {
            setState((s) => ({ ...s, displayCreation: true }))
        }
        else {
            setState((s) => ({ ...s, displayCreation: false }))
        }
    }, [provider, EnergyDao, profile, project.id, project.beneficiaryAddr, project.voteInfo.voteStart])

    const fetchUpdate = useCallback(async () => {
        const hasVoted = await EnergyDao.hasVoted(project.id, profile.address)

        const state = await EnergyDao.getState(project.id).then((s) => ProposalProjectStateCodes[s])
        const p = project
        p.state = state
        fetchQuotations(project.id)
        updateProject(p)

        const castVote = !hasVoted && p.state === ProposalProjectStates.Active
        setState((s) => ({ ...s, castVote: castVote }))

    }, [EnergyDao, profile, project, fetchQuotations, updateProject])

    const fetchData = useCallback(() => {
        fetchCraftsman()
        fetchUpdate()
    }, [fetchCraftsman, fetchUpdate])

    useEffect(() => {
        fetchData()
    }, [fetchData, profile, project])

    const handleClick = async (addr) => {
        setState((s) => ({ ...s, isLoading: true }))
        await EnergyDao.connect(signer).castVote(project.id, profile.address, addr)
        setState((s) => ({ ...s, isLoading: false }))
    }

    const handleClose = () => {
        fetchProjects()
        setOpen(false)
    }

    const handleDecision = async (accept) => {
        setState((s) => ({ ...s, isLoading: true }))
        if (accept) {
            await EnergyDao.connect(signer).accept(project.id)
        }
        else {
            await EnergyDao.connect(signer).reject(project.id)
        }
        setState((s) => ({ ...s, isLoading: false }))
    }

    const handleCreate = () => {
        setOpenQuotation(true)
    }

    const setOpenQuotation = (bool) => {
        setState((s) => ({ ...state, openQuotation: bool }))
    }

    return (
        <>
            <CreateQuotationModal open={state.openQuotation} setOpen={setOpenQuotation} project={project} fetchCraftsman={fetchCraftsman} />
            <CenteredModal
                open={open}
                onClose={() => handleClose()}>
                <Box
                    className="bg-gray-900"
                    p={2}
                    borderRadius={2}>
                    <Grid container mb={5} >
                        <RoundedGrid sx={{ width: "inherit" }} className="bg-gray-900">
                            <Box className="boxHeader">
                                <Typography variant="h6">Informations générales</Typography>
                            </Box>
                            <Box className="content">
                                <Box className="line">
                                    <Typography variant="b">Nom</Typography>
                                    <Typography>{project.name}</Typography>
                                </Box>
                                <Box className="line">
                                    <Typography variant="b">Bénéficiaire</Typography>
                                    <Box display="flex" alignItems="center" gap="4px">
                                        <Identicon className="identicon" value={project.beneficiaryAddr} size={20} theme="ethereum" />
                                        <Typography>{project.beneficiaryAddr}</Typography>
                                    </Box>
                                </Box>
                                <Box className="line">
                                    <Typography variant="b">Description</Typography>
                                    <Typography>{project.description}</Typography>
                                </Box>
                                <Box className="line">
                                    <Typography variant="b">Département</Typography>
                                    <Typography>{project.department}</Typography>
                                </Box>
                                <Box className="line">
                                    <Typography variant="b">Photos</Typography>
                                    <Typography><PdfPicture onClick={() => openIpfsLink(project.photos)} /></Typography>
                                </Box>
                                <Box className="line">
                                    <Typography variant="b">Diagnostic (DPE)</Typography>
                                    <Typography><PdfPicture onClick={() => openIpfsLink(project.diagnostic)} /></Typography>
                                </Box>
                                <Box className="line">
                                    <Typography variant="b">Plan</Typography>
                                    <Typography><PdfPicture onClick={() => openIpfsLink(project.plan)} /></Typography>
                                </Box>
                                <Box className="line">
                                    <Typography variant="b">Status</Typography>
                                    <Typography>{project.state}</Typography>
                                </Box>
                                <DisplayVoteBlock state={project.state}
                                    voteStart={project.voteInfo.voteStart}
                                    voteEnd={project.voteInfo.voteEnd}
                                    voteExpire={project.voteInfo.voteExpire} 
                                    blockNumber={blockNumber} />
                            </Box>
                        </RoundedGrid>
                    </Grid>
                    <Grid container >
                        <Grid item xs={12} >
                            <TableContainerUI sx={{ width: '100%', marginBottom: '10px' }} className="bg-gray-900">
                                <Table sx={{ minWidth: 650 }} aria-label="simple table" className="bg-gray-900">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Artisan</TableCell>
                                            <TableCell align="right">Description</TableCell>
                                            <TableCell align="right">Devis</TableCell>
                                            <TableCell align="right">Prix (€)</TableCell>
                                            <TableCell align="right">CEE émis</TableCell>
                                            <TableCell align="right">Votes</TableCell>
                                            <TableCell align="right"></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {quotations.map((row) =>
                                        (

                                            <TableRow
                                                key={row.id}
                                            >
                                                <TableCell component="th" scope="row">
                                                    <Box display="flex" alignItems="center" gap="4px">
                                                        <Identicon className="identicon" value={row.craftsmanAddr} size={20} theme="ethereum" />
                                                        <Typography>{formatAddress(row.craftsmanAddr)}</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="right">{row.description}</TableCell>
                                                <TableCell align="right"><IconHover><PictureAsPdfIcon onClick={() => openIpfsLink(row.documentHash)} /></IconHover></TableCell>
                                                <TableCell align="right">{BigNumber.from(row.price).toNumber()}</TableCell>
                                                <TableCell align="right">{BigNumber.from(row.nbCee).toNumber()}</TableCell>
                                                <TableCell align="right" >{formatEther(row.weightVote)}</TableCell>
                                                <TableCell align="right">
                                                    {
                                                        <DisplayStateIcon castVote={state.castVote} project={project} handleClick={handleClick} quotation={row} />
                                                    }
                                                </TableCell>

                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainerUI>
                            {state.castVote && <Typography variant="p" pl={1} pb={1}>Votre poids de vote actuel est de {votePower} EED. Faites votre choix.</Typography>}

                            <CircularIndeterminate loading={state.isLoading} />
                        </Grid>
                        {isBeneficiary && project.state === ProposalProjectStates.Ended &&
                            <>
                                <Box display="flex" gap="5px">
                                    <ButtonUI variant="contained" component="label" htmlFor="file-upload" onClick={() => handleDecision(true)}>
                                        Accepter
                                    </ButtonUI>
                                    <ButtonUI variant="contained" component="label" htmlFor="file-upload" onClick={() => handleDecision(false)}>
                                        Refuser
                                    </ButtonUI>
                                </Box>

                            </>
                        }
                        {state.displayCreation &&
                            <>
                                <Box display="flex" gap="5px">
                                    <ButtonUI variant="contained" component="label" htmlFor="file-upload" onClick={() => handleCreate()}>
                                        Proposer un devis
                                    </ButtonUI>
                                </Box>

                            </>
                        }

                    </Grid>
                </Box>

            </CenteredModal>
            <SnackbarUI open={notif.open} msg={notif.msg} setOpen={setOpenNotif} />

        </>
    )
}

export default ProjectDetailsModal