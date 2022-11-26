import { Box, Popover, styled, Typography } from "@mui/material"
import { borderRadius } from "@mui/system"
import { useDisconnect } from "wagmi"

const PopoverStyled = styled(Popover)({
    ".MuiPaper-root": {
        backgroundColor: "inherit",
        borderRadius: "10px",
        padding: "10px 0px 10px 15px",
    }
})

function PopoverDisconnect(props) {
    const { id, open, anchorEl, handleClose, address } = props

    const { disconnect } = useDisconnect()

    const handleDisconnect = () => {
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
                horizontal: 'left',
            }}
        >
            <Box width={200} sx={{display: "flex", flexDirection: "column", textAlign:"left", }}>
                <Typography sx={{ color: "text.secondary"}}>{address}</Typography>

                <Typography
                    sx={{ color: "error.main", fontWeight: "600", cursor: "pointer" }}
                    onClick={() => handleDisconnect()}>
                    Disconnect
                </Typography>
            </Box>
        </PopoverStyled>
    )
}

export default PopoverDisconnect