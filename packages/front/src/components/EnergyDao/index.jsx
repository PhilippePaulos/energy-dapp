import { Grid } from "@mui/material";
import { useAccount } from "wagmi";
import { useProfile } from "../../contexts/DaoContext";
import NotConnected from "../Notices/NotConnected";
import DaoRouter from "../routes/DaoRouter";

function EnergyDao() {

    const { isConnected } = useAccount()
    const { state } = useProfile()

    if (isConnected && state.fetched) {

        return (
            <>
                    <Grid container sx={{ mx: "auto", maxWidth: "1250px" }}>
                        <DaoRouter isConnected={isConnected} />
                    </Grid>
            </>
        )
    }


    if(state.fetched){
        return (
            <Grid container sx={{ mx: "auto", maxWidth: "1250px" }}>
                <NotConnected />
            </Grid>
        )
    }

}

export default EnergyDao

