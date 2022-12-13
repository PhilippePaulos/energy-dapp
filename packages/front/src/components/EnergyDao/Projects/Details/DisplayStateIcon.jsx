import DoNotTouchIcon from '@mui/icons-material/DoNotTouch'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt'
import { ProposalProjectStates } from "../../../../common/enums"
import IconHover from '../../../ui/IconHover'


function DisplayStateIcon({ project, castVote, handleClick, quotation }) {
    let icon
    if (project.state === ProposalProjectStates.Active && castVote) {
        icon = <IconHover onClick={() => handleClick(quotation.craftsmanAddr)}><ThumbUpAltIcon /></IconHover>
    }
    else if ((project.state === ProposalProjectStates.Ended && quotation.isWinner) || (project.choosedCraftsman === quotation.craftsmanAddr)) {
        icon = <EmojiEventsIcon sx={{color: "yellow"}} />
    }
    else if ((project.state === ProposalProjectStates.Rejected && quotation.isWinner)
        || (project.state === ProposalProjectStates.Expire && quotation.isWinner)) {
        icon = <DoNotTouchIcon />
    }
    return icon
}

export default DisplayStateIcon