import { useState } from "react"
import { openIpfsLink } from "../../../helpers/eth"
import ButtonUI from "../../ui/button"
import CreateProjectModal from "../Create/CreateProjectModal"

function DisplayProjects(){

    const [open, setOpen] = useState(false)
    
    const handleClick = () => {
        setOpen(true)
    }
    
    return (
        <>
            <ButtonUI variant="contained" onClick={handleClick}>
                Create project
            </ButtonUI>
            <ButtonUI variant="contained" component="label" onClick={() => openIpfsLink()}>Go</ButtonUI>

            <CreateProjectModal open={open} setOpen={setOpen} />
        </>
    )
}

export default DisplayProjects