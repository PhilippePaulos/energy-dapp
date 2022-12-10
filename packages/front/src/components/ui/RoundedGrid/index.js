import { Grid, styled } from "@mui/material"
import { theme } from "../../theme"

const RoundedGrid = styled(Grid)({
    // backgroundColor: theme.palette.background.grid,
    borderRadius: ".75rem",
    border: "1px solid",
    borderColor: theme.palette.border.main,
    "& .MuiTypography-h4": {
        fontWeight: "bold"
    },
    "& .boxHeader": {
        padding: "10px 15px 10px 15px",
        display: "flex",
        justifyContent: "space-between",
        fontWeight: "bold",
    },
    "& .content .line": {
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 15px 10px 15px",
        // borderColor: theme.palette.border.main,
        alignSelf:"center"
    },
    "& .MuiTypography-b": {
        color: theme.palette.secondary.main
    },
    "& .admin:hover": {
        cursor: "pointer"
    }
})

export default RoundedGrid