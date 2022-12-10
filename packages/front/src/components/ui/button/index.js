import { Button, styled } from "@mui/material"
import { theme } from "../../theme"

const ButtonUI = styled(Button)({
    backgroundColor: theme.palette.action.main,
    color: "black",
    '&:hover': {
        backgroundColor: theme.palette.action.secondary,
        color: "white"
    }
})

export default ButtonUI