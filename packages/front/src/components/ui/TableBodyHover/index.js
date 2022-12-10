import { styled, TableBody } from "@mui/material";
import { theme } from "../../theme";

const TableBodyHover = styled(TableBody)({
    '&:last-child td, &:last-child th':{
        border: 0 
    },
    '& tr': {
        cursor: 'pointer',
    },
    '& tr:hover': {
        background: theme.palette.background.pop
    }
});

export default TableBodyHover