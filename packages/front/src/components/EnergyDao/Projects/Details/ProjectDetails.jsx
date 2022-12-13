import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt'
import { Box, Grid, Step, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material"
import Identicon from '@polkadot/react-identicon'
import { BigNumber, ethers } from "ethers"
import { formatEther } from 'ethers/lib/utils.js'
import { useCallback, useEffect, useState } from 'react'
import { useAccount, useBlockNumber, useContractEvent, useNetwork, useProvider, useSigner } from 'wagmi'
import { ProposalProjectStates } from "../../../../common/enums"
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


function DisplayVoteBlock({ state, voteEnd, voteStart, voteExpire }) {

    const { data: currentBlock } = useBlockNumber()

    const currentDisplay =
        <Box className="line">
            <Typography variant="b">Current block</Typography>
            <Typography>{currentBlock}</Typography>
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

    const { project: currentProject, quotations, open, setOpen, fetchQuotations, retrieveState, fetchProjects } = props

    const { state: { contracts: { EnergyDao}, votePower, isValidated} } = useProfile()

    const [state, setState] = useState({
        openQuotation: false,
        hasVoted: false,
        castVote:  false,
        isLoading: false,
        displayCreation: false,
        stateProject: currentProject.state
    })

    const { data: signer } = useSigner()
    const { address } = useAccount()
    const provider = useProvider()
    const { chain } = useNetwork()

    const [notif, setNotif] = useState({
        open: false,
        msg: ""
    })

    const isBeneficiary = currentProject.beneficiaryAddr === address

    const setOpenNotif = (b) => {
        setNotif({ ...notif, open: b })
    }

    useContractEvent({
        address: EnergyDao.address,
        abi: getContractDescription('EnergyDao', chain.id).abi,
        eventName: 'QuotationRegistred',
        listener() {
            fetchData()
            setNotif({ msg: "Devis enregistré!", open: true })
        },
    })

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

    const fetchCraftsman = async () => {
        const quotation = await EnergyDao.quotations(currentProject.id, address)
        const currentBlock = await provider.getBlockNumber()

        if (currentProject.beneficiaryAddr !== address && address !== quotation.craftsmanAddr
            && isValidated && currentProject.voteInfo.voteStart > BigNumber.from(currentBlock)) {
            setState((s) => ({ ...s, displayCreation: true }))
        }
        else {
            setState((s) => ({ ...s, displayCreation: false }))
        }
    }

    const fetchUpdate = async () => {
        const hasVoted = await EnergyDao.hasVoted(currentProject.id, address)
        
        const p = await retrieveState(currentProject)
        fetchQuotations(p.id)
        setState((s) => ({ ...s, stateProject: p.state}))

        const castVote = !hasVoted && p.state === ProposalProjectStates.Active

        setState((s) => ({...s, castVote: castVote}))
    }

    const fetchData = useCallback(() => {
        console.log("fetch data ");
        fetchCraftsman()
        fetchUpdate()
    }, [fetchCraftsman, fetchUpdate, state.displayCreation])

    useEffect(() => {
        fetchData()
        console.log("USE EFFECT");
    }, [provider, address])

    const handleClick = async (addr) => {
        setState((s) => ({ ...state, isLoading: true }))
        await EnergyDao.connect(signer).castVote(currentProject.id, address, addr)
        setState((s) => ({ ...state, isLoading: false }))
    }

    const handleClose = () => {
        fetchProjects()
        setOpen(false)
    }

    const handleDecision = async (accept) => {
        setState({ ...state, isLoading: true })
        if (accept) {
            await EnergyDao.connect(signer).accept(currentProject.id)
        }
        else {
            await EnergyDao.connect(signer).reject(currentProject.id)
        }
        setState({ ...state, isLoading: false })
    }

    const handleCreate = () => {
        setOpenQuotation(true)
    }

    const setOpenQuotation = (bool) => {
        setState({ ...state, openQuotation: bool })
    }

    return (
        <>
            <CreateQuotationModal open={state.openQuotation} setOpen={setOpenQuotation} project={currentProject} fetchCraftsman={fetchCraftsman} />
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
                                    <Typography>{currentProject.name}</Typography>
                                </Box>
                                <Box className="line">
                                    <Typography variant="b">Bénéficiaire</Typography>
                                    <Box display="flex" alignItems="center" gap="4px">
                                        <Identicon className="identicon" value={currentProject.beneficiaryAddr} size={20} theme="ethereum" />
                                        <Typography>{currentProject.beneficiaryAddr}</Typography>
                                    </Box>
                                </Box>
                                <Box className="line">
                                    <Typography variant="b">Description</Typography>
                                    <Typography>{currentProject.description}</Typography>
                                </Box>
                                <Box className="line">
                                    <Typography variant="b">Département</Typography>
                                    <Typography>{currentProject.department}</Typography>
                                </Box>
                                <Box className="line">
                                    <Typography variant="b">Photos</Typography>
                                    <Typography><PdfPicture onClick={() => openIpfsLink(currentProject.photos)} /></Typography>
                                </Box>
                                <Box className="line">
                                    <Typography variant="b">Diagnostic (DPE)</Typography>
                                    <Typography><PdfPicture onClick={() => openIpfsLink(currentProject.diagnostic)} /></Typography>
                                </Box>
                                <Box className="line">
                                    <Typography variant="b">Plan</Typography>
                                    <Typography><PdfPicture onClick={() => openIpfsLink(currentProject.plan)} /></Typography>
                                </Box>
                                <Box className="line">
                                    <Typography variant="b">Status</Typography>
                                    <Typography>{state.stateProject}</Typography>
                                </Box>
                                <DisplayVoteBlock state={state.stateProject} 
                                    voteStart={currentProject.voteInfo.voteStart} 
                                    voteEnd={currentProject.voteInfo.voteEnd} 
                                    voteExpire={currentProject.voteInfo.voteExpire}/>
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
                                                {
                                                    state.castVote ?
                                                        <TableCell align="right" sx={{ display: "flex", alignItems: "center", flexDirection: "inherit", gap: "4px" }}>
                                                            {formatEther(row.weightVote)}
                                                            <IconHover onClick={() => handleClick(row.craftsmanAddr)}><ThumbUpAltIcon /></IconHover>
                                                        </TableCell> :
                                                        <TableCell align="right" >
                                                            {formatEther(row.weightVote)}

                                                        </TableCell>
                                                }

                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainerUI>
                            {state.castVote && <Typography variant="p" pl={1} pb={1}>Votre poids de vote actuel est de {votePower} EED. Faites votre choix.</Typography>}

                            <CircularIndeterminate loading={state.isLoading} />
                        </Grid>
                        {isBeneficiary && state.stateProject === ProposalProjectStates.Ended &&
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