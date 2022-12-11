import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import { Box, Grid, Typography } from "@mui/material"
import Identicon from "@polkadot/react-identicon"
import { BigNumber, ethers } from "ethers"
import { useState } from "react"
import { useContractEvent, useNetwork, useSigner } from "wagmi"
import { ProposalState } from "../../../../common/enums"
import { getContractDescription, openIpfsLink } from "../../../../common/helpers/eth"
import { useProfile } from "../../../../contexts/DaoContext"
import ButtonUI from "../../../ui/button"
import CenteredModal from "../../../ui/CenteredModal"
import CircularIndeterminate from "../../../ui/CircularIndeterminate"
import IconHover from "../../../ui/IconHover"
import RoundedGrid from "../../../ui/RoundedGrid"
import DisplayVotes from './DisplayVotes'

function State({ state }) {
    if (state !== undefined) {
        return (
            <Box className="line">
                <Typography variant="b">Proposal status</Typography>
                <Typography> {state}</Typography>
            </Box>
        )
    }
}

function VoteProposal({ state, handleDecision }) {
    
    const title = state === undefined ? "Initier vote" : "Accepter vote"

    if (state === undefined || state === ProposalState.Succeeded) {
        return (
            <Box display="flex" gap="5px" mt={2}>
                <ButtonUI variant="contained" component="label" htmlFor="file-upload" onClick={() => handleDecision(true)}>
                    {title}
                </ButtonUI>
            </Box>
        )
    }
}

function CraftsmanDetailsModal(props) {
    const { craftsman, open, setOpen, fetchCraftsman, quorum } = props
    const { data: signer } = useSigner()
    const { profile: { contracts: { EnergyDao, EnergyGovernor } } } = useProfile()
    const [isLoading, setIsLoading] = useState(false)
    const {chain} = useNetwork()

    useContractEvent({
        address: EnergyDao.address,
        abi: getContractDescription('EnergyGovernor', chain.id).abi,
        eventName: 'VoteCastWithParams',
        listener() {
            console.log("EVEEEEEEEEEEEEEEEEEEEENT");
        },
    })

    const handleProposal = async () => {
        setIsLoading(true)
        const encodedFunc = EnergyDao.interface.encodeFunctionData("validateCraftsman", [craftsman.craftsmanAddr])
        if (craftsman.state === undefined) {
            await EnergyGovernor.connect(signer).propose([EnergyDao.address], [0], [encodedFunc], `validate ${craftsman.craftsmanAddr}`)
        }
        else if (craftsman.state === ProposalState.Succeeded) {
            await EnergyGovernor.connect(signer).execute([EnergyDao.address], [0], [encodedFunc], ethers.utils.id(craftsman.description))
        }
        fetchCraftsman()
        setOpen(false)
        setIsLoading(false)
    }

    return (
        <CenteredModal
            open={open}
            onClose={() => setOpen(false)}>
            <Box
                className="bg-gray-900"
                p={2}
                borderRadius={2}>
                <Grid container >
                    <RoundedGrid sx={{ width: "inherit" }} className="bg-gray-900">
                        <Box className="boxHeader" display="flex" alignItems="center" gap="4px">
                            <Box display="flex" gap={1}>
                                <Identicon className="identicon" value={craftsman.craftsmanAddr} size={20} theme="ethereum" />
                                <Typography>{craftsman.craftsmanAddr}</Typography>
                            </Box>
                        </Box>

                        <Box className="content">
                            <Box className="line">
                                <Typography variant="b">Nom</Typography>
                                <Typography>{craftsman.name}</Typography>
                            </Box>
                            <Box className="line">
                                <Typography variant="b">Certification</Typography>
                                <Typography><IconHover><PictureAsPdfIcon onClick={() => openIpfsLink(craftsman.certification)} /></IconHover></Typography>
                            </Box>
                            <State state={craftsman.state} />
                            <Box className="line">
                                <Typography variant="b">Nombre de projets validés</Typography>
                                <Typography>{BigNumber.from(craftsman.nbProjectsValidated).toNumber()}</Typography>
                            </Box>
                        </Box>
                    </RoundedGrid>
                </Grid>
                <VoteProposal state={craftsman.state} handleDecision={handleProposal}/>
                {
                    craftsman.votes && <DisplayVotes craftsman={craftsman} quorum={quorum} />
                }
                <CircularIndeterminate loading={isLoading} />
            </Box>
        </CenteredModal>


    )
}
export default CraftsmanDetailsModal