import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt'
import { Box, Grid, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material"
import Identicon from '@polkadot/react-identicon'
import { BigNumber, ethers } from "ethers"
import { formatEther } from 'ethers/lib/utils.js'
import { useCallback, useEffect, useState } from 'react'
import { useAccount, useBlockNumber, useSigner, useContractEvent, useNetwork} from 'wagmi'
import { ProposalProjectStates } from "../../../../common/enums"
import { formatAddress, getContractDescription, openIpfsLink } from "../../../../common/helpers/eth"
import { useProfile } from '../../../../contexts/DaoContext'
import ButtonUI from '../../../ui/button'
import CenteredModal from "../../../ui/CenteredModal"
import CircularIndeterminate from '../../../ui/CircularIndeterminate'
import IconHover from '../../../ui/IconHover'
import PdfPicture from "../../../ui/PdfPicture"
import RoundedGrid from "../../../ui/RoundedGrid"
import TableContainerUI from "../../../ui/TableContainer"
import CreateQuotationModal from '../Create/CreateQuotationModal'


function DisplayVoteBlock({ project }) {

    const { data: currentBlock } = useBlockNumber()

    const currentDisplay =
        <Box className="line">
            <Typography variant="b">Current block</Typography>
            <Typography>{currentBlock}</Typography>
        </Box>

    if (project.state == ProposalProjectStates.Pending) {
        return (
            <>
                {currentDisplay}
                <Box className="line">
                    <Typography variant="b">Vote block start</Typography>
                    <Typography>{BigNumber.from(project.voteInfo.voteStart).toNumber()}</Typography>
                </Box>
            </>
        )
    } else if (project.state == ProposalProjectStates.Active) {
        return (
            <>
                {currentDisplay}
                <Box className="line">
                    <Typography variant="b">Vote block ends</Typography>
                    <Typography>{BigNumber.from(project.voteInfo.voteEnd).toNumber()}</Typography>
                </Box>
            </>

        )
    } else if (project.state == ProposalProjectStates.Ended) {
        return (
            <>
                {currentDisplay}
                <Box className="line">
                    <Typography variant="b">Vote block ends</Typography>
                    <Typography>{BigNumber.from(project.voteInfo.voteExpire).toNumber()}</Typography>
                </Box>
            </>

        )
    }
}

function ProjectDetailsModal(props) {

    const { project, quotations, open, setOpen} = props
    const [openQuotation, setOpenQuotation] = useState(false)
    const { data: signer } = useSigner()
    const { address } = useAccount()
    const { profile: { contracts: { EnergyDao, EEDToken } } } = useProfile()
    const [votePower, setVotePower] = useState(0)
    const [hasVoted, setHasVoted] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [displayCreation, setDisplayCreation] = useState()
    const {chain} = useNetwork()

    useContractEvent({
        address: EnergyDao.address,
        abi: getContractDescription('EnergyDao', chain.id).abi,
        eventName: 'QuotationRegistred',
        listener() {
            fetchData()
        },
      })
    
    useBlockNumber({
        onSuccess(data) {
            fetchData(data)
        },
      })

    const castVote = !hasVoted && project.state === ProposalProjectStates.Active

    const isBeneficiary = project.beneficiaryAddr === address

    const fetchHasVoted = useCallback(async () => {
        const hasVoted = await EnergyDao.hasVoted(project.id, address)
        setHasVoted(hasVoted)
    }, [])

    const fetchVotePower = useCallback(async () => {
        const votes = (await EEDToken.balanceOf(address))
        setVotePower(ethers.utils.formatEther(votes))
    }, [])

    const fetchCraftsman = useCallback(async (currentBlock) => {
        const isValidated = await EnergyDao.isCraftsmanValidated(address)
        const quotation = await EnergyDao.quotations(project.id, address)
        if (project.beneficiaryAddr !== address && address !== quotation.craftsmanAddr && isValidated && project.voteInfo.voteStart > currentBlock) {
            setDisplayCreation(true)
        }

    }, [project, EnergyDao])

    const handleClick = useCallback(async (addr) => {
        setIsLoading(true)
        await EnergyDao.connect(signer).castVote(project.id, address, addr)
        setIsLoading(false)
    }, [])

    const handleDecision = useCallback(async (accept) => {
        setIsLoading(true)
        if (accept) {
            await EnergyDao.connect(signer).accept(project.id)
        }
        else {
            await EnergyDao.connect(signer).reject(project.id)
        }
        setIsLoading(false)
    })

    const handleCreate = () => {
        setOpenQuotation(true)
    }

    const fetchData = useCallback((currentBlock) => {
        fetchVotePower()
        fetchHasVoted()
        fetchCraftsman(currentBlock)
    }, [fetchVotePower, fetchHasVoted, fetchCraftsman])   

    return (
        <>
        <CreateQuotationModal open={openQuotation} setOpen={setOpenQuotation} project={project}/>
        <CenteredModal
            open={open}
            onClose={() => setOpen(false)}>
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
                            <DisplayVoteBlock project={project} />
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
                                                castVote ?
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
                        {castVote && <Typography variant="p" pl={1} pb={1}>Votre poids de vote actuel est de {votePower} EED. Faites votre choix.</Typography>}

                        <CircularIndeterminate loading={isLoading} />
                    </Grid>
                    {isBeneficiary && project.state == ProposalProjectStates.Ended &&
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
                    {displayCreation && 
                        <>
                            <Box display="flex" gap="5px">
                                <ButtonUI variant="contained" component="label" htmlFor="file-upload" onClick={() => handleCreate()}>
                                    Propose un devis
                                </ButtonUI>
                            </Box>

                        </>
                    }

                </Grid>
            </Box>
        </CenteredModal>
        </>
    )
}

export default ProjectDetailsModal