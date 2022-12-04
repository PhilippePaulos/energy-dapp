import { Box, Grid, Typography } from "@mui/material";
import { ethers } from "ethers";
import { useState } from "react";
import { useAccount, useContractRead, useContractWrite, useNetwork, usePrepareContractWrite } from "wagmi";
import { getContractDescription, getEthValue } from "../../helpers/eth";
import ButtonUI from "../ui/button";
import CircularIndeterminate from "../ui/CircularIndeterminate";
import TextFieldUI from "../ui/text-field";


function Ico() {
    const { address } = useAccount()
    const { chain } = useNetwork()
    const [amount, setAmount] = useState("")
    const { abi, addr } = getContractDescription('Sale', chain.id)

    const { data: data1 } = useContractRead({
        address: addr,
        abi: abi,
        functionName: "remainingTokens",
        watch: true
    })

    const { data: data2 } = useContractRead({
        address: addr,
        abi: abi,
        functionName: "rate",
    })

    const remainingTokens = getEthValue(data1)
    const rate = data2.toNumber()
    const tokensToBuy = amount * rate

    const { config } = usePrepareContractWrite({
        address: addr,
        abi: abi,
        functionName: 'buyTokens',
        args: [address],
        overrides: {
            from: address,
            value: !amount ? undefined : ethers.utils.parseEther(amount),
        },
        enabled: amount > 0 && tokensToBuy <= remainingTokens,
    })
    const { write, isLoading } = useContractWrite(config)

    const onInputChange = (event) => {
        if (/^[1-9]\d*$/.test(event.target.value)) {
            setAmount((parseFloat(event.target.value) * rate).toString());
        }
    };

    const handleSubmit = async (event) => {
        console.log("amount", amount);
        event.preventDefault();
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
                <ButtonUI size="medium" variant="contained" onClick={(e) => handleSubmit(e)}>Buy {amount} EED</ButtonUI>
            </Grid>
            <CircularIndeterminate loading={isLoading} />
        </Grid>
    )
}

export default Ico