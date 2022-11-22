import { Typography } from "@mui/material";
import { useCallback, useEffect } from "react";
import useWallet from "../../contexts/WalletContext/useWallet";



function Home() {

    const {state: {artifact, contract}} = useWallet()

    const fetchOwner = useCallback(async () => {
        const owner = await contract.methods.owner().call()
        return owner
    }, [contract])

    useEffect(() => {
        if(artifact != null) {
            fetchOwner()
            
        }
    }, [artifact, contract, fetchOwner])

    return (
        <Typography variant="h1">Bonjour toi</Typography>
    )
}

export default Home