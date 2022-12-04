import { useState } from "react"
import { getIpfsLink } from "../../../helpers/eth"
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
            <ButtonUI variant="contained" component="label" onClick={() => window.open(getIpfsLink("QmQ3C2j5ZzHxbdBKPFj6G7s9szwig95iy4MXHMrKcN9cvD"))}>Go</ButtonUI>

            <CreateProjectModal open={open} setOpen={setOpen} />
        </>
    )
}

export default DisplayProjects