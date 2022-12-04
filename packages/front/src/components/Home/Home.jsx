import { Grid, Link } from "@mui/material";
import { useAccount } from "wagmi";
import NotConnected from "../Notices/NotConnected";

function Home() {

    const { isConnected } = useAccount()

    if (isConnected) {
        return (
            <>
                <Grid container spacing={2}>
                    <Grid item xs={12}><Link href="/projects-display" color="inherit" underline="none">Projets</Link></Grid>
                    <Grid item xs={12}><Link href="/craftsman-display" color="inherit" underline="none">Artisans</Link></Grid>
                </Grid>

            </>
        )
    }
    else {
        return (
            <NotConnected />
        )
    }
}

export default Home;