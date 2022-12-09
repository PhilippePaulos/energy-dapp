import { useState } from "react"
import ButtonUI from "../../../ui/button"
import CreateCraftsmanModal from "../Create/CreateCraftsmanModal"

function DisplayCraftsman(){
    const [open, setOpen] = useState(false)
    
    const handleClick = () => {
        setOpen(true)
    }


 return (
        <>
            <ButtonUI variant="contained" onClick={handleClick}>
                Candidater
            </ButtonUI>
            <CreateCraftsmanModal open={open} setOpen={setOpen}/>
        </>
    )
}

export default DisplayCraftsman