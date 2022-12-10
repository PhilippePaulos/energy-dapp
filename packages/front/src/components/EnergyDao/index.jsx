import { Grid } from "@mui/material";
import { useAccount } from "wagmi";
import DaoProvider from "../../contexts/DaoContext/DaoProvider";
import NotConnected from "../Notices/NotConnected";
import DaoRouter from "../routes/DaoRouter";

function EnergyDao() {

    const { isConnected } = useAccount()

    if (isConnected) {
        return (
            <>
                <DaoProvider>
                    <Grid container sx={{ mx: "auto", maxWidth: "1250px" }}>
                        <DaoRouter isConnected={isConnected} />
                    </Grid>
                </DaoProvider>
            </>
        )
    }
    
    return (<Grid container sx={{ mx: "auto", maxWidth: "1250px" }}>
        <NotConnected />
    </Grid>
    )

}

export default EnergyDao

