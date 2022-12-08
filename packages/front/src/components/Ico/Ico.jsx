import { Box, Grid, Typography } from "@mui/material"
import { ethers } from "ethers"
import { useState } from "react"
import { useAccount, useContractRead, useContractWrite, useNetwork, usePrepareContractWrite } from "wagmi"
import { getContractDescription, getEthValue } from "../../common/helpers/eth"
import ButtonUI from "../ui/button"
import CircularIndeterminate from "../ui/CircularIndeterminate"
import TextFieldUI from "../ui/text-field"


function Ico() {
    const { address } = useAccount()

    const [tokens, setTokens] = useState(0)
    const { chain } = useNetwork()

    const { abi, addr } = getContractDescription('Sale', chain.id)

    const { data: data1 } = useContractRead({
        address: addr,
        abi: abi,
        functionName: "remainingTokens",
        watch: true
    })

    const remainingTokens = getEthValue(data1)

    const { data: data2 } = useContractRead({
        address: addr,
        abi: abi,
        functionName: "rate",
    })
    const rate = data2.toNumber()

    const amount = parseInt(tokens) / rate

    const { config } = usePrepareContractWrite({
        address: addr,
        abi: abi,
        functionName: 'buyTokens',
        args: [address],
        overrides: {
            from: address,
            value: ethers.utils.parseEther(amount.toString()),
        },
        enabled: amount > 0,
    })
    console.log(ethers.utils.parseEther(amount.toString()));
    const { write, isLoading } = useContractWrite(config)

    const onInputChange = (event) => {
        if (/^[0-9]\d*$/.test(event.target.value)) {
            setTokens(event.target.value)
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        write?.()
    }

    return (
        <Grid container>
            <Grid item margin={"auto"} sx={{ display: "flex", gap: "5px", flexDirection: "column", textAlign: "left" }}>
                <Typography variant="h6">Sale Price:  1 ETH = {rate} EED</Typography>
                <Typography variant="h6">Remaining tokens: {remainingTokens}</Typography>
                <Box component="form" noValidate autoComplete="off">
                    <TextFieldUI id="amount" label="EED amount" onChange={onInputChange} />
                </Box>
                <ButtonUI size="medium" variant="contained" onClick={(e) => handleSubmit(e)}>Buy {tokens} EED for {amount} ETH</ButtonUI>
            </Grid>
            <CircularIndeterminate loading={isLoading} />
        </Grid>
    )
}

export default Ico