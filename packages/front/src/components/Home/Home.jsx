import { Grid, Link } from "@mui/material";
import { useProfile } from "../../contexts/DaoContext"

function Home() {

    const { state: balance } = useProfile()

    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12}><Link href="/projects-display" color="inherit" underline="none">Projets</Link></Grid>
                <Grid item xs={12}><Link href="/craftsman-display" color="inherit" underline="none">Artisans</Link></Grid>
            </Grid>
        </>
    )

}

export default Home;