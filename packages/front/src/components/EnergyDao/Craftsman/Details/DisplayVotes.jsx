import HelpOutlinedIcon from '@mui/icons-material/HelpOutlined'
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt'
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt'
import { Box, Grid, Table, TableCell, TableHead, TableRow, Typography } from "@mui/material"
import { ethers } from "ethers"
import { useCallback, useEffect, useState } from 'react'
import { useAccount, useSigner } from "wagmi"
import { ProposalState, Votes } from "../../../../common/enums"
import { useProfile } from "../../../../contexts/DaoContext"
import CircularIndeterminate from "../../../ui/CircularIndeterminate"
import IconHover from "../../../ui/IconHover"
import TableBodyNormal from "../../../ui/TableBodyNormal"
import TableContainerUI from "../../../ui/TableContainer"


function DisplayVotes({ craftsman, quorum }) {

    const { state: { contracts: { EnergyGovernor, EEDToken } } } = useProfile()
    const { data: signer } = useSigner()
    const { address } = useAccount()
    const [isLoading, setIsLoading] = useState(false)
    const [hasVoted, setHasVoted] = useState(false)
    const [votePower, setVotePower] = useState(0)

    const fetchHasVoted = useCallback(async () => {
        const hasVoted = await EnergyGovernor.hasVoted(craftsman.proposalId, address)
        setHasVoted(hasVoted)
    }, [])

    const fetchVotePower =  useCallback(async() => {
        const votes = (await EEDToken.getVotes(address))
        setVotePower(ethers.utils.formatEther(votes))
      }, [])

    useEffect(() => {
        fetchHasVoted()
        fetchVotePower()
    }, [fetchHasVoted, fetchVotePower])



    const handleClick = useCallback(async (type) => {
        setIsLoading(true)
        let vote
        switch (type) {
            case "up":
                vote = Votes.For
                break
            case "down":
                vote = Votes.Against
                break
            case "abstain":
                vote = Votes.Abstain
                break
        }
        await EnergyGovernor.connect(signer).castVote(craftsman.proposalId, vote)

        setIsLoading(false)
    }, [])

    return (
        <Grid container mt={5}>
            <Grid item xs={12} >
                <Typography variant="h6" pl={1}>Votes</Typography>
                <Box><Typography variant="p" pl={1} pb={1}>Le quorum à atteindre est de {quorum} EED</Typography></Box>
                <TableContainerUI sx={{ width: '100%', marginBottom: '10px' }} className="bg-gray-900">
                    <Table sx={{ minWidth: 650 }} aria-label="simple table" className="bg-gray-900">
                        {
                            !hasVoted && craftsman.state === ProposalState.Active ?
                                <TableHead>
                                    <TableRow>
                                        <TableCell onClick={() => handleClick("up")}><IconHover><ThumbUpAltIcon /></IconHover></TableCell>
                                        <TableCell onClick={() => handleClick("down")} align="right"><IconHover><ThumbDownAltIcon /></IconHover></TableCell>
                                        <TableCell onClick={() => handleClick("abstain")} align="right"><IconHover><HelpOutlinedIcon /></IconHover></TableCell>
                                    </TableRow>
                                </TableHead>
                                :
                                <TableHead>
                                    <TableRow>
                                        <TableCell><ThumbUpAltIcon /></TableCell>
                                        <TableCell align="right"><ThumbDownAltIcon /></TableCell>
                                        <TableCell align="right"><HelpOutlinedIcon /></TableCell>
                                    </TableRow>
                                </TableHead>

                        }
                        <TableBodyNormal>
                            <TableRow>
                                <TableCell component="th" scope="craftsman">{ethers.utils.formatEther(craftsman.votes.forVotes)}</TableCell>
                                <TableCell align="right">{ethers.utils.formatEther(craftsman.votes.againstVotes)}</TableCell>
                                <TableCell align="right">{ethers.utils.formatEther(craftsman.votes.abstainVotes)}</TableCell>
                            </TableRow>
                        </TableBodyNormal>
                    </Table>
                </TableContainerUI>
                
                { !hasVoted && craftsman.state === ProposalState.Active && <Typography variant="p" pl={1} pb={1}>Votre poids de vote actuel est de {votePower} EED. Selectionnez votre option préférée.</Typography>}
                <CircularIndeterminate loading={isLoading} />
            </Grid>
        </Grid>
    )
}

export default DisplayVotes