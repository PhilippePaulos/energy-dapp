import { styled, SvgIcon } from "@mui/material"
import { theme } from "../../theme"

const IconHover = styled(SvgIcon)({
    "&:hover": {
        cursor: "pointer",
        color: theme.palette.hover.main
    }
})

export default IconHover