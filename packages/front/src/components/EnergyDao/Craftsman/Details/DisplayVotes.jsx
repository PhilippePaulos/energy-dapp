import QuestionMarkIcon from '@mui/icons-material/QuestionMark'
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt'
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt'
import { Grid, Table, TableCell, TableHead, TableRow, Typography } from "@mui/material"
import { ethers } from "ethers"
import { useCallback, useEffect, useState } from 'react'
import { useAccount, useSigner } from "wagmi"
import { ProposalState, Votes } from "../../../../common/enums"
import { useProfile } from "../../../../contexts/DaoContext"
import CircularIndeterminate from "../../../ui/CircularIndeterminate"
import IconHover from "../../../ui/IconHover"
import TableBodyNormal from "../../../ui/TableBodyNormal"
import TableContainerUI from "../../../ui/TableContainer"


function DisplayVotes({ fetchCraftsmans, craftsman, setCraftsman, quorum }) {

    const { state: { contracts: { EnergyGovernor }, votePower } } = useProfile()
    const { data: signer } = useSigner()
    const { address } = useAccount()
    const [isLoading, setIsLoading] = useState(false)
    const [hasVoted, setHasVoted] = useState(false)

    const fetchHasVoted = useCallback(async () => {
        console.log(craftsman.addr);
        const hasVoted = await EnergyGovernor.hasVoted(craftsman.proposalId, address)
        setHasVoted(hasVoted)
    }, [address])

    useEffect(() => {
        fetchHasVoted()
        console.log("EFFECT DISPLAY");
        console.log(hasVoted);
    }, [fetchHasVoted, hasVoted, address, craftsman.votes])

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
        fetchCraftsmans()
        const votes = await EnergyGovernor.proposalVotes(craftsman.proposalId)
        const c = craftsman
        craftsman.votes = votes
        setCraftsman(c)
        setIsLoading(false)
        window.location.reload(false);
    }, [fetchCraftsmans])

    return (
        <Grid container mt={3} alignItems="center"   direction="column"   justifyContent="center"
        >
            <Grid item xs={12} pb={1}>
                <Typography variant="h6" pl={1}>Votes</Typography>
            </Grid>
            <Grid >
                <TableContainerUI sx={{ marginBottom: '10px' }} className="bg-gray-900">
                    <Table sx={{}} aria-label="simple table" className="bg-gray-900">
                        {
                            !hasVoted && craftsman.state === ProposalState.Active ?
                                <TableHead>
                                    <TableRow>
                                        <TableCell onClick={() => handleClick("up")} align="right"><IconHover><ThumbUpAltIcon color="success" /></IconHover></TableCell>
                                        <TableCell onClick={() => handleClick("down")} align="right"><IconHover><ThumbDownAltIcon color="error" /></IconHover></TableCell>
                                        <TableCell onClick={() => handleClick("abstain")} align="right"><IconHover><QuestionMarkIcon sx={{ color: "yellow" }} /></IconHover></TableCell>
                                    </TableRow>
                                </TableHead>
                                :
                                <TableHead>
                                    <TableRow>
                                        <TableCell><ThumbUpAltIcon align="right" color="success" /></TableCell>
                                        <TableCell align="right"><ThumbDownAltIcon color="error" /></TableCell>
                                        <TableCell align="right"><QuestionMarkIcon color="warning" /></TableCell>
                                    </TableRow>
                                </TableHead>

                        }
                        <TableBodyNormal>
                            <TableRow>
                                <TableCell align="right">{ethers.utils.formatEther(craftsman.votes.forVotes)}</TableCell>
                                <TableCell align="right">{ethers.utils.formatEther(craftsman.votes.againstVotes)}</TableCell>
                                <TableCell align="right">{ethers.utils.formatEther(craftsman.votes.abstainVotes)}</TableCell>
                            </TableRow>
                        </TableBodyNormal>
                    </Table>
                </TableContainerUI>
                <CircularIndeterminate loading={isLoading} />
            </Grid>
            <Grid margin={"auto"}>
                {!hasVoted && craftsman.state === ProposalState.Active && <Typography variant="p" pl={1} pb={1}>Votre poids de vote actuel est de {votePower} EED. Faites votre choix.</Typography>}
            </Grid>
            <Typography variant="p">QUORUM = {quorum} EED</Typography>
        </Grid>
    )
}

export default DisplayVotes