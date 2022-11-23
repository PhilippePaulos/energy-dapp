import { Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import useWallet from "../../contexts/WalletContext/useWallet";

function Home() {

    const {state: {artifact, contract, accounts}} = useWallet()

    const [owner, setOwner] = useState('')

    const fetchOwner = useCallback(async () => {
        const owner = await contract.methods.owner().call({from: accounts[0]})
        setOwner(owner)
        return owner
    }, [contract])

    useEffect(() => {
        if(artifact != null) {
            fetchOwner()
        }
    }, [artifact, contract, fetchOwner])

    return (
        <Typography variant="h5">Bonjour {owner}</Typography>
    )
}

export default Home
