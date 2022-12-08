import { styled, TableContainer } from "@mui/material"
import { theme } from "../../theme"

const TableContainerUI = styled(TableContainer)({
    borderRadius: ".75rem",
    border: "1px solid",
    borderColor: theme.palette.border.main,
    boxShadow: 'none'

})

export default TableContainerUI