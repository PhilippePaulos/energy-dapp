import CancelIcon from '@mui/icons-material/Cancel'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HourglassFullIcon from '@mui/icons-material/HourglassFull'
import { ProposalState, ProposalStateCodes } from "../../../../common/enums"
import StartIcon from '@mui/icons-material/Start';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import GroupsIcon from '@mui/icons-material/Groups'


function VoteIcon({state}){
    const st = ProposalStateCodes[state]

    if (st === ProposalState.Executed){
        return <CheckCircleIcon />
    }
    else if(st === ProposalState.Defeated) {
        return <CancelIcon  />
    } 
    else if(st === ProposalState.Pending) {
        return <HourglassFullIcon />
    }
    else if(st === ProposalState.Active) {
        return <HowToVoteIcon />
    }
    else if(st === ProposalState.Succeeded){
        return <StartIcon sx={{'&:hover': {cursor:"pointer"}}} />
    }
    else {
        return <GroupsIcon sx={{'&:hover': {cursor:"pointer"}}} /> 
        
    }
}

export default VoteIcon