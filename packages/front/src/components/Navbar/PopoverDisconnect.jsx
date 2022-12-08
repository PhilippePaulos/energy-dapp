import DoneIcon from '@mui/icons-material/Done'
import LogoutIcon from '@mui/icons-material/Logout'
import { Box, Popover, styled, Typography } from "@mui/material"
import { useDisconnect } from 'wagmi'

const PopoverStyled = styled(Popover)({
    ".MuiPaper-root": {
        backgroundColor: "inherit",
        border: "none"
    }
})

function PopoverDisconnect(props) {
    const { id, open, anchorEl, handleClose, address } = props

    const { disconnect } = useDisconnect()

    const handleDisconnect = async () => {
        disconnect()
        handleClose()
    }

    return (
        <PopoverStyled
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
            }}

        >
            <Box
                className="bg-slate-700 border border-slate-600"
                mt={0.5}
                p={1}
                width={150} sx={{ display: "flex", flexDirection: "column", textAlign: "left", borderRadius: "inherit"}}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography variant="p">{address}</Typography>
                    <DoneIcon fontSize="inherit" className="text-green-500" />
                </Box>

                <Box
                    onClick={() => handleDisconnect()}
                    mt={1}
                    sx={{ display: "flex", alignItems: "center", gap: "2px", color: "error.main", cursor: "pointer" }}>
                    <LogoutIcon fontSize="inherit" />
                    <Typography variant="p"
                        sx={{ fontWeight: "bold" }}
                    >
                        Disconnect
                    </Typography>
                </Box>
            </Box>
        </PopoverStyled>
    )
}

export default PopoverDisconnect