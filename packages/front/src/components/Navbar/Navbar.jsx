import { AppBar, Grid, Link, Toolbar, Typography } from "@mui/material"
import { Box } from "@mui/system"
import Identicon from '@polkadot/react-identicon'
import { useState } from "react"
import { useAccount, useConnect } from "wagmi"
import { InjectedConnector } from 'wagmi/connectors/injected'
import { formatAddress } from "../../helpers/eth"
import ButtonUI from "../ui/button"
import PopoverDisconnect from "./PopoverDisconnect"



function Navbar() {
    const { address, isConnected } = useAccount()
    const { connect } = useConnect({
        connector: new InjectedConnector(),
    })
    const [anchorEl, setAnchorEl] = useState(null)

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const open = Boolean(anchorEl)
    const id = open ? 'disconnect-popover' : undefined

    const formatedAddr = isConnected ? formatAddress(address) : null

    const connectBtn = <ButtonUI size="medium" variant="contained" onClick={() => connect()}>Connect</ButtonUI>
    const addressAvatar =
        <Box display="flex" alignItems="center" gap="4px" sx={{ cursor: "pointer" }} onClick={handleClick}>
            <Identicon className="identicon" value={address} size={20} theme="ethereum" />
            <Typography>{formatedAddr}</Typography>
        </Box>


    return (
        <AppBar position="sticky" sx={{ borderBottom: "none", backgroundColor: "rgb(17 24 39/1)" }}>
            <Toolbar sx={{ height: "80px" }}>
                <Grid
                    container
                    justifyContent="space-between"
                    sx={{ mx: "auto", maxWidth: "1250px", display: "flex" }}
                >
                    <Box>
                        <Typography variant="h4">Energy</Typography>
                    </Box>
                    <Box
                        display="flex"
                        gap={4}
                        alignItems="center">
                        <Link href="#" color="inherit" underline="none">Whitepaper</Link>
                        {
                            !isConnected ? connectBtn : addressAvatar
                        }
                    </Box>
                </Grid>
            </Toolbar>
            <PopoverDisconnect
                id={id}
                open={open}
                anchorEl={anchorEl}
                handleClose={handleClose}
                address={formatedAddr} />
        </AppBar>
    )
}

export default Navbar