import { Grid, Link } from "@mui/material"
import { useProfile } from "../../../contexts/DaoContext"
import DisplayCraftsman from "../Craftsman/Display/DisplayCraftsman"
import DisplayProjects from "../Projects/Display/DisplayProjects"
import { Divider } from '@mui/material';

function Home() {

    const { state: balance } = useProfile()

    return (
        <>
            <DisplayProjects/>
            <DisplayCraftsman />
        </>
    )

}

export default Home