import GroupsIcon from '@mui/icons-material/Groups'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import { Box, Grid, ImageList, ImageListItem, Typography } from "@mui/material"
import Identicon from "@polkadot/react-identicon"
import { ethers } from "ethers"
import { useState } from "react"
import { useAccount, useSigner } from "wagmi"
import { ProposalState, ProposalStateCodes } from "../../../../common/enums"
import { openIpfsLink } from "../../../../common/helpers/eth"
import { useProfile } from "../../../../contexts/DaoContext"
import CenteredModal from "../../../ui/CenteredModal"
import CircularIndeterminate from "../../../ui/CircularIndeterminate"
import IconHover from "../../../ui/IconHover"
import RoundedGrid from "../../../ui/RoundedGrid"
import VoteIcon from '../VoteIcon/VoteIcon'
import DisplayVotes from './DisplayVotes'


function State({ craftsman, handleClick }) {

    if (craftsman.state === undefined || ProposalStateCodes[craftsman.state] === ProposalState.Succeeded) {
        const icon = craftsman.state === undefined ? <GroupsIcon state={craftsman.state} /> : <VoteIcon state={craftsman.state} />
        return (
            <Box className="line" onClick={() => handleClick()}>
                <Typography variant="b">Proposal status</Typography>
                <Typography sx={{ "& .MuiSvgIcon-root": { marginLeft: "5px" }, "& .MuiSvgIcon-root:hover": { cursor: "pointer", color: "black" } }}>{icon}</Typography>
            </Box>)
    }
    else {
        return (
            <Box className="line" onClick={() => handleClick(craftsman.state)}>
                <Typography variant="b">Proposal status</Typography>
                <Typography> {ProposalStateCodes[craftsman.state]}</Typography>
            </Box>
        )
    }
}

function CraftsmanDetailsModal(props) {
    const { craftsman, open, setOpen, fetchCraftsman } = props
    const { address } = useAccount()
    const { data: signer } = useSigner()
    const { profile: { contracts: { EnergyDao, EnergyGovernor } } } = useProfile()
    const [isLoading, setIsLoading] = useState(false)

    const handleProposal = async () => {
        if (craftsman.state === undefined) {
            setIsLoading(true)
            const encodedFunc = EnergyDao.interface.encodeFunctionData("validateCraftsman", [craftsman.craftsmanAddr])
            await EnergyGovernor.connect(signer).propose([EnergyDao.address], [0], [encodedFunc], `validate ${craftsman.craftsmanAddr}`)
            fetchCraftsman()
            setOpen(false)
            setIsLoading(false)
        }
        else if (ProposalStateCodes[craftsman.state] === ProposalState.Succeeded) {            
            setIsLoading(true)
            const encodedFunc = EnergyDao.interface.encodeFunctionData("validateCraftsman", [craftsman.craftsmanAddr])
            console.log(encodedFunc);
            console.log(craftsman.description);


            await EnergyGovernor.connect(signer).execute([EnergyDao.address], [0], [encodedFunc], ethers.utils.id(craftsman.description))
            fetchCraftsman()
            setOpen(false)
            setIsLoading(false)
        }
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
                            <State craftsman={craftsman} handleClick={handleProposal} />
                        </Box>
                    </RoundedGrid>
                </Grid>
                {
                    craftsman.votes && <DisplayVotes craftsman={craftsman} />
                }
                <CircularIndeterminate loading={isLoading} />
                {/* <img src=''></img> */}
                <div>
                {/* <img
                    src="https://gateway.pinata.cloud/ipfs/QmPuV2zVQKir4TyexrS8AxoL5igtPRT22w9NXaAnoiVfVD"
                /> */}
                </div>
            </Box>
        </CenteredModal>
    )
}
export default CraftsmanDetailsModal