import { Box, Grid, Typography } from "@mui/material"
import { ethers } from "ethers"
import { useCallback, useEffect, useState } from "react"
import { useAccount, useNetwork, useProvider, useSigner } from "wagmi"
import { getEthValue, initContract } from "../../../common/helpers/eth"
import ButtonUI from "../../ui/button"
import CircularIndeterminate from "../../ui/CircularIndeterminate"
import TextFieldUI from "../../ui/text-field"
import RoundedGrid from "../../ui/RoundedGrid"


function Ico() {
    const { address } = useAccount()
    const provider = useProvider()

    const [tokens, setTokens] = useState(0)
    const { chain } = useNetwork()
    const [remainingTokens,setRemainingTokens] = useState()
    const [rate, setRate] = useState()
    const [isLoading, setIsLoading] = useState(false)
    const { data: signer } = useSigner() 

    const contract = initContract("Sale", chain.id, provider)

    const fetchRemainingTokens = useCallback(async() => {
        const remaining = await contract.remainingTokens()
        setRemainingTokens(getEthValue(remaining))
    }, [])

    const fetchRate = useCallback(async() => {
        setRate((await contract.rate()).toNumber())
    }, [])

    useEffect(() => {
        fetchRemainingTokens()
        fetchRate()
    }, [])

    const amount = tokens ? parseInt(tokens) / rate : 0

    const buyTokens = async() => {
        setIsLoading(true)
        await contract.connect(signer).buyTokens(address, {value: ethers.utils.parseEther(amount.toString())})
        fetchRemainingTokens()
        setIsLoading(false)
    }

    const onInputChange = (event) => {
        if (/^[0-9]\d*$/.test(event.target.value)) {
            setTokens(event.target.value)
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        buyTokens()
    }

    return (
        <>
            <RoundedGrid sx={{ display: "flex", gap: "5px", flexDirection: "column", textAlign: "left", padding: "40px", position: "absolute", top: "50%", left:"50%",
             transform: "translate(-50%,-50%)"}}>
                <Typography mb={2} variant="h6">Sale Price:  1 ETH = {rate} EED</Typography>
                
                <Box mb={2} component="form" noValidate autoComplete="off">
                    <TextFieldUI id="amount" label="EED amount" onChange={onInputChange} />
                </Box>
                <ButtonUI size="medium" variant="contained" onClick={(e) => handleSubmit(e)}>Buy {tokens} EED for {amount} ETH</ButtonUI>
                <Typography mt={2} variant="h6">Remaining tokens: {remainingTokens}</Typography>
            </RoundedGrid>
            <CircularIndeterminate loading={isLoading} />
        </>
    )
}

export default Ico