import CancelIcon from '@mui/icons-material/Cancel'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HourglassFullIcon from '@mui/icons-material/HourglassFull'
import { ProposalState, ProposalStateCodes } from "../../../../common/enums"
import StartIcon from '@mui/icons-material/Start';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import GroupsIcon from '@mui/icons-material/Groups'
import CloseIcon from '@mui/icons-material/Close';

function VoteIcon({state}){

    if (state === ProposalState.Executed){
        return <CheckCircleIcon />
    }
    else if(state === ProposalState.Defeated) {
        return <CancelIcon  />
    } 
    else if(state === ProposalState.Pending || state === ProposalState.Finished) {
        return <HourglassFullIcon />
    }
    else if (state === ProposalState.Defeated) {
        return <CloseIcon/>
    }
    else if(state === ProposalState.Active) {
        return <HowToVoteIcon />
    }
    else if(state === ProposalState.Succeeded){
        return <StartIcon sx={{'&:hover': {cursor:"pointer"}}} />
    }
    else {
        return <GroupsIcon sx={{'&:hover': {cursor:"pointer"}}} /> 
        
    }
}

export default VoteIcon